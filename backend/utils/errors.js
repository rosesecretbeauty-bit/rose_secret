// ============================================
// Custom Error Classes
// ============================================
// Clases de error personalizadas para mejor manejo y tipado
// FASE 4: Hardening y calidad enterprise

/**
 * Error base personalizado
 */
class AppError extends Error {
  constructor(message, statusCode = 500, type = 'INTERNAL_ERROR', userMessage = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode;
    this.type = type;
    this.userMessage = userMessage || message;
    this.isOperational = true; // Errores operacionales (conocidos)
    
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convertir a JSON para respuestas
   */
  toJSON() {
    return {
      name: this.name,
      message: this.userMessage,
      type: this.type,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: this.stack,
        originalMessage: this.message
      })
    };
  }
}

/**
 * Error de validación
 * Status: 400
 */
class ValidationError extends AppError {
  constructor(message, errors = null, userMessage = null) {
    super(message, 400, 'VALIDATION_ERROR', userMessage || 'Los datos proporcionados no son válidos');
    this.errors = errors || [message];
    this.name = 'ValidationError';
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      errors: this.errors
    };
  }
}

/**
 * Error de autenticación
 * Status: 401
 */
class AuthError extends AppError {
  constructor(message = 'Credenciales inválidas', userMessage = null) {
    super(message, 401, 'AUTH_ERROR', userMessage || 'Credenciales inválidas');
    this.name = 'AuthError';
  }
}

/**
 * Error de autorización/permisos
 * Status: 403
 */
class PermissionError extends AppError {
  constructor(message = 'Acceso denegado', userMessage = null, permission = null) {
    super(message, 403, 'PERMISSION_ERROR', userMessage || 'No tienes permisos para realizar esta acción');
    this.name = 'PermissionError';
    this.permission = permission;
  }
}

/**
 * Error de lógica de negocio
 * Status: 400
 */
class BusinessError extends AppError {
  constructor(message, userMessage = null, code = null) {
    super(message, 400, 'BUSINESS_LOGIC_ERROR', userMessage || message);
    this.name = 'BusinessError';
    this.code = code;
  }
}

/**
 * Error de recurso no encontrado
 * Status: 404
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', resource = null) {
    super(message, 404, 'NOT_FOUND_ERROR', 'Recurso no encontrado');
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * Error de conflicto (ej: recurso duplicado)
 * Status: 409
 */
class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe', resource = null) {
    super(message, 409, 'CONFLICT_ERROR', message);
    this.name = 'ConflictError';
    this.resource = resource;
  }
}

/**
 * Error de servicio no disponible
 * Status: 503
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible', service = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE_ERROR', 'El servicio no está disponible temporalmente');
    this.name = 'ServiceUnavailableError';
    this.service = service;
  }
}

/**
 * Error de límite de tasa excedido
 * Status: 429
 */
class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes', retryAfter = null) {
    let userMessage = 'Demasiadas solicitudes. Por favor intenta más tarde';
    if (retryAfter) {
      const minutes = Math.floor(retryAfter / 60);
      const seconds = retryAfter % 60;
      if (minutes > 0) {
        userMessage = `Demasiadas solicitudes. Por favor intenta nuevamente en ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else {
        userMessage = `Demasiadas solicitudes. Por favor intenta nuevamente en ${seconds} segundo${seconds > 1 ? 's' : ''}`;
      }
    }
    super(message, 429, 'RATE_LIMIT_ERROR', userMessage);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      ...(this.retryAfter && { retryAfter: this.retryAfter })
    };
  }
}

/**
 * Error de base de datos
 * Status: 500 o 409 según el caso
 */
class DatabaseError extends AppError {
  constructor(message, dbCode = null, statusCode = 500) {
    super(message, statusCode, 'DATABASE_ERROR', 'Error en la base de datos');
    this.name = 'DatabaseError';
    this.dbCode = dbCode;
    
    // Mapear códigos de BD específicos
    if (dbCode === 'ER_DUP_ENTRY' || dbCode === '23505') {
      this.statusCode = 409;
      this.status = 409;
      this.type = 'CONFLICT_ERROR';
      this.userMessage = 'El recurso ya existe';
    } else if (dbCode === 'ER_NO_REFERENCED_ROW_2' || dbCode === '23503') {
      this.statusCode = 400;
      this.status = 400;
      this.type = 'VALIDATION_ERROR';
      this.userMessage = 'Referencia inválida';
    }
  }
}

module.exports = {
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
};

