// ============================================
// Analytics Payload Validation
// ============================================
// Validación de payloads usando validación simple (sin dependencias externas)

import type {
  AnalyticsEventPayload,
  AddToCartPayload,
  ViewProductPayload,
  SearchProductsPayload,
  BeginCheckoutPayload,
  PaymentSuccessPayload,
  OrderCreatedPayload,
} from './events';

// ============================================
// Validation Helpers
// ============================================

type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

/**
 * Valida que un valor sea un string no vacío
 */
function isValidString(value: any, minLength = 1): boolean {
  return typeof value === 'string' && value.trim().length >= minLength;
}

/**
 * Valida que un valor sea un número positivo
 */
function isValidNumber(value: any, min = 0): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min;
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 500); // Limitar longitud
}

/**
 * Sanitiza un objeto removiendo propiedades peligrosas
 */
function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const allowedKeys = new Set([
    'productId',
    'productName',
    'category',
    'price',
    'currency',
    'quantity',
    'variantId',
    'orderId',
    'orderNumber',
    'totalValue',
    'itemCount',
    'query',
    'resultsCount',
    'path',
    'title',
    'status',
    'method',
    'error',
    'timestamp',
    'sessionId',
    'userId',
    'anonymousId',
  ]);

  for (const [key, value] of Object.entries(obj)) {
    if (allowedKeys.has(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = isValidNumber(value) ? value : 0;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 50); // Limitar arrays
      } else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      }
    }
  }

  return sanitized;
}

// ============================================
// Event-Specific Validators
// ============================================

export function validateAddToCartPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidString(payload.productId)) {
    errors.push('productId is required and must be a non-empty string');
  }
  if (!isValidString(payload.productName)) {
    errors.push('productName is required and must be a non-empty string');
  }
  if (!isValidNumber(payload.quantity, 1)) {
    errors.push('quantity is required and must be a positive number');
  }
  if (!isValidNumber(payload.price, 0)) {
    errors.push('price is required and must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateViewProductPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidString(payload.productId)) {
    errors.push('productId is required and must be a non-empty string');
  }
  if (!isValidString(payload.productName)) {
    errors.push('productName is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateSearchProductsPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidString(payload.query)) {
    errors.push('query is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateBeginCheckoutPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidNumber(payload.totalValue, 0)) {
    errors.push('totalValue is required and must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validatePaymentSuccessPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidString(payload.orderId)) {
    errors.push('orderId is required and must be a non-empty string');
  }
  if (!isValidString(payload.orderNumber)) {
    errors.push('orderNumber is required and must be a non-empty string');
  }
  if (!isValidNumber(payload.amount, 0)) {
    errors.push('amount is required and must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateOrderCreatedPayload(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!isValidString(payload.orderId)) {
    errors.push('orderId is required and must be a non-empty string');
  }
  if (!isValidString(payload.orderNumber)) {
    errors.push('orderNumber is required and must be a non-empty string');
  }
  if (!isValidNumber(payload.totalValue, 0)) {
    errors.push('totalValue is required and must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================
// Generic Validator
// ============================================

export function validatePayload(eventType: string, payload: any): ValidationResult {
  // Sanitizar payload primero
  const sanitized = sanitizeObject(payload);

  // Validar según tipo de evento
  switch (eventType) {
    case 'ADD_TO_CART':
      return validateAddToCartPayload(sanitized);
    case 'VIEW_PRODUCT':
      return validateViewProductPayload(sanitized);
    case 'SEARCH_PRODUCTS':
      return validateSearchProductsPayload(sanitized);
    case 'BEGIN_CHECKOUT':
      return validateBeginCheckoutPayload(sanitized);
    case 'PAYMENT_SUCCESS':
      return validatePaymentSuccessPayload(sanitized);
    case 'ORDER_CREATED':
      return validateOrderCreatedPayload(sanitized);
    default:
      // Para otros eventos, solo validar que payload existe
      return {
        valid: payload && typeof payload === 'object',
        errors: payload && typeof payload === 'object' ? undefined : ['Payload must be an object'],
      };
  }
}

// ============================================
// Sanitization Export
// ============================================

export function sanitizePayload(payload: any): AnalyticsEventPayload {
  return sanitizeObject(payload) as AnalyticsEventPayload;
}

