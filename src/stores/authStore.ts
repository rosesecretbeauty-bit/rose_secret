import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { trackEvent, identifyUser, resetAnalytics } from '../analytics/analyticsClient';

export type UserRole = 'customer' | 'admin' | 'manager';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  email_verified?: boolean;
  email_verified_at?: string;
  phone?: string;
  phone_verified?: boolean;
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loadProfile: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.data) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        
        // Asegurar que el user tenga el formato correcto
        // Si tiene role_names, verificar si incluye admin para determinar el rol principal
        let primaryRole = response.data.user.role || 'customer';
        if (response.data.user.role_names && Array.isArray(response.data.user.role_names)) {
          if (response.data.user.role_names.includes('admin')) {
            primaryRole = 'admin';
          } else if (response.data.user.role_names.includes('manager')) {
            primaryRole = 'manager';
          } else if (response.data.user.role_names.length > 0) {
            primaryRole = response.data.user.role_names[0];
          }
        }
        
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.email,
          role: primaryRole,
          avatar: response.data.user.avatar || null, // Asegurar que siempre sea string o null, nunca undefined
          email_verified: response.data.user.email_verified === true || response.data.user.email_verified === 1,
          email_verified_at: response.data.user.email_verified_at,
          phone: response.data.user.phone || null,
          phone_verified: response.data.user.phone_verified === true || response.data.user.phone_verified === 1
        };
        
        set({
          user: userData,
          isAuthenticated: true
        });

        // Cargar permisos después del login (especialmente importante para ADMIN)
        if (primaryRole === 'admin' || primaryRole === 'manager') {
          // Cargar permisos en background para no bloquear el login
          import('../stores/permissionStore').then(({ usePermissionStore }) => {
            const permissionStore = usePermissionStore.getState();
            permissionStore.loadPermissions().catch(err => {
              console.error('Error loading permissions after login:', err);
            });
          });
        }

        // Track analytics event and identify user
        trackEvent('USER_LOGIN', {
          method: 'email',
        });
        identifyUser(userData.id, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });

        return true;
      }
      
      // Si la respuesta no es exitosa, lanzar error con el mensaje
      throw new Error(response.message || 'Error al iniciar sesión');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Propagar el error con el mensaje para que el componente pueda mostrarlo
      const errorMessage = error.message || error.response?.data?.message || 'Credenciales inválidas';
      throw new Error(errorMessage);
    }
  },
  
  logout: () => {
    // Track analytics event before resetting
    trackEvent('USER_LOGOUT', {});
    resetAnalytics();

    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false
    });
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.success && response.data) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        
        const userData = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.email,
          role: response.data.user.role || 'customer'
        };
        
        set({
          user: userData,
          isAuthenticated: true
        });

        // Track analytics event and identify user
        trackEvent('USER_REGISTER', {
          method: 'email',
        });
        identifyUser(userData.id, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  },
  
  // Cargar perfil del usuario autenticado
  loadProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, limpiar estado
        set({
          user: null,
          isAuthenticated: false
        });
        return;
      }
      
      const response = await api.get('/auth/me');
      
      if (response.success && response.data) {
        // Asegurar que el user tenga el formato correcto
        // Si tiene role_names, verificar si incluye admin para determinar el rol principal
        let primaryRole = response.data.user.role || 'customer';
        if (response.data.user.role_names && Array.isArray(response.data.user.role_names)) {
          if (response.data.user.role_names.includes('admin')) {
            primaryRole = 'admin';
          } else if (response.data.user.role_names.includes('manager')) {
            primaryRole = 'manager';
          } else if (response.data.user.role_names.length > 0) {
            primaryRole = response.data.user.role_names[0];
          }
        }
        
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.email,
          role: primaryRole,
          avatar: response.data.user.avatar || null, // Asegurar que siempre sea string o null, nunca undefined
          email_verified: response.data.user.email_verified === true || response.data.user.email_verified === 1,
          email_verified_at: response.data.user.email_verified_at,
          phone: response.data.user.phone || null,
          phone_verified: response.data.user.phone_verified === true || response.data.user.phone_verified === 1
        };
        
        set({
          user: userData,
          isAuthenticated: true
        });

        // Cargar permisos después de cargar perfil (especialmente importante para ADMIN)
        if (primaryRole === 'admin' || primaryRole === 'manager') {
          // Cargar permisos en background
          import('../stores/permissionStore').then(({ usePermissionStore }) => {
            const permissionStore = usePermissionStore.getState();
            permissionStore.loadPermissions().catch(err => {
              console.error('Error loading permissions after profile load:', err);
            });
          });
        }

        // Identify user after loading profile
        identifyUser(userData.id, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });
      } else {
        // Si la respuesta no es exitosa, limpiar token
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false
        });
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      // Si falla (401, 403, etc.), limpiar token
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },
  
  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, ...updates }
      });
    }
  },
  
  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },
  
  isManager: () => {
    const { user } = get();
    return user?.role === 'manager' || user?.role === 'admin';
  }
}), {
  name: 'rose-secret-auth'
}));