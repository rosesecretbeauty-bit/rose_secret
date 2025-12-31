// ============================================
// Brute Force Protection Middleware
// ============================================

const { warn, critical } = require('../logger');
const securitySettingsService = require('../services/securitySettings.service');

// Almacenamiento en memoria de intentos fallidos
// En producción, considerar usar Redis
const failedAttempts = new Map();
const blockedIPs = new Map();

// Cache de configuración
let securityConfigCache = null;
let lastConfigUpdate = 0;
const CONFIG_CACHE_TTL = 30 * 1000; // 30 segundos

// Configuración por defecto
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos
const DELAY_BASE = 1000; // 1 segundo base para delay progresivo

/**
 * Obtener configuración de seguridad (con cache)
 */
async function getSecurityConfig() {
  const now = Date.now();
  
  if (securityConfigCache && (now - lastConfigUpdate) < CONFIG_CACHE_TTL) {
    return securityConfigCache;
  }
  
  try {
    securityConfigCache = await securitySettingsService.getSecuritySettings();
    lastConfigUpdate = now;
    return securityConfigCache;
  } catch (error) {
    if (!securityConfigCache) {
      securityConfigCache = securitySettingsService.getDefaultSettings();
    }
    return securityConfigCache;
  }
}

/**
 * Limpiar intentos fallidos antiguos
 */
async function cleanOldAttempts() {
  const config = await getSecurityConfig();
  const blockDuration = (config.ipBlockDurationMinutes || 15) * 60 * 1000;
  const now = Date.now();
  
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > blockDuration) {
      failedAttempts.delete(key);
    }
  }
  for (const [ip, blockTime] of blockedIPs.entries()) {
    if (now - blockTime > blockDuration) {
      blockedIPs.delete(ip);
    }
  }
}

// Limpiar cada 5 minutos
setInterval(cleanOldAttempts, 5 * 60 * 1000);

/**
 * Middleware de protección brute force
 * Aplica delay progresivo y bloqueo temporal
 * Wrapper para manejar errores async
 */
function bruteForceProtection(req, res, next) {
  (async () => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const identifier = `${ip}:${req.body?.email || req.body?.username || 'unknown'}`;
      
      // Obtener configuración de seguridad
      const config = await getSecurityConfig();
      
      // Si la protección está deshabilitada, permitir acceso
      if (!config.bruteForceProtectionEnabled) {
        return next();
      }
      
      const blockDuration = (config.ipBlockDurationMinutes || 15) * 60 * 1000;
      const maxAttempts = config.maxFailedAttempts || DEFAULT_MAX_ATTEMPTS;
  
  // Verificar si la IP está bloqueada
  if (blockedIPs.has(ip)) {
    const blockTime = blockedIPs.get(ip);
    const remainingTime = Math.ceil((blockDuration - (Date.now() - blockTime)) / 1000);
    
    // Registrar violación en sistema de reputación
    const { recordViolation } = require('../security/ipReputation');
    recordViolation(ip, 'BRUTE_FORCE_BLOCKED', 'high');
    
    critical('Blocked IP attempted access', {
      ip,
      path: req.path,
      remainingBlockTime: `${remainingTime}s`
    });
    
    return res.status(429).json({
      success: false,
      message: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.',
      retryAfter: remainingTime
    });
  }

  // Obtener intentos fallidos previos
  const attempts = failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  // Aplicar delay progresivo si hay intentos previos
  if (attempts.count > 0) {
    const delay = Math.min(DELAY_BASE * Math.pow(2, attempts.count - 1), 10000); // Max 10 segundos
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    
    if (timeSinceLastAttempt < delay) {
      const waitTime = Math.ceil((delay - timeSinceLastAttempt) / 1000);
      return res.status(429).json({
        success: false,
        message: 'Por favor espera antes de intentar nuevamente.',
        retryAfter: waitTime
      });
    }
  }

  // Middleware para registrar intentos fallidos
  const originalJson = res.json;
  res.json = function(data) {
    // Si la respuesta indica fallo de autenticación
    if (data.success === false && (res.statusCode === 401 || res.statusCode === 403)) {
      attempts.count += 1;
      attempts.lastAttempt = Date.now();
      failedAttempts.set(identifier, attempts);

      // Log de intento fallido
      warn('Failed authentication attempt', {
        ip,
        identifier: identifier.split(':')[1] ? '[REDACTED]' : 'unknown',
        attemptCount: attempts.count,
        path: req.path
      });

      // Bloquear si excede máximo de intentos (usar configuración dinámica)
      if (attempts.count >= maxAttempts) {
        blockedIPs.set(ip, Date.now());
        critical('IP blocked due to brute force attempts', {
          ip,
          attempts: attempts.count,
          path: req.path,
          blockDuration: `${blockDuration / 1000}s`,
          maxAttempts
        });
      }
    } else if (data.success === true) {
      // Limpiar intentos en caso de éxito
      failedAttempts.delete(identifier);
    }

    return originalJson.call(this, data);
  };

  next();
    } catch (error) {
      // Si hay error al obtener configuración, permitir acceso (fail-open)
      warn('Error en bruteForceProtection, permitiendo acceso:', error);
      next();
    }
  })();
}

/**
 * Obtener estadísticas de bloqueos (para admin)
 */
async function getBruteForceStats() {
  const config = await getSecurityConfig();
  const blockDuration = (config.ipBlockDurationMinutes || 15) * 60 * 1000;
  
  return {
    blockedIPs: Array.from(blockedIPs.entries()).map(([ip, time]) => ({
      ip,
      blockedAt: new Date(time).toISOString(),
      remainingTime: Math.ceil((blockDuration - (Date.now() - time)) / 1000)
    })),
    failedAttempts: Array.from(failedAttempts.entries()).map(([key, data]) => ({
      identifier: key.split(':')[0],
      attempts: data.count,
      lastAttempt: new Date(data.lastAttempt).toISOString()
    }))
  };
}

/**
 * Invalidar cache de configuración
 */
function invalidateConfigCache() {
  securityConfigCache = null;
  lastConfigUpdate = 0;
}

/**
 * Desbloquear IP manualmente (para admin)
 */
function unblockIP(ip) {
  blockedIPs.delete(ip);
  // También limpiar intentos fallidos de esa IP
  for (const [key] of failedAttempts.entries()) {
    if (key.startsWith(ip)) {
      failedAttempts.delete(key);
    }
  }
}

module.exports = {
  bruteForceProtection,
  getBruteForceStats,
  unblockIP,
  invalidateConfigCache
};

