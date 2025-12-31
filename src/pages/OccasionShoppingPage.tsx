import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';

const occasions = [{
  id: 'valentines',
  title: 'San Valentín',
  date: '14 Febrero',
  color: 'bg-rose-100'
}, {
  id: 'mothers-day',
  title: 'Día de la Madre',
  date: 'Mayo',
  color: 'bg-pink-100'
}, {
  id: 'christmas',
  title: 'Navidad',
  date: '25 Diciembre',
  color: 'bg-green-50'
}, {
  id: 'birthday',
  title: 'Cumpleaños',
  date: 'Todo el año',
  color: 'bg-blue-50'
}];

export function OccasionShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({ limit: 4 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <PremiumLoader />
    </div>;
  }
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container-custom text-center">
          <Gift className="w-12 h-12 text-rose-400 mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Regalos por Ocasión
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Encuentra el detalle perfecto para cada momento especial.
            Colecciones curadas para celebrar la vida.
          </p>
        </div>
      </div>

      {/* Occasions Grid */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {occasions.map((occasion, idx) => <motion.div key={occasion.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: idx * 0.1
        }} className={`group relative h-64 sm:h-80 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer ${occasion.color} flex items-center justify-center`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative z-10 text-center p-6 w-full">
                <p className="text-rose-400 sm:text-rose-300 text-xs sm:text-sm font-bold mb-1">
                  {occasion.date}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
                  {occasion.title}
                </h3>
                <span className="inline-flex items-center text-white text-xs sm:text-sm font-medium group-hover:underline">
                  Ver Colección <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </span>
              </div>
            </motion.div>)}
        </div>

        {/* Featured Collection */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-rose-600 font-bold tracking-widest uppercase text-sm mb-2 block">
                Trending
              </span>
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Regalos Populares
              </h2>
            </div>
            <Link to="/shop">
              <Button variant="outline">Ver Todo</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>

        {/* Gift Guide Teaser */}
        <div className="bg-rose-50 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Indeciso?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Deja que nuestro asistente inteligente te ayude a encontrar el
            regalo ideal en menos de 2 minutos.
          </p>
          <Link to="/gift-finder">
            <Button size="lg" variant="primary" className="px-12">
              Iniciar Buscador de Regalos
            </Button>
          </Link>
        </div>
      </div>
    </div>;
}