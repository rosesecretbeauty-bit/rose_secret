// ============================================
// Log Formatters
// ============================================

const LOG_FORMAT = process.env.LOG_FORMAT || 'json';
const SERVICE_NAME = process.env.SERVICE_NAME || 'rose-secret-backend';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Sanitizar datos sensibles
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'password_hash', 'token', 'authorization', 
    'api_key', 'secret', 'credit_card', 'cvv', 'ssn',
    'stripe_secret', 'jwt_secret', 'webhook_secret'
  ];
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in sanitized) {
    const keyLower = key.toLowerCase();
    if (sensitiveKeys.some(sk => keyLower.includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Formatear log como JSON estructurado
 */
function formatJSON(level, message, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: SERVICE_NAME,
    environment: NODE_ENV,
    message,
    ...sanitizeData(metadata)
  };
  
  return JSON.stringify(logEntry);
}

/**
 * Formatear log como texto legible
 */
function formatText(level, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(8);
  const metaStr = Object.keys(metadata).length > 0 
    ? ` ${JSON.stringify(sanitizeData(metadata))}` 
    : '';
  
  return `[${levelStr}] ${timestamp} - ${message}${metaStr}`;
}

/**
 * Formatear log según configuración
 */
function format(level, message, metadata = {}) {
  if (LOG_FORMAT === 'json') {
    return formatJSON(level, message, metadata);
  } else {
    return formatText(level, message, metadata);
  }
}

module.exports = {
  format,
  formatJSON,
  formatText,
  sanitizeData
};

