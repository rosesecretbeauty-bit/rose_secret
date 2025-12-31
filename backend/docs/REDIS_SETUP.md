# 🔴 Configuración de Redis para Multi-Instancia

## Descripción

Este documento describe cómo configurar Redis para habilitar el funcionamiento multi-instancia del backend de Rose Secret.

---

## 📋 ¿Cuándo usar Redis?

### ✅ **SÍ usar Redis si:**
- Tienes múltiples instancias del backend (load balancing)
- Necesitas cache compartido entre instancias
- Requieres locks distribuidos para operaciones críticas
- Quieres mejorar la escalabilidad horizontal

### ❌ **NO necesitas Redis si:**
- Solo tienes una instancia del backend
- El tráfico es bajo-medio
- No necesitas cache compartido
- Prefieres simplicidad sobre escalabilidad

---

## 🚀 Instalación de Redis

### Opción 1: Docker (Recomendado para Desarrollo)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Opción 2: Instalación Local

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Windows:
1. Descargar de: https://github.com/microsoftarchive/redis/releases
2. O usar WSL2: `sudo apt-get install redis-server`

### Opción 3: Servicio Cloud (Producción)

**Redis Cloud:**
- https://redis.com/cloud/
- Tier gratuito disponible
- Configuración en minutos

**AWS ElastiCache:**
- Servicio gestionado de AWS
- Alta disponibilidad incluida

**Azure Cache for Redis:**
- Servicio gestionado de Azure
- Integración con Azure Services

**Google Cloud Memorystore:**
- Servicio gestionado de GCP
- Alta disponibilidad

---

## ⚙️ Configuración en Backend

### 1. Instalar Dependencia

```bash
cd backend
npm install
```

La dependencia `redis` ya está en `package.json`.

### 2. Configurar Variables de Entorno

**Archivo `.env`:**

```env
# Habilitar Redis
REDIS_ENABLED=true

# URL de conexión
# Formato: redis://[password@]host[:port][/database]
REDIS_URL=redis://localhost:6379

# O con autenticación:
# REDIS_URL=redis://:password@localhost:6379

# O para Redis Cloud:
# REDIS_URL=redis://default:password@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

### 3. Verificar Funcionamiento

```bash
# Iniciar servidor
npm start

# Deberías ver en los logs:
# ✅ Redis: Conectado exitosamente
# O
# ⚠️ Redis: No disponible (usando fallback in-memory)
```

### 4. Probar Health Check

```bash
curl http://localhost:3000/api/ready
```

Respuesta esperada:
```json
{
  "status": "ready",
  "checks": {
    "cache": {
      "status": "healthy",
      "strategy": "redis+memory",
      "redis": "connected"
    }
  }
}
```

---

## 🔒 Seguridad

### Autenticación

**Opción 1: Password en URL**
```env
REDIS_URL=redis://:tu_password@localhost:6379
```

**Opción 2: Configurar en Redis**
```bash
# En redis.conf
requirepass tu_password_seguro
```

### Red Segura

**Para Producción:**
- ✅ Usar Redis en red privada (VPC)
- ✅ Habilitar TLS/SSL si está disponible
- ✅ Firewall que solo permita conexiones del backend
- ✅ Cambiar puerto por defecto (6379)

---

## 📊 Monitoreo

### Verificar Estado

```bash
# Conectar a Redis CLI
redis-cli

# Ver información
INFO stats
INFO memory
INFO clients

# Ver claves
KEYS *
```

### Métricas desde Backend

```bash
curl http://localhost:3000/api/admin/metrics
```

Incluye estadísticas de Redis si está configurado.

---

## 🐛 Troubleshooting

### Error: "Redis connection failed"

**Causas comunes:**
1. Redis no está corriendo
2. URL incorrecta
3. Firewall bloqueando conexión
4. Autenticación incorrecta

**Solución:**
```bash
# Verificar que Redis está corriendo
redis-cli ping
# Debería responder: PONG

# Verificar conectividad desde backend
# Revisar logs del servidor
```

### Fallback a In-Memory

Si Redis falla, el sistema automáticamente usa cache in-memory. Verás en los logs:
```
⚠️ Redis: Failed to initialize, using in-memory fallback
```

**Esto es seguro** - el sistema continúa funcionando, pero sin cache distribuido.

### Performance Degradada

Si notas que el cache no está funcionando bien:

1. **Verificar hit rate:**
   ```bash
   curl http://localhost:3000/api/admin/metrics
   ```

2. **Verificar conexión Redis:**
   ```bash
   redis-cli ping
   ```

3. **Revisar logs:**
   - Buscar errores de conexión
   - Verificar timeouts

---

## 🔄 Migración de Instancia Única a Multi-Instancia

### Paso 1: Configurar Redis

```env
REDIS_ENABLED=true
REDIS_URL=redis://tu-redis-server:6379
```

### Paso 2: Verificar Primera Instancia

```bash
# En instancia 1
npm start
# Verificar logs: Redis conectado
```

### Paso 3: Agregar Instancias Adicionales

```bash
# En instancia 2, 3, etc.
# Misma configuración de .env
npm start
```

### Paso 4: Configurar Load Balancer

```nginx
# nginx.conf
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

---

## 📚 Recursos Adicionales

- [Documentación Redis](https://redis.io/documentation)
- [Redis Commands](https://redis.io/commands)
- [Redis Best Practices](https://redis.io/topics/admin)

---

**Última actualización:** 29 de Diciembre, 2025

