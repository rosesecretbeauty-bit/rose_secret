// ============================================
// Notification API Client
// ============================================
// Cliente para interactuar con endpoints de notificaciones del backend

import { api } from '../api/client';
import type {
  Notification,
  NotificationResponse,
  NotificationPreferences,
  MarkAsReadRequest,
} from './notificationTypes';
import { sanitizeNotification, sanitizeNotificationPreferences } from './notificationSchemas';

// ============================================
// API Functions
// ============================================

/**
 * Obtener notificaciones del usuario
 */
export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  type?: string;
  unread_only?: boolean;
}): Promise<NotificationResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.unread_only) queryParams.append('unread_only', 'true');

    const response = await api.get(
      `/notifications?${queryParams.toString()}`
    ) as {
      success: boolean;
      message?: string;
      data?: {
        notifications: any[];
        unread_count: number;
      };
    };

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          notifications: response.data.notifications.map((n: any) => sanitizeNotification(n)),
          unread_count: response.data.unread_count || 0,
        },
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener notificaciones',
    };
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener notificaciones',
    };
  }
}

/**
 * Marcar notificación como leída
 */
export async function markAsRead(
  notificationId?: number,
  markAll: boolean = false
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload: MarkAsReadRequest = {};
    if (markAll) {
      payload.mark_all = true;
    } else if (notificationId) {
      payload.notification_id = notificationId;
    } else {
      return {
        success: false,
        message: 'Se requiere notification_id o mark_all',
      };
    }

    const response = await api.post('/notifications/mark-read', payload) as {
      success: boolean;
      message?: string;
    };

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.message || 'Error al marcar como leída',
    };
  }
}

/**
 * Obtener preferencias de notificaciones del usuario
 */
export async function getNotificationPreferences(): Promise<{
  success: boolean;
  preferences?: NotificationPreferences;
  message?: string;
}> {
  try {
    const response = await api.get('/notifications/preferences') as {
      success: boolean;
      data?: any;
      message?: string;
    };

    if (response.success && response.data) {
      return {
        success: true,
        preferences: sanitizeNotificationPreferences(response.data),
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener preferencias',
    };
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener preferencias',
    };
  }
}

/**
 * Actualizar preferencias de notificaciones
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; message?: string; preferences?: NotificationPreferences }> {
  try {
    const response = await api.put('/notifications/preferences', preferences) as {
      success: boolean;
      data?: any;
      message?: string;
    };

    if (response.success && response.data) {
      return {
        success: true,
        preferences: sanitizeNotificationPreferences(response.data),
        message: response.message,
      };
    }

    return {
      success: false,
      message: response.message || 'Error al actualizar preferencias',
    };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return {
      success: false,
      message: error.message || 'Error al actualizar preferencias',
    };
  }
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getUnreadCount(): Promise<{
  success: boolean;
  count?: number;
  message?: string;
}> {
  try {
    const response = await api.get('/notifications/unread-count') as {
      success: boolean;
      data?: { count: number };
      message?: string;
    };

    if (response.success && response.data) {
      return {
        success: true,
        count: response.data.count || 0,
      };
    }

    return {
      success: false,
      message: response.message || 'Error al obtener contador',
    };
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener contador',
    };
  }
}

