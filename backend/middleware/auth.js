// ============================================
// Middleware de Autenticación JWT (Hardened)
// ============================================

const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { warn } = require('../logger');
const { AuthError } = require('../utils/errors');
const redis = require('../cache/redis'); // FASE 4: Token blacklist distribuido

// Blacklist de tokens (FASE 4: Híbrido - Redis + in-memory fallback)
const tokenBlacklist = new Set();
const BLACKLIST_KEY_PREFIX = 'token:blacklist:';
const BLACKLIST_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días (mismo que JWT expiration)

/**
 * Verificar token JWT con validaciones mejoradas
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' // Mensaje genérico
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // FASE 4: Verificar si el token está en blacklist (Redis + in-memory)
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      warn('Attempted use of blacklisted token', {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId || req.context?.requestId
      });
      throw new AuthError('Token invalidado');
    }

    // Verificar token (con verificación de expiración explícita)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'], // Solo permitir algoritmo específico
        maxAge: process.env.JWT_EXPIRES_IN || '7d'
      });
    } catch (verifyError) {
      // Manejar diferentes tipos de errores de JWT
      if (verifyError.name === 'TokenExpiredError') {
        warn('Expired token attempted', {
          ip: req.ip,
          path: req.path,
          expiredAt: verifyError.expiredAt,
          requestId: req.requestId || req.context?.requestId
        });
        throw new AuthError('Token expirado');
      }
      
      if (verifyError.name === 'JsonWebTokenError') {
        warn('Invalid token attempted', {
          ip: req.ip,
          path: req.path,
          error: verifyError.message,
          requestId: req.requestId || req.context?.requestId
        });
        throw new AuthError('Token inválido');
      }
      
      throw verifyError;
    }

    // Verificar que el token tenga userId
    if (!decoded.userId) {
      throw new AuthError('Token sin userId');
    }

    // Obtener usuario de la BD con roles y todos los campos
    const users = await query(
      `SELECT u.id, u.email, u.name, u.role, u.phone, u.bio, u.location, u.avatar,
              u.email_verified, u.email_verified_at, u.created_at, u.updated_at, u.last_login_at,
              GROUP_CONCAT(DISTINCT r.id) as role_ids,
              GROUP_CONCAT(DISTINCT r.name) as role_names
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (users.length === 0) {
      warn('Token with non-existent user', {
        userId: decoded.userId,
        ip: req.ip,
        path: req.path,
        requestId: req.requestId || req.context?.requestId
      });
      throw new AuthError('Usuario no encontrado');
    }

    const user = users[0];
    
    // Parsear roles
    user.role_ids = user.role_ids ? user.role_ids.split(',').map(Number) : [];
    user.role_names = user.role_names ? user.role_names.split(',') : [];
    
    // Mantener compatibilidad con sistema antiguo
    if (!user.role && user.role_names.length > 0) {
      user.role = user.role_names[0]; // Primer rol como fallback
    }

    // Añadir usuario al request
    req.user = user;
    next();
  } catch (error) {
    // Si ya es un AuthError, propagarlo al error handler
    if (error instanceof AuthError) {
      return next(error);
    }

    // Error inesperado
    warn('Authentication error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      requestId: req.requestId || req.context?.requestId
    });
    
    // Convertir a AuthError para consistencia
    return next(new AuthError('Error en autenticación'));
  }
};

/**
 * Verificar que el usuario es admin
 * Compatible con sistema RBAC: verifica tanto role como role_names
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthError('Autenticación requerida'));
  }
  
  // Verificar admin en campo role (sistema antiguo) o en role_names (sistema RBAC)
  const isAdmin = req.user.role === 'admin' || 
                  (req.user.role_names && Array.isArray(req.user.role_names) && req.user.role_names.includes('admin'));
  
  if (!isAdmin) {
    warn('Non-admin attempted admin access', {
      userId: req.user.id,
      role: req.user.role,
      role_names: req.user.role_names,
      ip: req.ip,
      path: req.path,
      requestId: req.requestId || req.context?.requestId
    });
    return next(new PermissionError('Se requiere rol de administrador', null, 'admin'));
  }
  next();
};

/**
 * Verificar rol específico
 * Compatible con sistema RBAC: verifica tanto role como role_names
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Autenticación requerida'));
    }
    
    // Verificar rol en campo role (sistema antiguo) o en role_names (sistema RBAC)
    const hasRole = roles.includes(req.user.role) ||
                    (req.user.role_names && Array.isArray(req.user.role_names) && 
                     roles.some(r => req.user.role_names.includes(r)));
    
    if (!hasRole) {
      warn('Insufficient role for access', {
        userId: req.user.id,
        userRole: req.user.role,
        userRoleNames: req.user.role_names,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
        requestId: req.requestId || req.context?.requestId
      });
      return next(new PermissionError('Permisos insuficientes', null, roles.join(',')));
    }
    next();
  };
};

/**
 * Verificar si token está en blacklist (FASE 4: Redis + in-memory)
 */
async function isTokenBlacklisted(token) {
  // Intentar Redis primero
  if (redis.isRedisAvailable()) {
    try {
      const blacklisted = await redis.get(`${BLACKLIST_KEY_PREFIX}${token}`);
      if (blacklisted === 'true') {
        return true;
      }
    } catch (error) {
      warn('Redis blacklist check failed, using in-memory', { error: error.message });
    }
  }

  // Fallback a in-memory
  return tokenBlacklist.has(token);
}

/**
 * Invalidar token (logout) - FASE 4: Redis + in-memory
 */
async function invalidateToken(token) {
  // Agregar a Redis si está disponible
  if (redis.isRedisAvailable()) {
    try {
      await redis.set(`${BLACKLIST_KEY_PREFIX}${token}`, 'true', BLACKLIST_TTL);
    } catch (error) {
      warn('Redis blacklist add failed, using in-memory', { error: error.message });
      // Continuar con in-memory
    }
  }

  // También agregar a in-memory como fallback
  tokenBlacklist.add(token);

  // Limpiar tokens antiguos periódicamente (solo in-memory)
  if (tokenBlacklist.size > 10000) {
    // Limpiar algunos tokens (simplificado, en producción Redis maneja TTL)
    const tokensArray = Array.from(tokenBlacklist);
    tokenBlacklist.clear();
    // Mantener solo los últimos 5000
    tokensArray.slice(-5000).forEach(t => tokenBlacklist.add(t));
  }
}

/**
 * Limpiar blacklist (para testing o mantenimiento)
 */
function clearTokenBlacklist() {
  tokenBlacklist.clear();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireRole,
  invalidateToken,
  clearTokenBlacklist,
  isTokenBlacklisted
};

