// ============================================
// Structured Logger - Sistema Central de Logging
// ============================================
// NO usar console.log directamente, usar este logger

const { transport } = require('./transports');
const { LEVELS, getMinLevel } = require('./levels');
const crypto = require('crypto');

const minLevel = getMinLevel();

/**
 * Logger principal con contexto automático
 */
class Logger {
  constructor(context = {}) {
    this.context = context;
  }

  /**
   * Crear logger con contexto adicional
   */
  withContext(additionalContext) {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log con nivel y contexto
   */
  _log(level, message, metadata = {}) {
    const levelNum = LEVELS[level.toUpperCase()] || LEVELS.INFO;
    
    // Filtrar por nivel mínimo
    if (levelNum < minLevel) return;
    
    // Combinar contexto y metadata
    const fullMetadata = {
      ...this.context,
      ...metadata
    };
    
    transport(level, message, fullMetadata);
  }

  /**
   * Debug log
   */
  debug(message, metadata = {}) {
    this._log('DEBUG', message, metadata);
  }

  /**
   * Info log
   */
  info(message, metadata = {}) {
    this._log('INFO', message, metadata);
  }

  /**
   * Warn log
   */
  warn(message, metadata = {}) {
    this._log('WARN', message, metadata);
  }

  /**
   * Error log
   */
  error(message, err = null, metadata = {}) {
    const errorMetadata = {
      ...metadata,
      errorId: metadata.errorId || crypto.randomUUID()
    };

    if (err) {
      errorMetadata.error = {
        name: err.name,
        message: err.message,
        code: err.code,
        type: err.type,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      };
    }

    this._log('ERROR', message, errorMetadata);
    return errorMetadata.errorId;
  }

  /**
   * Critical log (siempre visible)
   */
  critical(message, metadata = {}) {
    const criticalMetadata = {
      ...metadata,
      critical: true,
      errorId: metadata.errorId || crypto.randomUUID()
    };
    this._log('CRITICAL', message, criticalMetadata);
    return criticalMetadata.errorId;
  }

  /**
   * Audit log (acciones críticas)
   */
  audit(action, metadata = {}) {
    const auditMetadata = {
      action,
      audit: true,
      ...metadata
    };
    this._log('AUDIT', `AUDIT: ${action}`, auditMetadata);
  }

  /**
   * Payment log (transacciones financieras)
   */
  payment(action, metadata = {}) {
    const paymentMetadata = {
      action,
      payment: true,
      ...metadata
    };
    this._log('PAYMENT', `PAYMENT: ${action}`, paymentMetadata);
  }
}

/**
 * Logger global (sin contexto)
 */
const globalLogger = new Logger();

/**
 * Crear logger con contexto de request
 */
function createRequestLogger(requestId, apiVersion, userId = null) {
  const context = {
    requestId,
    apiVersion: apiVersion || 1
  };
  
  if (userId) {
    context.userId = userId;
  }
  
  return new Logger(context);
}

module.exports = {
  Logger,
  createRequestLogger,
  // Exportar métodos del logger global para compatibilidad
  debug: (...args) => globalLogger.debug(...args),
  info: (...args) => globalLogger.info(...args),
  warn: (...args) => globalLogger.warn(...args),
  error: (...args) => globalLogger.error(...args),
  critical: (...args) => globalLogger.critical(...args),
  audit: (...args) => globalLogger.audit(...args),
  payment: (...args) => globalLogger.payment(...args)
};

