// ============================================
// Cache en Memoria (Simple, sin Redis)
// ============================================

const cache = new Map();
const TTL = 60 * 1000; // 60 segundos por defecto

/**
 * Obtener valor del cache
 */
function get(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  // Verificar si expiró
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

/**
 * Guardar en cache
 */
function set(key, value, ttl = TTL) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  });
}

/**
 * Eliminar del cache
 */
function del(key) {
  cache.delete(key);
}

/**
 * Limpiar cache por patrón
 */
function clearPattern(pattern) {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Limpiar todo el cache
 */
function clear() {
  cache.clear();
}

/**
 * Obtener estadísticas del cache
 */
function stats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

/**
 * Obtener o establecer valor en cache (get or set pattern)
 * Si existe en cache, lo retorna. Si no, ejecuta la función y guarda el resultado.
 * @param {string} key - Clave del cache
 * @param {Function} fn - Función async que retorna el valor a cachear
 * @param {number} ttl - Tiempo de vida en milisegundos (opcional)
 * @returns {Promise<any>} - Valor del cache o resultado de la función
 */
async function getOrSetCache(key, fn, ttl = TTL) {
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = await fn();
  set(key, value, ttl);
  return value;
}

/**
 * Limpiar cache por patrón (alias para clearPattern)
 */
function clearCacheByPattern(pattern) {
  clearPattern(pattern);
}

/**
 * Limpiar cache específico (alias para del)
 */
function clearCache(key) {
  del(key);
}

module.exports = {
  get,
  set,
  del,
  clear,
  clearPattern,
  stats,
  getOrSetCache,
  clearCacheByPattern,
  clearCache
};

