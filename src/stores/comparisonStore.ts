import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
interface ComparisonState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isInComparison: (productId: string) => boolean;
}
export const useComparisonStore = create<ComparisonState>()(persist((set, get) => ({
  items: [],
  addItem: product => {
    const {
      items
    } = get();
    if (items.length >= 3) {
      // Remove oldest item if already 3
      set({
        items: [...items.slice(1), product]
      });
    } else if (!items.find(p => p.id === product.id)) {
      set({
        items: [...items, product]
      });
    }
  },
  removeItem: productId => {
    set({
      items: get().items.filter(p => p.id !== productId)
    });
  },
  clearAll: () => {
    set({
      items: []
    });
  },
  isInComparison: productId => {
    return get().items.some(p => p.id === productId);
  }
}), {
  name: 'rose-secret-comparison'
}));