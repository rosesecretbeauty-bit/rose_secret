// ============================================
// Permission Types
// ============================================
// Tipos TypeScript para el sistema de permisos

// ============================================
// Permission Types from Backend
// ============================================

export interface Permission {
  id: number;
  key: string;
  name: string;
  description?: string;
  domain: string;
  action: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system?: boolean;
  permissions?: Permission[];
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  created_at: string;
}

// ============================================
// Permission Response
// ============================================

export interface PermissionResponse {
  success: boolean;
  message?: string;
  data?: {
    permissions: string[];
    roles: Role[];
  };
}

// ============================================
// Permission Helpers
// ============================================

export type PermissionKey = 
  // Orders
  | 'orders.read'
  | 'orders.create'
  | 'orders.update'
  | 'orders.delete'
  | 'orders.export'
  | 'orders.cancel'
  | 'orders.refund'
  // Products
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.export'
  // Users
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.export'
  // Categories
  | 'categories.read'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  // Inventory
  | 'inventory.read'
  | 'inventory.update'
  | 'inventory.export'
  // Coupons
  | 'coupons.read'
  | 'coupons.create'
  | 'coupons.update'
  | 'coupons.delete'
  // Promotions
  | 'promotions.read'
  | 'promotions.create'
  | 'promotions.update'
  | 'promotions.delete'
  // Settings
  | 'settings.read'
  | 'settings.update'
  // Analytics
  | 'analytics.read'
  | 'analytics.export'
  // Audit
  | 'audit.read'
  | 'audit.export'
  // Roles
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'roles.assign';

