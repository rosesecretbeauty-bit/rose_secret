// ============================================
// Analytics Events Catalog
// ============================================
// Catálogo tipado de eventos de negocio

// ============================================
// Event Types
// ============================================

export type AnalyticsEventType =
  // Autenticación
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'USER_LOGOUT'
  // Productos
  | 'VIEW_PRODUCT'
  | 'VIEW_CATEGORY'
  | 'SEARCH_PRODUCTS'
  // Carrito
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'UPDATE_CART_ITEM'
  | 'VIEW_CART'
  // Checkout
  | 'BEGIN_CHECKOUT'
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  // Órdenes
  | 'ORDER_CREATED'
  | 'ORDER_VIEWED'
  // Wishlist
  | 'ADD_TO_WISHLIST'
  | 'REMOVE_FROM_WISHLIST'
  // Descuentos
  | 'COUPON_APPLIED'
  | 'COUPON_FAILED'
  | 'DISCOUNT_APPLIED'
  | 'DISCOUNT_REMOVED'
  // Navegación
  | 'PAGE_VIEW';

// ============================================
// Event Payloads
// ============================================

export interface BaseEventPayload {
  timestamp?: number;
  sessionId?: string;
  userId?: string;
  anonymousId?: string;
}

// Autenticación
export interface UserLoginPayload extends BaseEventPayload {
  method?: string; // 'email', 'google', etc.
  email?: string; // Hasheado en producción
}

export interface UserRegisterPayload extends BaseEventPayload {
  method?: string;
  email?: string; // Hasheado en producción
}

// Productos
export interface ViewProductPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  category?: string;
  price?: number;
  currency?: string;
  variantId?: number;
}

export interface ViewCategoryPayload extends BaseEventPayload {
  categoryId?: string;
  categorySlug: string;
  categoryName?: string;
}

export interface SearchProductsPayload extends BaseEventPayload {
  query: string;
  resultsCount?: number;
  filters?: Record<string, any>;
}

// Carrito
export interface AddToCartPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency?: string;
  variantId?: number;
  totalValue?: number;
}

export interface RemoveFromCartPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency?: string;
}

export interface UpdateCartItemPayload extends BaseEventPayload {
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  price: number;
  currency?: string;
}

export interface ViewCartPayload extends BaseEventPayload {
  itemCount?: number;
  totalValue?: number;
  currency?: string;
}

// Checkout
export interface BeginCheckoutPayload extends BaseEventPayload {
  itemCount?: number;
  totalValue: number;
  currency?: string;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface PaymentIntentCreatedPayload extends BaseEventPayload {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
}

export interface PaymentSuccessPayload extends BaseEventPayload {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
}

export interface PaymentFailedPayload extends BaseEventPayload {
  orderId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  error?: string;
}

// Órdenes
export interface OrderCreatedPayload extends BaseEventPayload {
  orderId: string;
  orderNumber: string;
  totalValue: number;
  currency?: string;
  itemCount?: number;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderViewedPayload extends BaseEventPayload {
  orderId: string;
  orderNumber: string;
  status?: string;
  totalValue?: number;
  currency?: string;
}

// Wishlist
export interface AddToWishlistPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  price?: number;
  currency?: string;
}

export interface RemoveFromWishlistPayload extends BaseEventPayload {
  productId: string;
  productName: string;
}

// Descuentos
export interface CouponAppliedPayload extends BaseEventPayload {
  code: string;
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency?: string;
}

export interface CouponFailedPayload extends BaseEventPayload {
  code: string;
  cart_total_before: number;
  error?: string;
  currency?: string;
}

export interface DiscountAppliedPayload extends BaseEventPayload {
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency?: string;
  is_automatic?: boolean;
}

export interface DiscountRemovedPayload extends BaseEventPayload {
  code?: string;
  discount_id: number;
  amount: number;
  cart_total_before: number;
  cart_total_after: number;
  currency?: string;
}

// Notificaciones
export interface NotificationSentPayload extends BaseEventPayload {
  notification_id: number;
  type: string;
  channel: string;
}

export interface NotificationOpenedPayload extends BaseEventPayload {
  notification_id?: number;
  type: string;
  channel: string;
}

export interface NotificationClickedPayload extends BaseEventPayload {
  notification_id?: number;
  type: string;
  channel: string;
}

// Auditoría
export interface AdminActionPayload extends BaseEventPayload {
  action: string;
  entity: string;
  entity_id?: number;
  metadata?: Record<string, any>;
}

export interface RoleAssignedPayload extends BaseEventPayload {
  user_id: number;
  role_id: number;
  role_name: string;
}

export interface RoleRemovedPayload extends BaseEventPayload {
  user_id: number;
  role_id: number;
  role_name: string;
}

export interface PermissionDeniedPayload extends BaseEventPayload {
  user_id: number;
  permission: string;
  path: string;
  method: string;
}

// Navegación
export interface PageViewPayload extends BaseEventPayload {
  path: string;
  title?: string;
  referrer?: string;
  search?: string;
}

// ============================================
// Union Type for All Payloads
// ============================================

export type AnalyticsEventPayload =
  | UserLoginPayload
  | UserRegisterPayload
  | ViewProductPayload
  | ViewCategoryPayload
  | SearchProductsPayload
  | AddToCartPayload
  | RemoveFromCartPayload
  | UpdateCartItemPayload
  | ViewCartPayload
  | BeginCheckoutPayload
  | PaymentIntentCreatedPayload
  | PaymentSuccessPayload
  | PaymentFailedPayload
  | OrderCreatedPayload
  | OrderViewedPayload
  | AddToWishlistPayload
  | RemoveFromWishlistPayload
  | CouponAppliedPayload
  | CouponFailedPayload
  | DiscountAppliedPayload
  | DiscountRemovedPayload
  | NotificationSentPayload
  | NotificationOpenedPayload
  | NotificationClickedPayload
  | AdminActionPayload
  | RoleAssignedPayload
  | RoleRemovedPayload
  | PermissionDeniedPayload
  | PageViewPayload;

// ============================================
// Event Definition
// ============================================

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  payload: AnalyticsEventPayload;
}

