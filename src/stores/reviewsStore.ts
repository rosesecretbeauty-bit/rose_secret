// src/stores/reviewsStore.ts
// Zustand store para reviews

import { create } from 'zustand';
import { 
  getProductReviews, 
  getReviewStats, 
  createReview as createReviewAPI,
  voteReview as voteReviewAPI,
  replyToReview as replyToReviewAPI,
  deleteReview as deleteReviewAPI,
  Review,
  ReviewStats
} from '../api/reviews';

interface ReviewsState {
  // Estado por producto
  reviews: Record<number, Review[]>;
  stats: Record<number, ReviewStats | null>;
  pagination: Record<number, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;
  
  // Estados de carga
  loading: Record<number, boolean>;
  loadingStats: Record<number, boolean>;
  error: Record<number, string | null>;
  
  // Acciones
  loadReviews: (productId: number, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    with_images?: boolean;
  }) => Promise<void>;
  loadStats: (productId: number) => Promise<void>;
  addReview: (productId: number, payload: {
    rating: number;
    title?: string;
    content: string;
    order_id?: number;
  }) => Promise<Review | null>;
  voteReview: (productId: number, reviewId: number, helpful: boolean) => Promise<void>;
  replyToReview: (productId: number, reviewId: number, content: string) => Promise<void>;
  removeReview: (productId: number, reviewId: number) => Promise<void>;
  clearProduct: (productId: number) => void;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: {},
  stats: {},
  pagination: {},
  loading: {},
  loadingStats: {},
  error: {},

  loadReviews: async (productId, params) => {
    set(state => ({
      loading: { ...state.loading, [productId]: true },
      error: { ...state.error, [productId]: null }
    }));

    try {
      const data = await getProductReviews(productId, params);
      
      if (data) {
        set(state => ({
          reviews: { ...state.reviews, [productId]: data.reviews },
          pagination: { ...state.pagination, [productId]: data.pagination },
          loading: { ...state.loading, [productId]: false },
          error: { ...state.error, [productId]: null }
        }));
      } else {
        set(state => ({
          reviews: { ...state.reviews, [productId]: [] },
          pagination: { ...state.pagination, [productId]: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          loading: { ...state.loading, [productId]: false },
          error: { ...state.error, [productId]: null }
        }));
      }
    } catch (error: any) {
      set(state => ({
        loading: { ...state.loading, [productId]: false },
        error: { ...state.error, [productId]: error.message || 'Error al cargar reviews' }
      }));
    }
  },

  loadStats: async (productId) => {
    set(state => ({
      loadingStats: { ...state.loadingStats, [productId]: true }
    }));

    try {
      const stats = await getReviewStats(productId);
      
      set(state => ({
        stats: { ...state.stats, [productId]: stats },
        loadingStats: { ...state.loadingStats, [productId]: false }
      }));
    } catch (error) {
      set(state => ({
        stats: { ...state.stats, [productId]: null },
        loadingStats: { ...state.loadingStats, [productId]: false }
      }));
    }
  },

  addReview: async (productId, payload) => {
    try {
      const review = await createReviewAPI(productId, payload);
      
      if (review) {
        // Recargar reviews y stats
        await Promise.all([
          get().loadReviews(productId),
          get().loadStats(productId)
        ]);
        
        return review;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  },

  voteReview: async (productId, reviewId, helpful) => {
    try {
      await voteReviewAPI(reviewId, helpful);
      
      // Optimistic update
      set(state => {
        const reviews = state.reviews[productId] || [];
        const updatedReviews = reviews.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              helpful_count: helpful ? r.helpful_count + 1 : r.helpful_count,
              not_helpful_count: !helpful ? r.not_helpful_count + 1 : r.not_helpful_count
            };
          }
          return r;
        });
        
        return {
          reviews: { ...state.reviews, [productId]: updatedReviews }
        };
      });
      
      // Recargar para asegurar sincronización
      await get().loadReviews(productId);
    } catch (error) {
      // Revertir optimistic update en caso de error
      await get().loadReviews(productId);
      throw error;
    }
  },

  replyToReview: async (productId, reviewId, content) => {
    try {
      const reply = await replyToReviewAPI(reviewId, content);
      
      if (reply) {
        // Recargar reviews para incluir la nueva respuesta
        await get().loadReviews(productId);
      }
    } catch (error) {
      throw error;
    }
  },

  removeReview: async (productId, reviewId) => {
    try {
      await deleteReviewAPI(reviewId);
      
      // Remover de estado local
      set(state => {
        const reviews = state.reviews[productId] || [];
        const updatedReviews = reviews.filter(r => r.id !== reviewId);
        
        return {
          reviews: { ...state.reviews, [productId]: updatedReviews },
          pagination: {
            ...state.pagination,
            [productId]: {
              ...state.pagination[productId],
              total: Math.max(0, (state.pagination[productId]?.total || 0) - 1)
            }
          }
        };
      });
      
      // Recargar stats
      await get().loadStats(productId);
    } catch (error) {
      throw error;
    }
  },

  clearProduct: (productId) => {
    set(state => {
      const { [productId]: _, ...reviews } = state.reviews;
      const { [productId]: __, ...stats } = state.stats;
      const { [productId]: ___, ...pagination } = state.pagination;
      const { [productId]: ____, ...loading } = state.loading;
      const { [productId]: _____, ...loadingStats } = state.loadingStats;
      const { [productId]: ______, ...error } = state.error;
      
      return {
        reviews,
        stats,
        pagination,
        loading,
        loadingStats,
        error
      };
    });
  }
}));

