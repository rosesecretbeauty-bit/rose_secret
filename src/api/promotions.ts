// ============================================
// Promotions API Client
// ============================================

import { api } from './client';

export interface Promotion {
  id: number;
  type: 'flash_sale' | 'banner' | 'popup' | 'homepage_section';
  title: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  discount_type: 'percentage' | 'fixed';
  start_date: string;
  end_date: string;
  active: boolean;
  cta_text: string;
  cta_url?: string;
  banner_position: 'top' | 'header' | 'homepage' | 'floating';
  target_categories?: number[];
  target_products?: number[];
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count?: number;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  show_countdown: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionsResponse {
  success: boolean;
  data: Promotion[];
}

/**
 * Obtener promociones activas
 * @param position - Posición del banner ('header', 'top', 'homepage', 'floating')
 */
export async function getActivePromotions(position?: string): Promise<Promotion[]> {
  try {
    const params = position ? `?position=${position}` : '';
    const response = await api.get(`/promotions/active${params}`) as PromotionsResponse;
    
    if (response.success && response.data) {
      // Filtrar solo promociones válidas (fechas correctas)
      const now = new Date();
      return response.data.filter(promo => {
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);
        return now >= start && now <= end;
      });
    }
    
    return [];
  } catch (error) {
    // Silenciar errores, simplemente no mostrar promociones
    return [];
  }
}

/**
 * Calcular tiempo restante hasta el fin de la promoción
 */
export function calculateTimeLeft(endDate: string): { hours: number; minutes: number; seconds: number } | null {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return null; // Promoción expirada
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

/**
 * Obtener todas las promociones (admin)
 */
export async function getAllPromotions(filters?: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Promotion[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/promotions?${queryString}` : '/promotions';
    
    const response = await api.get(endpoint) as PromotionsResponse;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo promociones:', error);
    throw error;
  }
}

/**
 * Crear promoción (admin)
 */
export async function createPromotion(promotion: Partial<Promotion>): Promise<Promotion> {
  try {
    const response = await api.post('/promotions', promotion) as { success: boolean; data: Promotion; message?: string };
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al crear promoción');
  } catch (error) {
    console.error('Error creando promoción:', error);
    throw error;
  }
}

/**
 * Actualizar promoción (admin)
 */
export async function updatePromotion(id: number, promotion: Partial<Promotion>): Promise<Promotion> {
  try {
    const response = await api.put(`/promotions/${id}`, promotion) as { success: boolean; data: Promotion; message?: string };
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al actualizar promoción');
  } catch (error) {
    console.error('Error actualizando promoción:', error);
    throw error;
  }
}

/**
 * Eliminar promoción (admin)
 */
export async function deletePromotion(id: number): Promise<void> {
  try {
    const response = await api.delete(`/promotions/${id}`) as { success: boolean; message?: string };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar promoción');
    }
  } catch (error) {
    console.error('Error eliminando promoción:', error);
    throw error;
  }
}

