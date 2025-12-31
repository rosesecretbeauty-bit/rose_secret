import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Analytics event types
export type AnalyticsEvent = 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'add_to_wishlist' | 'remove_from_wishlist' | 'begin_checkout' | 'complete_checkout' | 'purchase' | 'search' | 'user_signup' | 'user_signin' | 'review_submitted' | 'newsletter_subscribed';
interface AnalyticsProperties {
  [key: string]: any;
}

// Track function - replace with your analytics provider
export const track = (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;
    (window as any).gtag('event', event, properties);
  }

  // Mixpanel
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    ;
    (window as any).mixpanel.track(event, properties);
  }

  // Segment
  if (typeof window !== 'undefined' && (window as any).analytics) {
    ;
    (window as any).analytics.track(event, properties);
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
  }
};

// Hook for automatic page view tracking
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    track('page_view', {
      path: location.pathname,
      search: location.search,
      title: document.title
    });
  }, [location]);
}

// Product tracking helpers
export const trackProductView = (productId: string, productName: string, category: string, price: number) => {
  track('product_view', {
    productId,
    productName,
    category,
    price
  });
};
export const trackAddToCart = (productId: string, productName: string, quantity: number, price: number, variant?: {
  color?: string;
  size?: string;
}) => {
  track('add_to_cart', {
    productId,
    productName,
    quantity,
    price,
    totalValue: price * quantity,
    variant
  });
};
export const trackPurchase = (orderId: string, total: number, items: any[], paymentMethod: string) => {
  track('purchase', {
    orderId,
    total,
    itemCount: items.length,
    items: items.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    paymentMethod
  });
};
export const trackSearch = (query: string, resultsCount: number) => {
  track('search', {
    query,
    resultsCount
  });
};