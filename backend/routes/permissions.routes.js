// ============================================
// Rutas de Permisos
// ============================================
// Sistema RBAC - Permisos y Roles

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const permissionService = require('../services/permission.service');
const auditService = require('../services/audit.service');

// ============================================
// GET /api/permissions/me
// ============================================
// Obtener permisos del usuario autenticado
router.get('/me', authenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user.id;

    const permissions = await permissionService.getUserPermissions(userId);
    const roles = await permissionService.getUserRoles(userId);

    res.json({
      success: true,
      data: {
        permissions,
        roles,
      },
    });
  } catch (error) {
    logError('Error getting user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener permisos',
    });
  }
});

// ============================================
// GET /api/permissions
// ============================================
// Obtener todos los permisos disponibles (solo admin)
router.get('/', authenticate, authorize('roles.read'), rateLimiters.api, async (req, res) => {
  try {
    const permissions = await permissionService.getAllPermissions();

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    logError('Error getting all permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener permisos',
    });
  }
});

// ============================================
// GET /api/roles
// ============================================
// Obtener todos los roles (solo admin)
router.get('/roles', authenticate, authorize('roles.read'), rateLimiters.api, async (req, res) => {
  try {
    const { query } = require('../db');
    const roles = await query(
      `SELECT r.*, 
              GROUP_CONCAT(DISTINCT p.key) as permission_keys
       FROM roles r
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       GROUP BY r.id
       ORDER BY r.name`
    );

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      is_system: role.is_system,
      permissions: role.permission_keys ? role.permission_keys.split(',') : [],
    }));

    res.json({
      success: true,
      data: formattedRoles,
    });
  } catch (error) {
    logError('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
    });
  }
});

// ============================================
// POST /api/roles/:roleId/assign
// ============================================
// Asignar rol a usuario (solo admin)
router.post('/roles/:roleId/assign', authenticate, authorize('roles.assign'), rateLimiters.api, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido',
      });
    }

    // Obtener nombre del rol para auditoría
    const { query } = require('../db');
    const roles = await query('SELECT name FROM roles WHERE id = ?', [roleId]);
    const roleName = roles[0]?.name || `role_${roleId}`;

    await permissionService.assignRoleToUser(userId, parseInt(roleId));

    // Auditoría
    await auditService.logAudit(
      'ROLE_ASSIGNED',
      'user',
      userId,
      null,
      { role_id: roleId, role_name: roleName },
      req,
      {
        assigned_by: req.user.id,
        role_id: roleId,
        role_name: roleName,
        user_id: userId,
      }
    );

    res.json({
      success: true,
      message: 'Rol asignado exitosamente',
    });
  } catch (error) {
    logError('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar rol',
    });
  }
});

// ============================================
// DELETE /api/roles/:roleId/assign
// ============================================
// Remover rol de usuario (solo admin)
router.delete('/roles/:roleId/assign', authenticate, authorize('roles.assign'), rateLimiters.api, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido',
      });
    }

    // Obtener nombre del rol para auditoría
    const { query } = require('../db');
    const roles = await query('SELECT name FROM roles WHERE id = ?', [roleId]);
    const roleName = roles[0]?.name || `role_${roleId}`;

    await permissionService.removeRoleFromUser(userId, parseInt(roleId));

    // Auditoría
    await auditService.logAudit(
      'ROLE_REMOVED',
      'user',
      userId,
      { role_id: roleId, role_name: roleName },
      null,
      req,
      {
        removed_by: req.user.id,
        role_id: roleId,
        role_name: roleName,
        user_id: userId,
      }
    );

    // Track analytics
    try {
      const { trackEvent } = require('../../src/analytics/analyticsClient');
      trackEvent('ROLE_REMOVED', {
        user_id: userId.toString(),
        role_id: roleId,
        role_name: roleName,
      });
    } catch (err) {
      // Analytics opcional, no fallar si no está disponible
    }

    res.json({
      success: true,
      message: 'Rol removido exitosamente',
    });
  } catch (error) {
    logError('Error removing role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover rol',
    });
  }
});

module.exports = router;

