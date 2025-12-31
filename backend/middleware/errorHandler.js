// ============================================
// Error Handler Middleware (Mejorado)
// ============================================
// Manejo centralizado de errores con logging estructurado

const crypto = require('crypto');
const { createRequestLogger } = require('../logger');
const { error: logError, critical: logCritical } = require('../logger');
const metricsService = require('../metrics/metrics.service');
const {
  AppError,
  ValidationError,
  AuthError,
  PermissionError,
  BusinessError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
  RateLimitError,
  DatabaseError
} = require('../utils/errors');

/**
 * Clasificar tipo de error
 * FASE 4: Mejorado para usar clases de error personalizadas
 */
function classifyError(err) {
  // Si ya es una instancia de AppError, usar directamente
  if (err instanceof AppError) {
    return {
      type: err.type,
      status: err.statusCode,
      message: err.message,
      userMessage: err.userMessage,
      ...(err.errors && { errors: err.errors }),
      ...(err.retryAfter && { retryAfter: err.retryAfter }),
      ...(err.permission && { permission: err.permission })
    };
  }

  // Clases de error personalizadas (por nombre)
  if (err instanceof ValidationError) {
    return {
      type: 'VALIDATION_ERROR',
      status: 400,
      message: err.message,
      userMessage: err.userMessage,
      errors: err.errors
    };
  }

  if (err instanceof AuthError) {
    return {
      type: 'AUTH_ERROR',
      status: 401,
      message: err.message,
      userMessage: err.userMessage
    };
  }

  if (err instanceof PermissionError) {
    return {
      type: 'PERMISSION_ERROR',
      status: 403,
      message: err.message,
      userMessage: err.userMessage,
      permission: err.permission
    };
  }

  if (err instanceof BusinessError) {
    return {
      type: 'BUSINESS_LOGIC_ERROR',
      status: 400,
      message: err.message,
      userMessage: err.userMessage,
      code: err.code
    };
  }

  if (err instanceof NotFoundError) {
    return {
      type: 'NOT_FOUND_ERROR',
      status: 404,
      message: err.message,
      userMessage: err.userMessage
    };
  }

  if (err instanceof ConflictError) {
    return {
      type: 'CONFLICT_ERROR',
      status: 409,
      message: err.message,
      userMessage: err.userMessage
    };
  }

  if (err instanceof RateLimitError) {
    return {
      type: 'RATE_LIMIT_ERROR',
      status: 429,
      message: err.message,
      userMessage: err.userMessage,
      retryAfter: err.retryAfter
    };
  }

  // Errores de validación (express-validator)
  if (err.name === 'ValidationError' || err.type === 'validation') {
    return {
      type: 'VALIDATION_ERROR',
      status: 400,
      message: 'Errores de validación',
      userMessage: 'Los datos proporcionados no son válidos',
      errors: err.errors || [err.message]
    };
  }

  // Errores de autenticación (JWT)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return {
      type: 'AUTH_ERROR',
      status: 401,
      message: 'Token inválido o expirado',
      userMessage: 'Credenciales inválidas'
    };
  }

  // Errores de autorización
  if (err.status === 403 || err.name === 'ForbiddenError') {
    return {
      type: 'PERMISSION_ERROR',
      status: 403,
      message: 'Acceso denegado',
      userMessage: 'No tienes permisos para realizar esta acción'
    };
  }

  // Errores de base de datos
  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    return {
      type: 'CONFLICT_ERROR',
      status: 409,
      message: 'El recurso ya existe',
      userMessage: 'El recurso ya existe'
    };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === '23503') {
    return {
      type: 'VALIDATION_ERROR',
      status: 400,
      message: 'Referencia inválida',
      userMessage: 'Referencia inválida'
    };
  }

  // Errores de Stripe
  if (err.type && err.type.startsWith('Stripe')) {
    return {
      type: 'STRIPE_ERROR',
      status: 400,
      message: err.message || 'Error con el procesador de pagos',
      userMessage: err.stripeError?.userMessage || 'Error procesando el pago',
      stripeCode: err.code,
      stripeType: err.type
    };
  }

  // Error 404
  if (err.status === 404 || err.name === 'NotFoundError') {
    return {
      type: 'NOT_FOUND_ERROR',
      status: 404,
      message: err.message || 'Recurso no encontrado',
      userMessage: 'Recurso no encontrado'
    };
  }

  // Error genérico
  return {
    type: 'INTERNAL_ERROR',
    status: err.status || err.statusCode || 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor',
    userMessage: 'Ha ocurrido un error. Por favor intenta más tarde'
  };
}

/**
 * Middleware centralizado de manejo de errores
 */
function errorHandler(err, req, res, next) {
  // Crear logger con contexto de request
  const logger = createRequestLogger(
    req.requestId || req.context?.requestId,
    req.apiVersion || 1,
    req.user?.id
  );

  // Clasificar error
  const errorInfo = classifyError(err);
  const errorId = err.errorId || crypto.randomUUID();

  // Determinar si es crítico
  const isCritical = errorInfo.status >= 500 || 
                     req.path?.startsWith('/api/admin') ||
                     req.path?.startsWith('/api/payments') ||
                     req.path?.startsWith('/api/webhooks');

  // Metadata del error
  const errorMetadata = {
    errorId,
    errorType: errorInfo.type,
    errorCode: err.code,
    path: req.path,
    method: req.method,
    statusCode: errorInfo.status,
    userId: req.user?.id || null,
    userRole: req.user?.role || null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    apiVersion: req.apiVersion || 1,
    ...(process.env.NODE_ENV === 'development' && {
      body: req.body,
      params: req.params,
      query: req.query
    })
  };

  // Agregar información específica según tipo
  if (errorInfo.stripeCode) {
    errorMetadata.stripeCode = errorInfo.stripeCode;
    errorMetadata.stripeType = errorInfo.stripeType;
  }

  // Log del error
  if (isCritical) {
    logCritical(`Critical error: ${errorInfo.message}`, {
      ...errorMetadata,
      error: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
      }
    });
  } else {
    logger.error(`Error: ${errorInfo.message}`, err, errorMetadata);
  }

  // Registrar en métricas
  metricsService.recordError(errorInfo.type, req.path);

  // Respuesta al cliente
  const response = {
    success: false,
    message: errorInfo.userMessage,
    errorId, // Incluir ID para que el cliente pueda reportarlo
    ...(errorInfo.type === 'VALIDATION_ERROR' && {
      errors: err.errors || [err.message]
    })
  };

  // En desarrollo, incluir más detalles (NUNCA en producción)
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    response.debug = {
      type: errorInfo.type,
      message: errorInfo.message,
      ...(errorInfo.stripeCode && {
        stripeCode: errorInfo.stripeCode
      })
    };
  }
  
  // Asegurar que stack traces nunca se envíen al cliente
  // Solo loguear en servidor
  if (err.stack && process.env.NODE_ENV === 'production') {
    // Stack trace solo en logs, nunca en respuesta
    logError('Stack trace (production):', { stack: err.stack }, errorMetadata);
  }

  res.status(errorInfo.status).json(response);
}

module.exports = {
  errorHandler,
  classifyError
};

// Exportar clases de error para uso en otros módulos
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.AuthError = AuthError;
module.exports.PermissionError = PermissionError;
module.exports.BusinessError = BusinessError;
module.exports.NotFoundError = NotFoundError;
module.exports.ConflictError = ConflictError;
module.exports.ServiceUnavailableError = ServiceUnavailableError;
module.exports.RateLimitError = RateLimitError;
module.exports.DatabaseError = DatabaseError;
