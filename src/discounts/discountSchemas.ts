// ============================================
// Discount Payload Validation
// ============================================

import type {
  Discount,
  AppliedDiscount,
  CartTotals,
  DiscountValidationResponse,
} from './discountTypes';

// ============================================
// Validation Helpers
// ============================================

function isValidString(value: any, minLength = 1): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isValidNumber(value: any, min = 0): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min;
}

function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .trim()
    .toUpperCase()
    .substring(0, 50); // Limitar longitud
}

// ============================================
// Discount Validators
// ============================================

export function validateDiscount(discount: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!isValidNumber(discount.id, 1)) {
    errors.push('Discount ID is required and must be a positive number');
  }

  if (!isValidString(discount.type)) {
    errors.push('Discount type is required');
  } else if (!['coupon', 'promotion', 'automatic'].includes(discount.type)) {
    errors.push('Invalid discount type');
  }

  if (!isValidNumber(discount.amount, 0)) {
    errors.push('Discount amount is required and must be non-negative');
  }

  if (!isValidString(discount.amount_type)) {
    errors.push('Discount amount_type is required');
  } else if (!['fixed', 'percentage'].includes(discount.amount_type)) {
    errors.push('Invalid amount_type');
  }

  if (discount.amount_type === 'percentage' && discount.amount > 100) {
    errors.push('Percentage discount cannot exceed 100%');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateAppliedDiscount(discount: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!isValidNumber(discount.amount, 0)) {
    errors.push('Applied discount amount is required and must be non-negative');
  }

  if (!isValidString(discount.label)) {
    errors.push('Applied discount label is required');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateCartTotals(totals: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!isValidNumber(totals.subtotal, 0)) {
    errors.push('Subtotal is required and must be non-negative');
  }

  if (!isValidNumber(totals.total, 0)) {
    errors.push('Total is required and must be non-negative');
  }

  if (!Array.isArray(totals.discounts)) {
    errors.push('Discounts must be an array');
  }

  // Validar que el total sea consistente
  const calculatedTotal =
    totals.subtotal -
    (totals.discount_total || 0) +
    (totals.shipping || 0) +
    (totals.tax || 0);

  if (Math.abs(calculatedTotal - totals.total) > 0.01) {
    errors.push('Total calculation mismatch');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================
// Sanitization
// ============================================

export function sanitizeDiscountCode(code: string): string {
  return sanitizeString(code);
}

export function sanitizeDiscount(discount: any): Discount {
  return {
    id: parseInt(discount.id) || 0,
    type: discount.type || 'coupon',
    code: discount.code ? sanitizeDiscountCode(discount.code) : undefined,
    name: discount.name ? discount.name.substring(0, 255) : undefined,
    description: discount.description ? discount.description.substring(0, 1000) : undefined,
    amount: parseFloat(discount.amount) || 0,
    amount_type: discount.amount_type || 'fixed',
    applies_to: discount.applies_to || 'cart',
    conditions: discount.conditions || {},
    starts_at: discount.starts_at,
    ends_at: discount.ends_at,
    min_purchase: discount.min_purchase ? parseFloat(discount.min_purchase) : undefined,
    max_discount: discount.max_discount ? parseFloat(discount.max_discount) : undefined,
    is_active: discount.is_active !== undefined ? Boolean(discount.is_active) : true,
  };
}

