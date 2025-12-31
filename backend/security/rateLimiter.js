// ============================================
// Advanced Rate Limiter - Sliding Window
// ============================================
// Rate limiting con ventanas deslizantes y claves compuestas
// Integrado con métricas y configuración centralizada

const { warn, critical, debug } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');
const { getRateLimitConfig, isEnabled } = require('./rateLimitConfig');
const redis = require('../cache/redis'); // FASE 4: Rate limiting distribuido
const { RateLimitError } = require('../utils/errors');
const {
  incrementCounterRedis,
  getCounterRedis,
  blockKeyRedis,
  isBlockedRedis
} = require('./rateLimiterRedis');

// Almacenamiento híbrido: Redis (distribuido) + in-memory (fallback)
const requestCounts = new Map();
const blockedKeys = new Map();
const RATE_LIMIT_KEY_PREFIX = 'ratelimit:';
const BLOCK_KEY_PREFIX = 'ratelimit:block:';

// Limpiar datos antiguos cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > data.windowMs) {
      requestCounts.delete(key);
    }
  }
  for (const [key, blockTime] of blockedKeys.entries()) {
    if (now - blockTime.blockedAt > blockTime.blockDuration) {
      blockedKeys.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generar clave compuesta para rate limiting
 */
function generateKey(req, type = 'ip') {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (type === 'ip') {
    return `rate:ip:${ip}`;
  } else if (type === 'user') {
    const userId = req.user?.id;
    return userId ? `rate:user:${userId}` : `rate:ip:${ip}`;
  } else if (type === 'endpoint') {
    return `rate:endpoint:${ip}:${req.method}:${req.path}`;
  } else if (type === 'combined') {
    const userId = req.user?.id;
    return `rate:combined:${ip}:${userId || 'anonymous'}:${req.method}:${req.path}`;
  }
  
  return `rate:ip:${ip}`;
}

/**
 * Verificar si una clave está bloqueada (FASE 4: Redis + in-memory)
 * Retorna: { blocked: boolean, remainingSeconds: number | null }
 */
async function isBlocked(key) {
  // Intentar Redis primero
  const redisResult = await isBlockedRedis(key);
  if (redisResult.blocked) {
    // Si está bloqueado pero no tenemos TTL exacto, retornar bloqueado
    // El remaining se calculará desde blockDuration si es necesario
    return { blocked: true, remainingSeconds: null };
  }

  // Fallback a in-memory
  const block = blockedKeys.get(key);
  if (!block) {
    return { blocked: false, remainingSeconds: 0 };
  }
  
  const now = Date.now();
  const elapsed = now - block.blockedAt;
  if (elapsed > block.blockDuration) {
    blockedKeys.delete(key);
    return { blocked: false, remainingSeconds: 0 };
  }
  
  const remainingSeconds = Math.ceil((block.blockDuration - elapsed) / 1000);
  return { blocked: true, remainingSeconds };
}

/**
 * Bloquear una clave (FASE 4: Redis + in-memory)
 */
async function blockKey(key, durationMs) {
  // Intentar Redis primero
  await blockKeyRedis(key, durationMs);

  // También en in-memory como fallback
  blockedKeys.set(key, {
    blockedAt: Date.now(),
    blockDuration: durationMs
  });
}

/**
 * Incrementar contador de requests (FASE 4: Redis + in-memory)
 */
async function incrementCounter(key, windowMs) {
  // Intentar Redis primero
  const redisCount = await incrementCounterRedis(key, windowMs);
  if (redisCount !== null) {
    return redisCount;
  }

  // Fallback a in-memory
  const now = Date.now();
  const data = requestCounts.get(key);
  
  if (!data || now - data.windowStart > windowMs) {
    // Nueva ventana
    requestCounts.set(key, {
      count: 1,
      windowStart: now,
      windowMs
    });
    return 1;
  }
  
  // Incrementar en ventana existente
  data.count++;
  return data.count;
}

/**
 * Obtener contador actual (FASE 4: Redis + in-memory)
 */
async function getCounter(key) {
  // Intentar Redis primero
  const redisCount = await getCounterRedis(key);
  if (redisCount !== null) {
    return redisCount;
  }

  // Fallback a in-memory
  const data = requestCounts.get(key);
  if (!data) return 0;
  
  const now = Date.now();
  if (now - data.windowStart > data.windowMs) {
    requestCounts.delete(key);
    return 0;
  }
  
  return data.count;
}

/**
 * Crear rate limiter configurable
 * @param {Object|string} config - Configuración o tipo de rate limit
 */
function createRateLimiter(config) {
  // Si es string, obtener configuración por tipo
  const configObj = typeof config === 'string' 
    ? getRateLimitConfig(config)
    : config;

  const {
    windowMs = 60 * 1000,           // 1 minuto por defecto
    maxRequests = 100,               // 100 requests por defecto
    blockDurationMs = 10 * 60 * 1000, // 10 minutos de bloqueo
    keyType = 'ip',                  // ip, user, endpoint, combined
    message = 'Too many requests',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = configObj;

  return async (req, res, next) => {
    // Verificar si está habilitado globalmente
    if (!isEnabled()) {
      if (process.env.NODE_ENV === 'development') {
        debug('Rate limiting disabled globally');
      }
      return next();
    }

    // Bypass en development si se especifica (solo para debugging)
    if (process.env.NODE_ENV === 'development' && req.query.bypassRateLimit === 'true') {
      debug('Rate limit bypassed via query param (development only)');
      return next();
    }

    const key = generateKey(req, keyType);
    
    // Verificar si está bloqueado (FASE 4: Redis + in-memory)
    const blockResult = await isBlocked(key);
    if (blockResult.blocked) {
      // Obtener remaining desde resultado o calcular desde in-memory
      let remaining = blockResult.remainingSeconds;
      if (remaining === null) {
        // Si viene de Redis sin TTL exacto, usar blockDuration
        remaining = Math.ceil(blockDurationMs / 1000);
      }
      
      // Obtener información de bloqueo de in-memory si existe
      const block = blockedKeys.get(key);
      if (block && blockResult.remainingSeconds === null) {
        remaining = Math.ceil((block.blockDuration - (Date.now() - block.blockedAt)) / 1000);
      }
      
      critical('Rate limit block active', {
        key,
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user?.id || null,
        remainingSeconds: remaining,
        requestId: req.requestId || req.context?.requestId
      });

      // Registrar auditoría si hay usuario
      if (req.user?.id) {
        await auditService.logAudit(
          'RATE_LIMIT_BLOCK',
          'security',
          null,
          null,
          { key, path: req.path, remainingSeconds: remaining },
          req
        ).catch(() => {}); // No fallar si la auditoría falla
      }

      // Agregar headers cuando está bloqueado
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + (block.blockDuration - (Date.now() - block.blockedAt))) / 1000));
      res.setHeader('Retry-After', remaining);

      // FASE 4: Usar RateLimitError
      const rateLimitErr = new RateLimitError(`Demasiadas solicitudes. Intenta nuevamente en ${remaining} segundos.`, remaining);
      return next(rateLimitErr);
    }

    // Incrementar contador (FASE 4: Redis + in-memory)
    const count = await incrementCounter(key, windowMs);
    
    // Calcular tiempo de reset
    const data = requestCounts.get(key);
    const resetTime = Math.ceil((data.windowStart + windowMs) / 1000);
    
    // Agregar headers informativos (siempre, incluso si no se excede)
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
    res.setHeader('X-RateLimit-Reset', resetTime);
    
    // Registrar métrica de request permitido
    metricsService.recordRateLimitAllowed(req.path, req.method);

    // Verificar límite
    if (count > maxRequests) {
      // Bloquear (FASE 4: Redis + in-memory)
      await blockKey(key, blockDurationMs);
      
      // Registrar métrica
      metricsService.recordRateLimitExceeded(req.path, req.method);
      
      // Registrar violación en sistema de reputación
      const { recordViolation } = require('./ipReputation');
      recordViolation(req.ip, 'RATE_LIMIT_EXCEEDED', 'medium');
      
      warn('Rate limit exceeded', {
        key,
        ip: req.ip,
        path: req.path,
        method: req.method,
        count,
        maxRequests,
        userId: req.user?.id || null,
        requestId: req.requestId || req.context?.requestId
      });

      // Registrar auditoría si hay usuario
      if (req.user?.id) {
        await auditService.logAudit(
          'RATE_LIMIT_EXCEEDED',
          'security',
          null,
          null,
          { key, path: req.path, count, maxRequests },
          req
        ).catch(() => {});
      }

      // Agregar headers incluso cuando se bloquea
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', resetTime);
      res.setHeader('Retry-After', Math.ceil(blockDurationMs / 1000));

      // FASE 4: Usar RateLimitError
      const retryAfter = Math.ceil(blockDurationMs / 1000);
      const rateLimitErr = new RateLimitError(`Demasiadas solicitudes. Intenta nuevamente en ${retryAfter} segundos.`, retryAfter);
      return next(rateLimitErr);
    }

    // Continuar
    next();
  };
}

/**
 * Rate limiters pre-configurados usando configuración centralizada
 */
const rateLimiters = {
  // Público - Alto límite (GET /products, etc.)
  public: createRateLimiter('PUBLIC'),

  // Público sensible - Límite medio (búsqueda, etc.)
  publicSensitive: createRateLimiter('PUBLIC_SENSITIVE'),

  // Autenticación - Crítico
  auth: createRateLimiter('AUTH'),

  // Login específico
  login: createRateLimiter('LOGIN'),

  // Registro
  register: createRateLimiter('REGISTER'),

  // Rutas privadas (requieren auth)
  private: createRateLimiter('PRIVATE'),

  // Pagos - Crítico
  payment: createRateLimiter('PAYMENT'),

  // Admin - Estricto
  admin: createRateLimiter('ADMIN'),

  // Métricas admin
  metrics: createRateLimiter('METRICS'),

  // Auditoría admin
  audit: createRateLimiter('AUDIT'),

  // Checkout
  checkout: createRateLimiter('CHECKOUT'),

  // Internas (health, ready)
  internal: createRateLimiter('INTERNAL'),

  // API routes (cart, stock - optional auth)
  api: createRateLimiter('API')
};

module.exports = {
  createRateLimiter,
  rateLimiters,
  generateKey,
  isBlocked,
  blockKey,
  getCounter,
  // Exportar para desarrollo (limpiar bloqueos)
  blockedKeys,
  requestCounts
};

