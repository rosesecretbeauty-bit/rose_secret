// ============================================
// Google Analytics Provider
// ============================================
// Provider para Google Analytics 4 (gtag)

import type { AnalyticsEvent, AnalyticsEventPayload } from '../events';
import type { AnalyticsProvider } from './console.provider';

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export class GoogleProvider implements AnalyticsProvider {
  private measurementId: string | null;
  private enabled: boolean;

  constructor(measurementId?: string) {
    this.measurementId = measurementId || null;
    this.enabled = typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled || !this.measurementId) return;

    try {
      const gtagEvent = this.transformEvent(event);
      window.gtag!('event', event.type, gtagEvent);
    } catch (error) {
      console.error('[Google Analytics] Error tracking event:', error);
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled || !this.measurementId) return;

    try {
      window.gtag!('set', 'user_id', userId);
      if (traits) {
        window.gtag!('set', 'user_properties', traits);
      }
    } catch (error) {
      console.error('[Google Analytics] Error identifying user:', error);
    }
  }

  page(path: string, properties?: Record<string, any>): void {
    if (!this.enabled || !this.measurementId) return;

    try {
      window.gtag!('event', 'page_view', {
        page_path: path,
        page_title: properties?.title || document.title,
        ...properties,
      });
    } catch (error) {
      console.error('[Google Analytics] Error tracking page:', error);
    }
  }

  reset(): void {
    if (!this.enabled) return;

    try {
      window.gtag!('set', 'user_id', null);
    } catch (error) {
      console.error('[Google Analytics] Error resetting:', error);
    }
  }

  /**
   * Transforma eventos de nuestro formato a formato GA4
   */
  private transformEvent(event: AnalyticsEvent): Record<string, any> {
    const payload = event.payload;
    const transformed: Record<string, any> = {
      ...payload,
    };

    // Mapear eventos de e-commerce a formato GA4
    if (event.type === 'ADD_TO_CART' && 'productId' in payload) {
      transformed.currency = payload.currency || 'USD';
      transformed.value = payload.totalValue || payload.price * payload.quantity;
      transformed.items = [
        {
          item_id: payload.productId,
          item_name: payload.productName,
          price: payload.price,
          quantity: payload.quantity,
        },
      ];
    }

    if (event.type === 'VIEW_PRODUCT' && 'productId' in payload) {
      transformed.currency = payload.currency || 'USD';
      transformed.value = payload.price || 0;
      transformed.items = [
        {
          item_id: payload.productId,
          item_name: payload.productName,
          price: payload.price,
          quantity: 1,
        },
      ];
    }

    if (event.type === 'BEGIN_CHECKOUT' && 'totalValue' in payload) {
      transformed.currency = payload.currency || 'USD';
      transformed.value = payload.totalValue;
      if (payload.items) {
        transformed.items = payload.items.map((item: any) => ({
          item_id: item.productId,
          item_name: item.productName,
          price: item.price,
          quantity: item.quantity,
        }));
      }
    }

    if (event.type === 'PAYMENT_SUCCESS' && 'amount' in payload) {
      transformed.currency = payload.currency || 'USD';
      transformed.value = payload.amount;
      transformed.transaction_id = payload.orderNumber;
    }

    if (event.type === 'ORDER_CREATED' && 'totalValue' in payload) {
      transformed.currency = payload.currency || 'USD';
      transformed.value = payload.totalValue;
      transformed.transaction_id = payload.orderNumber;
      if (payload.items) {
        transformed.items = payload.items.map((item: any) => ({
          item_id: item.productId,
          item_name: item.productName,
          price: item.price,
          quantity: item.quantity,
        }));
      }
    }

    return transformed;
  }
}

