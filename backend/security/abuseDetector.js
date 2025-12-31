// ============================================
// Abuse Detection - Behavior-Based
// ============================================
// Detecta patrones de abuso basados en comportamiento

const { critical, warn } = require('../logger');
const auditService = require('../services/audit.service');

// Lazy load ipReputation module
let ipReputation = null;

// Almacenamiento en memoria
const abusePatterns = new Map();
const suspiciousIPs = new Map();

// Limpiar datos antiguos cada 10 minutos
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hora
  
  for (const [key, data] of abusePatterns.entries()) {
    if (now - data.firstSeen > maxAge) {
      abusePatterns.delete(key);
    }
  }
  
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.firstSeen > maxAge) {
      suspiciousIPs.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Detectar patrón de muchos 401/403
 */
function detectAuthFailures(ip, statusCode) {
  if (statusCode !== 401 && statusCode !== 403) return false;
  
  const key = `auth_failures:${ip}`;
  const data = abusePatterns.get(key) || { count: 0, firstSeen: Date.now() };
  data.count++;
  data.lastSeen = Date.now();
  abusePatterns.set(key, data);
  
  // Si hay más de 10 fallos en 5 minutos, es sospechoso
  if (data.count > 10 && (Date.now() - data.firstSeen) < 5 * 60 * 1000) {
    return true;
  }
  
  return false;
}

/**
 * Detectar patrón de enumeración (muchos 404)
 */
function detectEnumeration(ip, path, statusCode) {
  if (statusCode !== 404) return false;
  
  const key = `enumeration:${ip}`;
  const data = abusePatterns.get(key) || { count: 0, paths: new Set(), firstSeen: Date.now() };
  data.count++;
  data.paths.add(path);
  data.lastSeen = Date.now();
  abusePatterns.set(key, data);
  
  // Si hay más de 20 404s en 5 minutos con diferentes paths, es enumeración
  if (data.count > 20 && data.paths.size > 10 && (Date.now() - data.firstSeen) < 5 * 60 * 1000) {
    return true;
  }
  
  return false;
}

/**
 * Detectar requests muy rápidos (bot)
 */
function detectRapidRequests(ip, duration) {
  if (duration > 50) return false; // Solo requests muy rápidos (<50ms)
  
  const key = `rapid:${ip}`;
  const data = abusePatterns.get(key) || { count: 0, firstSeen: Date.now() };
  data.count++;
  data.lastSeen = Date.now();
  abusePatterns.set(key, data);
  
  // Si hay más de 50 requests rápidos en 1 minuto, es bot
  if (data.count > 50 && (Date.now() - data.firstSeen) < 60 * 1000) {
    return true;
  }
  
  return false;
}

/**
 * Detectar cambios constantes de endpoint (scanner)
 */
function detectEndpointScanning(ip, path) {
  const key = `scanning:${ip}`;
  const data = abusePatterns.get(key) || { 
    endpoints: new Set(), 
    firstSeen: Date.now(),
    lastEndpoint: null
  };
  
  data.endpoints.add(path);
  data.lastSeen = Date.now();
  
  // Si cambió de endpoint muy rápido
  if (data.lastEndpoint && data.lastEndpoint !== path) {
    const timeSinceLastChange = Date.now() - (data.lastChangeTime || Date.now());
    if (timeSinceLastChange < 100) { // Menos de 100ms entre cambios
      data.rapidChanges = (data.rapidChanges || 0) + 1;
    }
  }
  
  data.lastEndpoint = path;
  data.lastChangeTime = Date.now();
  abusePatterns.set(key, data);
  
  // Si hay más de 30 endpoints diferentes en 2 minutos con cambios rápidos
  if (data.endpoints.size > 30 && data.rapidChanges > 20 && (Date.now() - data.firstSeen) < 2 * 60 * 1000) {
    return true;
  }
  
  return false;
}

/**
 * Marcar IP como sospechosa
 */
function markSuspicious(ip, reason, severity = 'medium') {
  const data = suspiciousIPs.get(ip) || {
    firstSeen: Date.now(),
    reasons: [],
    severity: 'low',
    blockCount: 0
  };
  
  data.reasons.push({
    reason,
    severity,
    timestamp: Date.now()
  });
  
  // Actualizar severidad
  if (severity === 'high' || data.severity === 'high') {
    data.severity = 'high';
  } else if (severity === 'medium' && data.severity !== 'high') {
    data.severity = 'medium';
  }
  
  data.lastSeen = Date.now();
  suspiciousIPs.set(ip, data);
  
  return data;
}

/**
 * Middleware de detección de abuso
 */
async function abuseDetector(req, res, next) {
  // Obtener configuración de seguridad
  let config;
  try {
    const securitySettingsService = require('../services/securitySettings.service');
    config = await securitySettingsService.getSecuritySettings();
  } catch (error) {
    // Si falla, usar variable de entorno como fallback
    if (process.env.ABUSE_DETECTION_ENABLED === 'false') {
      return next();
    }
    config = { abuseDetectionEnabled: true };
  }
  
  // Verificar si está habilitado
  if (!config.abuseDetectionEnabled) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const startTime = Date.now();
  
  // Interceptar respuesta para analizar
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    analyzeRequest();
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    analyzeRequest();
    return originalJson.call(this, data);
  };
  
  function analyzeRequest() {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const path = req.path;
    
    let abuseDetected = false;
    let abuseType = null;
    let severity = 'medium';
    
    // Detectar patrones
    if (detectAuthFailures(ip, statusCode)) {
      abuseDetected = true;
      abuseType = 'AUTH_FAILURES';
      severity = 'high';
    } else if (detectEnumeration(ip, path, statusCode)) {
      abuseDetected = true;
      abuseType = 'ENUMERATION';
      severity = 'medium';
    } else if (detectRapidRequests(ip, duration)) {
      abuseDetected = true;
      abuseType = 'RAPID_REQUESTS';
      severity = 'high';
    } else if (detectEndpointScanning(ip, path)) {
      abuseDetected = true;
      abuseType = 'ENDPOINT_SCANNING';
      severity = 'high';
    }
    
    if (abuseDetected) {
      const suspiciousData = markSuspicious(ip, abuseType, severity);
      
      critical('Abuse pattern detected', {
        ip,
        abuseType,
        severity,
        path,
        method: req.method,
        statusCode,
        duration,
        userId: req.user?.id || null,
        requestId: req.requestId || req.context?.requestId,
        blockCount: suspiciousData.blockCount,
        reasons: suspiciousData.reasons.length
      });
      
      // Registrar auditoría si hay usuario
      if (req.user?.id) {
        auditService.logAudit(
          'ABUSE_DETECTED',
          'security',
          null,
          null,
          { abuseType, severity, path, ip },
          req
        ).catch(() => {});
      }
      
      // Escalar rate limit si es severo
      if (severity === 'high' && suspiciousData.blockCount < 3) {
        suspiciousData.blockCount++;
        
        // Registrar violación en sistema de reputación (lazy load)
        if (!ipReputation) {
          ipReputation = require('./ipReputation');
        }
        ipReputation.recordViolation(ip, abuseType, severity);
        
        warn('Escalating rate limit for suspicious IP', {
          ip,
          abuseType,
          blockCount: suspiciousData.blockCount
        });
      }
    }
  }
  
  next();
}

/**
 * Verificar si una IP es sospechosa
 */
function isSuspicious(ip) {
  const data = suspiciousIPs.get(ip);
  if (!data) return false;
  
  // Si tiene severidad alta y bloqueos recientes
  if (data.severity === 'high' && data.blockCount >= 2) {
    return true;
  }
  
  return false;
}

/**
 * Obtener información de IP sospechosa
 */
function getSuspiciousInfo(ip) {
  return suspiciousIPs.get(ip) || null;
}

module.exports = {
  abuseDetector,
  detectAuthFailures,
  detectEnumeration,
  detectRapidRequests,
  detectEndpointScanning,
  markSuspicious,
  isSuspicious,
  getSuspiciousInfo
};

