// ============================================
// Cache Manager - LRU con TTL (In-Memory)
// ============================================
// Sistema de cache inteligente con LRU y métricas
// FASE 3: Este es el fallback cuando Redis no está disponible
// Para usar Redis, importar cacheManagerRedis en su lugar

const { info, debug } = require('../logger');
const metricsService = require('../metrics/metrics.service');

// Configuración
const MAX_SIZE = parseInt(process.env.CACHE_MAX_SIZE || '500', 10);
const DEFAULT_TTL = parseInt(process.env.CACHE_DEFAULT_TTL || '60000', 10); // 60s por defecto

// Almacenamiento
const cache = new Map();
const accessOrder = new Map(); // Para LRU
let accessCounter = 0;

// Métricas
let stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  evictions: 0,
  expires: 0
};

// Limpiar items expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [key, item] of cache.entries()) {
    if (item.expiresAt && now > item.expiresAt) {
      cache.delete(key);
      accessOrder.delete(key);
      expiredCount++;
      stats.expires++;
    }
  }
  
  if (expiredCount > 0) {
    debug(`Cache cleanup: ${expiredCount} items expired`);
  }
}, 5 * 60 * 1000);

/**
 * Actualizar orden de acceso (LRU)
 */
function updateAccessOrder(key) {
  accessCounter++;
  accessOrder.set(key, accessCounter);
}

/**
 * Obtener item menos usado recientemente
 */
function getLRUKey() {
  let lruKey = null;
  let minAccess = Infinity;
  
  for (const [key, access] of accessOrder.entries()) {
    if (access < minAccess) {
      minAccess = access;
      lruKey = key;
    }
  }
  
  return lruKey;
}

/**
 * Evictar item si el cache está lleno
 */
function evictIfNeeded() {
  if (cache.size >= MAX_SIZE) {
    const lruKey = getLRUKey();
    if (lruKey) {
      cache.delete(lruKey);
      accessOrder.delete(lruKey);
      stats.evictions++;
      debug(`Cache eviction: ${lruKey}`);
    }
  }
}

/**
 * Obtener valor del cache
 */
function get(key) {
  const item = cache.get(key);
  
  if (!item) {
    stats.misses++;
    metricsService.recordCacheMiss();
    return null;
  }
  
  // Verificar expiración
  if (item.expiresAt && Date.now() > item.expiresAt) {
    cache.delete(key);
    accessOrder.delete(key);
    stats.misses++;
    stats.expires++;
    metricsService.recordCacheMiss();
    return null;
  }
  
  // Actualizar orden de acceso
  updateAccessOrder(key);
  stats.hits++;
  metricsService.recordCacheHit();
  
  return item.value;
}

/**
 * Guardar en cache
 * @param {string} key - Clave del cache
 * @param {any} value - Valor a cachear
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {boolean} true si se cacheó, false si se omitió
 */
function set(key, value, ttl = DEFAULT_TTL) {
  try {
    // No cachear si está deshabilitado
    if (process.env.CACHE_ENABLED === 'false') {
      debug(`Cache disabled, skipping set for: ${key}`);
      return false;
    }
    
    // Validar que el valor no sea null/undefined
    if (value === null || value === undefined) {
      debug(`Cannot cache null/undefined value for: ${key}`);
      return false;
    }
    
    // Validar TTL
    if (ttl <= 0) {
      debug(`TTL <= 0, skipping cache for: ${key}`);
      return false;
    }
    
    // Evictar si es necesario
    evictIfNeeded();
    
    const expiresAt = Date.now() + ttl;
    
    cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    
    updateAccessOrder(key);
    stats.sets++;
    
    debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
    return true;
  } catch (error) {
    // Fallback seguro: si el cache falla, no romper la app
    const { warn } = require('../logger');
    warn(`Cache set failed for ${key}, continuing without cache`, { error: error.message });
    return false;
  }
}

/**
 * Eliminar del cache
 */
function del(key) {
  const deleted = cache.delete(key);
  accessOrder.delete(key);
  
  if (deleted) {
    stats.deletes++;
    debug(`Cache delete: ${key}`);
  }
  
  return deleted;
}

/**
 * Eliminar por patrón
 */
function delPattern(pattern) {
  const regex = new RegExp(pattern);
  let deleted = 0;
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      accessOrder.delete(key);
      deleted++;
    }
  }
  
  if (deleted > 0) {
    stats.deletes += deleted;
    debug(`Cache delete pattern: ${pattern} (${deleted} items)`);
  }
  
  return deleted;
}

/**
 * Limpiar todo el cache
 */
function flush() {
  const size = cache.size;
  cache.clear();
  accessOrder.clear();
  stats.deletes += size;
  info(`Cache flushed: ${size} items cleared`);
}

/**
 * Obtener estadísticas
 */
function getStats() {
  return {
    ...stats,
    size: cache.size,
    maxSize: MAX_SIZE,
    hitRatio: stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%'
      : '0%',
    utilization: ((cache.size / MAX_SIZE) * 100).toFixed(2) + '%'
  };
}

/**
 * Resetear estadísticas
 */
function resetStats() {
  stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    expires: 0
  };
}

/**
 * Obtener o establecer (get or set pattern)
 * Fallback seguro: si el cache falla, ejecuta la función igual
 * @param {string} key - Clave del cache
 * @param {Function} fn - Función async que retorna el valor
 * @param {number} ttl - Tiempo de vida en milisegundos
 * @returns {Promise<any>} Valor del cache o resultado de la función
 */
async function getOrSet(key, fn, ttl = DEFAULT_TTL) {
  try {
    // Intentar obtener del cache
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Cache miss: ejecutar función
    const value = await fn();
    
    // Intentar cachear (puede fallar, pero no rompe)
    set(key, value, ttl);
    
    return value;
  } catch (error) {
    // Fallback seguro: si todo falla, ejecutar función sin cache
    const { warn } = require('../logger');
    warn(`Cache getOrSet failed for ${key}, executing function without cache`, { error: error.message });
    
    try {
      return await fn();
    } catch (fnError) {
      // Si la función también falla, propagar el error
      throw fnError;
    }
  }
}

/**
 * Verificar si el cache está funcionando
 */
function isHealthy() {
  return cache.size < MAX_SIZE * 0.95; // 95% de capacidad
}

/**
 * Cerrar cache (cleanup)
 */
function close() {
  cache.clear();
  accessOrder.clear();
  stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    expires: 0
  };
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  flush,
  getStats,
  resetStats,
  getOrSet,
  isHealthy,
  close
};

