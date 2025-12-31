// ============================================
// Authorization Middleware
// ============================================
// Middleware para verificar permisos basado en RBAC

const permissionService = require('../services/permission.service');
const { warn } = require('../logger');

/**
 * Middleware para verificar un permiso específico
 * @param {string} permissionKey - Clave del permiso (e.g. "orders.update")
 */
const authorize = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
        });
      }

      // Verificar permiso
      const hasAccess = await permissionService.hasPermission(
        req.user.id,
        permissionKey
      );

      if (!hasAccess) {
        warn('Permission denied', {
          userId: req.user.id,
          permission: permissionKey,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        // Auditoría: Permiso denegado
        const auditService = require('../services/audit.service');
        auditService.logAudit(
          'PERMISSION_DENIED',
          'permission',
          null,
          null,
          { permission: permissionKey, path: req.path, method: req.method },
          req,
          {
            user_id: req.user.id,
            permission: permissionKey,
            path: req.path,
            method: req.method,
          }
        ).catch(err => {
          // No fallar si auditoría falla
          warn('Error logging permission denied audit:', err);
        });

        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes',
          required_permission: permissionKey,
        });
      }

      next();
    } catch (error) {
      warn('Authorization error', {
        error: error.message,
        userId: req.user?.id,
        permission: permissionKey,
        path: req.path,
      });

      return res.status(500).json({
        success: false,
        message: 'Error en autorización',
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario tenga alguno de los permisos
 * @param {string[]} permissionKeys - Array de claves de permisos
 */
const authorizeAny = (permissionKeys) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
        });
      }

      const hasAccess = await permissionService.hasAnyPermission(
        req.user.id,
        permissionKeys
      );

      if (!hasAccess) {
        warn('Permission denied (any)', {
          userId: req.user.id,
          permissions: permissionKeys,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes',
          required_permissions: permissionKeys,
        });
      }

      next();
    } catch (error) {
      warn('Authorization error (any)', {
        error: error.message,
        userId: req.user?.id,
        permissions: permissionKeys,
        path: req.path,
      });

      return res.status(500).json({
        success: false,
        message: 'Error en autorización',
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario tenga todos los permisos
 * @param {string[]} permissionKeys - Array de claves de permisos
 */
const authorizeAll = (permissionKeys) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
        });
      }

      const hasAccess = await permissionService.hasAllPermissions(
        req.user.id,
        permissionKeys
      );

      if (!hasAccess) {
        warn('Permission denied (all)', {
          userId: req.user.id,
          permissions: permissionKeys,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes',
          required_permissions: permissionKeys,
        });
      }

      next();
    } catch (error) {
      warn('Authorization error (all)', {
        error: error.message,
        userId: req.user?.id,
        permissions: permissionKeys,
        path: req.path,
      });

      return res.status(500).json({
        success: false,
        message: 'Error en autorización',
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeAny,
  authorizeAll,
};

