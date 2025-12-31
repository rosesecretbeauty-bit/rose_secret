// ============================================
// Waitlist API Client
// ============================================

import { api } from './client';

export interface WaitlistItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  product_slug: string;
  variant_name: string | null;
  price: number;
  image_url: string | null;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
}

/**
 * Obtener waitlist del usuario
 */
export async function getWaitlist(): Promise<WaitlistItem[]> {
  const response = await api.get('/user/waitlist') as {
    success: boolean;
    data: { items: WaitlistItem[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener lista de espera');
  }
  
  return response.data.items;
}

/**
 * Agregar producto a waitlist
 */
export async function addToWaitlist(productId: number, variantId?: number): Promise<{
  id: number;
  product_id: number;
  variant_id: number | null;
}> {
  const response = await api.post('/user/waitlist', {
    product_id: productId,
    variant_id: variantId || null
  }) as {
    success: boolean;
    data: {
      id: number;
      product_id: number;
      variant_id: number | null;
    };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al agregar a lista de espera');
  }
  
  return response.data;
}

/**
 * Remover de waitlist
 */
export async function removeFromWaitlist(waitlistId: number): Promise<void> {
  const response = await api.delete(`/user/waitlist/${waitlistId}`) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error('Error al remover de lista de espera');
  }
}

