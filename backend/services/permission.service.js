// ============================================
// Permission Service
// ============================================
// Servicio para gestionar permisos y autorización

const { query } = require('../db');
const { error: logError, warn } = require('../logger');

// Cache de permisos por usuario (en producción usar Redis)
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtener todos los permisos de un usuario (con cache)
 */
async function getUserPermissions(userId) {
  try {
    // Verificar cache
    const cacheKey = `user:${userId}:permissions`;
    const cached = permissionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.permissions;
    }

    // Obtener roles del usuario
    const userRoles = await query(
      `SELECT role_id FROM user_roles WHERE user_id = ?`,
      [userId]
    );

    if (userRoles.length === 0) {
      // Usuario sin roles, retornar array vacío
      permissionCache.set(cacheKey, {
        permissions: [],
        timestamp: Date.now(),
      });
      return [];
    }

    const roleIds = userRoles.map(ur => ur.role_id);

    // Obtener permisos de los roles
    const permissions = await query(
      `SELECT DISTINCT p.key, p.name, p.domain, p.action
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id IN (?)
       ORDER BY p.domain, p.action`,
      [roleIds]
    );

    const permissionKeys = permissions.map(p => p.key);

    // Guardar en cache
    permissionCache.set(cacheKey, {
      permissions: permissionKeys,
      timestamp: Date.now(),
    });

    return permissionKeys;
  } catch (error) {
    logError('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Verificar si un usuario tiene un permiso específico
 */
async function hasPermission(userId, permissionKey) {
  try {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permissionKey);
  } catch (error) {
    logError('Error checking permission:', error);
    return false;
  }
}

/**
 * Verificar si un usuario tiene alguno de los permisos
 */
async function hasAnyPermission(userId, permissionKeys) {
  try {
    const permissions = await getUserPermissions(userId);
    return permissionKeys.some(key => permissions.includes(key));
  } catch (error) {
    logError('Error checking permissions:', error);
    return false;
  }
}

/**
 * Verificar si un usuario tiene todos los permisos
 */
async function hasAllPermissions(userId, permissionKeys) {
  try {
    const permissions = await getUserPermissions(userId);
    return permissionKeys.every(key => permissions.includes(key));
  } catch (error) {
    logError('Error checking permissions:', error);
    return false;
  }
}

/**
 * Invalidar cache de permisos de un usuario
 */
function invalidateUserPermissionCache(userId) {
  const cacheKey = `user:${userId}:permissions`;
  permissionCache.delete(cacheKey);
}

/**
 * Limpiar todo el cache de permisos
 */
function clearPermissionCache() {
  permissionCache.clear();
}

/**
 * Obtener roles de un usuario
 */
async function getUserRoles(userId) {
  try {
    const roles = await query(
      `SELECT r.id, r.name, r.description, r.is_system
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?
       ORDER BY r.name`,
      [userId]
    );

    return roles;
  } catch (error) {
    logError('Error getting user roles:', error);
    return [];
  }
}

/**
 * Asignar rol a usuario
 */
async function assignRoleToUser(userId, roleId) {
  try {
    await query(
      `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [userId, roleId]
    );

    // Invalidar cache
    invalidateUserPermissionCache(userId);

    return true;
  } catch (error) {
    logError('Error assigning role to user:', error);
    throw error;
  }
}

/**
 * Remover rol de usuario
 */
async function removeRoleFromUser(userId, roleId) {
  try {
    await query(
      `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`,
      [userId, roleId]
    );

    // Invalidar cache
    invalidateUserPermissionCache(userId);

    return true;
  } catch (error) {
    logError('Error removing role from user:', error);
    throw error;
  }
}

/**
 * Obtener todos los permisos disponibles
 */
async function getAllPermissions() {
  try {
    const permissions = await query(
      `SELECT * FROM permissions ORDER BY domain, action`
    );

    return permissions;
  } catch (error) {
    logError('Error getting all permissions:', error);
    throw error;
  }
}

/**
 * Obtener permisos de un rol
 */
async function getRolePermissions(roleId) {
  try {
    const permissions = await query(
      `SELECT p.*
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?
       ORDER BY p.domain, p.action`,
      [roleId]
    );

    return permissions;
  } catch (error) {
    logError('Error getting role permissions:', error);
    throw error;
  }
}

/**
 * Asignar permisos a un rol
 */
async function assignPermissionsToRole(roleId, permissionIds) {
  try {
    // Remover permisos existentes
    await query(
      `DELETE FROM role_permissions WHERE role_id = ?`,
      [roleId]
    );

    // Agregar nuevos permisos
    if (permissionIds.length > 0) {
      const values = permissionIds.map(pid => `(${roleId}, ${pid})`).join(',');
      await query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
      );
    }

    // Invalidar cache de todos los usuarios con este rol
    const users = await query(
      `SELECT DISTINCT user_id FROM user_roles WHERE role_id = ?`,
      [roleId]
    );

    users.forEach(user => {
      invalidateUserPermissionCache(user.user_id);
    });

    return true;
  } catch (error) {
    logError('Error assigning permissions to role:', error);
    throw error;
  }
}

module.exports = {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  invalidateUserPermissionCache,
  clearPermissionCache,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getAllPermissions,
  getRolePermissions,
  assignPermissionsToRole,
};

