# ⚠️ Manejo de Errores - Rose Secret Backend

## Índice
1. [Clases de Error Personalizadas](#clases-de-error-personalizadas)
2. [Error Handler Centralizado](#error-handler-centralizado)
3. [Uso en Código](#uso-en-código)
4. [Logging de Errores](#logging-de-errores)
5. [Respuestas al Cliente](#respuestas-al-cliente)

---

## Clases de Error Personalizadas

### AppError (Base)

Clase base para todos los errores personalizados.

```javascript
class AppError extends Error {
  constructor(message, statusCode, type, userMessage)
}
```

### ValidationError

Para errores de validación (400).

```javascript
throw new ValidationError('Email inválido', errors);
```

### AuthError

Para errores de autenticación (401).

```javascript
throw new AuthError('Token inválido');
```

### PermissionError

Para errores de autorización (403).

```javascript
throw new PermissionError('Permisos insuficientes', null, 'admin');
```

### BusinessError

Para errores de lógica de negocio (400).

```javascript
throw new BusinessError('Stock insuficiente');
```

### NotFoundError

Para recursos no encontrados (404).

```javascript
throw new NotFoundError('Producto no encontrado', 'product');
```

### ConflictError

Para conflictos (409).

```javascript
throw new ConflictError('El email ya está registrado');
```

### RateLimitError

Para límite de tasa excedido (429).

```javascript
throw new RateLimitError('Demasiadas solicitudes', 60);
```

### DatabaseError

Para errores de base de datos (500/409).

```javascript
throw new DatabaseError('Error en la consulta', 'ER_DUP_ENTRY');
```

---

## Error Handler Centralizado

### Middleware Global

El error handler está configurado como middleware final en `index.js`:

```javascript
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);
```

### Funcionalidad

1. **Clasifica** el tipo de error
2. **Loggea** con contexto completo
3. **Registra métricas** del error
4. **Responde** al cliente con formato consistente

### Clasificación Automática

El handler reconoce automáticamente:
- Errores JWT (`TokenExpiredError`, `JsonWebTokenError`)
- Errores de BD (códigos `ER_*`, `23505`, etc.)
- Errores de Stripe
- Errores 404/403/401
- Errores personalizados (instancias de `AppError`)

---

## Uso en Código

### Lanzar Errores

```javascript
// En rutas
router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error); // Pasar al error handler
  }
});

// En servicios
async function createOrder(userId, items) {
  for (const item of items) {
    const stock = await inventoryService.getAvailableStock(item.variantId);
    if (stock < item.quantity) {
      throw new BusinessError(
        `Stock insuficiente para variante ${item.variantId}`,
        'INSUFFICIENT_STOCK'
      );
    }
  }
  // ...
}
```

### Errores de Validación

```javascript
router.post('/products', [
  body('name').notEmpty(),
  body('price').isFloat({ min: 0 })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(
      'Errores de validación',
      errors.array()
    ));
  }
  // ...
});
```

---

## Logging de Errores

### Información Incluida

Todos los errores se loggean con:
- `errorId`: UUID único para trazabilidad
- `errorType`: Tipo de error
- `path`, `method`: Endpoint afectado
- `userId`, `userRole`: Usuario (si está autenticado)
- `ip`, `userAgent`: Información del cliente
- `requestId`: Correlation ID
- `stack`: Stack trace (solo en desarrollo)

### Niveles de Log

- **Critical**: Errores 500+, rutas admin/pagos/webhooks
- **Error**: Errores operacionales (400-499)
- **Warn**: Warnings y eventos sospechosos

### Ejemplo de Log

```json
{
  "level": "ERROR",
  "message": "Error: Producto no encontrado",
  "errorId": "550e8400-e29b-41d4-a716-446655440000",
  "errorType": "NOT_FOUND_ERROR",
  "path": "/api/products/999",
  "method": "GET",
  "userId": 123,
  "ip": "192.168.1.1",
  "requestId": "abc123",
  "error": {
    "name": "NotFoundError",
    "message": "Producto no encontrado"
  }
}
```

---

## Respuestas al Cliente

### Formato Estándar

```json
{
  "success": false,
  "message": "Mensaje amigable para el usuario",
  "errorId": "550e8400-e29b-41d4-a716-446655440000",
  "errors": ["Campo requerido: email"]  // Solo en ValidationError
}
```

### Información Sensible

**NUNCA** se expone:
- Stack traces (solo en desarrollo)
- Mensajes de error internos
- Detalles de BD
- Tokens o secretos

### Headers HTTP

- `X-Request-Id`: Correlation ID
- `X-Error-Id`: ID del error (para reportar)

---

## Testing de Errores

### Ejemplo de Test

```javascript
test('should return 404 for non-existent product', async () => {
  const response = await request(app)
    .get('/api/products/999')
    .expect(404);
  
  expect(response.body.success).toBe(false);
  expect(response.body.errorId).toBeDefined();
  expect(response.body.message).toContain('no encontrado');
});
```

---

**Última actualización:** FASE 4 (29 de Diciembre, 2025)

