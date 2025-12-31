// ============================================
// usePermission Hook
// ============================================
// Hook para verificar permisos en componentes

import { useEffect } from 'react';
import { usePermissionStore } from '../stores/permissionStore';
import { useAuthStore } from '../stores/authStore';
import type { PermissionKey } from '../permissions/permissionTypes';

/**
 * Hook para verificar permisos
 * Auto-carga permisos al montar si el usuario está autenticado
 */
export function usePermission() {
  const {
    permissions,
    roles,
    isLoading,
    hasPermission: storeHasPermission,
    hasAnyPermission: storeHasAnyPermission,
    hasAllPermissions: storeHasAllPermissions,
    loadPermissions,
  } = usePermissionStore();

  const { isAuthenticated } = useAuthStore();

  // Cargar permisos al montar si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadPermissions();
    }
  }, [isAuthenticated, loadPermissions]);

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const can = (permission: PermissionKey | string): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    return storeHasPermission(permission);
  };

  /**
   * Verificar si el usuario tiene alguno de los permisos
   */
  const canAny = (permissions: (PermissionKey | string)[]): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    return storeHasAnyPermission(permissions);
  };

  /**
   * Verificar si el usuario tiene todos los permisos
   */
  const canAll = (permissions: (PermissionKey | string)[]): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    return storeHasAllPermissions(permissions);
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (roleName: string): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    return roles.some(r => r.name === roleName);
  };

  /**
   * Verificar si el usuario tiene alguno de los roles
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    return roles.some(r => roleNames.includes(r.name));
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    permissions,
    roles,
    isLoading,
    isAuthenticated,
  };
}

