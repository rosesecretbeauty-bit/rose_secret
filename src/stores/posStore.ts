import { create } from 'zustand';
import { Product, CartItem } from '../types';
interface POSStore {
  cart: CartItem[];
  searchQuery: string;
  selectedCustomer: string | null;
  paymentMethod: 'cash' | 'card' | 'transfer' | null;
  discount: number;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer') => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  completeSale: () => void;
}
export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  searchQuery: '',
  selectedCustomer: null,
  paymentMethod: null,
  discount: 0,
  setSearchQuery: query => set({
    searchQuery: query
  }),
  addToCart: (product, quantity = 1) => {
    set(state => {
      const existingItem = state.cart.find(item => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item => item.id === product.id ? {
            ...item,
            quantity: item.quantity + quantity
          } : item)
        };
      }
      return {
        cart: [...state.cart, {
          ...product,
          quantity
        }]
      };
    });
  },
  removeFromCart: productId => {
    set(state => ({
      cart: state.cart.filter(item => item.id !== productId)
    }));
  },
  updateQuantity: (productId, quantity) => {
    set(state => ({
      cart: state.cart.map(item => item.id === productId ? {
        ...item,
        quantity
      } : item).filter(item => item.quantity > 0)
    }));
  },
  setPaymentMethod: method => set({
    paymentMethod: method
  }),
  setDiscount: discount => set({
    discount
  }),
  clearCart: () => set({
    cart: [],
    paymentMethod: null,
    discount: 0,
    selectedCustomer: null
  }),
  getSubtotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    return subtotal - subtotal * discount / 100;
  },
  completeSale: () => {
    // Mock sale completion
    const cart = get().cart;
    const total = get().getTotal();
    console.log('Sale completed:', {
      cart,
      total
    });
    get().clearCart();
  }
}));