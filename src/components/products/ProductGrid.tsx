import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}
export function ProductGrid({
  products,
  isLoading = false
}: ProductGridProps) {
  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] rounded-sm mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>)}
      </div>;
  }
  if (products.length === 0) {
    return <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No se encontraron productos que coincidan con tus criterios.
        </p>
      </div>;
  }
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>;
}