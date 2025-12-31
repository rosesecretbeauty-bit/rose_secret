import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type Module = 'products' | 'orders' | 'users' | 'categories' | 'promotions' | 'inventory' | 'coupons' | 'settings' | 'analytics' | 'logs';
export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export';
export interface Permission {
  module: Module;
  actions: Action[];
}
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}
interface PermissionsState {
  roles: Role[];
  currentRole: Role | null;
  setRole: (roleId: string) => void;
  hasPermission: (module: Module, action: Action) => boolean;
  getRole: (roleId: string) => Role | undefined;
}
const defaultRoles: Role[] = [{
  id: 'admin',
  name: 'Administrador',
  description: 'Acceso total a todos los módulos',
  permissions: [{
    module: 'products',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  }, {
    module: 'orders',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  }, {
    module: 'users',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  }, {
    module: 'categories',
    actions: ['view', 'create', 'edit', 'delete']
  }, {
    module: 'promotions',
    actions: ['view', 'create', 'edit', 'delete']
  }, {
    module: 'inventory',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  }, {
    module: 'coupons',
    actions: ['view', 'create', 'edit', 'delete']
  }, {
    module: 'settings',
    actions: ['view', 'edit']
  }, {
    module: 'analytics',
    actions: ['view', 'export']
  }, {
    module: 'logs',
    actions: ['view', 'export']
  }]
}, {
  id: 'manager',
  name: 'Gerente',
  description: 'Gestión de tienda sin acceso a configuración sensible',
  permissions: [{
    module: 'products',
    actions: ['view', 'create', 'edit', 'export']
  }, {
    module: 'orders',
    actions: ['view', 'edit', 'export']
  }, {
    module: 'users',
    actions: ['view', 'export']
  }, {
    module: 'categories',
    actions: ['view', 'create', 'edit']
  }, {
    module: 'promotions',
    actions: ['view', 'create', 'edit']
  }, {
    module: 'inventory',
    actions: ['view', 'edit', 'export']
  }, {
    module: 'coupons',
    actions: ['view', 'create', 'edit']
  }, {
    module: 'analytics',
    actions: ['view']
  }, {
    module: 'logs',
    actions: ['view']
  }]
}, {
  id: 'staff',
  name: 'Vendedor',
  description: 'Acceso básico para gestión de pedidos',
  permissions: [{
    module: 'products',
    actions: ['view']
  }, {
    module: 'orders',
    actions: ['view', 'edit']
  }, {
    module: 'users',
    actions: ['view']
  }, {
    module: 'inventory',
    actions: ['view']
  }]
}];
export const usePermissionsStore = create<PermissionsState>()(persist((set, get) => ({
  roles: defaultRoles,
  currentRole: defaultRoles[0],
  // Default to admin for demo

  setRole: roleId => {
    const role = get().roles.find(r => r.id === roleId);
    if (role) {
      set({
        currentRole: role
      });
    }
  },
  hasPermission: (module, action) => {
    const {
      currentRole
    } = get();
    if (!currentRole) return false;
    const modulePermission = currentRole.permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    return modulePermission.actions.includes(action);
  },
  getRole: roleId => get().roles.find(r => r.id === roleId)
}), {
  name: 'rose-secret-permissions'
}));