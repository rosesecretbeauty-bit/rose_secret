# Sistema de Descuentos y Cupones - Rose Secret

Este módulo implementa un sistema robusto de descuentos y cupones, completamente backend-driven, para el e-commerce Rose Secret.

## Arquitectura

```
src/discounts/
├── discountTypes.ts      # Tipos TypeScript
├── discountSchemas.ts    # Validación y sanitización
├── discountUtils.ts      # Utilidades de cálculo (solo visual)
├── discountClient.ts     # Cliente API para backend
└── README.md            # Esta documentación
```

## Principios Fundamentales

### ✅ Backend-Driven
- **El backend es la fuente de verdad** para todos los cálculos de descuentos
- El frontend solo refleja y valida UX
- Todos los totales vienen del backend en `cart_totals`

### ✅ Determinista y Auditable
- Todos los descuentos son trackeados en analytics
- Los cálculos son reproducibles
- No hay lógica de negocio oculta en el frontend

### ✅ Seguro
- Validación de payloads con sanitización
- No se confía en el cliente para cálculos críticos
- Manejo de edge cases (expirados, límites, etc.)

## Componentes

### `discountStore.ts`
Zustand store que gestiona:
- Descuentos aplicados manualmente (cupones)
- Descuentos automáticos (promociones)
- Total del carrito con descuentos
- Estados de carga y error

### `CouponInput.tsx`
Componente para aplicar cupones en checkout:
- Input de código de cupón
- Visualización de descuentos aplicados
- Manejo de estados (loading, success, error)
- Tracking automático de eventos

### Integración en `OrderReview.tsx`
- Muestra descuentos aplicados
- Calcula totales con descuentos
- Integra con `CouponInput`

## Endpoints del Backend

### `POST /api/discounts/apply`
Aplicar un cupón al carrito.

**Request:**
```json
{
  "code": "CUPON10"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Cupón aplicado exitosamente",
  "discount": { ... },
  "calculated_amount": 10.00,
  "cart_totals": {
    "subtotal": 100.00,
    "discounts": [...],
    "discount_total": 10.00,
    "shipping": 0,
    "tax": 16.00,
    "total": 106.00,
    "currency": "USD"
  }
}
```

### `POST /api/discounts/remove`
Remover un descuento aplicado.

### `GET /api/discounts/automatic`
Obtener descuentos automáticos aplicables al carrito actual.

### `POST /api/discounts/validate`
Validar un código de cupón sin aplicarlo.

## Flujo de Aplicación de Cupón

1. Usuario ingresa código en `CouponInput`
2. Frontend llama `applyDiscount(code)` → `POST /api/discounts/apply`
3. Backend valida:
   - Código existe y está activo
   - No está expirado
   - Cumple condiciones (min_purchase, etc.)
   - No excede límites de uso
4. Backend calcula descuento y devuelve `cart_totals`
5. Frontend actualiza `discountStore` con totales del backend
6. Se trackea evento `COUPON_APPLIED` en analytics
7. UI se actualiza mostrando descuento y nuevos totales

## Descuentos Automáticos

Los descuentos automáticos se cargan:
- Al cargar el carrito
- Después de agregar items al carrito
- Automáticamente en checkout

Se trackean con `DISCOUNT_APPLIED` cuando se detectan por primera vez.

## Tracking de Eventos

### `COUPON_APPLIED`
Cuando un cupón se aplica exitosamente.

**Payload:**
```typescript
{
  code: string;
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency: string;
}
```

### `COUPON_FAILED`
Cuando falla la aplicación de un cupón.

**Payload:**
```typescript
{
  code: string;
  cart_total_before: number;
  error: string;
  currency: string;
}
```

### `DISCOUNT_APPLIED`
Cuando se aplica un descuento automático.

**Payload:**
```typescript
{
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency: string;
  is_automatic: boolean;
}
```

### `DISCOUNT_REMOVED`
Cuando se remueve un descuento.

**Payload:**
```typescript
{
  code?: string;
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency: string;
}
```

## Edge Cases Manejados

- ✅ Cupones expirados
- ✅ Cupones de un solo uso
- ✅ Límites de uso por usuario
- ✅ Compra mínima requerida
- ✅ Descuento máximo (para porcentajes)
- ✅ Carrito vacío
- ✅ Cambios de carrito con cupón activo
- ✅ Doble aplicación de cupones
- ✅ Incompatibilidades entre cupones

## Integración con Checkout

El `checkoutStore` envía:
- `coupon_code`: Código del cupón aplicado (si hay)
- `discount`: Monto total de descuento

El backend valida y recalcula todo antes de crear la orden.

## Próximas Mejoras

- [ ] Sistema de referral codes
- [ ] Gift cards
- [ ] Cashback
- [ ] Wallet interna
- [ ] Promociones automáticas más complejas (por categoría, producto, etc.)
- [ ] Descuentos por volumen
- [ ] Descuentos por membresía

