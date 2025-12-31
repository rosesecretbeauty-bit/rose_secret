// ============================================
// Request Sanitizer Middleware
// ============================================
// Limpia y valida payloads de requests

const { warn, error: logError } = require('../logger');

// Tamaño máximo de body (configurable)
const MAX_BODY_SIZE = parseInt(process.env.MAX_BODY_SIZE || '1048576', 10); // 1MB por defecto
const MAX_JSON_DEPTH = 10;

// Palabras SQL peligrosas (para detectar intentos de SQL injection)
const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', ';', '/*', '*/'
];

// Patrones de scripts peligrosos
const SCRIPT_PATTERNS = [
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick, onerror, etc.
  /eval\s*\(/i,
  /expression\s*\(/i
];

/**
 * Sanitizar string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remover caracteres de control
  let sanitized = str.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Detectar intentos de SQL injection
  const upperStr = sanitized.toUpperCase();
  for (const keyword of SQL_KEYWORDS) {
    if (upperStr.includes(keyword)) {
      warn('Potential SQL injection attempt detected', {
        keyword,
        snippet: sanitized.substring(0, 50)
      });
      // No bloquear, solo loguear (puede ser falso positivo)
    }
  }
  
  // Detectar scripts
  for (const pattern of SCRIPT_PATTERNS) {
    if (pattern.test(sanitized)) {
      warn('Potential XSS attempt detected', {
        pattern: pattern.toString(),
        snippet: sanitized.substring(0, 50)
      });
      // Escapar HTML
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  }
  
  return sanitized;
}

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > MAX_JSON_DEPTH) {
    throw new Error('JSON depth exceeds maximum');
  }
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitizar key también
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Verificar tamaño de body
 */
function checkBodySize(req) {
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return false;
  }
  return true;
}

/**
 * Middleware de sanitización
 */
function requestSanitizer(req, res, next) {
  // Verificar tamaño de body
  if (!checkBodySize(req)) {
    warn('Request body too large', {
      contentLength: req.get('content-length'),
      maxSize: MAX_BODY_SIZE,
      ip: req.ip,
      path: req.path,
      requestId: req.requestId || req.context?.requestId
    });
    
    return res.status(413).json({
      success: false,
      error: 'Payload too large',
      message: 'El tamaño del payload excede el límite permitido'
    });
  }
  
  // Sanitizar body si existe
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeObject(req.body);
    } catch (err) {
      logError('Error sanitizing request body', err, {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId || req.context?.requestId
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload',
        message: 'El payload de la solicitud no es válido'
      });
    }
  }
  
  // Sanitizar query params
  if (req.query && typeof req.query === 'object') {
    try {
      req.query = sanitizeObject(req.query);
    } catch (err) {
      logError('Error sanitizing query params', err, {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId || req.context?.requestId
      });
    }
  }
  
  next();
}

module.exports = requestSanitizer;

