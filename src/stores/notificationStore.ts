// ============================================
// Notification Store
// ============================================
// Zustand store para gestionar notificaciones in-app

import { create } from 'zustand';
import type {
  Notification,
  NotificationPreferences,
} from '../notifications/notificationTypes';
import {
  getNotifications as getNotificationsAPI,
  markAsRead as markAsReadAPI,
  getNotificationPreferences as getNotificationPreferencesAPI,
  updateNotificationPreferences as updateNotificationPreferencesAPI,
  getUnreadCount as getUnreadCountAPI,
} from '../notifications/notificationClient';

interface NotificationStore {
  // Estado
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  isMarkingAsRead: boolean;
  error: string | null;
  isOpen: boolean;

  // Acciones
  loadNotifications: (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    unread_only?: boolean;
  }) => Promise<void>;
  markAsRead: (notificationId?: number, markAll?: boolean) => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  toggleNotifications: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  clearError: () => void;
}

// Preferencias por defecto
const defaultPreferences: NotificationPreferences = {
  email_order: true,
  email_payment: true,
  email_promo: true,
  email_account: true,
  in_app_order: true,
  in_app_payment: true,
  in_app_promo: true,
  in_app_account: true,
  in_app_system: true,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Estado inicial
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  isMarkingAsRead: false,
  error: null,
  isOpen: false,

  // Cargar notificaciones
  loadNotifications: async (params) => {
    try {
      set({ isLoading: true, error: null });

      const result = await getNotificationsAPI(params);

      if (result.success && result.data) {
        set({
          notifications: result.data.notifications,
          unreadCount: result.data.unread_count,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: result.message || 'Error al cargar notificaciones',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar notificaciones',
      });
    }
  },

  // Marcar como leída
  markAsRead: async (notificationId, markAll = false) => {
    try {
      set({ isMarkingAsRead: true, error: null });

      const result = await markAsReadAPI(notificationId, markAll);

      if (result.success) {
        // Actualizar estado local
        if (markAll) {
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              read_at: n.read_at || new Date().toISOString(),
            })),
            unreadCount: 0,
            isMarkingAsRead: false,
          }));
        } else if (notificationId) {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, read_at: n.read_at || new Date().toISOString() }
                : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
            isMarkingAsRead: false,
          }));
        }
      } else {
        set({
          isMarkingAsRead: false,
          error: result.message || 'Error al marcar como leída',
        });
      }
    } catch (error: any) {
      set({
        isMarkingAsRead: false,
        error: error.message || 'Error al marcar como leída',
      });
    }
  },

  // Cargar preferencias
  loadPreferences: async () => {
    try {
      const result = await getNotificationPreferencesAPI();

      if (result.success && result.preferences) {
        set({ preferences: result.preferences });
      } else {
        // Usar preferencias por defecto si no hay en backend
        set({ preferences: defaultPreferences });
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      // Usar preferencias por defecto en caso de error
      set({ preferences: defaultPreferences });
    }
  },

  // Actualizar preferencias
  updatePreferences: async (preferences) => {
    try {
      const result = await updateNotificationPreferencesAPI(preferences);

      if (result.success && result.preferences) {
        set({ preferences: result.preferences });
      } else {
        throw new Error(result.message || 'Error al actualizar preferencias');
      }
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  // Refrescar contador de no leídas
  refreshUnreadCount: async () => {
    try {
      const result = await getUnreadCountAPI();

      if (result.success && result.count !== undefined) {
        set({ unreadCount: result.count });
      }
    } catch (error: any) {
      console.error('Error refreshing unread count:', error);
    }
  },

  // Toggle panel de notificaciones
  toggleNotifications: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  // Abrir panel
  openNotifications: () => {
    set({ isOpen: true });
    // Cargar notificaciones al abrir
    get().loadNotifications({ limit: 20, unread_only: false });
  },

  // Cerrar panel
  closeNotifications: () => {
    set({ isOpen: false });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },
}));

