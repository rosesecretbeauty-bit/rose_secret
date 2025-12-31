import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, Users, MessageCircle, Heart, ShoppingBag, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { getProductImage } from '../utils/productUtils';

export function LiveShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [upcomingEvents] = useState<any[]>([]); // Empty - no events API available

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ limit: 5 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    loadProducts();
  }, []);
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* Empty State - No Live Events */}
      <div className="relative h-[70vh] bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 via-black to-black" />
        <div className="relative z-10 text-center px-4">
          <Play className="w-20 h-20 text-rose-400 mx-auto mb-6 opacity-50" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Live Shopping
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Próximamente: transmisiones en vivo con expertos en belleza y fragancias.
            Descubre nuevos productos y aprende técnicas exclusivas.
          </p>
          {products.length > 0 && (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-rose-400">
                Productos Destacados
              </p>
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex gap-4 items-center">
                    <img src={getProductImage(product.images)} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-white" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-lg font-bold">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Schedule - Empty State */}
      <div className="py-16 bg-gray-900">
        <div className="container-custom">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold mb-4">Próximos Eventos</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              No hay eventos programados en este momento. Vuelve pronto para ver nuestras próximas transmisiones en vivo.
            </p>
          </div>
        </div>
      </div>
    </div>;
}