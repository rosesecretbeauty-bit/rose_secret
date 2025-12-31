// ============================================
// Redis Client - Con Fallback a In-Memory
// ============================================
// Sistema híbrido que usa Redis si está disponible, sino usa in-memory
// Permite funcionar en instancia única y escalar a multi-instancia

const { info, warn, error: logError } = require('../logger');

let redisClient = null;
let redisAvailable = false;
let useRedis = false;

// Inicializar Redis si está configurado
async function initializeRedis() {
  // Verificar si Redis está habilitado
  if (process.env.REDIS_ENABLED === 'true' && process.env.REDIS_URL) {
    try {
      const redis = require('redis');
      
      const redisUrl = process.env.REDIS_URL;
      redisClient = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              warn('Redis: Max reconnection attempts reached, falling back to in-memory');
              redisAvailable = false;
              return false; // Stop trying
            }
            return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
          }
        }
      });

      redisClient.on('error', (err) => {
        logError('Redis client error:', err);
        redisAvailable = false;
      });

      redisClient.on('connect', () => {
        info('Redis: Connected successfully');
        redisAvailable = true;
      });

      redisClient.on('reconnecting', () => {
        warn('Redis: Reconnecting...');
        redisAvailable = false;
      });

      redisClient.on('ready', () => {
        info('Redis: Ready for commands');
        redisAvailable = true;
        useRedis = true;
      });

      await redisClient.connect();
      redisAvailable = true;
      useRedis = true;
      info('Redis: Initialized successfully');
    } catch (err) {
      logError('Redis: Failed to initialize, using in-memory fallback:', err);
      redisAvailable = false;
      useRedis = false;
      redisClient = null;
    }
  } else {
    info('Redis: Not configured (REDIS_ENABLED=false or REDIS_URL missing), using in-memory');
    redisAvailable = false;
    useRedis = false;
  }
}

/**
 * Verificar si Redis está disponible
 */
function isRedisAvailable() {
  return redisAvailable && redisClient && redisClient.isReady;
}

/**
 * Obtener valor de Redis
 */
async function get(key) {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (value === null) {
      return null;
    }
    // Intentar parsear JSON, si falla retornar como string
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (err) {
    logError(`Redis get error for key ${key}:`, err);
    redisAvailable = false;
    return null;
  }
}

/**
 * Guardar valor en Redis
 */
async function set(key, value, ttlMs = null) {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const options = {};
    
    if (ttlMs && ttlMs > 0) {
      options.EX = Math.floor(ttlMs / 1000); // Redis EX está en segundos
    }

    await redisClient.set(key, serialized, options);
    return true;
  } catch (err) {
    logError(`Redis set error for key ${key}:`, err);
    redisAvailable = false;
    return false;
  }
}

/**
 * Eliminar de Redis
 */
async function del(key) {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (err) {
    logError(`Redis del error for key ${key}:`, err);
    redisAvailable = false;
    return false;
  }
}

/**
 * Eliminar por patrón (usando SCAN)
 */
async function delPattern(pattern) {
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    let deleted = 0;
    let cursor = 0;
    
    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      
      cursor = result.cursor;
      const keys = result.keys;
      
      if (keys.length > 0) {
        const deletedCount = await redisClient.del(keys);
        deleted += deletedCount;
      }
    } while (cursor !== 0);

    return deleted;
  } catch (err) {
    logError(`Redis delPattern error for pattern ${pattern}:`, err);
    redisAvailable = false;
    return 0;
  }
}

/**
 * Adquirir lock distribuido
 * @param {string} key - Clave del lock
 * @param {number} ttlMs - Tiempo de vida del lock en ms
 * @param {number} retries - Número de reintentos
 * @param {number} retryDelayMs - Delay entre reintentos en ms
 * @returns {Promise<{acquired: boolean, lockId?: string}>}
 */
async function acquireLock(key, ttlMs = 5000, retries = 3, retryDelayMs = 100) {
  if (!isRedisAvailable()) {
    // Sin Redis, no podemos hacer locks distribuidos
    // Retornar false para que el código use locks de DB
    return { acquired: false };
  }

  const lockKey = `lock:${key}`;
  const lockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const ttlSeconds = Math.floor(ttlMs / 1000);

  for (let i = 0; i < retries; i++) {
    try {
      // SET con NX (only if not exists) y EX (expiration)
      const result = await redisClient.set(lockKey, lockId, {
        NX: true,  // Solo si no existe
        EX: ttlSeconds  // Expira en ttlSeconds
      });

      if (result === 'OK') {
        return { acquired: true, lockId };
      }

      // Lock no adquirido, esperar antes de reintentar
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    } catch (err) {
      logError(`Redis lock acquire error for key ${key}:`, err);
      if (i === retries - 1) {
        redisAvailable = false;
        return { acquired: false };
      }
    }
  }

  return { acquired: false };
}

/**
 * Liberar lock distribuido
 */
async function releaseLock(key, lockId) {
  if (!isRedisAvailable()) {
    return false;
  }

  const lockKey = `lock:${key}`;

  try {
    // Usar Lua script para liberar solo si el lockId coincide (atomic)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await redisClient.eval(script, {
      keys: [lockKey],
      arguments: [lockId]
    });

    return result === 1;
  } catch (err) {
    logError(`Redis lock release error for key ${key}:`, err);
    redisAvailable = false;
    return false;
  }
}

/**
 * Extender TTL de un lock
 */
async function extendLock(key, lockId, ttlMs) {
  if (!isRedisAvailable()) {
    return false;
  }

  const lockKey = `lock:${key}`;
  const ttlSeconds = Math.floor(ttlMs / 1000);

  try {
    // Lua script para extender solo si el lockId coincide
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    
    const result = await redisClient.eval(script, {
      keys: [lockKey],
      arguments: [lockId, ttlSeconds.toString()]
    });

    return result === 1;
  } catch (err) {
    logError(`Redis lock extend error for key ${key}:`, err);
    return false;
  }
}

/**
 * Verificar estado de Redis
 */
function getStatus() {
  return {
    enabled: process.env.REDIS_ENABLED === 'true',
    available: isRedisAvailable(),
    configured: !!process.env.REDIS_URL,
    useRedis
  };
}

/**
 * Cerrar conexión Redis
 */
async function close() {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      info('Redis: Connection closed');
    } catch (err) {
      logError('Redis: Error closing connection:', err);
    }
    redisClient = null;
    redisAvailable = false;
    useRedis = false;
  }
}

module.exports = {
  initializeRedis,
  isRedisAvailable,
  get,
  set,
  del,
  delPattern,
  acquireLock,
  releaseLock,
  extendLock,
  getStatus,
  close
};

