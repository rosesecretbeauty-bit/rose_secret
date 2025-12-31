// ============================================
// Enumeration Protection Middleware
// ============================================
// Protege contra enumeración de recursos

const { warn } = require('../logger');
const { detectEnumeration } = require('../security/abuseDetector');

// Delay mínimo para respuestas 404 (para evitar timing attacks)
const MIN_404_DELAY = 100; // 100ms

/**
 * Middleware para proteger contra enumeración
 * Hace que todos los 404 tengan tiempos similares y mensajes homogéneos
 */
function enumerationProtection(req, res, next) {
  // Interceptar respuestas 404
  const originalStatus = res.status;
  const originalJson = res.json;
  
  res.status = function(code) {
    if (code === 404) {
      // Aplicar delay mínimo para evitar timing attacks
      const startTime = Date.now();
      
      // Detectar si es enumeración
      const isEnumeration = detectEnumeration(req.ip, req.path, 404);
      
      if (isEnumeration) {
        warn('Potential enumeration detected', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          requestId: req.requestId || req.context?.requestId
        });
      }
      
      // Asegurar delay mínimo
      const delay = Math.max(0, MIN_404_DELAY - (Date.now() - startTime));
      if (delay > 0) {
        setTimeout(() => {
          originalStatus.call(this, 404);
        }, delay);
      } else {
        originalStatus.call(this, 404);
      }
      
      return this;
    }
    
    return originalStatus.call(this, code);
  };
  
  res.json = function(data) {
    // Si es 404, usar mensaje genérico y detectar enumeración
    if (res.statusCode === 404) {
      // Detectar enumeración (llamada después de que se establece el status)
      const isEnumeration = detectEnumeration(req.ip, req.path, 404);
      
      if (isEnumeration) {
        warn('Potential enumeration detected', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          requestId: req.requestId || req.context?.requestId
        });
      }
      
      const genericResponse = {
        success: false,
        message: 'Recurso no encontrado'
      };
      return originalJson.call(this, genericResponse);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

module.exports = enumerationProtection;

