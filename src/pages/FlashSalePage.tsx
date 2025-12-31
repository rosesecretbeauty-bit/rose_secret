import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getActivePromotions, calculateTimeLeft, Promotion } from '../api/promotions';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { Product } from '../types';

export function FlashSalePage() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFlashSale() {
      try {
        setIsLoading(true);
        
        // Cargar promociones activas tipo flash_sale
        const promotions = await getActivePromotions();
        const flashSalePromo = promotions.find(p => p.type === 'flash_sale');
        
        if (!flashSalePromo) {
          // No hay flash sale activa
          setPromotion(null);
          setFlashSaleProducts([]);
          setIsLoading(false);
          return;
        }

        setPromotion(flashSalePromo);

        // Calcular tiempo restante
        const time = calculateTimeLeft(flashSalePromo.end_date);
        if (time) {
          setTimeLeft(time);
        } else {
          // Promoción expirada
          setTimeLeft(null);
        }

        // Cargar productos con descuento
        const response = await getProducts({ limit: 20 });
        if (response.products) {
          // Filtrar productos con descuento o que coincidan con target_products
          let filtered = response.products.filter(p => 
            p.compare_at_price && p.compare_at_price > p.price
          );

          // Si hay productos específicos en la promoción, usarlos
          if (flashSalePromo.target_products && flashSalePromo.target_products.length > 0) {
            filtered = response.products.filter(p => 
              flashSalePromo.target_products!.includes(parseInt(p.id))
            );
          }

          setFlashSaleProducts(filtered.slice(0, 8));
        }
      } catch (error) {
        console.error('Error loading flash sale:', error);
        setPromotion(null);
        setFlashSaleProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFlashSale();
  }, []);

  // Actualizar countdown
  useEffect(() => {
    if (!promotion || !timeLeft) return;

    const timer = setInterval(() => {
      if (!promotion) return;
      const time = calculateTimeLeft(promotion.end_date);
      
      if (time) {
        setTimeLeft(time);
      } else {
        // Promoción expirada
        setTimeLeft(null);
        setPromotion(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [promotion, timeLeft]);

  if (isLoading) {
    return <PremiumLoader fullScreen text="Loading Flash Sales" />;
  }

  // Si no hay promoción activa, mostrar mensaje
  if (!promotion || !timeLeft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No hay Flash Sale activa</h1>
          <p className="text-gray-600 mb-6">Vuelve pronto para ver nuestras ofertas especiales</p>
          <Link to="/shop" className="text-rose-600 hover:text-rose-700 font-medium">
            Ver tienda →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900 to-purple-900 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

        <div className="container-custom relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-6 animate-pulse"
          >
            <Zap className="h-4 w-4 fill-current" />
            FLASH SALE LIVE
          </motion.div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            {promotion.discount_percentage 
              ? `Up to ${promotion.discount_percentage}% Off`
              : promotion.discount_amount
              ? `Up to $${promotion.discount_amount} Off`
              : promotion.title}
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {promotion.description || 'Exclusive deals on luxury fragrances and premium beauty. Limited quantities available.'}
          </p>

          {/* Countdown Timer */}
          {promotion.show_countdown && timeLeft && (
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-2">
                    <span className="text-3xl md:text-4xl font-bold font-mono">
                      {item.value.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Hot Deals Ending Soon
          </h2>
          <div className="text-sm text-gray-500">
            {flashSaleProducts.length > 0 
              ? `Showing ${flashSaleProducts.length} items`
              : 'No hay productos disponibles'}
          </div>
        </div>

        {flashSaleProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <ProductCard product={product} />
                  {/* Progress Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-red-600">Almost Gone!</span>
                      <span className="text-gray-500">
                        {product.stock || 0} left
                      </span>
                    </div>
                    {product.stock && product.stock > 0 && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{
                            width: `${Math.min((product.stock / 10) * 100, 100)}%`
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay productos disponibles en esta promoción</p>
            <Link to="/shop" className="text-rose-600 hover:text-rose-700 font-medium mt-4 inline-block">
              Ver tienda →
            </Link>
          </div>
        )}

        {promotion.show_countdown && timeLeft && (
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-4">
              More deals unlocking in {timeLeft.hours}h {timeLeft.minutes}m
            </p>
            <Button variant="outline" size="lg">
              Notify Me of Next Drop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
