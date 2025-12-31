// ============================================
// Request Logger Middleware (Mejorado)
// ============================================
// Registra todas las peticiones HTTP con contexto completo

const { createRequestLogger } = require('../logger');
const metricsService = require('../metrics/metrics.service');

/**
 * Middleware para registrar todas las peticiones HTTP
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Crear logger con contexto de request
  const logger = createRequestLogger(
    req.requestId || req.context?.requestId,
    req.apiVersion || 1,
    req.user?.id
  );
  
  // Capturar el status code cuando se envía la respuesta
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    logRequest();
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    logRequest();
    return originalJson.call(this, data);
  };
  
  function logRequest() {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Metadata de la request
    const metadata = {
      method: req.method,
      path: req.path,
      statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null,
      userRole: req.user?.role || null,
      apiVersion: req.apiVersion || 1,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      // NO loguear body (puede contener datos sensibles)
    };
    
    // Determinar nivel según status code
    if (statusCode >= 500) {
      logger.error(`HTTP ${statusCode} - ${req.method} ${req.path}`, null, metadata);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${statusCode} - ${req.method} ${req.path}`, metadata);
    } else {
      logger.info(`HTTP ${statusCode} - ${req.method} ${req.path}`, metadata);
    }

    // Registrar en métricas
    metricsService.recordRequest(
      req.method,
      req.path,
      statusCode,
      duration,
      req.apiVersion || 1
    );
  }
  
  next();
}

module.exports = requestLogger;
