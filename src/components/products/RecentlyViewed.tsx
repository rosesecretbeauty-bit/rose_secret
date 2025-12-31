import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { ProductCard } from './ProductCard';
interface RecentlyViewedProps {
  limit?: number;
  title?: string;
  excludeId?: string;
}
export function RecentlyViewed({
  limit = 4,
  title = 'Vistos Recientemente',
  excludeId
}: RecentlyViewedProps) {
  const {
    products
  } = useRecentlyViewed();
  // Filter out current product and limit
  const displayProducts = products.filter(p => p.id !== excludeId).slice(0, limit);
  if (displayProducts.length === 0) return null;
  return <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <Clock className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-gray-600">
              Continúa explorando tus productos favoritos
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => <motion.div key={product.id} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }}>
              <ProductCard product={product} />
            </motion.div>)}
        </div>
      </div>
    </section>;
}