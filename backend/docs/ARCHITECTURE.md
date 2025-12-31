# 🏗️ Arquitectura - Rose Secret Backend

## Índice
1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Capas de la Aplicación](#capas-de-la-aplicación)
4. [Flujo de Request](#flujo-de-request)
5. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
6. [Escalabilidad](#escalabilidad)

---

## Visión General

Rose Secret Backend es una API REST para un e-commerce de productos de belleza. Está diseñado para:
- Alta disponibilidad (multi-instancia)
- Escalabilidad horizontal
- Seguridad enterprise
- Observabilidad completa

### Principios de Diseño

1. **Separation of Concerns**: Capas claras (routes → services → database)
2. **DRY**: Código reutilizable (middlewares, servicios)
3. **Fail Fast**: Validación temprana de inputs
4. **Security First**: Autenticación, autorización y sanitización en cada capa
5. **Observability**: Logs estructurados, métricas, correlation IDs

---

## Estructura de Carpetas

```
backend/
├── cache/              # Sistema de cache (Redis + in-memory)
├── db/                 # Configuración de base de datos
├── docs/               # Documentación técnica
├── logger/             # Sistema de logging estructurado
├── metrics/            # Métricas y export Prometheus
├── middleware/         # Middlewares de Express
├── routes/             # Rutas de la API
├── security/           # Rate limiting, validaciones de seguridad
├── services/           # Lógica de negocio
├── templates/          # Plantillas de email
├── tests/              # Tests unitarios e integración
├── utils/              # Utilidades (errores, helpers)
└── index.js            # Punto de entrada
```

---

## Capas de la Aplicación

### 1. Routes (Rutas)

- **Responsabilidad**: Definir endpoints, validar inputs, llamar servicios
- **Ejemplo**: `routes/products.routes.js`

```javascript
router.get('/products', async (req, res, next) => {
  try {
    const products = await productService.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error); // Pasar al error handler
  }
});
```

### 2. Services (Servicios)

- **Responsabilidad**: Lógica de negocio, coordinación entre recursos
- **Ejemplo**: `services/order.service.js`

```javascript
async function createOrder(userId, items) {
  // Validar stock
  // Calcular totales
  // Crear orden
  // Procesar pago
  // Enviar email
}
```

### 3. Database (Base de Datos)

- **Responsabilidad**: Acceso a datos, queries, transacciones
- **Ejemplo**: `db.js`, queries en servicios

```javascript
const { query, transaction } = require('../db');
const orders = await query('SELECT * FROM orders WHERE user_id = ?', [userId]);
```

### 4. Middleware

- **Request Context**: Correlation IDs
- **Auth**: Autenticación JWT
- **Rate Limiting**: Control de tasa
- **Error Handler**: Manejo centralizado
- **Sanitizer**: Limpieza de inputs

---

## Flujo de Request

```
1. Request llega
   ↓
2. Request Context (genera X-Request-Id)
   ↓
3. API Versioning
   ↓
4. Security Headers (Helmet)
   ↓
5. IP Reputation Check
   ↓
6. Request Logger
   ↓
7. Rate Limiting
   ↓
8. Body Parser
   ↓
9. Request Sanitizer
   ↓
10. Authentication (si requiere)
    ↓
11. Route Handler
    ↓
12. Service Layer
    ↓
13. Database Query
    ↓
14. Response
    ↓
15. Error Handler (si hay error)
```

---

## Tecnologías y Dependencias

### Core

- **Express.js**: Framework web
- **Node.js**: Runtime (>=18.0.0)

### Base de Datos

- **MySQL/PostgreSQL**: Dual support
- **mysql2** / **pg**: Drivers

### Seguridad

- **jsonwebtoken**: JWT
- **bcryptjs**: Hash de contraseñas
- **helmet**: Headers de seguridad
- **express-validator**: Validación de inputs

### Cache y Locks

- **redis**: Cache distribuido y locks (opcional)

### Pagos

- **stripe**: Procesador de pagos

### Email

- **resend**: Servicio de email

### Observabilidad

- **Winston**: Logging (via logger personalizado)
- **Prometheus**: Export de métricas

---

## Escalabilidad

### Multi-Instancia

El sistema soporta múltiples instancias con:
- **Redis**: Cache y locks distribuidos
- **Load Balancer**: Distribución de carga
- **Shared Database**: Base de datos compartida

### Performance

- **Cache Estratégico**: Productos, categorías (TTL configurable)
- **Índices de BD**: Optimización de queries críticas
- **Connection Pooling**: Pool de conexiones a BD
- **Paginación**: En todos los listados

### Resiliencia

- **Graceful Shutdown**: Cierre ordenado de recursos
- **Error Handling**: Recuperación de errores
- **Health Checks**: Monitoreo de salud
- **Fallbacks**: Redis → in-memory si falla

---

## Fases de Implementación

### FASE 1: Estabilización Crítica
- ✅ Testing (unit + integración)
- ✅ Recuperación de contraseña
- ✅ Validaciones de negocio
- ✅ Manejo de errores básico

### FASE 2: Performance
- ✅ Índices de BD
- ✅ Optimización de queries
- ✅ Cache estratégico
- ✅ Paginación

### FASE 3: Multi-Instancia
- ✅ Cache distribuido (Redis)
- ✅ Locks distribuidos
- ✅ Graceful shutdown
- ✅ Health checks avanzados

### FASE 4: Hardening Enterprise
- ✅ Clases de error personalizadas
- ✅ Rate limiting distribuido
- ✅ Token blacklist distribuido
- ✅ Export Prometheus
- ✅ Seguridad mejorada
- ✅ Documentación técnica

---

**Última actualización:** FASE 4 (29 de Diciembre, 2025)

