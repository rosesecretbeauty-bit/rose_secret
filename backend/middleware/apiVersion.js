// ============================================
// API Version Middleware
// ============================================
// Identifica y registra la versión de API utilizada

const { info, warn } = require('../logger');

/**
 * Middleware para identificar versión de API
 */
function apiVersion(req, res, next) {
  // Extraer versión de la URL
  const versionMatch = req.path.match(/^\/api\/v(\d+)/);
  const version = versionMatch ? parseInt(versionMatch[1]) : null;

  // Si no hay versión explícita, asumir v1 (compatibilidad)
  req.apiVersion = version || 1;

  // Agregar versión al contexto de request
  req.apiContext = {
    version: req.apiVersion,
    path: req.path,
    method: req.method
  };

  // Log de versión (solo en desarrollo o si es v2+)
  if (process.env.NODE_ENV !== 'production' || req.apiVersion > 1) {
    info(`API Request - Version ${req.apiVersion}`, {
      method: req.method,
      path: req.path,
      version: req.apiVersion
    });
  }

  next();
}

/**
 * Middleware para agregar headers de versión y deprecación
 */
function apiVersionHeaders(req, res, next) {
  // Agregar header con versión actual
  res.setHeader('X-API-Version', req.apiVersion || 1);

  // Headers de deprecación (preparación futura)
  // Cuando una versión se deprecque, configurar aquí:
  const deprecatedVersions = {}; // { version: { deprecated: true, sunset: 'YYYY-MM-DD' } }
  
  // Ejemplo futuro:
  // const deprecatedVersions = {
  //   1: { deprecated: true, sunset: '2025-12-31' }
  // };

  const deprecationInfo = deprecatedVersions[req.apiVersion];
  
  if (deprecationInfo && deprecationInfo.deprecated) {
    res.setHeader('X-API-Deprecated', 'true');
    if (deprecationInfo.sunset) {
      res.setHeader('X-API-Sunset', deprecationInfo.sunset);
    }
    
    // Log warning en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      warn('Deprecated API version used', {
        version: req.apiVersion,
        path: req.path,
        sunset: deprecationInfo.sunset
      });
    }
  }

  // Header con versión recomendada
  res.setHeader('X-API-Current-Version', '1');

  next();
}

/**
 * Middleware para validar versión soportada
 */
function validateApiVersion(req, res, next) {
  const supportedVersions = [1]; // Versiones soportadas actualmente

  if (req.apiVersion && !supportedVersions.includes(req.apiVersion)) {
    return res.status(404).json({
      success: false,
      message: `API version ${req.apiVersion} not found`,
      supportedVersions: supportedVersions,
      currentVersion: 1
    });
  }

  next();
}

module.exports = {
  apiVersion,
  apiVersionHeaders,
  validateApiVersion
};

