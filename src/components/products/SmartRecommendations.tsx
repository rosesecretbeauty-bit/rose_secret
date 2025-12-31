import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { getProducts } from '../../api/products';
import { ProductCard } from './ProductCard';
import { PremiumLoader } from '../ui/PremiumLoader';

interface SmartRecommendationsProps {
  currentProductId?: string;
  category?: string;
  title?: string;
  limit?: number;
}

export function SmartRecommendations({
  currentProductId,
  category,
  title = 'Recomendado para ti',
  limit = 4
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setIsLoading(true);
        // Obtener productos de la misma categoría (o todos si no hay categoría)
        const response = await getProducts({
          category: category,
          limit: limit + 1 // +1 para excluir el producto actual
        });
        
        // Filtrar el producto actual y limitar
        const filtered = response.products
          .filter(p => p.id !== currentProductId)
          .slice(0, limit);
        
        setRecommendations(filtered);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [currentProductId, category, limit]);

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-rose-50/30">
        <div className="container-custom">
          <div className="flex items-center justify-center py-8">
            <PremiumLoader />
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;
  return <section className="py-8 sm:py-12 bg-gradient-to-b from-white to-rose-50/30">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 group">
            Ver todo
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {recommendations.map((product, index) => <motion.div key={product.id} initial={{
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
              <div className="relative group">
                {/* Recommendation Reason Tag */}
                <div className="absolute -top-3 left-4 z-10 bg-white/90 backdrop-blur shadow-sm border border-rose-100 px-3 py-1 rounded-full text-[10px] font-medium text-rose-800 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {index % 2 === 0 ? 'Estilo similar' : 'Comprado juntos'}
                </div>

                <ProductCard product={product} />
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
}