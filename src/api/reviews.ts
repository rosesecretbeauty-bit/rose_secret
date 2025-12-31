// src/api/reviews.ts
// API helpers para reviews

import { api } from './client';

// ============================================
// Types
// ============================================

export interface ReviewImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ReviewReply {
  id: number;
  content: string;
  is_admin: boolean;
  created_at: string;
  user_name: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  images?: string[];
  replies?: ReviewReply[];
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verified_count: number;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data: {
    review: Review;
  };
}

export interface ReviewReplyResponse {
  success: boolean;
  message?: string;
  data: {
    reply: ReviewReply;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Obtener reviews de un producto con paginación y filtros
 */
export async function getProductReviews(
  productId: number,
  params?: {
    page?: number;
    limit?: number;
    rating?: number;
    with_images?: boolean;
  }
): Promise<ReviewsResponse['data'] | null> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.rating !== undefined) queryParams.append('rating', params.rating.toString());
      if (params.with_images !== undefined) queryParams.append('with_images', params.with_images.toString());
    }

    const query = queryParams.toString();
    const endpoint = `/products/${productId}/reviews${query ? `?${query}` : ''}`;
    
    const response = await api.get(endpoint) as ReviewsResponse;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo reviews:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de reviews de un producto
 */
export async function getReviewStats(
  productId: number
): Promise<ReviewStats | null> {
  try {
    const response = await api.get(`/products/${productId}/reviews/stats`) as ReviewStatsResponse;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo stats de reviews:', error);
    throw error;
  }
}

/**
 * Crear una review para un producto
 */
export async function createReview(
  productId: number,
  payload: {
    rating: number;
    title?: string;
    content: string;
    order_id?: number;
  }
): Promise<Review | null> {
  try {
    const response = await api.post(`/products/${productId}/reviews`, payload) as ReviewResponse;
    
    if (response.success && response.data) {
      return response.data.review;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error creando review:', error);
    
    // Re-lanzar error para que el componente pueda manejarlo
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw error;
  }
}

/**
 * Votar helpful/not helpful en una review
 */
export async function voteReview(
  reviewId: number,
  helpful: boolean
): Promise<boolean> {
  try {
    const response = await api.post(`/reviews/${reviewId}/vote`, { helpful }) as { success: boolean; message?: string };
    
    return response.success;
  } catch (error) {
    console.error('Error votando review:', error);
    throw error;
  }
}

/**
 * Responder a una review
 */
export async function replyToReview(
  reviewId: number,
  content: string
): Promise<ReviewReply | null> {
  try {
    const response = await api.post(`/reviews/${reviewId}/replies`, { content }) as ReviewReplyResponse;
    
    if (response.success && response.data) {
      return response.data.reply;
    }
    
    return null;
  } catch (error) {
    console.error('Error respondiendo review:', error);
    throw error;
  }
}

/**
 * Eliminar una review
 */
export async function deleteReview(
  reviewId: number
): Promise<boolean> {
  try {
    const response = await api.delete(`/reviews/${reviewId}`) as { success: boolean; message?: string };
    
    return response.success;
  } catch (error) {
    console.error('Error eliminando review:', error);
    throw error;
  }
}

