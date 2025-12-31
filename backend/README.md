# 🌹 Rose Secret Backend - MVP

Backend mínimo viable para Rose Secret. Simple, funcional y listo para hosting gratuito.

## 📋 Requisitos

- Node.js 18+ instalado
- MySQL 8.0+ / MariaDB 10.5+ instalado
- npm o yarn

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

#### Opción A: Usando phpMyAdmin (Recomendado)

1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Crea una nueva base de datos llamada `rose_secret`
3. Selecciona la base de datos
4. Ve a la pestaña "SQL"
5. Copia y pega el contenido de `database/schema.sql`
6. Ejecuta el SQL

#### Opción B: Usando línea de comandos

```bash
mysql -u root -p
```

```sql
CREATE DATABASE rose_secret CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rose_secret;
SOURCE database/schema.sql;
```

### 3. Configurar variables de entorno

1. Copia `env.example.txt` a `.env`:

```bash
cp env.example.txt .env
```

2. Edita `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=rose_secret
DB_PORT=3306

JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

**Importante:** Genera un JWT_SECRET seguro:

```bash
openssl rand -base64 32
```

### 4. Iniciar servidor

#### Desarrollo (con auto-reload):

```bash
npm run dev
```

#### Producción:

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## ✅ Verificar que funciona

1. **Health Check:**
   ```
   GET http://localhost:3000/api/health
   ```

2. **Deberías ver:**
   ```json
   {
     "success": true,
     "message": "Backend funcionando correctamente",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

## 📡 Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener perfil (requiere auth)

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Detalle de producto

### Carrito (requiere auth)
- `GET /api/cart` - Ver carrito
- `POST /api/cart` - Añadir al carrito
- `PUT /api/cart/:id` - Actualizar cantidad
- `DELETE /api/cart/:id` - Eliminar del carrito

### Pedidos (requiere auth)
- `POST /api/orders` - Crear pedido
- `GET /api/orders` - Listar pedidos del usuario
- `GET /api/orders/:id` - Detalle de pedido

### Usuario (requiere auth)
- `PUT /api/user/profile` - Actualizar perfil

### Admin (requiere auth + admin)
- `GET /api/admin/products` - Listar productos (admin)
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/:id` - Actualizar producto
- `DELETE /api/admin/products/:id` - Eliminar producto
- `GET /api/admin/orders` - Listar todos los pedidos
- `PUT /api/admin/orders/:id/status` - Cambiar estado de pedido

## 🔐 Usuario Admin por Defecto

Después de ejecutar el SQL, se crea un usuario admin:

- **Email:** `admin@rosesecret.com`
- **Password:** `admin123`

**⚠️ IMPORTANTE:** Cambia la contraseña en producción.

## 🔌 Conectar con Frontend

1. En el frontend, crea un archivo `src/api/client.js`:

```javascript
const API_URL = 'http://localhost:3000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }
  
  return data;
}
```

2. Actualiza los stores para usar la API real en lugar de mocks.

## 📦 Estructura del Proyecto

```
backend/
├── index.js                 # Entry point
├── db.js                    # Conexión a BD
├── package.json
├── .env                     # Variables de entorno (NO commitear)
├── env.example.txt         # Ejemplo de .env
├── routes/
│   ├── auth.routes.js      # Rutas de autenticación
│   ├── products.routes.js  # Rutas de productos
│   ├── cart.routes.js      # Rutas de carrito
│   ├── orders.routes.js    # Rutas de pedidos
│   └── user.routes.js      # Rutas de usuario
├── middleware/
│   └── auth.js             # Middleware de autenticación
└── database/
    └── schema.sql           # Esquema de base de datos
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos `rose_secret` exista

### Error: "JWT_SECRET is not defined"

1. Asegúrate de tener un archivo `.env`
2. Verifica que `JWT_SECRET` esté definido en `.env`

### Error: CORS

1. Verifica que `FRONTEND_URL` en `.env` coincida con la URL de tu frontend
2. Si usas un puerto diferente, actualiza `FRONTEND_URL`

## 🚀 Deploy a Hosting Gratuito

### Opción 1: Railway (Recomendado)

1. Crea cuenta en [Railway](https://railway.app)
2. Conecta tu repositorio GitHub
3. Añade variable de entorno `NODE_ENV=production`
4. Configura las variables de BD
5. Deploy automático

### Opción 2: Render

1. Crea cuenta en [Render](https://render.com)
2. Crea nuevo "Web Service"
3. Conecta repositorio
4. Configura variables de entorno
5. Deploy

### Opción 3: 000webhost

1. Crea cuenta en [000webhost](https://000webhost.com)
2. Sube archivos vía FTP
3. Configura base de datos MySQL en el panel
4. Actualiza `.env` con credenciales del hosting

## 🔧 Optimizaciones de Performance (FASE 2)

### Ejecutar Migración de Índices

Para mejorar significativamente el rendimiento, ejecuta la migración de índices:

```bash
mysql -u root -p rose_secret < database/migrations/fase2_performance_indexes.sql
```

Esto agregará índices estratégicos que mejoran el rendimiento de queries críticas en **60-80%**.

**Impacto esperado:**
- Listado de órdenes: 60-80% más rápido
- Listado de productos: 50-70% más rápido
- Consultas de carrito: 40-60% más rápido

### Cache

El sistema incluye cache estratégico para:
- **Productos:** TTL de 60 segundos
- **Categorías:** TTL de 5 minutos
- **Configuración de App:** TTL de 5 minutos

**Variables de entorno opcionales:**
```env
CACHE_MAX_SIZE=500              # Tamaño máximo del cache
CACHE_DEFAULT_TTL=60000         # TTL por defecto (60s)
CACHE_TTL_PRODUCTS_LIST=60      # TTL para listado de productos
CACHE_TTL_CATEGORIES=300        # TTL para categorías
CACHE_TTL_APP_CONFIG=300        # TTL para configuración de app
```

### Health Checks

El sistema incluye endpoints de health check:

- `GET /api/health` - Estado básico (DB + memoria)
- `GET /api/ready` - Estado completo (DB + cache + logger + rate limiter)

Útiles para monitoreo y load balancers.

### Correlation IDs

Todas las requests incluyen un `X-Request-Id` header para trazabilidad. Este ID se propaga en todos los logs para facilitar debugging.

## 📝 Notas

- Este es un MVP mínimo. No incluye pagos reales, reviews, analytics, etc.
- Los pedidos se crean con estado "pending". Un admin puede cambiar el estado.
- El carrito es persistente por usuario (requiere autenticación).
- No hay variantes de productos en el MVP (solo un precio por producto).

## 📚 Documentación Adicional

### Operativa
- **RUNBOOK.md**: Guía operativa y troubleshooting
- **DEPLOYMENT.md**: Guía completa de despliegue
- **CONTRIBUTING.md**: Guía para desarrolladores

### Técnica
- **Concurrencia y Race Conditions:** Ver `docs/CONCURRENCY.md`
- **Seguridad:** Ver `docs/SECURITY.md`
- **Manejo de Errores:** Ver `docs/ERROR_HANDLING.md`
- **Arquitectura:** Ver `docs/ARCHITECTURE.md`
- **Configuración de Redis:** Ver `docs/REDIS_SETUP.md`

### API
- **Swagger UI**: http://localhost:3000/api-docs (desarrollo)
- **OpenAPI Spec**: http://localhost:3000/api-docs/json

### Fases
- **Resumen de FASE 1:** Ver `FASE1_RESUMEN_CAMBIOS.md`
- **Resumen de FASE 2:** Ver `FASE2_RESUMEN_CAMBIOS.md`
- **Resumen de FASE 3:** Ver `FASE3_RESUMEN_CAMBIOS.md`
- **Resumen de FASE 4:** Ver `FASE4_RESUMEN_CAMBIOS.md`
- **Resumen de FASE 5:** Ver `FASE5_RESUMEN_CAMBIOS.md`

## 🔴 Redis para Multi-Instancia (FASE 3)

### Configuración Básica

Para habilitar soporte multi-instancia, configura Redis:

```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

**Sin Redis:** El sistema funciona en instancia única con cache in-memory.

**Con Redis:** El sistema escala a múltiples instancias con cache y locks distribuidos.

Ver documentación completa en: `docs/REDIS_SETUP.md`

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica la conexión a la base de datos
3. Asegúrate de que todas las variables de entorno estén configuradas

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo tests de integración
npm run test:integration

# Modo watch
npm run test:watch
```

**Requisitos:**
- Base de datos configurada (usa la BD del `.env` o crea una de test)
- Ver `tests/README.md` para más información

---

**Versión:** 1.0.0 MVP  
**Última actualización:** 29 de Diciembre, 2025 (FASE 2 completada)

