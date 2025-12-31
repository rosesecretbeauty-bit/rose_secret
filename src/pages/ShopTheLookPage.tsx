import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';

interface Look {
  id: number;
  title: string;
  image: string;
  products: Product[];
}

export function ShopTheLookPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLooks() {
      try {
        setIsLoading(true);
        // Cargar productos reales
        const data = await getProducts({ limit: 10 });
        const transformedProducts = data.products.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          images: p.image_url ? [p.image_url] : [],
          rating: p.rating || 0,
          reviews: p.reviews_count || 0,
          isNew: p.is_new || false,
          isBestSeller: p.is_bestseller || false,
          stock: p.stock || 0
        }));

        // Crear looks con productos reales
        const looksData: Look[] = [
          {
            id: 1,
            title: 'Parisian Evening',
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200',
            products: transformedProducts.slice(0, 2)
          },
          {
            id: 2,
            title: 'Summer Breeze',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
            products: transformedProducts.slice(2, 3)
          }
        ];
        setLooks(looksData);
      } catch (error) {
        console.error('Error loading looks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLooks();
  }, []);
  if (isLoading) {
    return <PremiumLoader fullScreen text="Cargando looks..." />;
  }

  return <div className="bg-white min-h-screen pb-20">
      <div className="container-custom py-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">
          Shop The Look
        </h1>

        <div className="space-y-24">
          {looks.map((look, index) => <div key={look.id} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-2/3 relative group">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img src={look.image} alt={look.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                {/* Hotspots could go here */}
              </div>

              <div className="lg:w-1/3 space-y-6">
                <h2 className="font-serif text-3xl font-bold">{look.title}</h2>
                <p className="text-gray-600">
                  Achieve this curated aesthetic with our selected products.
                </p>

                <div className="space-y-4">
                  {look.products.map(product => {
                    const productImage = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.png';
                    const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price?.toString() || '0').toFixed(2);
                    return <GlassCard key={product.id} className="flex items-center gap-4 p-4" hover>
                      <img src={productImage} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{product.name}</h4>
                        <p className="text-rose-600 text-sm">
                          ${productPrice}
                        </p>
                      </div>
                      <button className="p-2 bg-gray-900 text-white rounded-full hover:bg-rose-600 transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </GlassCard>;
                  })}
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}