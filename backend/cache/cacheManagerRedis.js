// ============================================
// Cache Manager - Híbrido (Redis + In-Memory Fallback)
// ============================================
// Usa Redis si está disponible, sino usa el cacheManager original (in-memory)
// Permite funcionar en instancia única y escalar a multi-instancia

const { info, debug } = require('../logger');
const metricsService = require('../metrics/metrics.service');
const redis = require('./redis');
const inMemoryCache = require('./cacheManager'); // Fallback

const DEFAULT_TTL = parseInt(process.env.CACHE_DEFAULT_TTL || '60000', 10); // 60s por defecto

/**
 * Obtener valor del cache (Redis primero, luego in-memory)
 */
async function get(key) {
  // Intentar Redis primero
  if (redis.isRedisAvailable()) {
    try {
      const value = await redis.get(key);
      if (value !== null) {
        metricsService.recordCacheHit();
        debug(`Cache hit (Redis): ${key}`);
        return value;
      }
    } catch (error) {
      debug(`Redis get failed for ${key}, trying in-memory:`, error.message);
    }
  }

  // Fallback a in-memory
  const value = inMemoryCache.get(key);
  if (value !== null) {
    metricsService.recordCacheHit();
    debug(`Cache hit (in-memory): ${key}`);
    return value;
  }

  // Miss en ambos
  metricsService.recordCacheMiss();
  debug(`Cache miss: ${key}`);
  return null;
}

/**
 * Guardar en cache (ambos si Redis está disponible)
 */
async function set(key, value, ttl = DEFAULT_TTL) {
  if (process.env.CACHE_ENABLED === 'false') {
    debug(`Cache disabled, skipping set for: ${key}`);
    return false;
  }

  if (value === null || value === undefined) {
    debug(`Cannot cache null/undefined value for: ${key}`);
    return false;
  }

  if (ttl <= 0) {
    debug(`TTL <= 0, skipping cache for: ${key}`);
    return false;
  }

  let redisSet = false;
  let memorySet = false;

  // Guardar en Redis si está disponible
  if (redis.isRedisAvailable()) {
    try {
      redisSet = await redis.set(key, value, ttl);
    } catch (error) {
      debug(`Redis set failed for ${key}, using in-memory only:`, error.message);
    }
  }

  // Siempre guardar en in-memory como fallback
  memorySet = inMemoryCache.set(key, value, ttl);

  debug(`Cache set: ${key} (Redis: ${redisSet}, Memory: ${memorySet})`);
  return redisSet || memorySet;
}

/**
 * Eliminar del cache
 */
async function del(key) {
  let redisDel = false;
  let memoryDel = false;

  // Eliminar de Redis si está disponible
  if (redis.isRedisAvailable()) {
    try {
      redisDel = await redis.del(key);
    } catch (error) {
      debug(`Redis del failed for ${key}:`, error.message);
    }
  }

  // Eliminar de in-memory
  memoryDel = inMemoryCache.del(key);

  debug(`Cache delete: ${key} (Redis: ${redisDel}, Memory: ${memoryDel})`);
  return redisDel || memoryDel;
}

/**
 * Eliminar por patrón
 */
async function delPattern(pattern) {
  let redisDel = 0;
  let memoryDel = 0;

  // Eliminar de Redis si está disponible
  if (redis.isRedisAvailable()) {
    try {
      redisDel = await redis.delPattern(pattern);
    } catch (error) {
      debug(`Redis delPattern failed for ${pattern}:`, error.message);
    }
  }

  // Eliminar de in-memory
  memoryDel = inMemoryCache.delPattern(pattern);

  debug(`Cache delete pattern: ${pattern} (Redis: ${redisDel}, Memory: ${memoryDel})`);
  return redisDel + memoryDel;
}

/**
 * Limpiar todo el cache
 */
async function flush() {
  // Flush Redis si está disponible
  if (redis.isRedisAvailable()) {
    try {
      // Eliminar todas las claves de cache (patrón cache:*)
      await redis.delPattern('cache:*');
    } catch (error) {
      debug('Redis flush failed:', error.message);
    }
  }

  // Flush in-memory
  inMemoryCache.flush();
  info('Cache flushed (Redis + Memory)');
}

/**
 * Obtener estadísticas combinadas
 */
async function getStats() {
  const memoryStats = inMemoryCache.getStats();
  const redisStatus = redis.getStatus();

  return {
    ...memoryStats,
    redis: redisStatus,
    strategy: redisStatus.available ? 'redis+memory' : 'memory-only'
  };
}

/**
 * Get or Set pattern
 */
async function getOrSet(key, fn, ttl = DEFAULT_TTL) {
  // Intentar obtener del cache primero
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss: ejecutar función
  const value = await fn();

  // Cachear el resultado
  await set(key, value, ttl);

  return value;
}

/**
 * Verificar si el cache está saludable
 */
function isHealthy() {
  const memoryHealthy = inMemoryCache.isHealthy();
  const redisHealthy = redis.isRedisAvailable();

  // Si Redis está disponible, confiar en Redis
  if (redisHealthy) {
    return true;
  }

  // Sino, confiar en memory
  return memoryHealthy;
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  flush,
  getStats,
  resetStats: inMemoryCache.resetStats,
  getOrSet,
  isHealthy
};

