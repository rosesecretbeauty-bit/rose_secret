// ============================================
// Discount Utilities
// ============================================
// Funciones helper para cálculos y transformaciones

import type { AppliedDiscount, CartTotals, Discount } from './discountTypes';

// ============================================
// Calculation Helpers
// ============================================

/**
 * Calcula el monto del descuento basado en el subtotal
 * NOTA: Este cálculo es solo visual. El backend es la fuente de verdad.
 */
export function calculateDiscountAmount(
  discount: Discount,
  subtotal: number
): number {
  if (discount.amount_type === 'fixed') {
    return Math.min(discount.amount, subtotal);
  } else {
    // Percentage
    const percentageAmount = (subtotal * discount.amount) / 100;
    
    // Aplicar max_discount si existe
    if (discount.max_discount) {
      return Math.min(percentageAmount, discount.max_discount);
    }
    
    return percentageAmount;
  }
}

/**
 * Calcula el total del carrito con descuentos (solo visual)
 * NOTA: El backend calcula los totales reales
 */
export function calculateCartTotal(
  subtotal: number,
  discounts: AppliedDiscount[],
  shipping: number = 0,
  tax: number = 0
): CartTotals {
  const discount_total = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const total = Math.max(0, subtotal - discount_total + shipping + tax);

  return {
    subtotal,
    discounts,
    discount_total,
    shipping,
    tax,
    total,
    currency: 'USD',
  };
}

/**
 * Formatea el label de un descuento para mostrar al usuario
 */
export function formatDiscountLabel(discount: AppliedDiscount): string {
  if (discount.code) {
    return discount.code;
  }

  if (discount.amount_type === 'fixed') {
    return `$${discount.amount.toFixed(2)} OFF`;
  } else {
    return `${discount.original_amount}% OFF`;
  }
}

/**
 * Verifica si un descuento está activo (basado en fechas)
 */
export function isDiscountActive(discount: Discount): boolean {
  if (discount.is_active === false) {
    return false;
  }

  const now = new Date();

  if (discount.starts_at) {
    const startsAt = new Date(discount.starts_at);
    if (now < startsAt) {
      return false;
    }
  }

  if (discount.ends_at) {
    const endsAt = new Date(discount.ends_at);
    if (now > endsAt) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica si un descuento es aplicable al subtotal actual
 */
export function isDiscountApplicable(discount: Discount, subtotal: number): boolean {
  if (!isDiscountActive(discount)) {
    return false;
  }

  if (discount.min_purchase && subtotal < discount.min_purchase) {
    return false;
  }

  return true;
}

/**
 * Transforma un Discount del backend a AppliedDiscount para el frontend
 */
export function transformToAppliedDiscount(
  discount: Discount,
  calculatedAmount: number,
  isAutomatic: boolean = false
): AppliedDiscount {
  return {
    id: discount.id,
    discount_id: discount.id,
    type: discount.type,
    code: discount.code,
    label: discount.code || discount.name || formatDiscountLabel({
      amount: calculatedAmount,
      amount_type: discount.amount_type,
      original_amount: discount.amount,
    } as AppliedDiscount),
    amount: calculatedAmount,
    amount_type: discount.amount_type,
    original_amount: discount.amount,
    applies_to: discount.applies_to,
    is_automatic: isAutomatic,
  };
}

