import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getProducts } from '../api/products';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/ui/Button';
import { Product } from '../types';
import { transformProducts } from '../utils/productTransform';

export function NewArrivalsPage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNewProducts() {
      setIsLoading(true);
      try {
        // TODO (backend): agregar query param is_new para filtrar en backend
        // Por ahora, obtener todos los productos y filtrar en frontend
        const data = await getProducts({ limit: 1000 }); // Limite alto para obtener todos
        
        // Transformar productos del backend al formato del frontend
        const transformedProducts = transformProducts(data.products);
        
        // Filtrar por isNew (filtrado temporal en frontend)
        const filtered = transformedProducts.filter(p => p.isNew);
        
        setNewProducts(filtered);
      } catch (error) {
        console.error('Error loading new products:', error);
        setNewProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadNewProducts();
  }, []);
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2000" alt="New Arrivals Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-xs font-bold tracking-[0.2em] uppercase">
              Colección 2024
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
        }} className="font-serif text-5xl md:text-7xl font-bold mb-6">
            New Arrivals
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-light mb-10">
            Descubre las últimas adiciones a nuestra colección. Desde fragancias
            vanguardistas hasta cuidado de la piel revolucionario.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <Button className="bg-white text-gray-900 hover:bg-gray-100 border-none px-8">
              Ver Colección
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Recién Llegados
          </h2>
          <div className="text-sm text-gray-500">
            {isLoading ? 'Cargando...' : `${newProducts.length} productos`}
          </div>
        </div>

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
        ) : newProducts.length > 0 ? (
          <ProductGrid products={newProducts} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron productos nuevos.</p>
          </div>
        )}

        <div className="mt-20 bg-rose-50 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-6" />
            <h3 className="font-serif text-3xl font-bold text-gray-900 mb-4">
              ¿Quieres ser la primera en enterarte?
            </h3>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              Suscríbete a nuestro boletín y recibe acceso anticipado a nuevos
              lanzamientos y ofertas exclusivas.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input type="email" placeholder="Tu correo electrónico" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none" />
              <Button>Suscribirse</Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}