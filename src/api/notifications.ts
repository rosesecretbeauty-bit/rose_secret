// src/api/notifications.ts
// API functions for notifications

import { api } from './client';

// ============================================
// Types
// ============================================

export interface Notification {
  id: number;
  user_id?: number;
  type: 'order' | 'payment' | 'promo' | 'account' | 'system';
  channel: 'email' | 'in_app' | 'push';
  title: string;
  message: string;
  metadata?: any;
  read_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    total: number;
    unread: number;
  };
  message?: string;
}

export interface NotificationPreferences {
  email_order: boolean;
  email_payment: boolean;
  email_promo: boolean;
  email_account: boolean;
  in_app_order: boolean;
  in_app_payment: boolean;
  in_app_promo: boolean;
  in_app_account: boolean;
  in_app_system: boolean;
  push_order: boolean;
  push_payment: boolean;
  push_promo: boolean;
}

// ============================================
// Get User Notifications
// ============================================

export async function getNotifications(filters?: {
  limit?: number;
  offset?: number;
  type?: 'order' | 'payment' | 'promo' | 'account' | 'system';
  unread_only?: boolean;
}): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  if (filters?.type) params.append('type', filters.type);
  if (filters?.unread_only) params.append('unread_only', 'true');
  
  const query = params.toString();
  const endpoint = `/notifications${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<NotificationsResponse>;
}

// ============================================
// Mark Notification as Read
// ============================================

export async function markNotificationAsRead(notificationId?: number, markAll?: boolean): Promise<{ success: boolean; message?: string }> {
  return api.post('/notifications/mark-read', {
    notification_id: notificationId,
    mark_all: markAll
  }) as Promise<{ success: boolean; message?: string }>;
}

// ============================================
// Get Unread Count
// ============================================

export async function getUnreadCount(): Promise<{ success: boolean; data?: { count: number } }> {
  return api.get('/notifications/unread-count') as Promise<{ success: boolean; data?: { count: number } }>;
}

// ============================================
// Get Notification Preferences
// ============================================

export async function getNotificationPreferences(): Promise<{ success: boolean; data?: NotificationPreferences }> {
  return api.get('/notifications/preferences') as Promise<{ success: boolean; data?: NotificationPreferences }>;
}

// ============================================
// Update Notification Preferences
// ============================================

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; data?: NotificationPreferences; message?: string }> {
  return api.put('/notifications/preferences', preferences) as Promise<{ success: boolean; data?: NotificationPreferences; message?: string }>;
}

