// ============================================
// Cache Manager - Auto-selector
// ============================================
// Exporta cacheManagerRedis si Redis está disponible, sino cacheManager (in-memory)
// Permite transición transparente de instancia única a multi-instancia

const redis = require('./redis');
const cacheManagerRedis = require('./cacheManagerRedis');
const cacheManagerInMemory = require('./cacheManager');

// Inicializar Redis si está configurado
let initialized = false;

async function initialize() {
  if (!initialized) {
    await redis.initializeRedis();
    initialized = true;
  }
}

// Auto-inicializar si Redis está habilitado
if (process.env.REDIS_ENABLED === 'true') {
  initialize().catch(err => {
    console.warn('Cache: Redis initialization failed, using in-memory:', err.message);
  });
}

/**
 * Obtener el cache manager apropiado
 */
function getCacheManager() {
  // Si Redis está habilitado y disponible, usar cacheManagerRedis
  if (process.env.REDIS_ENABLED === 'true' && redis.isRedisAvailable()) {
    return cacheManagerRedis;
  }
  
  // Sino, usar in-memory
  return cacheManagerInMemory;
}

// Exportar funciones que delegan al cache manager apropiado
// Nota: Las funciones son async cuando usan Redis, sync cuando usan in-memory
// Para mantener compatibilidad, todas las funciones exportadas son async
module.exports = {
  get: async (key) => {
    const manager = getCacheManager();
    const result = await manager.get(key);
    return result;
  },
  set: async (key, value, ttl) => {
    const manager = getCacheManager();
    const result = await manager.set(key, value, ttl);
    return result;
  },
  del: async (key) => {
    const manager = getCacheManager();
    const result = await manager.del(key);
    return result;
  },
  delPattern: async (pattern) => {
    const manager = getCacheManager();
    const result = await manager.delPattern(pattern);
    return result;
  },
  flush: async () => {
    const manager = getCacheManager();
    await manager.flush();
  },
  getStats: async () => {
    const manager = getCacheManager();
    const stats = await manager.getStats();
    return stats;
  },
  resetStats: () => {
    const manager = getCacheManager();
    if (manager.resetStats) {
      manager.resetStats();
    }
  },
  getOrSet: async (key, fn, ttl) => {
    const manager = getCacheManager();
    const result = await manager.getOrSet(key, fn, ttl);
    return result;
  },
  isHealthy: () => {
    const manager = getCacheManager();
    return manager.isHealthy();
  },
  // Funciones adicionales
  initialize,
  isRedisAvailable: () => redis.isRedisAvailable(),
  getRedisStatus: () => redis.getStatus()
};

