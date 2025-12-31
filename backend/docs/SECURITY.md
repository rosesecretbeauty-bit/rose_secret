# 🔒 Seguridad - Rose Secret Backend

## Índice
1. [Autenticación y Autorización](#autenticación-y-autorización)
2. [Protección contra Ataques](#protección-contra-ataques)
3. [Rate Limiting](#rate-limiting)
4. [Validación y Sanitización](#validación-y-sanitización)
5. [Headers de Seguridad](#headers-de-seguridad)
6. [Manejo de Secretos](#manejo-de-secretos)
7. [Best Practices](#best-practices)

---

## Autenticación y Autorización

### Sistema de Autenticación

- **JWT (JSON Web Tokens)**: Tokens firmados con `HS256`
- **Token Blacklist**: Tokens invalidados se almacenan en Redis (con fallback in-memory)
- **Expiración**: Configurable via `JWT_EXPIRES_IN` (default: 7 días)

### RBAC (Role-Based Access Control)

El sistema soporta roles y permisos:
- **Roles básicos**: `admin`, `user`
- **Sistema RBAC**: Permisos granulares por dominio y acción
- **Middleware**: `authenticate`, `requireAdmin`, `requireRole()`

### Uso

```javascript
// Rutas protegidas
router.get('/profile', authenticate, async (req, res) => {
  // req.user contiene información del usuario autenticado
});

// Solo admin
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  // Solo usuarios con rol admin pueden acceder
});

// Rol específico
router.get('/reports', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  // Requiere uno de los roles especificados
});
```

---

## Protección contra Ataques

### SQL Injection

- ✅ **Prepared Statements**: Todas las queries usan parámetros preparados
- ✅ **Validación de inputs**: Express-validator en todos los endpoints
- ✅ **Sanitización**: Request sanitizer remueve caracteres peligrosos

### XSS (Cross-Site Scripting)

- ✅ **Helmet**: Headers de seguridad configurados
- ✅ **Sanitización**: Scripts y tags HTML son escapados
- ✅ **Content-Type**: Validación estricta de tipos MIME

### CSRF

- ✅ **Same-Site Cookies**: Configurado en producción
- ✅ **Origin Validation**: CORS estricto configurado

### Brute Force

- ✅ **Rate Limiting**: Límites estrictos en login/registro
- ✅ **Brute Force Protection**: Middleware específico para autenticación
- ✅ **Blacklist**: IPs bloqueadas después de múltiples intentos fallidos

---

## Rate Limiting

### Sistema Distribuido

El rate limiting usa **Redis** (con fallback a in-memory) para compartir límites entre instancias.

### Configuración

Diferentes límites por tipo de endpoint:

- **Public**: 200 req/min
- **Auth (Login)**: 5 req/min
- **Register**: 3 req/min
- **Payment**: 10 req/min
- **Admin**: 50 req/min

### Headers

El sistema incluye headers informativos:
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos antes de reintentar (cuando se bloquea)

---

## Validación y Sanitización

### Express-Validator

Todos los endpoints validan inputs:

```javascript
router.post('/products', [
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Datos inválidos', errors.array());
  }
  // ...
});
```

### Request Sanitizer

Middleware global que:
- Remueve caracteres de control
- Escapa HTML/XSS
- Detecta intentos de SQL injection
- Limita profundidad de JSON

---

## Headers de Seguridad

### Helmet

Configurado con:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (en producción)
- `Content-Security-Policy` (configurado)

### Custom Headers

- `X-Request-Id`: Correlation ID para trazabilidad
- `X-API-Version`: Versión de API usada

---

## Manejo de Secretos

### Variables de Entorno

**NUNCA** hardcodear secretos en código. Usar `.env`:

```env
JWT_SECRET=tu-secreto-muy-seguro
DB_PASSWORD=password-seguro
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
```

### Validación de Entorno

El sistema valida que variables críticas estén configuradas al iniciar.

---

## Best Practices

### ✅ Hacer

1. **Siempre usar prepared statements** para queries SQL
2. **Validar todos los inputs** antes de procesar
3. **Usar HTTPS** en producción (Strict-Transport-Security)
4. **Rotar secretos** periódicamente
5. **Auditar acciones críticas** (pagos, cambios admin)
6. **Rate limiting** en todos los endpoints públicos
7. **Logs estructurados** para debugging y análisis

### ❌ No Hacer

1. **Nunca** exponer stack traces en producción
2. **Nunca** revelar si un email/usuario existe (mensajes genéricos)
3. **Nunca** confiar en validación del frontend únicamente
4. **Nunca** loguear contraseñas o tokens completos
5. **Nunca** permitir SQL dinámico sin sanitización

---

## Incidentes de Seguridad

Si detectas un problema de seguridad:

1. **No crear un issue público**
2. Contactar al equipo de seguridad directamente
3. Documentar el incidente
4. Aplicar parche inmediatamente si es crítico

---

**Última actualización:** FASE 4 (29 de Diciembre, 2025)

