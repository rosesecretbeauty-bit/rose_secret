// src/api/payments.ts
// API helpers para pagos

import { api } from './client';

// ============================================
// Types
// ============================================

export interface PaymentIntentResponse {
  success: boolean;
  message?: string;
  data?: {
    clientSecret: string;
    order_id: number;
    order_number: string;
    amount: number;
    alreadyExists?: boolean;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    order_id: number;
    order_number: string;
    order_status: string;
    payment_status: string;
    payment: {
      id: number;
      payment_intent_id: string;
      amount: number;
      currency: string;
      status: 'pending' | 'requires_action' | 'processing' | 'paid' | 'failed' | 'refunded';
      payment_method?: string;
      failure_reason?: string;
      created_at: string;
      updated_at: string;
    } | null;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: number;
    status: string;
    alreadyProcessed?: boolean;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Crear Payment Intent para una orden
 */
export async function createPaymentIntent(orderId: number): Promise<PaymentIntentResponse> {
  try {
    const response = await api.post('/payments/create-intent', {
      order_id: orderId
    }) as PaymentIntentResponse;
    
    return response;
  } catch (error: any) {
    console.error('Error creando payment intent:', error);
    throw error;
  }
}

/**
 * Confirmar que un pago fue exitoso
 */
export async function confirmPayment(
  paymentIntentId: string,
  orderId: number
): Promise<ConfirmPaymentResponse> {
  try {
    const response = await api.post('/payments/confirm', {
      payment_intent_id: paymentIntentId,
      order_id: orderId
    }) as ConfirmPaymentResponse;
    
    return response;
  } catch (error: any) {
    console.error('Error confirmando pago:', error);
    throw error;
  }
}

/**
 * Obtener estado de pago de una orden
 */
export async function getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
  try {
    const response = await api.get(`/payments/orders/${orderId}/status`) as PaymentStatusResponse;
    
    return response;
  } catch (error: any) {
    console.error('Error obteniendo estado de pago:', error);
    throw error;
  }
}

