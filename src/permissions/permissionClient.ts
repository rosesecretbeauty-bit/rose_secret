// ============================================
// Permission API Client
// ============================================
// Cliente para interactuar con endpoints de permisos del backend

import { api } from '../api/client';
import type { PermissionResponse, Permission, Role } from './permissionTypes';

// ============================================
// API Functions
// ============================================

/**
 * Obtener permisos del usuario autenticado
 */
export async function getMyPermissions(): Promise<PermissionResponse> {
  try {
    const response = await api.get('/permissions/me') as {
      success: boolean;
      message?: string;
      data?: {
        permissions: string[];
        roles: any[];
      };
    };

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          permissions: response.data.permissions,
          roles: response.data.roles.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            is_system: r.is_system,
            permissions: r.permissions || [],
          })),
        },
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener permisos',
    };
  } catch (error: any) {
    console.error('Error getting permissions:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener permisos',
    };
  }
}

/**
 * Obtener todos los permisos disponibles (solo admin)
 */
export async function getAllPermissions(): Promise<{
  success: boolean;
  permissions?: Permission[];
  message?: string;
}> {
  try {
    const response = await api.get('/permissions') as {
      success: boolean;
      data?: any[];
      message?: string;
    };

    if (response.success && response.data) {
      return {
        success: true,
        permissions: response.data,
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener permisos',
    };
  } catch (error: any) {
    console.error('Error getting all permissions:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener permisos',
    };
  }
}

/**
 * Obtener todos los roles (solo admin)
 */
export async function getAllRoles(): Promise<{
  success: boolean;
  roles?: Role[];
  message?: string;
}> {
  try {
    const response = await api.get('/roles') as {
      success: boolean;
      data?: any[];
      message?: string;
    };

    if (response.success && response.data) {
      return {
        success: true,
        roles: response.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          is_system: r.is_system,
          permissions: r.permissions || [],
        })),
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener roles',
    };
  } catch (error: any) {
    console.error('Error getting roles:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener roles',
    };
  }
}

