// ============================================
// Rate Limiting Middleware
// ============================================

const rateLimit = require('express-rate-limit');
const { warn } = require('../logger');

// Rate limit general para toda la API (público - alto)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde'
  },
  standardHeaders: true, // Retorna rate limit info en headers
  legacyHeaders: false,
  handler: (req, res) => {
    // Log de intentos bloqueados
    warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde'
    });
  }
});

// Rate limit estricto para login (auth - bajo, crítico)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de login. Por favor intenta en 15 minutos'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log crítico de intentos bloqueados en login
    warn('Login rate limit exceeded - potential brute force', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email ? '[REDACTED]' : null,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de login. Por favor intenta en 15 minutos'
    });
  }
});

// Rate limit para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por IP por hora
  message: {
    success: false,
    message: 'Demasiados intentos de registro. Por favor intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para checkout
const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto
  message: {
    success: false,
    message: 'Demasiadas solicitudes de checkout. Por favor espera un momento'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para pagos
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 intentos de pago por minuto
  message: {
    success: false,
    message: 'Demasiados intentos de pago. Por favor espera un momento'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit estricto para admin
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes al panel admin'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log crítico de intentos bloqueados en admin
    warn('Admin rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id || null,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes al panel admin'
    });
  }
});

// Rate limit para webhooks (más permisivo, pero con límite)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 webhooks por minuto (Stripe puede enviar muchos)
  message: {
    success: false,
    message: 'Demasiados webhooks recibidos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  checkoutLimiter,
  paymentLimiter,
  adminLimiter,
  webhookLimiter
};

