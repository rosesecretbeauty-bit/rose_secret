// ============================================
// IP Reputation System
// ============================================
// Sistema de reputación de IPs para bloqueo progresivo

const { critical, warn } = require('../logger');
const auditService = require('../services/audit.service');
const securitySettingsService = require('../services/securitySettings.service');

// Cache de configuración (se actualiza cada 30 segundos)
let securityConfigCache = null;
let lastConfigUpdate = 0;
const CONFIG_CACHE_TTL = 30 * 1000; // 30 segundos

// Almacenamiento en memoria
const ipReputation = new Map();

// Limpiar datos antiguos cada 30 minutos
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas
  
  for (const [ip, data] of ipReputation.entries()) {
    if (now - data.lastSeen > maxAge && data.reputationScore > 50) {
      // Resetear reputación si no se ha visto en 24 horas y tiene buena reputación
      ipReputation.delete(ip);
    }
  }
}, 30 * 60 * 1000);

/**
 * Obtener o crear reputación de IP
 */
function getReputation(ip) {
  if (!ipReputation.has(ip)) {
    ipReputation.set(ip, {
      reputationScore: 100,      // 100 = buena, 0 = mala
      violations: [],
      blockCount: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now()
    });
  }
  
  const data = ipReputation.get(ip);
  data.lastSeen = Date.now();
  return data;
}

/**
 * Registrar violación
 */
function recordViolation(ip, violationType, severity = 'medium') {
  const data = getReputation(ip);
  
  // Penalizar según severidad
  let penalty = 0;
  if (severity === 'low') penalty = 5;
  else if (severity === 'medium') penalty = 15;
  else if (severity === 'high') penalty = 30;
  else if (severity === 'critical') penalty = 50;
  
  data.reputationScore = Math.max(0, data.reputationScore - penalty);
  data.violations.push({
    type: violationType,
    severity,
    timestamp: Date.now()
  });
  
  // Si la reputación baja mucho, incrementar bloqueos
  if (data.reputationScore < 30 && data.blockCount < 4) {
    data.blockCount++;
    
    critical('IP reputation degraded - applying progressive block', {
      ip,
      reputationScore: data.reputationScore,
      blockCount: data.blockCount,
      violationType,
      severity
    });
  }
  
  return data;
}

/**
 * Registrar comportamiento positivo
 */
function recordPositiveBehavior(ip) {
  const data = getReputation(ip);
  
  // Mejorar reputación lentamente
  if (data.reputationScore < 100) {
    data.reputationScore = Math.min(100, data.reputationScore + 1);
  }
  
  return data;
}

/**
 * Obtener nivel de bloqueo según reputación
 */
function getBlockLevel(ip) {
  const data = getReputation(ip);
  
  if (data.reputationScore >= 70) {
    return 'none'; // Sin bloqueo
  } else if (data.reputationScore >= 50) {
    return 'warning'; // Advertencia
  } else if (data.reputationScore >= 30) {
    return 'strict'; // Rate limit estricto
  } else if (data.reputationScore >= 10) {
    return 'temporary'; // Bloqueo temporal
  } else {
    return 'long'; // Bloqueo largo
  }
}

/**
 * Verificar si IP está bloqueada
 */
function isBlocked(ip) {
  const data = getReputation(ip);
  const blockLevel = getBlockLevel(ip);
  
  return blockLevel === 'temporary' || blockLevel === 'long';
}

/**
 * Obtener configuración de seguridad (con cache)
 */
async function getSecurityConfig() {
  const now = Date.now();
  
  // Si el cache está válido, retornarlo
  if (securityConfigCache && (now - lastConfigUpdate) < CONFIG_CACHE_TTL) {
    return securityConfigCache;
  }
  
  // Actualizar cache
  try {
    securityConfigCache = await securitySettingsService.getSecuritySettings();
    lastConfigUpdate = now;
    return securityConfigCache;
  } catch (error) {
    // Si falla, usar valores por defecto
    if (!securityConfigCache) {
      securityConfigCache = securitySettingsService.getDefaultSettings();
    }
    return securityConfigCache;
  }
}

/**
 * Obtener tiempo de bloqueo restante
 */
async function getBlockRemaining(ip) {
  const config = await getSecurityConfig();
  const data = getReputation(ip);
  const blockLevel = getBlockLevel(ip);
  
  // Usar duración desde configuración
  const blockDurationMs = (config.ipBlockDurationMinutes || 15) * 60 * 1000;
  
  if (blockLevel === 'temporary') {
    return blockDurationMs;
  } else if (blockLevel === 'long') {
    return blockDurationMs * 4; // Bloqueo largo = 4x la duración normal
  }
  
  return 0;
}

/**
 * Middleware de verificación de reputación
 * Wrapper para manejar errores async
 */
function ipReputationCheck(req, res, next) {
  (async () => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      
      // Obtener configuración de seguridad
      const config = await getSecurityConfig();
      
      // Si el bloqueo de IP está deshabilitado, permitir acceso
      if (!config.ipBlockingEnabled) {
        return next();
      }
      
      // Verificar si está bloqueada
      if (isBlocked(ip)) {
        const remaining = await getBlockRemaining(ip);
        const data = getReputation(ip);
        
        critical('Blocked IP attempted access', {
          ip,
          reputationScore: data.reputationScore,
          blockCount: data.blockCount,
          remainingSeconds: Math.ceil(remaining / 1000),
          requestId: req.requestId || req.context?.requestId
        });
        
        // Registrar auditoría
        auditService.logAudit(
          'IP_BLOCKED',
          'security',
          null,
          null,
          { ip, reputationScore: data.reputationScore, blockCount: data.blockCount },
          req
        ).catch(() => {});
        
        return res.status(403).json({
          success: false,
          error: 'IP blocked',
          message: 'Tu IP ha sido bloqueada temporalmente debido a actividad sospechosa.',
          retryAfter: Math.ceil(remaining / 1000)
        });
      }
      
      // Registrar comportamiento positivo si la request es exitosa
      // (se hará después de la respuesta)
      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode < 400) {
          recordPositiveBehavior(ip);
        }
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      // Si hay error al obtener configuración, permitir acceso (fail-open)
      warn('Error en ipReputationCheck, permitiendo acceso:', error);
      next();
    }
  })();
}

/**
 * Invalidar cache de configuración (llamar cuando se actualiza la configuración)
 */
function invalidateConfigCache() {
  securityConfigCache = null;
  lastConfigUpdate = 0;
}

module.exports = {
  getReputation,
  recordViolation,
  recordPositiveBehavior,
  getBlockLevel,
  isBlocked,
  getBlockRemaining,
  ipReputationCheck,
  getSecurityConfig,
  invalidateConfigCache
};

