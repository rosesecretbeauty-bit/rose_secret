// ============================================
// Rate Limit Configuration - Centralizada
// ============================================
// Configuración centralizada de límites por tipo de ruta

/**
 * Configuración de rate limits por tipo de ruta
 * Valores pueden ser sobrescritos por variables de entorno
 */
const RATE_LIMIT_CONFIG = {
  // Rutas públicas generales (GET /products, etc.)
  PUBLIC: {
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || '200', 10), // 200 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_PUBLIC_BLOCK || '300000', 10), // 5 min
    keyType: 'ip',
    message: 'Demasiadas solicitudes desde esta IP'
  },

  // Rutas públicas sensibles (búsqueda, etc.)
  PUBLIC_SENSITIVE: {
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_SENSITIVE_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_SENSITIVE_MAX || '50', 10), // 50 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_PUBLIC_SENSITIVE_BLOCK || '300000', 10), // 5 min
    keyType: 'ip',
    message: 'Demasiadas solicitudes de búsqueda'
  },

  // Autenticación (login, register)
  AUTH: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || (process.env.NODE_ENV === 'development' ? '20' : '5'), 10), // 20 en dev, 5 en prod
    blockDurationMs: parseInt(process.env.RATE_LIMIT_AUTH_BLOCK || (process.env.NODE_ENV === 'development' ? '60000' : '1800000'), 10), // 1 min en dev, 30 min en prod
    keyType: 'combined',
    message: 'Demasiados intentos de autenticación',
    skipSuccessfulRequests: true
  },

  // Login específico
  LOGIN: {
    windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || (process.env.NODE_ENV === 'development' ? '20' : '5'), 10), // 20 en dev, 5 en prod
    blockDurationMs: parseInt(process.env.RATE_LIMIT_LOGIN_BLOCK || (process.env.NODE_ENV === 'development' ? '60000' : '1800000'), 10), // 1 min en dev, 30 min en prod
    keyType: 'combined',
    message: 'Demasiados intentos de login',
    skipSuccessfulRequests: true
  },

  // Registro
  REGISTER: {
    windowMs: parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW || '3600000', 10), // 1 hora
    maxRequests: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || (process.env.NODE_ENV === 'development' ? '10' : '3'), 10), // 10 en dev, 3 en prod
    blockDurationMs: parseInt(process.env.RATE_LIMIT_REGISTER_BLOCK || (process.env.NODE_ENV === 'development' ? '300000' : '3600000'), 10), // 5 min en dev, 1 hora en prod
    keyType: 'ip',
    message: 'Demasiados intentos de registro'
  },

  // Rutas privadas (requieren auth)
  PRIVATE: {
    windowMs: parseInt(process.env.RATE_LIMIT_PRIVATE_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_PRIVATE_MAX || '100', 10), // 100 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_PRIVATE_BLOCK || '300000', 10), // 5 min
    keyType: 'user', // Fallback a IP si no hay userId
    message: 'Demasiadas solicitudes'
  },

  // Admin
  ADMIN: {
    windowMs: parseInt(process.env.RATE_LIMIT_ADMIN_WINDOW || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_ADMIN_MAX || '60', 10), // 60 req/15min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_ADMIN_BLOCK || '1800000', 10), // 30 min
    keyType: 'user',
    message: 'Demasiadas solicitudes al panel admin'
  },

  // Métricas admin
  METRICS: {
    windowMs: parseInt(process.env.RATE_LIMIT_METRICS_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_METRICS_MAX || '30', 10), // 30 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_METRICS_BLOCK || '600000', 10), // 10 min
    keyType: 'user',
    message: 'Demasiadas solicitudes de métricas'
  },

  // Auditoría admin
  AUDIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUDIT_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_AUDIT_MAX || '20', 10), // 20 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_AUDIT_BLOCK || '600000', 10), // 10 min
    keyType: 'user',
    message: 'Demasiadas solicitudes de auditoría'
  },

  // Pagos
  PAYMENT: {
    windowMs: parseInt(process.env.RATE_LIMIT_PAYMENT_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_PAYMENT_MAX || '10', 10), // 10 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_PAYMENT_BLOCK || '900000', 10), // 15 min
    keyType: 'user',
    message: 'Demasiados intentos de pago'
  },

  // Checkout
  CHECKOUT: {
    windowMs: parseInt(process.env.RATE_LIMIT_CHECKOUT_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_CHECKOUT_MAX || '10', 10), // 10 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_CHECKOUT_BLOCK || '300000', 10), // 5 min
    keyType: 'user',
    message: 'Demasiadas solicitudes de checkout'
  },

  // Health/Ready (internas, muy permisivo)
  INTERNAL: {
    windowMs: parseInt(process.env.RATE_LIMIT_INTERNAL_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_INTERNAL_MAX || '1000', 10), // 1000 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_INTERNAL_BLOCK || '60000', 10), // 1 min
    keyType: 'ip',
    message: 'Demasiadas solicitudes a endpoints internos'
  },

  // API routes (cart, stock validation - optional auth)
  API: {
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW || '60000', 10), // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '100', 10), // 100 req/min
    blockDurationMs: parseInt(process.env.RATE_LIMIT_API_BLOCK || '300000', 10), // 5 min
    keyType: 'user', // Fallback a IP si no hay userId
    message: 'Demasiadas solicitudes a la API'
  }
};

/**
 * Obtener configuración de rate limit por tipo
 * @param {string} type - Tipo de rate limit
 * @returns {Object} Configuración
 */
function getRateLimitConfig(type) {
  return RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.PUBLIC;
}

/**
 * Verificar si rate limiting está habilitado
 * @returns {boolean}
 */
function isEnabled() {
  return process.env.RATE_LIMIT_ENABLED !== 'false';
}

/**
 * Obtener configuración completa
 */
function getConfig() {
  return {
    ...RATE_LIMIT_CONFIG,
    enabled: isEnabled()
  };
}

module.exports = {
  RATE_LIMIT_CONFIG,
  getRateLimitConfig,
  isEnabled,
  getConfig
};

