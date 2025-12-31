// ============================================
// Discount Types
// ============================================
// Tipos TypeScript para el sistema de descuentos

// ============================================
// Discount Types from Backend
// ============================================

export type DiscountType = 'coupon' | 'promotion' | 'automatic';
export type DiscountAmountType = 'fixed' | 'percentage';
export type DiscountAppliesTo = 'cart' | 'product' | 'category';

export interface Discount {
  id: number;
  type: DiscountType;
  code?: string;
  name?: string;
  description?: string;
  amount: number;
  amount_type: DiscountAmountType;
  applies_to: DiscountAppliesTo;
  conditions?: Record<string, any>;
  starts_at?: string;
  ends_at?: string;
  min_purchase?: number;
  max_discount?: number;
  is_active?: boolean;
}

// ============================================
// Applied Discount (Frontend State)
// ============================================

export interface AppliedDiscount {
  id: number;
  discount_id: number;
  type: DiscountType;
  code?: string;
  label: string; // "CUPON10" o "10% OFF Automático"
  amount: number; // Monto del descuento calculado
  amount_type: DiscountAmountType;
  original_amount: number; // Valor original del descuento (antes de calcular)
  applies_to: DiscountAppliesTo;
  is_automatic?: boolean;
}

// ============================================
// Cart Totals with Discounts
// ============================================

export interface CartTotals {
  subtotal: number;
  discounts: AppliedDiscount[];
  discount_total: number; // Suma de todos los descuentos
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
}

// ============================================
// Discount Validation Response
// ============================================

export interface DiscountValidationResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  discount?: Discount;
  calculated_amount?: number; // Monto calculado del descuento
  cart_totals?: CartTotals;
  error_code?: 'EXPIRED' | 'INVALID' | 'NOT_APPLICABLE' | 'ALREADY_USED' | 'MIN_PURCHASE' | 'USAGE_LIMIT';
}

// ============================================
// Apply Discount Request
// ============================================

export interface ApplyDiscountRequest {
  code?: string;
  cart_id?: number | string;
}

// ============================================
// Remove Discount Request
// ============================================

export interface RemoveDiscountRequest {
  discount_id: number;
  code?: string;
}

