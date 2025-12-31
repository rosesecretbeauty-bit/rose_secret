// ============================================
// Log Levels
// ============================================

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
  AUDIT: 5,
  PAYMENT: 6
};

const LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'CRITICAL',
  5: 'AUDIT',
  6: 'PAYMENT'
};

/**
 * Obtener nivel mínimo según entorno
 */
function getMinLevel() {
  const env = process.env.NODE_ENV || 'development';
  const debug = process.env.DEBUG === 'true';
  
  if (env === 'production') {
    return LEVELS.INFO; // Solo INFO y superiores en producción
  }
  
  if (debug) {
    return LEVELS.DEBUG;
  }
  
  return LEVELS.INFO;
}

module.exports = {
  LEVELS,
  LEVEL_NAMES,
  getMinLevel
};

