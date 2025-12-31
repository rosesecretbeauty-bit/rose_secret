// ============================================
// Notification Payload Validation
// ============================================

import type { Notification, NotificationPreferences } from './notificationTypes';

// ============================================
// Validation Helpers
// ============================================

function isValidString(value: any, minLength = 1): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isValidNumber(value: any, min = 0): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min;
}

function sanitizeString(value: string, maxLength = 500): string {
  return value
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, maxLength);
}

// ============================================
// Notification Validators
// ============================================

export function validateNotification(notification: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!isValidNumber(notification.id, 1)) {
    errors.push('Notification ID is required and must be a positive number');
  }

  if (!isValidNumber(notification.user_id, 1)) {
    errors.push('User ID is required and must be a positive number');
  }

  if (!isValidString(notification.type)) {
    errors.push('Notification type is required');
  } else if (!['order', 'payment', 'promo', 'account', 'system'].includes(notification.type)) {
    errors.push('Invalid notification type');
  }

  if (!isValidString(notification.channel)) {
    errors.push('Notification channel is required');
  } else if (!['email', 'in_app', 'push'].includes(notification.channel)) {
    errors.push('Invalid notification channel');
  }

  if (!isValidString(notification.title)) {
    errors.push('Notification title is required');
  }

  if (!isValidString(notification.message)) {
    errors.push('Notification message is required');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateNotificationPreferences(prefs: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  const requiredPrefs = [
    'email_order',
    'email_payment',
    'email_promo',
    'email_account',
    'in_app_order',
    'in_app_payment',
    'in_app_promo',
    'in_app_account',
    'in_app_system',
  ];

  requiredPrefs.forEach((pref) => {
    if (typeof prefs[pref] !== 'boolean') {
      errors.push(`Preference ${pref} must be a boolean`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================
// Sanitization
// ============================================

export function sanitizeNotification(notification: any): Notification {
  return {
    id: parseInt(notification.id) || 0,
    user_id: parseInt(notification.user_id) || 0,
    type: notification.type || 'system',
    channel: notification.channel || 'in_app',
    title: sanitizeString(notification.title || '', 255),
    message: sanitizeString(notification.message || '', 1000),
    metadata: notification.metadata || {},
    read_at: notification.read_at || null,
    sent_at: notification.sent_at || null,
    created_at: notification.created_at || new Date().toISOString(),
    updated_at: notification.updated_at,
  };
}

export function sanitizeNotificationPreferences(prefs: any): NotificationPreferences {
  return {
    email_order: Boolean(prefs.email_order),
    email_payment: Boolean(prefs.email_payment),
    email_promo: Boolean(prefs.email_promo),
    email_account: Boolean(prefs.email_account),
    in_app_order: Boolean(prefs.in_app_order),
    in_app_payment: Boolean(prefs.in_app_payment),
    in_app_promo: Boolean(prefs.in_app_promo),
    in_app_account: Boolean(prefs.in_app_account),
    in_app_system: Boolean(prefs.in_app_system),
    push_order: prefs.push_order !== undefined ? Boolean(prefs.push_order) : undefined,
    push_payment: prefs.push_payment !== undefined ? Boolean(prefs.push_payment) : undefined,
    push_promo: prefs.push_promo !== undefined ? Boolean(prefs.push_promo) : undefined,
  };
}

