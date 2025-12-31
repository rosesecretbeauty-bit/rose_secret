// ============================================
// Notification Types
// ============================================
// Tipos TypeScript para el sistema de notificaciones

// ============================================
// Notification Types from Backend
// ============================================

export type NotificationType = 'order' | 'payment' | 'promo' | 'account' | 'system';
export type NotificationChannel = 'email' | 'in_app' | 'push';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read_at?: string | null;
  sent_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// ============================================
// Notification Preferences
// ============================================

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
  push_order?: boolean;
  push_payment?: boolean;
  push_promo?: boolean;
}

// ============================================
// Notification Response
// ============================================

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: {
    notifications: Notification[];
    unread_count: number;
  };
}

// ============================================
// Mark as Read Request
// ============================================

export interface MarkAsReadRequest {
  notification_id?: number;
  mark_all?: boolean;
}

// ============================================
// Notification Template Data
// ============================================

export interface NotificationTemplateData {
  orderNumber?: string;
  orderId?: number;
  orderTotal?: number;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  userName?: string;
  userEmail?: string;
  [key: string]: any;
}

