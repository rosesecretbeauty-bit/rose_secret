// Analytics event tracking schema
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

// Page view tracking
export const trackPageView = (path: string, title?: string) => {
  const event: AnalyticsEvent = {
    event: 'page_view',
    category: 'navigation',
    action: 'page_view',
    label: path,
    page_path: path,
    page_title: title || document.title
  };
  pushEvent(event);
};

// E-commerce events
export const trackProductView = (product: any) => {
  const event: AnalyticsEvent = {
    event: 'product_view',
    category: 'ecommerce',
    action: 'view_item',
    label: product.name,
    ecommerce: {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1
      }]
    }
  };
  pushEvent(event);
};
export const trackAddToCart = (product: any, quantity: number) => {
  const event: AnalyticsEvent = {
    event: 'add_to_cart',
    category: 'ecommerce',
    action: 'add_to_cart',
    label: product.name,
    value: product.price * quantity,
    ecommerce: {
      currency: 'USD',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    }
  };
  pushEvent(event);
};
export const trackRemoveFromCart = (product: any, quantity: number) => {
  const event: AnalyticsEvent = {
    event: 'remove_from_cart',
    category: 'ecommerce',
    action: 'remove_from_cart',
    label: product.name,
    value: product.price * quantity,
    ecommerce: {
      currency: 'USD',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    }
  };
  pushEvent(event);
};
export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  const event: AnalyticsEvent = {
    event: 'begin_checkout',
    category: 'ecommerce',
    action: 'begin_checkout',
    value: totalValue,
    ecommerce: {
      currency: 'USD',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      }))
    }
  };
  pushEvent(event);
};
export const trackPurchase = (orderId: string, cartItems: any[], totalValue: number) => {
  const event: AnalyticsEvent = {
    event: 'purchase',
    category: 'ecommerce',
    action: 'purchase',
    value: totalValue,
    ecommerce: {
      transaction_id: orderId,
      currency: 'USD',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      }))
    }
  };
  pushEvent(event);
};
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  const event: AnalyticsEvent = {
    event: 'search',
    category: 'engagement',
    action: 'search',
    label: searchTerm,
    value: resultsCount,
    search_term: searchTerm,
    results_count: resultsCount
  };
  pushEvent(event);
};
export const trackWishlistAdd = (product: any) => {
  const event: AnalyticsEvent = {
    event: 'add_to_wishlist',
    category: 'engagement',
    action: 'add_to_wishlist',
    label: product.name,
    ecommerce: {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price
      }]
    }
  };
  pushEvent(event);
};
export const trackShare = (contentType: string, contentId: string, method: string) => {
  const event: AnalyticsEvent = {
    event: 'share',
    category: 'engagement',
    action: 'share',
    label: `${contentType}_${contentId}`,
    content_type: contentType,
    content_id: contentId,
    method: method
  };
  pushEvent(event);
};
export const trackSignUp = (method: string) => {
  const event: AnalyticsEvent = {
    event: 'sign_up',
    category: 'user',
    action: 'sign_up',
    label: method,
    method: method
  };
  pushEvent(event);
};
export const trackLogin = (method: string) => {
  const event: AnalyticsEvent = {
    event: 'login',
    category: 'user',
    action: 'login',
    label: method,
    method: method
  };
  pushEvent(event);
};

// Feature usage tracking
export const trackFeatureUsage = (featureName: string, action: string) => {
  const event: AnalyticsEvent = {
    event: 'feature_usage',
    category: 'features',
    action: action,
    label: featureName,
    feature_name: featureName
  };
  pushEvent(event);
};

// Push event to dataLayer (Google Analytics 4)
function pushEvent(event: AnalyticsEvent) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if ((window as any).gtag) {
      ;
      (window as any).gtag('event', event.event, event);
    }

    // Google Tag Manager
    if ((window as any).dataLayer) {
      ;
      (window as any).dataLayer.push(event);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }
}