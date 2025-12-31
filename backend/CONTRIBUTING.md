# 🤝 Contribuir - Rose Secret Backend

**Guía para Desarrolladores**

---

## 📋 Índice

1. [Setup de Desarrollo](#setup-de-desarrollo)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Convenciones de Código](#convenciones-de-código)
4. [Testing](#testing)
5. [Commits y Pull Requests](#commits-y-pull-requests)

---

## 🛠️ Setup de Desarrollo

### Prerequisitos

- Node.js >= 18.0.0
- MySQL o PostgreSQL
- Redis (opcional, para testing multi-instancia)

### Configuración Inicial

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd RoseSecret/backend

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env con configuración local

# 4. Crear base de datos de desarrollo
mysql -u root -p -e "CREATE DATABASE rose_secret_dev"

# 5. Ejecutar schema
mysql -u root -p rose_secret_dev < database/schema.sql

# 6. Ejecutar migraciones
mysql -u root -p rose_secret_dev < database/migrations/fase2_performance_indexes.sql

# 7. Iniciar servidor
npm run dev
```

---

## 📁 Estructura del Proyecto

```
backend/
├── cache/          # Sistema de cache (Redis + in-memory)
├── db/             # Configuración de base de datos
├── docs/           # Documentación técnica
├── logger/         # Sistema de logging
├── metrics/        # Métricas y Prometheus
├── middleware/     # Middlewares de Express
├── routes/         # Rutas de la API
├── security/       # Rate limiting, validaciones
├── services/       # Lógica de negocio
├── tests/          # Tests (unit + integration)
├── utils/          # Utilidades (errores, helpers)
└── index.js        # Punto de entrada
```

---

## 💻 Convenciones de Código

### Naming

- **Variables/Funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Clases**: `PascalCase`
- **Archivos**: `camelCase.js` o `kebab-case.js`

### Estructura de Archivos

```javascript
// 1. Imports externos
const express = require('express');
const { query } = require('../db');

// 2. Imports internos
const service = require('../services/my.service');

// 3. Constantes
const CONSTANT = 'value';

// 4. Funciones auxiliares
function helperFunction() {}

// 5. Exports principales
module.exports = {
  mainFunction
};
```

### Manejo de Errores

**SIEMPRE** usar clases de error personalizadas:

```javascript
const { ValidationError, BusinessError, NotFoundError } = require('../utils/errors');

// ❌ NO hacer
throw new Error('Stock insuficiente');

// ✅ Hacer
throw new BusinessError('Stock insuficiente', null, 'INSUFFICIENT_STOCK');
```

### Async/Await

**SIEMPRE** usar async/await, no callbacks:

```javascript
// ❌ NO hacer
query('SELECT * FROM users', (err, results) => {
  // ...
});

// ✅ Hacer
const users = await query('SELECT * FROM users');
```

### Transacciones

**SIEMPRE** usar transacciones para operaciones críticas:

```javascript
const { transaction } = require('../db');

await transaction(async (connection) => {
  // Operaciones que deben ser atómicas
});
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo unit tests
npm run test:unit

# Solo integration tests
npm run test:integration

# Modo watch (desarrollo)
npm run test:watch
```

### Escribir Tests

**Unit Tests** (`tests/unit/`):
- Testear funciones aisladas
- Usar mocks cuando sea necesario
- Rápidos y determinísticos

**Integration Tests** (`tests/integration/`):
- Testear flujos completos
- Usar base de datos de test
- Limpiar datos después de cada test

### Ejemplo de Test

```javascript
describe('MyService', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something correctly', async () => {
    // Arrange
    const input = { ... };

    // Act
    const result = await myService.doSomething(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

---

## 📝 Commits y Pull Requests

### Mensajes de Commit

Formato:
```
tipo(scope): descripción breve

Descripción detallada (opcional)
```

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `test`: Tests
- `docs`: Documentación
- `refactor`: Refactorización
- `perf`: Mejora de performance

Ejemplo:
```
test(auth): add unit tests for token validation

Added comprehensive unit tests for JWT token validation,
including expired tokens, invalid tokens, and missing tokens.
```

### Pull Requests

Antes de crear PR:
- [ ] Tests pasan: `npm test`
- [ ] Linter pasa: `npm run lint`
- [ ] Código sigue convenciones
- [ ] Documentación actualizada (si aplica)

---

## 🔍 Debugging

### Logs en Desarrollo

```javascript
const { debug, info, warn, error } = require('../logger');

debug('Debug message', { metadata });
info('Info message', { metadata });
warn('Warning message', { metadata });
error('Error message', err, { metadata });
```

### Usar Correlation IDs

Los logs incluyen `requestId` automáticamente. Para debugging:

```bash
# Filtrar logs por requestId
grep "requestId:abc123" logs/app.log
```

---

## 📚 Recursos

- **Documentación API**: http://localhost:3000/api-docs (Swagger)
- **Architecture**: Ver `docs/ARCHITECTURE.md`
- **Security**: Ver `docs/SECURITY.md`
- **Error Handling**: Ver `docs/ERROR_HANDLING.md`

---

**Última actualización:** FASE 5 (29 de Diciembre, 2025)

