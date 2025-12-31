// ============================================
// Critical Logger Middleware
// ============================================
// Separa logs críticos (auth, pagos, admin, webhooks)

const { critical, warn } = require('../logger');

/**
 * Middleware para registrar eventos críticos
 * Se aplica a rutas sensibles: auth, payments, admin, webhooks
 */
function criticalLogger(req, res, next) {
  const isCriticalRoute = 
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/payments') ||
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/webhooks');

  if (isCriticalRoute) {
    const originalSend = res.send;
    res.send = function(data) {
      const metadata = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userId: req.user?.id || null,
        ip: req.ip
      };

      // Log crítico para errores o acciones importantes
      if (res.statusCode >= 400) {
        if (res.statusCode >= 500) {
          critical('Critical error in sensitive route', metadata);
        } else {
          warn('Client error in sensitive route', metadata);
        }
      } else if (req.method !== 'GET') {
        // Log todas las acciones de escritura en rutas críticas
        critical('Action in critical route', {
          ...metadata,
          action: req.method
        });
      }

      return originalSend.call(this, data);
    };
  }

  next();
}

module.exports = criticalLogger;

