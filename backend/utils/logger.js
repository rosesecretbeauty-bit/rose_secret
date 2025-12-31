// ============================================
// Logger Utility - Logs Estructurados (JSON)
// ============================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const LOG_FORMAT = process.env.LOG_FORMAT || 'json'; // 'json' o 'text'

/**
 * Generar ID único para errores
 */
function generateErrorId() {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Sanitizar datos sensibles para logs
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = ['password', 'password_hash', 'token', 'authorization', 'api_key', 'secret', 'credit_card', 'cvv', 'ssn'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Formatear log como JSON o texto
 */
function formatLog(level, message, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };

  if (LOG_FORMAT === 'json') {
    return JSON.stringify(logEntry);
  } else {
    // Formato texto legible
    const metaStr = Object.keys(metadata).length > 0 
      ? ` ${JSON.stringify(metadata)}` 
      : '';
    return `[${level}] ${logEntry.timestamp} - ${message}${metaStr}`;
  }
}

/**
 * Log normal
 */
function log(message, metadata = {}) {
  if (!isProduction || metadata.critical) {
    const sanitized = sanitizeData(metadata);
    const formatted = formatLog('INFO', message, sanitized);
    console.log(formatted);
  }
}

/**
 * Log de error (siempre visible)
 */
function error(message, err = null, metadata = {}) {
  const errorId = generateErrorId();
  const errorMetadata = {
    errorId,
    ...metadata
  };

  if (err) {
    errorMetadata.error = {
      name: err.name,
      message: err.message,
      code: err.code,
      ...(isProduction ? {} : { stack: err.stack })
    };
  }

  const sanitized = sanitizeData(errorMetadata);
  const formatted = formatLog('ERROR', message, sanitized);
  console.error(formatted);
  
  return errorId; // Retornar ID para referencia
}

/**
 * Log de warning
 */
function warn(message, metadata = {}) {
  const sanitized = sanitizeData(metadata);
  const formatted = formatLog('WARN', message, sanitized);
  console.warn(formatted);
}

/**
 * Log de información
 */
function info(message, metadata = {}) {
  if (!isProduction) {
    const sanitized = sanitizeData(metadata);
    const formatted = formatLog('INFO', message, sanitized);
    console.info(formatted);
  }
}

/**
 * Log de debug
 */
function debug(message, metadata = {}) {
  if (!isProduction && process.env.DEBUG === 'true') {
    const sanitized = sanitizeData(metadata);
    const formatted = formatLog('DEBUG', message, sanitized);
    console.debug(formatted);
  }
}

/**
 * Log crítico (siempre visible, para eventos importantes)
 */
function critical(message, metadata = {}) {
  const errorId = generateErrorId();
  const criticalMetadata = {
    errorId,
    critical: true,
    ...metadata
  };
  const sanitized = sanitizeData(criticalMetadata);
  const formatted = formatLog('CRITICAL', message, sanitized);
  console.error(formatted);
  return errorId;
}

/**
 * Log de request HTTP
 */
function requestLog(req, res, duration, metadata = {}) {
  const logMetadata = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...metadata
  };

  // Determinar nivel según status code
  let level = 'INFO';
  if (res.statusCode >= 500) level = 'ERROR';
  else if (res.statusCode >= 400) level = 'WARN';

  const sanitized = sanitizeData(logMetadata);
  const formatted = formatLog(level, `${req.method} ${req.path} ${res.statusCode}`, sanitized);
  
  if (level === 'ERROR') {
    console.error(formatted);
  } else if (level === 'WARN') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

module.exports = {
  log,
  error,
  warn,
  info,
  debug,
  critical,
  requestLog,
  generateErrorId,
  sanitizeData
};
