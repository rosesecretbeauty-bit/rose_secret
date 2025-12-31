import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';
import { api } from '../api/client';
import { trackEvent } from '../analytics/analyticsClient';

// Ensure compatibility with existing components that expect CartItem to extend Product
export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  variant_id?: number;
  product_id?: string | number;
  id?: string | number;
}
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  total: number;

  // Actions
  addItem: (product: Product, quantity?: number, color?: string, size?: string, variantId?: number, priceSnapshot?: number) => Promise<void>;
  removeItem: (cartItemId: string | number) => Promise<void>;
  updateQuantity: (cartItemId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;

  // UI State
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Getters
  getCartTotal: () => number;
  getItemCount: () => number;
}
export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  total: 0,
  
  // Cargar carrito desde el backend
  loadCart: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId') || `guest_${Date.now()}`;
      
      // Si no hay sessionId, crear uno para guests
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId);
      }
      
      // Headers para identificar guest
      const headers: Record<string, string> = {};
      if (!token && sessionId) {
        headers['x-session-id'] = sessionId;
      }
      
      // Solo pasar headers si hay alguno
      const options = Object.keys(headers).length > 0 ? { headers } : undefined;
      const response = await api.get('/cart', options) as {
        success: boolean;
        data?: {
          items: any[];
          total: number;
          itemCount: number;
          sessionId?: string;
        };
      };
      
      if (response.success && response.data) {
        // Si el backend devuelve un sessionId, guardarlo
        if (response.data.sessionId && !token) {
          localStorage.setItem('sessionId', response.data.sessionId);
        }
        
        // Transform API cart items to match CartItem type
        const transformedItems = response.data.items.map((item: any) => ({
          ...item,
          id: item.id?.toString() || item.product_id?.toString(),
          product_id: item.product_id,
          images: item.image_url ? [item.image_url] : [],
          rating: 0,
          reviews: 0,
          selectedColor: undefined,
          selectedSize: undefined,
          variant_id: item.variant_id || undefined,
          // Usar price_snapshot si existe, sino precio actual
          price: item.price_snapshot !== null && item.price_snapshot !== undefined
            ? parseFloat(item.price_snapshot)
            : (item.price ? parseFloat(item.price) : 0)
        }));
        
        set({ 
          items: transformedItems,
          total: response.data.total || 0,
          isLoading: false
        });
        
        // Cargar descuentos automáticos después de cargar el carrito
        if (transformedItems.length > 0) {
          const { useDiscountStore } = await import('./discountStore');
          const discountStore = useDiscountStore.getState();
          discountStore.loadAutomaticDiscounts().catch(err => {
            // Silencioso: no mostrar error si falla la carga de descuentos
            console.debug('Could not load automatic discounts:', err);
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      // Si es un error de red, no mostrar error en consola (backend puede no estar disponible)
      if (error?.isNetworkError) {
        // Silencioso: backend no disponible, continuar sin carrito
        set({ isLoading: false, items: [], total: 0 });
        return;
      }
      
      // Para otros errores, loguear normalmente
      console.error('Error loading cart:', error);
      set({ isLoading: false });
    }
  },
  
  addItem: async (product, quantity = 1, color, size, variantId, priceSnapshot) => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId') || `guest_${Date.now()}`;
      
      // Si no hay sessionId, crear uno para guests
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId);
      }
      
      // Usar priceSnapshot si se proporciona, sino usar precio del producto
      const finalPriceSnapshot = priceSnapshot !== undefined ? priceSnapshot : product.price;
      
      // Headers para identificar guest
      const headers: any = {};
      if (!token) {
        headers['x-session-id'] = sessionId;
      }
      
      // Llamar al backend con nuevo endpoint (tanto para usuarios autenticados como guests)
      const response = await api.post('/cart/items', {
        product_id: parseInt(product.id.toString()),
        quantity,
        variant_id: variantId || undefined,
        price_snapshot: finalPriceSnapshot
      }, { headers: headers }) as {
        success: boolean;
        data?: {
          items: any[];
          total: number;
          itemCount: number;
        };
        message?: string;
      };
      
      if (response.success && response.data) {
        // Si el backend devuelve un sessionId, guardarlo
        if ((response.data as any).sessionId && !token) {
          localStorage.setItem('sessionId', (response.data as any).sessionId);
        }
        
        // Manejar respuesta de guest (el backend no guarda items de guests en BD)
        if ((response.data as any).is_guest && (response.data as any).item) {
          const guestItem = (response.data as any).item;
          
          // Agregar item al carrito local (guests se manejan en frontend)
          set(state => {
            const existingItemIndex = state.items.findIndex(
              item => item.product_id?.toString() === guestItem.product_id?.toString() &&
                      item.variant_id === guestItem.variant_id
            );
            
            let newItems: CartItem[];
            if (existingItemIndex >= 0) {
              // Item existe, actualizar cantidad
              newItems = state.items.map((item, index) => 
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity + guestItem.quantity }
                  : item
              );
            } else {
              // Nuevo item, agregarlo
              const newItem: CartItem = {
                ...product,
                id: guestItem.id || `guest_${Date.now()}`,
                product_id: guestItem.product_id,
                quantity: guestItem.quantity,
                variant_id: guestItem.variant_id || undefined,
                price: guestItem.price_snapshot ? parseFloat(guestItem.price_snapshot) : product.price,
                selectedColor: color,
                selectedSize: size,
                images: product.images || [],
                rating: 0,
                reviews: 0
              };
              newItems = [...state.items, newItem];
            }
            
            // Calcular total
            const newTotal = newItems.reduce((sum, item) => {
              return sum + (item.price * item.quantity);
            }, 0);
            
            return {
              items: newItems,
              total: newTotal,
              isOpen: true,
              isLoading: false
            };
          });
        } else {
          // Para usuarios autenticados, recargar el carrito completo del backend
          try {
            const sessionId = localStorage.getItem('sessionId');
            const headers: any = {};
            if (!token && sessionId) {
              headers['x-session-id'] = sessionId;
            }
            
            const options = Object.keys(headers).length > 0 ? { headers } : undefined;
            const cartResponse = await api.get('/cart', options) as {
              success: boolean;
              data?: {
                items: any[];
                total: number;
                itemCount: number;
                sessionId?: string;
              };
            };
            
            if (cartResponse.success && cartResponse.data) {
              // Guardar sessionId si se devuelve
              if (cartResponse.data.sessionId && !token) {
                localStorage.setItem('sessionId', cartResponse.data.sessionId);
              }
              
              // Transform API cart items
              const transformedItems = (cartResponse.data.items || []).map((item: any) => ({
                ...item,
                id: item.id?.toString() || item.product_id?.toString(),
                product_id: item.product_id,
                images: item.image_url ? [item.image_url] : [],
                rating: 0,
                reviews: 0,
                selectedColor: color,
                selectedSize: size,
                variant_id: item.variant_id || undefined,
                price: item.price_snapshot !== null && item.price_snapshot !== undefined
                  ? parseFloat(item.price_snapshot)
                  : (item.price ? parseFloat(item.price) : 0)
              }));
              
              set({
                items: transformedItems,
                total: cartResponse.data.total || 0,
                isOpen: true,
                isLoading: false
              });
            } else {
              // Si no se puede obtener el carrito completo, intentar usar la respuesta original
              if ((response.data as any).items && Array.isArray((response.data as any).items)) {
                const transformedItems = (response.data as any).items.map((item: any) => ({
                  ...item,
                  id: item.id?.toString() || item.product_id?.toString(),
                  product_id: item.product_id,
                  images: item.image_url ? [item.image_url] : [],
                  rating: 0,
                  reviews: 0,
                  selectedColor: color,
                  selectedSize: size,
                  variant_id: item.variant_id || undefined,
                  price: item.price_snapshot !== null && item.price_snapshot !== undefined
                    ? parseFloat(item.price_snapshot)
                    : (item.price ? parseFloat(item.price) : 0)
                }));
                
                set({
                  items: transformedItems,
                  total: response.data.total || 0,
                  isOpen: true,
                  isLoading: false
                });
              } else {
                set({ isLoading: false });
                throw new Error('No se pudo obtener el carrito después de agregar el producto');
              }
            }
          } catch (cartError: any) {
            console.error('Error obteniendo carrito después de agregar item:', cartError);
            // Si falla, intentar usar la respuesta original si tiene items
            if ((response.data as any).items && Array.isArray((response.data as any).items)) {
              const transformedItems = (response.data as any).items.map((item: any) => ({
                ...item,
                id: item.id?.toString() || item.product_id?.toString(),
                product_id: item.product_id,
                images: item.image_url ? [item.image_url] : [],
                rating: 0,
                reviews: 0,
                selectedColor: color,
                selectedSize: size,
                variant_id: item.variant_id || undefined,
                price: item.price_snapshot !== null && item.price_snapshot !== undefined
                  ? parseFloat(item.price_snapshot)
                  : (item.price ? parseFloat(item.price) : 0)
              }));
              
              set({
                items: transformedItems,
                total: response.data.total || 0,
                isOpen: true,
                isLoading: false
              });
            } else {
              set({ isLoading: false });
              throw new Error('Error al actualizar el carrito');
            }
          }
        }

        // Track analytics event
        trackEvent('ADD_TO_CART', {
          productId: product.id.toString(),
          productName: product.name,
          quantity,
          price: finalPriceSnapshot,
          currency: 'USD',
          totalValue: finalPriceSnapshot * quantity,
          variantId: variantId || undefined,
        });
      } else {
        set({ isLoading: false });
        throw new Error(response.message || 'Error al agregar al carrito');
      }
    } catch (error: any) {
      set({ isLoading: false });
      
      // Si es un error de red, no loguear (backend puede no estar disponible)
      if (error?.isNetworkError) {
        // Silencioso: backend no disponible
        // Re-lanzar para que el componente pueda mostrar mensaje al usuario
        throw error;
      }
      
      // Para otros errores, loguear normalmente
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  removeItem: async (cartItemId) => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      
      // Headers para identificar guest
      const headers: any = {};
      if (!token && sessionId) {
        headers['x-session-id'] = sessionId;
      }
      
      // Find removed item for analytics (before deletion)
      const removedItem = get().items.find(item => item.id?.toString() === cartItemId.toString());
      
      // Usar nuevo endpoint (tanto para usuarios autenticados como guests)
      await api.delete(`/cart/items/${cartItemId}`, { headers: headers });
      
      // Recargar carrito
      await get().loadCart();
      if (removedItem) {
        trackEvent('REMOVE_FROM_CART', {
          productId: removedItem.id?.toString() || removedItem.product_id?.toString() || '',
          productName: removedItem.name,
          quantity: removedItem.quantity,
          price: removedItem.price,
          currency: 'USD',
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      set({ isLoading: false });
    }
  },
  
  updateQuantity: async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(cartItemId);
      return;
    }
    
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Modo invitado
        set(state => ({
          items: state.items.map(item => 
            item.id?.toString() === cartItemId.toString() ? { ...item, quantity } : item
          ),
          isLoading: false
        }));
        return;
      }
      
      // Usar nuevo endpoint
      const response = await api.put(`/cart/items/${cartItemId}`, { quantity }) as {
        success: boolean;
        data?: {
          items: any[];
          total: number;
        };
      };
      
      if (response.success && response.data) {
        // Find item being updated for analytics
        const oldItem = get().items.find(item => item.id?.toString() === cartItemId.toString());
        
        const transformedItems = response.data.items.map((item: any) => ({
          ...item,
          id: item.id?.toString() || item.product_id?.toString(),
          product_id: item.product_id,
          images: item.image_url ? [item.image_url] : [],
          price: item.price_snapshot !== null && item.price_snapshot !== undefined
            ? parseFloat(item.price_snapshot)
            : (item.price ? parseFloat(item.price) : 0)
        }));
        
        set({
          items: transformedItems,
          total: response.data.total || 0,
          isLoading: false
        });

        // Track analytics event
        if (oldItem) {
          trackEvent('UPDATE_CART_ITEM', {
            productId: oldItem.id?.toString() || oldItem.product_id?.toString() || '',
            oldQuantity: oldItem.quantity,
            newQuantity: quantity,
            price: oldItem.price,
            currency: 'USD',
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      set({ isLoading: false });
    }
  },
  clearCart: async () => {
    // Para usuarios autenticados, eliminar items uno por uno
    // Para guests, simplemente limpiar el estado
    const token = localStorage.getItem('token');
    if (token) {
      const items = get().items;
      for (const item of items) {
        if (item.id) {
          try {
            await api.delete(`/cart/items/${item.id}`);
          } catch (error) {
            console.error('Error clearing cart item:', error);
          }
        }
      }
      await get().loadCart();
    } else {
      set({ items: [], total: 0 });
    }
  },
  toggleCart: () => set(state => ({
    isOpen: !state.isOpen
  })),
  openCart: () => set({
    isOpen: true
  }),
  closeCart: () => set({
    isOpen: false
  }),
  getCartTotal: () => {
    // Usar total del backend si está disponible, sino calcular
    const backendTotal = get().total;
    if (backendTotal > 0) {
      return backendTotal;
    }
    return get().items.reduce((total, item) => {
      const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
      return total + price * item.quantity;
    }, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}), {
  name: 'rose-secret-cart-storage',
  // Unique name
  storage: createJSONStorage(() => localStorage),
  // Only persist items, not UI state like isOpen
  partialize: state => ({
    items: state.items
  }),
  version: 1
}));

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === 'rose-secret-cart-storage' && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        // Only update items from storage event, preserve local UI state
        useCartStore.setState(state => ({
          ...state,
          items: newState.state.items || []
        }));
      } catch (error) {
        console.error('Failed to sync cart across tabs:', error);
      }
    }
  });
}