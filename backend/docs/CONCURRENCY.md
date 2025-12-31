# 🔒 Manejo de Concurrencia y Race Conditions

## Resumen

Este documento describe cómo el sistema maneja la concurrencia y previene race conditions, especialmente en operaciones críticas como manejo de stock y creación de órdenes.

---

## 🎯 Áreas Críticas

### 1. Manejo de Stock

**Problema:** Múltiples usuarios pueden intentar comprar el último producto disponible simultáneamente.

**Solución Implementada:**

```javascript
// Usando transacciones con FOR UPDATE lock
return await transaction(async (connection) => {
  // Lock exclusivo en el registro de inventario
  const inventory = await queryWithConnection(connection, `
    SELECT * FROM inventory 
    WHERE variant_id = ? 
    FOR UPDATE
  `, [variantId]);
  
  // Validar stock disponible
  if (inventory.available_stock < quantity) {
    throw new Error('Stock insuficiente');
  }
  
  // Actualizar stock
  await updateInventory(connection, variantId, ...);
});
```

**Funcionamiento:**
- `FOR UPDATE` crea un lock exclusivo en el registro
- Solo una transacción puede leer/modificar el stock a la vez
- Otras transacciones esperan hasta que se libere el lock

**Archivos:**
- `backend/services/inventory.service.js` - Funciones `reserveStock`, `recordSale`, `releaseStock`

---

### 2. Creación de Órdenes

**Problema:** Stock puede cambiar entre validación inicial y creación de orden.

**Solución Implementada:**

```javascript
// Validación dentro de transacción con lock
async function createOrderFromCart(userId, addressPayload, totals) {
  return await transaction(async (connection) => {
    // Validar stock con lock
    for (const item of cart.items) {
      const stockValidation = await inventoryService.validateStock(
        item.variant_id, 
        item.quantity
      );
      if (!stockValidation.valid) {
        throw new Error('Stock insuficiente');
      }
    }
    
    // Crear orden (el stock ya está validado y bloqueado)
    // ...
  });
}
```

**Funcionamiento:**
- Validación de stock dentro de transacción
- Lock mantenido durante toda la creación de orden
- Previne que stock cambie durante el proceso

**Archivos:**
- `backend/services/order.service.js` - Función `createOrderFromCart`

---

### 3. Procesamiento de Pagos

**Problema:** Múltiples intentos de confirmar el mismo pago pueden causar doble procesamiento.

**Solución Implementada:**

```javascript
// Validación de estado antes de confirmar
async function confirmPayment(paymentId, providerData) {
  return await transaction(async (connection) => {
    // Lock en el pago
    const payment = await queryWithConnection(connection, `
      SELECT * FROM payments 
      WHERE id = ? 
      FOR UPDATE
    `, [paymentId]);
    
    // Validar que el pago está en estado válido
    if (payment.status !== 'pending') {
      throw new Error('Pago ya procesado');
    }
    
    // Actualizar estado
    // ...
  });
}
```

**Funcionamiento:**
- Idempotencia: Verificar estado antes de procesar
- Lock en el pago previene procesamiento simultáneo
- Cambio de estado atómico dentro de transacción

**Archivos:**
- `backend/services/payment.service.js` - Función `confirmPayment`

---

## ✅ Casos Cubiertos

| Caso | Solución | Estado |
|------|----------|--------|
| Dos usuarios compran último producto | `FOR UPDATE` lock en stock | ✅ Cubierto |
| Stock cambia durante creación de orden | Validación dentro de transacción | ✅ Cubierto |
| Confirmación múltiple de pago | Validación de estado + lock | ✅ Cubierto |
| Reserva de stock en carrito | Transacción atómica | ✅ Cubierto |
| Liberación de stock al cancelar | Transacción atómica | ✅ Cubierto |

---

## ⚠️ Limitaciones Actuales

### 1. Instancia Única

**Estado:** Las soluciones actuales funcionan correctamente en **instancia única**.

**Limitación:** Si se ejecutan múltiples instancias del backend (load balancing), los locks `FOR UPDATE` solo funcionan dentro de cada instancia.

**Ejemplo del problema:**
```
Instancia 1: Usuario A reserva último producto (stock = 0 en DB)
Instancia 2: Usuario B también reserva último producto (no ve el lock de Instancia 1)
Resultado: Dos usuarios tienen el mismo producto reservado
```

### 2. Sin Reintentos Automáticos

**Estado:** Si una transacción falla por race condition, se retorna error al usuario.

**Limitación:** No hay reintento automático. El usuario debe reintentar manualmente.

---

## 🔮 Soluciones Futuras (FASE 3)

### 1. Locks Distribuidos con Redis

**Solución Propuesta:**
```javascript
const Redis = require('redis');
const redis = Redis.createClient();

async function reserveStockWithDistributedLock(variantId, quantity) {
  const lockKey = `lock:stock:${variantId}`;
  const lockTTL = 5000; // 5 segundos
  
  // Intentar adquirir lock distribuido
  const lockAcquired = await redis.set(lockKey, 'locked', {
    NX: true,  // Solo si no existe
    EX: lockTTL  // Expira en 5 segundos
  });
  
  if (!lockAcquired) {
    throw new Error('Stock siendo procesado por otra instancia');
  }
  
  try {
    // Realizar operación
    // ...
  } finally {
    // Liberar lock
    await redis.del(lockKey);
  }
}
```

**Beneficios:**
- Funciona con múltiples instancias
- Previene race conditions entre instancias
- Timeout automático previene deadlocks

### 2. Retry Logic con Backoff

**Solución Propuesta:**
```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && i < maxRetries - 1) {
        // Esperar antes de reintentar (backoff exponencial)
        await sleep(Math.pow(2, i) * 100);
        continue;
      }
      throw error;
    }
  }
}
```

**Beneficios:**
- Reintentos automáticos en caso de conflictos temporales
- Mejor experiencia de usuario
- Reduce errores por contienda temporal

---

## 📊 Métricas y Monitoreo

### Queries para Detectar Problemas

```sql
-- Ver transacciones que están esperando locks
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- Ver transacciones activas
SELECT * FROM information_schema.INNODB_TRX;

-- Ver deadlocks recientes
SHOW ENGINE INNODB STATUS;
```

### Logs a Monitorear

- Errores de "Stock insuficiente" (pueden indicar race conditions)
- Errores de "Pago ya procesado" (pueden indicar confirmaciones duplicadas)
- Timeouts de transacciones (pueden indicar locks prolongados)

---

## ✅ Checklist de Validación

Para validar que el manejo de concurrencia funciona:

- [ ] Probar dos usuarios comprando simultáneamente el último producto
- [ ] Verificar que solo uno puede completar la compra
- [ ] Probar confirmación múltiple del mismo pago
- [ ] Verificar que solo se procesa una vez
- [ ] Monitorear logs para detectar race conditions no cubiertas

---

## 📚 Referencias

- [MySQL InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
- [Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)
- [FOR UPDATE Lock](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html)

---

**Última actualización:** 29 de Diciembre, 2025

