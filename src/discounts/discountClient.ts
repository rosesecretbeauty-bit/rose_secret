// ============================================
// Discount API Client
// ============================================
// Cliente para interactuar con endpoints de descuentos del backend

import { api } from '../api/client';
import type {
  Discount,
  DiscountValidationResponse,
  AppliedDiscount,
  CartTotals,
  ApplyDiscountRequest,
  RemoveDiscountRequest,
} from './discountTypes';
import { sanitizeDiscount, sanitizeDiscountCode } from './discountSchemas';
import { transformToAppliedDiscount, calculateDiscountAmount } from './discountUtils';

// ============================================
// API Functions
// ============================================

/**
 * Aplicar un cupón o descuento al carrito
 * El backend valida y calcula el descuento
 */
export async function applyDiscount(
  code?: string
): Promise<DiscountValidationResponse> {
  try {
    const payload: ApplyDiscountRequest = {};
    
    if (code) {
      payload.code = sanitizeDiscountCode(code);
    }

    const response = await api.post('/discounts/apply', payload) as {
      success: boolean;
      valid: boolean;
      message?: string;
      discount?: any;
      calculated_amount?: number;
      cart_totals?: any;
      error_code?: string;
    };

    if (!response.success) {
      return {
        success: false,
        valid: false,
        message: response.message || 'Error al aplicar descuento',
        error_code: response.error_code as any,
      };
    }

    // Si el backend devuelve cart_totals, usarlos directamente
    if (response.cart_totals) {
      return {
        success: true,
        valid: response.valid,
        message: response.message,
        discount: response.discount ? sanitizeDiscount(response.discount) : undefined,
        calculated_amount: response.calculated_amount,
        cart_totals: response.cart_totals as CartTotals,
        error_code: response.error_code as any,
      };
    }

    // Si solo devuelve discount, calcular totales en frontend (solo visual)
    // NOTA: En producción, el backend siempre debe devolver cart_totals
    if (response.discount && response.valid) {
      const discount = sanitizeDiscount(response.discount);
      
      // Obtener subtotal del carrito actual
      const { useCartStore } = await import('../stores/cartStore');
      const cartStore = useCartStore.getState();
      const subtotal = cartStore.getCartTotal();
      
      const calculatedAmount = response.calculated_amount || 
        calculateDiscountAmount(discount, subtotal);
      
      const appliedDiscount = transformToAppliedDiscount(
        discount,
        calculatedAmount,
        discount.type === 'automatic'
      );

      const cartTotals: CartTotals = {
        subtotal,
        discounts: [appliedDiscount],
        discount_total: calculatedAmount,
        shipping: 0,
        tax: 0,
        total: subtotal - calculatedAmount,
        currency: 'USD',
      };

      return {
        success: true,
        valid: true,
        message: response.message,
        discount,
        calculated_amount: calculatedAmount,
        cart_totals: cartTotals,
      };
    }

    return {
      success: true,
      valid: response.valid,
      message: response.message,
      error_code: response.error_code as any,
    };
  } catch (error: any) {
    console.error('Error applying discount:', error);
    
    // Extraer mensaje de error del backend
    const errorMessage = error.message || 
      error.response?.data?.message || 
      'Error al aplicar descuento';

    return {
      success: false,
      valid: false,
      message: errorMessage,
      error_code: error.response?.data?.error_code || 'INVALID',
    };
  }
}

/**
 * Remover un descuento aplicado
 */
export async function removeDiscount(
  discountId: number,
  code?: string
): Promise<{ success: boolean; message?: string; cart_totals?: CartTotals }> {
  try {
    const payload: RemoveDiscountRequest = {
      discount_id: discountId,
    };
    
    if (code) {
      payload.code = sanitizeDiscountCode(code);
    }

    const response = await api.post('/discounts/remove', payload) as {
      success: boolean;
      message?: string;
      cart_totals?: any;
    };

    if (response.success && response.cart_totals) {
      return {
        success: true,
        message: response.message,
        cart_totals: response.cart_totals as CartTotals,
      };
    }

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Error removing discount:', error);
    
    return {
      success: false,
      message: error.message || 'Error al remover descuento',
    };
  }
}

/**
 * Obtener descuentos automáticos aplicables al carrito actual
 * El backend calcula qué promociones automáticas se aplican
 */
export async function getAutomaticDiscounts(): Promise<{
  success: boolean;
  discounts: AppliedDiscount[];
  cart_totals?: CartTotals;
}> {
  try {
    const response = await api.get('/discounts/automatic') as {
      success: boolean;
      discounts?: any[];
      cart_totals?: any;
    };

    if (response.success && response.discounts) {
      const discounts: AppliedDiscount[] = response.discounts.map((disc: any) => {
        const discount = sanitizeDiscount(disc.discount || disc);
        return transformToAppliedDiscount(
          discount,
          disc.calculated_amount || disc.amount,
          true // Es automático
        );
      });

      return {
        success: true,
        discounts,
        cart_totals: response.cart_totals as CartTotals | undefined,
      };
    }

    return {
      success: true,
      discounts: [],
    };
  } catch (error: any) {
    console.error('Error getting automatic discounts:', error);
    
    return {
      success: false,
      discounts: [],
    };
  }
}

/**
 * Validar un código de cupón sin aplicarlo
 */
export async function validateCouponCode(code: string): Promise<DiscountValidationResponse> {
  try {
    const sanitizedCode = sanitizeDiscountCode(code);
    
    const response = await api.post('/discounts/validate', {
      code: sanitizedCode,
    }) as {
      success: boolean;
      valid: boolean;
      message?: string;
      discount?: any;
      error_code?: string;
    };

    if (!response.success) {
      return {
        success: false,
        valid: false,
        message: response.message || 'Error al validar cupón',
        error_code: response.error_code as any,
      };
    }

    return {
      success: true,
      valid: response.valid,
      message: response.message,
      discount: response.discount ? sanitizeDiscount(response.discount) : undefined,
      error_code: response.error_code as any,
    };
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    
    return {
      success: false,
      valid: false,
      message: error.message || 'Error al validar cupón',
      error_code: 'INVALID',
    };
  }
}

