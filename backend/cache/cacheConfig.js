// ============================================
// Cache Configuration - TTLs Centralizados
// ============================================
// Configuración centralizada de TTLs por tipo de recurso

const { debug } = require('../logger');

/**
 * TTLs por tipo de recurso (en milisegundos)
 * Estos valores pueden ser sobrescritos por variables de entorno
 */
const TTL_CONFIG = {
  // Productos públicos
  PRODUCTS_LIST: parseInt(process.env.CACHE_TTL_PRODUCTS_LIST || '60000', 10), // 60s
  PRODUCT_DETAIL: parseInt(process.env.CACHE_TTL_PRODUCT_DETAIL || '60000', 10), // 60s
  
  // Categorías (cambian poco)
  CATEGORIES_LIST: parseInt(process.env.CACHE_TTL_CATEGORIES || '300000', 10), // 5min
  
  // Home page
  HOME_DATA: parseInt(process.env.CACHE_TTL_HOME || '60000', 10), // 60s
  
  // Datos de usuario (cache aislado, TTL corto)
  USER_CART: parseInt(process.env.CACHE_TTL_USER_CART || '30000', 10), // 30s
  USER_WISHLIST: parseInt(process.env.CACHE_TTL_USER_WISHLIST || '30000', 10), // 30s
  USER_ORDERS: parseInt(process.env.CACHE_TTL_USER_ORDERS || '0', 10), // NO cachear (0 = deshabilitado)
  
  // Admin (NO cachear por defecto)
  ADMIN_PRODUCTS: 0, // NO cachear
  ADMIN_ORDERS: 0, // NO cachear
  ADMIN_METRICS: 0, // NO cachear
  ADMIN_AUDIT: 0 // NO cachear
};

/**
 * Obtener TTL para un tipo de recurso
 * @param {string} resourceType - Tipo de recurso
 * @returns {number} TTL en milisegundos
 */
function getTTL(resourceType) {
  const ttl = TTL_CONFIG[resourceType] || TTL_CONFIG.PRODUCTS_LIST;
  
  // Validar que el TTL sea válido
  if (ttl < 0) {
    debug(`Invalid TTL for ${resourceType}, using default`);
    return TTL_CONFIG.PRODUCTS_LIST;
  }
  
  return ttl;
}

/**
 * Verificar si un recurso debe ser cacheado
 * @param {string} resourceType - Tipo de recurso
 * @returns {boolean}
 */
function shouldCache(resourceType) {
  const ttl = getTTL(resourceType);
  return ttl > 0;
}

/**
 * Obtener configuración completa
 */
function getConfig() {
  return {
    ...TTL_CONFIG,
    enabled: process.env.CACHE_ENABLED !== 'false',
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '500', 10)
  };
}

module.exports = {
  TTL_CONFIG,
  getTTL,
  shouldCache,
  getConfig
};

