import { useMemo } from 'react';
import { Product } from '../types';
interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  brands?: string[];
  minRating?: number | null;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
export function useOptimizedProducts(products: Product[], filters: FilterOptions) {
  return useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => product.price >= min && product.price <= max);
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands!.includes(product.brand || ''));
    }

    // Rating filter
    if (filters.minRating !== null && filters.minRating !== undefined) {
      filtered = filtered.filter(product => (product.rating || 0) >= filters.minRating!);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query) || product.category?.toLowerCase().includes(query));
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return b.isNew ? 1 : -1;
          default:
            return 0;
        }
      });
    }
    return filtered;
  }, [products, filters]);
}