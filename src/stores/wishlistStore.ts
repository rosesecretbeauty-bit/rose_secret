import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';
import { api } from '../api/client';
import { trackEvent } from '../analytics/analyticsClient';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loadWishlist: () => Promise<void>;
  fetchWishlistCount: () => Promise<number>;
}

export const useWishlistStore = create<WishlistStore>()(persist((set, get) => ({
  items: [],
  
  // Cargar wishlist desde el backend
  loadWishlist: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, limpiar wishlist (no hay modo invitado para wishlist)
        set({ items: [] });
        return;
      }
      
      const response = await api.get('/wishlist') as {
        success: boolean;
        data?: {
          items: any[];
          count?: number;
        };
      };
      
      if (response.success && response.data) {
        // Transform API wishlist items to match Product type
        const transformedItems = response.data.items.map((item: any) => ({
          ...item,
          id: item.product_id?.toString() || item.id?.toString(),
          images: item.image_url ? [item.image_url] : [],
          rating: 0,
          reviews: 0,
          isNew: item.is_new || false,
          isBestSeller: item.is_bestseller || false,
          stock: item.stock || 0,
          category: item.category_slug || item.category_name || 'uncategorized',
          discount: item.compare_at_price && item.price 
            ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)
            : undefined
        }));
        set({ items: transformedItems });
      } else {
        // Si no hay datos, establecer array vacío
        set({ items: [] });
      }
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      // En caso de error, mantener estado actual o establecer vacío
      // No lanzar error para no romper la UI
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        // Si no está autenticado, limpiar wishlist
        set({ items: [] });
      }
    }
  },
  
  addItem: async (product) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Wishlist requiere autenticación - no hay modo invitado
        throw new Error('Debes iniciar sesión para añadir productos a tu wishlist');
      }
      
      // Llamar al backend
      const response = await api.post('/wishlist', {
        product_id: parseInt(product.id.toString())
      }) as {
        success: boolean;
        message?: string;
        data?: {
          items: any[];
          count?: number;
        };
      };
      
      if (response.success && response.data) {
        // Transform API wishlist items
        const transformedItems = response.data.items.map((item: any) => ({
          ...item,
          id: item.product_id?.toString() || item.id?.toString(),
          images: item.image_url ? [item.image_url] : [],
          rating: 0,
          reviews: 0,
          isNew: item.is_new || false,
          isBestSeller: item.is_bestseller || false,
          stock: item.stock || 0,
          category: item.category_slug || item.category_name || 'uncategorized',
          discount: item.compare_at_price && item.price 
            ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)
            : undefined
        }));
        set({ items: transformedItems });

        // Track analytics event
        trackEvent('ADD_TO_WISHLIST', {
          productId: product.id.toString(),
          productName: product.name,
          price: product.price,
          currency: 'USD',
        });
      }
    } catch (error: any) {
      // Si es un error de autenticación, no loguear (es esperado)
      if (error?.message?.includes('iniciar sesión') || error?.response?.status === 401) {
        // Silencioso: usuario no autenticado intentando agregar a wishlist
        throw error; // Re-lanzar para que el componente pueda mostrar mensaje
      }
      
      // Si el error es que ya existe, no lanzar error (ya está en wishlist)
      if (error.message?.includes('ya está en tu wishlist') || 
          error.message?.includes('already') ||
          error.message?.includes('duplicate')) {
        // Recargar wishlist para asegurar sincronización
        await get().loadWishlist();
        return;
      }
      // Para otros errores, lanzar para que el componente pueda manejarlo
      throw error;
    }
  },
  
  removeItem: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Wishlist requiere autenticación
        throw new Error('Debes iniciar sesión para eliminar productos de tu wishlist');
      }
      
      // Optimistic update: remover inmediatamente de la UI
      set(state => ({
        items: state.items.filter(item => item.id !== productId)
      }));
      
      // Llamar al backend
      await api.delete(`/wishlist/${productId}`);
      
      // Recargar wishlist para asegurar sincronización
      await get().loadWishlist();

      // Track analytics event
      if (removedItem) {
        trackEvent('REMOVE_FROM_WISHLIST', {
          productId: removedItem.id.toString(),
          productName: removedItem.name,
        });
      }
    } catch (error: any) {
      // Si es un error de autenticación, no loguear (es esperado)
      if (error?.message?.includes('iniciar sesión') || error?.response?.status === 401) {
        // Silencioso: usuario no autenticado intentando remover de wishlist
        throw error; // Re-lanzar para que el componente pueda mostrar mensaje
      }
      
      // Para otros errores, loguear normalmente
      console.error('Error removing from wishlist:', error);
      
      // Si falla, recargar wishlist para restaurar estado
      await get().loadWishlist();
      
      // Si es error 404, el producto ya no está en wishlist (puede haber sido eliminado por otro dispositivo)
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return; // Ya se recargó, no hacer nada más
      }
      
      // Para otros errores, lanzar para que el componente pueda manejarlo
      throw error;
    }
  },
  
  isInWishlist: (productId) => {
    return get().items.some(item => item.id === productId);
  },
  
  clearWishlist: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Si no hay token, solo limpiar localmente
        set({ items: [] });
        return;
      }
      
      // Eliminar todos los items uno por uno (o implementar endpoint DELETE /api/wishlist/all)
      const { items } = get();
      for (const item of items) {
        try {
          await api.delete(`/wishlist/${item.id}`);
        } catch (error) {
          console.error(`Error removing item ${item.id} from wishlist:`, error);
        }
      }
      
      // Limpiar estado
      set({ items: [] });
      
      // Recargar para asegurar sincronización
      await get().loadWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      // En caso de error, al menos limpiar localmente
      set({ items: [] });
    }
  },

  fetchWishlistCount: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return 0;
      }

      const response = await api.get('/wishlist/count') as {
        success: boolean;
        data?: {
          count: number;
        };
      };

      if (response.success && response.data) {
        return response.data.count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      return 0;
    }
  }
}), {
  name: 'rose-secret-wishlist',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({
    items: state.items
  })
}));