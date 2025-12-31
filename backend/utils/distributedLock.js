// ============================================
// Distributed Lock Utility
// ============================================
// Sistema de locks distribuidos con Redis, con fallback a locks de DB
// FASE 3: Preparación para multi-instancia

const redis = require('../cache/redis');
const { warn } = require('../logger');

/**
 * Ejecutar función con lock distribuido
 * @param {string} lockKey - Clave única del lock (ej: "stock:variant:123")
 * @param {Function} fn - Función async a ejecutar dentro del lock
 * @param {Object} options - Opciones del lock
 * @param {number} options.ttlMs - Tiempo de vida del lock en ms (default: 5000)
 * @param {number} options.maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} options.retryDelayMs - Delay entre reintentos en ms (default: 100)
 * @param {boolean} options.useDatabaseLock - Si true, usar FOR UPDATE de DB como fallback (default: true)
 * @returns {Promise<any>} Resultado de la función
 */
async function withDistributedLock(lockKey, fn, options = {}) {
  const {
    ttlMs = 5000,
    maxRetries = 3,
    retryDelayMs = 100,
    useDatabaseLock = true
  } = options;

  // Intentar adquirir lock distribuido con Redis
  if (redis.isRedisAvailable()) {
    const lockResult = await redis.acquireLock(lockKey, ttlMs, maxRetries, retryDelayMs);

    if (lockResult.acquired) {
      // Lock adquirido, ejecutar función
      try {
        // Si la función tarda más que el TTL, extender el lock
        const startTime = Date.now();
        const extendInterval = setInterval(async () => {
          const elapsed = Date.now() - startTime;
          if (elapsed < ttlMs * 0.8) { // Extender antes de que expire (80% del TTL)
            await redis.extendLock(lockKey, lockResult.lockId, ttlMs);
          }
        }, Math.floor(ttlMs * 0.5)); // Verificar cada 50% del TTL

        try {
          const result = await fn();
          clearInterval(extendInterval);
          await redis.releaseLock(lockKey, lockResult.lockId);
          return result;
        } catch (error) {
          clearInterval(extendInterval);
          await redis.releaseLock(lockKey, lockResult.lockId);
          throw error;
        }
      } catch (error) {
        // Asegurarse de liberar el lock incluso si hay error
        try {
          await redis.releaseLock(lockKey, lockResult.lockId);
        } catch (releaseError) {
          warn(`Failed to release lock ${lockKey}:`, releaseError);
        }
        throw error;
      }
    } else {
      // Lock no adquirido después de reintentos
      throw new Error(`Could not acquire distributed lock for ${lockKey} after ${maxRetries} retries`);
    }
  } else {
    // Redis no disponible
    if (useDatabaseLock) {
      // Usar lock de DB como fallback (FOR UPDATE)
      // La función fn debe estar preparada para recibir una transacción con lock
      warn(`Redis not available, using database lock for ${lockKey}`);
      return await fn(); // La función debe manejar el lock de DB internamente
    } else {
      // Sin Redis y sin fallback, ejecutar directamente (riesgo de race condition)
      warn(`Redis not available and useDatabaseLock=false, executing without lock for ${lockKey} (RISKY)`);
      return await fn();
    }
  }
}

module.exports = {
  withDistributedLock
};

