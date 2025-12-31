// ============================================
// useNotifications Hook
// ============================================
// Hook para gestionar notificaciones con auto-refresh

import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook para gestionar notificaciones
 * Auto-carga al montar y refresca periódicamente
 */
export function useNotifications(options?: {
  autoRefresh?: boolean;
  refreshInterval?: number; // en ms
  loadOnMount?: boolean;
}) {
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    refreshUnreadCount,
    loadPreferences,
  } = useNotificationStore();

  const { isAuthenticated } = useAuthStore();

  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
    loadOnMount = true,
  } = options || {};

  // Cargar notificaciones al montar
  useEffect(() => {
    if (isAuthenticated && loadOnMount) {
      loadNotifications({ limit: 20 });
      loadPreferences();
      refreshUnreadCount();
    }
  }, [isAuthenticated, loadOnMount, loadNotifications, loadPreferences, refreshUnreadCount]);

  // Auto-refresh periódico
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, refreshInterval, refreshUnreadCount]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    if (isAuthenticated) {
      loadNotifications({ limit: 20 });
      refreshUnreadCount();
    }
  }, [isAuthenticated, loadNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    hasUnread: unreadCount > 0,
  };
}
