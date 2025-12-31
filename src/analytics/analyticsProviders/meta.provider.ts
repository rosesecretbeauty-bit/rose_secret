// ============================================
// Meta (Facebook) Pixel Provider
// ============================================
// Provider para Meta Pixel (placeholder para implementación futura)

import type { AnalyticsEvent } from '../events';
import type { AnalyticsProvider } from './console.provider';

declare global {
  interface Window {
    fbq?: (
      command: 'track' | 'trackCustom' | 'init' | 'set',
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

export class MetaProvider implements AnalyticsProvider {
  private pixelId: string | null;
  private enabled: boolean;

  constructor(pixelId?: string) {
    this.pixelId = pixelId || null;
    this.enabled = typeof window !== 'undefined' && typeof window.fbq === 'function';
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled || !this.pixelId) return;

    try {
      const metaEvent = this.mapEventToMeta(event);
      if (metaEvent) {
        window.fbq!('track', metaEvent, this.transformPayload(event.payload));
      }
    } catch (error) {
      console.error('[Meta Pixel] Error tracking event:', error);
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled || !this.pixelId) return;

    try {
      window.fbq!('set', 'userID', userId);
    } catch (error) {
      console.error('[Meta Pixel] Error identifying user:', error);
    }
  }

  page(path: string, properties?: Record<string, any>): void {
    if (!this.enabled || !this.pixelId) return;

    try {
      window.fbq!('track', 'PageView');
    } catch (error) {
      console.error('[Meta Pixel] Error tracking page:', error);
    }
  }

  reset(): void {
    if (!this.enabled) return;
    // Meta Pixel no tiene método reset explícito
  }

  /**
   * Mapea eventos nuestros a eventos de Meta Pixel
   */
  private mapEventToMeta(event: AnalyticsEvent): string | null {
    const eventMap: Record<string, string> = {
      ADD_TO_CART: 'AddToCart',
      BEGIN_CHECKOUT: 'InitiateCheckout',
      PAYMENT_SUCCESS: 'Purchase',
      VIEW_PRODUCT: 'ViewContent',
      SEARCH_PRODUCTS: 'Search',
    };

    return eventMap[event.type] || null;
  }

  /**
   * Transforma payload a formato Meta Pixel
   */
  private transformPayload(payload: any): Record<string, any> {
    const transformed: Record<string, any> = {};

    if ('productId' in payload) {
      transformed.content_ids = [payload.productId];
      transformed.content_name = payload.productName;
      transformed.value = payload.price || payload.totalValue || 0;
      transformed.currency = payload.currency || 'USD';
    }

    if ('totalValue' in payload) {
      transformed.value = payload.totalValue;
      transformed.currency = payload.currency || 'USD';
    }

    if ('orderId' in payload) {
      transformed.order_id = payload.orderNumber || payload.orderId;
    }

    return transformed;
  }
}

