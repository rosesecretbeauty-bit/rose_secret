import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
interface RecentlyViewedStore {
  products: Product[];
  addProduct: (product: Product) => void;
  clearAll: () => void;
}
export const useRecentlyViewedStore = create<RecentlyViewedStore>()(persist(set => ({
  products: [],
  addProduct: product => {
    set(state => {
      // Remove if already exists
      const filtered = state.products.filter(p => p.id !== product.id);

      // Add to beginning and limit to 12 products
      return {
        products: [product, ...filtered].slice(0, 12)
      };
    });
  },
  clearAll: () => set({
    products: []
  })
}), {
  name: 'rose-secret-recently-viewed'
}));
export function useRecentlyViewed() {
  return useRecentlyViewedStore();
}

// Hook to track product view
export function useTrackProductView(product: Product | null) {
  const addProduct = useRecentlyViewedStore(state => state.addProduct);
  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id, addProduct]);
}