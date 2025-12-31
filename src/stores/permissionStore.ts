// ============================================
// Permission Store
// ============================================
// Zustand store para gestionar permisos del usuario

import { create } from 'zustand';
import type { Permission, Role } from '../permissions/permissionTypes';
import {
  getMyPermissions as getMyPermissionsAPI,
} from '../permissions/permissionClient';

interface PermissionStore {
  // Estado
  permissions: string[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  loadPermissions: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  clearPermissions: () => void;
  clearError: () => void;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  // Estado inicial
  permissions: [],
  roles: [],
  isLoading: false,
  error: null,

  // Cargar permisos
  loadPermissions: async () => {
    try {
      set({ isLoading: true, error: null });

      const result = await getMyPermissionsAPI();

      if (result.success && result.data) {
        set({
          permissions: result.data.permissions,
          roles: result.data.roles,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: result.message || 'Error al cargar permisos',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar permisos',
      });
    }
  },

  // Verificar si tiene un permiso
  hasPermission: (permission: string) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  // Verificar si tiene alguno de los permisos
  hasAnyPermission: (permissions: string[]) => {
    const { permissions: userPermissions } = get();
    return permissions.some(p => userPermissions.includes(p));
  },

  // Verificar si tiene todos los permisos
  hasAllPermissions: (permissions: string[]) => {
    const { permissions: userPermissions } = get();
    return permissions.every(p => userPermissions.includes(p));
  },

  // Limpiar permisos
  clearPermissions: () => {
    set({
      permissions: [],
      roles: [],
    });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

