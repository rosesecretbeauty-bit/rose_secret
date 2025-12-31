// ============================================
// Request Context Middleware
// ============================================
// Genera y propaga Correlation ID (Request ID) para trazabilidad

const crypto = require('crypto');

/**
 * Middleware para generar y propagar Request ID
 */
function requestContext(req, res, next) {
  // Generar o usar Request ID existente
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(16).toString('hex');
  
  // Agregar al request
  req.requestId = requestId;
  req.apiVersion = req.apiVersion || 1; // Del middleware apiVersion
  
  // Agregar contexto al request
  req.context = {
    requestId,
    apiVersion: req.apiVersion,
    userId: req.user?.id || null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    method: req.method,
    path: req.path
  };
  
  // Agregar header de respuesta
  res.setHeader('X-Request-Id', requestId);
  
  // Si hay versión de API, agregarla también
  if (req.apiVersion) {
    res.setHeader('X-API-Version', req.apiVersion);
  }
  
  next();
}

module.exports = requestContext;

