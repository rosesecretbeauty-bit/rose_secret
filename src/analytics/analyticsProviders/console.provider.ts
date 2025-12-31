// ============================================
// Console Analytics Provider
// ============================================
// Provider para desarrollo y debugging

import type { AnalyticsEvent, AnalyticsEventPayload } from '../events';

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(path: string, properties?: Record<string, any>): void;
  reset(): void;
}

export class ConsoleProvider implements AnalyticsProvider {
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    const emoji = this.getEventEmoji(event.type);
    const timestamp = new Date().toISOString();

    console.group(`${emoji} [Analytics] ${event.type}`);
    console.log('Timestamp:', timestamp);
    console.log('Payload:', event.payload);
    console.groupEnd();
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled) return;

    console.group('👤 [Analytics] Identify User');
    console.log('User ID:', userId);
    if (traits) {
      console.log('Traits:', traits);
    }
    console.groupEnd();
  }

  page(path: string, properties?: Record<string, any>): void {
    if (!this.enabled) return;

    console.group('📄 [Analytics] Page View');
    console.log('Path:', path);
    if (properties) {
      console.log('Properties:', properties);
    }
    console.groupEnd();
  }

  reset(): void {
    if (!this.enabled) return;
    console.log('🔄 [Analytics] Reset');
  }

  private getEventEmoji(eventType: string): string {
    const emojiMap: Record<string, string> = {
      USER_LOGIN: '🔐',
      USER_REGISTER: '📝',
      USER_LOGOUT: '👋',
      VIEW_PRODUCT: '👁️',
      VIEW_CATEGORY: '📂',
      SEARCH_PRODUCTS: '🔍',
      ADD_TO_CART: '🛒',
      REMOVE_FROM_CART: '❌',
      UPDATE_CART_ITEM: '✏️',
      VIEW_CART: '🛍️',
      BEGIN_CHECKOUT: '💳',
      PAYMENT_INTENT_CREATED: '💵',
      PAYMENT_SUCCESS: '✅',
      PAYMENT_FAILED: '❌',
      ORDER_CREATED: '📦',
      ORDER_VIEWED: '👀',
      ADD_TO_WISHLIST: '❤️',
      REMOVE_FROM_WISHLIST: '💔',
      PAGE_VIEW: '📄',
    };

    return emojiMap[eventType] || '📊';
  }
}

