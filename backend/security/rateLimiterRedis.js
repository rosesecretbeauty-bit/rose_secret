// ============================================
// Rate Limiter Redis Helper
// ============================================
// FASE 4: Funciones helper para rate limiting distribuido con Redis

const redis = require('../cache/redis');
const { warn } = require('../logger');

const RATE_LIMIT_KEY_PREFIX = 'ratelimit:';
const BLOCK_KEY_PREFIX = 'ratelimit:block:';

/**
 * Incrementar contador en Redis con ventana deslizante
 */
async function incrementCounterRedis(key, windowMs) {
  if (!redis.isRedisAvailable()) {
    return null; // Fallback a in-memory
  }

  try {
    const now = Date.now();
    const redisKey = `${RATE_LIMIT_KEY_PREFIX}${key}`;
    
    // Obtener valor actual
    const current = await redis.get(redisKey);
    
    if (current === null) {
      // Nueva ventana
      await redis.set(redisKey, JSON.stringify({
        count: 1,
        windowStart: now
      }), windowMs);
      return 1;
    }

    const data = JSON.parse(current);
    const elapsed = now - data.windowStart;

    if (elapsed > windowMs) {
      // Ventana expirada, nueva ventana
      await redis.set(redisKey, JSON.stringify({
        count: 1,
        windowStart: now
      }), windowMs);
      return 1;
    }

    // Incrementar en ventana existente
    data.count++;
    const remainingTTL = windowMs - elapsed;
    await redis.set(redisKey, JSON.stringify(data), remainingTTL);
    return data.count;
  } catch (error) {
    warn('Redis rate limit increment failed, using in-memory', { error: error.message, key });
    return null; // Fallback
  }
}

/**
 * Obtener contador actual de Redis
 */
async function getCounterRedis(key) {
  if (!redis.isRedisAvailable()) {
    return null;
  }

  try {
    const redisKey = `${RATE_LIMIT_KEY_PREFIX}${key}`;
    const current = await redis.get(redisKey);
    
    if (current === null) {
      return 0;
    }

    const data = JSON.parse(current);
    return data.count || 0;
  } catch (error) {
    warn('Redis rate limit get failed', { error: error.message, key });
    return null;
  }
}

/**
 * Bloquear clave en Redis
 */
async function blockKeyRedis(key, durationMs) {
  if (!redis.isRedisAvailable()) {
    return false;
  }

  try {
    const blockKey = `${BLOCK_KEY_PREFIX}${key}`;
    await redis.set(blockKey, 'true', durationMs);
    return true;
  } catch (error) {
    warn('Redis rate limit block failed', { error: error.message, key });
    return false;
  }
}

/**
 * Verificar si clave está bloqueada en Redis y obtener TTL restante
 */
async function isBlockedRedis(key) {
  if (!redis.isRedisAvailable()) {
    return { blocked: false, ttl: 0 };
  }

  try {
    const blockKey = `${BLOCK_KEY_PREFIX}${key}`;
    // Usar TTL para obtener tiempo restante
    const redisClient = require('../cache/redis');
    if (!redisClient.isRedisAvailable()) {
      return { blocked: false, ttl: 0 };
    }

    // Verificar si existe y obtener TTL
    const exists = await redis.get(blockKey);
    if (exists !== 'true') {
      return { blocked: false, ttl: 0 };
    }

    // Obtener TTL (en segundos)
    // Nota: Redis TTL devuelve -2 si no existe, -1 si no tiene expiración
    // Como usamos set con TTL, siempre debe tener expiración
    // Por simplicidad, retornamos que está bloqueado
    // El TTL exacto puede obtenerse con comandos Redis adicionales si es necesario
    return { blocked: true, ttl: null }; // TTL se calculará desde duración original si es necesario
  } catch (error) {
    warn('Redis rate limit block check failed', { error: error.message, key });
    return { blocked: false, ttl: 0 };
  }
}

module.exports = {
  incrementCounterRedis,
  getCounterRedis,
  blockKeyRedis,
  isBlockedRedis
};

