// ============================================
// Secure Endpoint Middleware
// ============================================
// Protege endpoints críticos (pagos, webhooks, admin)

const { critical, warn } = require('../logger');

/**
 * Verificar origen de webhook (Stripe)
 */
function verifyWebhookOrigin(req, res, next) {
  // Verificar que viene de Stripe (por IP o header)
  const stripeSignature = req.headers['stripe-signature'];
  
  if (!stripeSignature) {
    warn('Webhook request without stripe-signature', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  }

  // Verificar método HTTP (solo POST para webhooks)
  if (req.method !== 'POST') {
    warn('Invalid method for webhook', {
      method: req.method,
      ip: req.ip,
      path: req.path
    });
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  next();
}

/**
 * Verificar que el request viene del frontend autorizado
 */
function verifyFrontendOrigin(req, res, next) {
  const origin = req.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];

  // En desarrollo, permitir requests sin origin
  if (process.env.NODE_ENV !== 'production' && !origin) {
    return next();
  }

  if (!origin || !allowedOrigins.includes(origin)) {
    warn('Request from unauthorized origin', {
      origin,
      ip: req.ip,
      path: req.path,
      allowedOrigins
    });
    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  }

  next();
}

/**
 * Proteger endpoint de pagos
 */
function protectPaymentEndpoint(req, res, next) {
  // Verificar autenticación
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
  }

  // Verificar método (solo POST para pagos)
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Log crítico de intentos de pago
  critical('Payment endpoint accessed', {
    userId: req.user.id,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  next();
}

/**
 * Proteger endpoint de admin
 */
function protectAdminEndpoint(req, res, next) {
  // Verificar autenticación
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
  }

  // Verificar rol admin
  if (req.user.role !== 'admin') {
    warn('Non-admin attempted admin endpoint', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path,
      ip: req.ip
    });
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }

  // Log crítico de acceso admin
  critical('Admin endpoint accessed', {
    userId: req.user.id,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  next();
}

module.exports = {
  verifyWebhookOrigin,
  verifyFrontendOrigin,
  protectPaymentEndpoint,
  protectAdminEndpoint
};

