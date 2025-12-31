import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';
interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [],
  addItem: (product, quantity = 1) => {
    set(state => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map(item => item.product.id === product.id ? {
            ...item,
            quantity: item.quantity + quantity
          } : item)
        };
      }
      return {
        items: [...state.items, {
          product,
          quantity
        }]
      };
    });

    // Analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: quantity
        }]
      });
    }
  },
  removeItem: productId => {
    set(state => ({
      items: state.items.filter(item => item.product.id !== productId)
    }));

    // Analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        item_id: productId
      });
    }
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set(state => ({
      items: state.items.map(item => item.product.id === productId ? {
        ...item,
        quantity
      } : item)
    }));
  },
  clearCart: () => {
    set({
      items: []
    });
  },
  getTotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product.discount ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
      return total + price * item.quantity;
    }, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}), {
  name: 'rose-secret-cart',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({
    items: state.items
  }),
  version: 1,
  migrate: (persistedState: any, version) => {
    // Handle migration if cart structure changes
    if (version === 0) {
      // Migration logic here if needed
    }
    return persistedState;
  }
}));

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === 'rose-secret-cart' && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        useCartStore.setState(newState.state);
      } catch (error) {
        console.error('Failed to sync cart across tabs:', error);
      }
    }
  });
}