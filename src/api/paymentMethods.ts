// ============================================
// Payment Methods API Client
// ============================================

import { api } from './client';

export interface PaymentMethod {
  id: number;
  stripe_payment_method_id: string;
  type: string;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  is_default: boolean;
  created_at: string;
}

/**
 * Obtener métodos de pago del usuario
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await api.get('/user/payment-methods') as {
    success: boolean;
    data: { methods: PaymentMethod[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener métodos de pago');
  }
  
  return response.data.methods;
}

/**
 * Agregar método de pago
 */
export async function addPaymentMethod(stripePaymentMethodId: string): Promise<PaymentMethod> {
  const response = await api.post('/user/payment-methods', {
    stripe_payment_method_id
  }) as {
    success: boolean;
    data: PaymentMethod;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al guardar método de pago');
  }
  
  return response.data;
}

/**
 * Eliminar método de pago
 */
export async function removePaymentMethod(paymentMethodId: number): Promise<void> {
  const response = await api.delete(`/user/payment-methods/${paymentMethodId}`) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error('Error al eliminar método de pago');
  }
}

/**
 * Marcar método de pago como default
 */
export async function setDefaultPaymentMethod(paymentMethodId: number): Promise<void> {
  const response = await api.put(`/user/payment-methods/${paymentMethodId}/default`) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error('Error al marcar método de pago como predeterminado');
  }
}

