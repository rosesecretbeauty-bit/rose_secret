import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { getProducts } from '../api/products';
import { ProductGrid } from '../components/products/ProductGrid';
import { Product } from '../types';
import { transformProducts } from '../utils/productTransform';

export function BestSellersPage() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBestSellers() {
      setIsLoading(true);
      try {
        // TODO (backend): agregar query param is_bestseller para filtrar en backend
        // Por ahora, obtener todos los productos y filtrar en frontend
        const data = await getProducts({ limit: 1000 }); // Limite alto para obtener todos
        
        // Transformar productos del backend al formato del frontend
        const transformedProducts = transformProducts(data.products);
        
        // Filtrar por isBestSeller (filtrado temporal en frontend)
        const filtered = transformedProducts.filter(p => p.isBestSeller);
        
        setBestSellers(filtered);
      } catch (error) {
        console.error('Error loading best sellers:', error);
        setBestSellers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBestSellers();
  }, []);

  return <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="container-custom text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-sm font-bold tracking-widest text-yellow-600 uppercase">
              Customer Favorites
            </span>
          </motion.div>
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Best Sellers
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Our most loved and highly rated products. Discover why these
            essentials have captured the hearts of our community.
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-gray-200 aspect-[3/4] w-full rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 w-1/2 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : bestSellers.length > 0 ? (
          <ProductGrid products={bestSellers} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron productos destacados.</p>
          </div>
        )}
      </div>
    </div>;
}