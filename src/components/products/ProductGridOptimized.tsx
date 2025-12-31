import React, { Suspense, lazy } from 'react';
import { Product } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Package } from 'lucide-react';
const ProductCard = lazy(() => import('./ProductCardOptimized').then(module => ({
  default: module.ProductCard
})));
interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}
export function ProductGridOptimized({
  products,
  onQuickView
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState icon={Package} title="No se encontraron productos" description="Intenta ajustar los filtros o buscar algo diferente" />;
  }
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product, index) => <Suspense key={product.id} fallback={<div className="space-y-4">
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>}>
          <ProductCard product={product} index={index} onQuickView={onQuickView} />
        </Suspense>)}
    </div>;
}