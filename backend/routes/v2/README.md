# API v2 - Preparado para Futuro

## 📋 Estado

**v2 está preparado pero NO implementado aún.**

Esta carpeta está lista para cuando se necesite implementar una nueva versión de la API.

## 🚀 Cuándo Crear v2

Considera crear v2 cuando necesites:

- ✅ Cambios breaking en estructura de respuestas
- ✅ Eliminar endpoints existentes
- ✅ Cambiar tipos de datos
- ✅ Cambiar nombres de campos
- ✅ Cambios significativos en autenticación
- ✅ Nuevas funcionalidades que requieren cambios estructurales

## 📝 Proceso de Implementación

### 1. Crear Nuevas Rutas

Crear archivos en esta carpeta siguiendo la estructura de v1:

```
v2/
  ├── index.js
  ├── auth.routes.js
  ├── products.routes.js
  └── ...
```

### 2. Actualizar v2/index.js

```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productsRoutes = require('./products.routes');
// ... otras rutas

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
// ...

module.exports = router;
```

### 3. Mantener v1 Intacto

- ✅ NO modificar rutas de v1
- ✅ NO eliminar endpoints de v1
- ✅ Mantener compatibilidad total

### 4. Documentar Cambios

- Actualizar `API-VERSIONING.md`
- Crear `API-v2.md`
- Crear guía de migración

### 5. Testing

- Probar que v1 sigue funcionando
- Probar que v2 funciona correctamente
- Probar migración de v1 a v2

## 🔄 Ejemplo de Cambio

### v1 (Actual)

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Product",
      "price": 100.00
    }
  }
}
```

### v2 (Futuro)

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_1",  // Cambio: String en lugar de número
      "name": "Product",
      "price": {
        "amount": 10000,  // Cambio: Estructura
        "currency": "USD"
      },
      "images": ["url1", "url2"]  // Nuevo campo
    }
  }
}
```

## 📚 Referencias

- [API Versioning](../API-VERSIONING.md)
- [Deprecation Policy](../DEPRECATION-POLICY.md)
- [API v1 Documentation](../API-v1.md)

