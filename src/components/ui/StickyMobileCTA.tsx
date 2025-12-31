import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../types';
import { Button } from './Button';
interface StickyMobileCTAProps {
  product: Product;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  inWishlist: boolean;
  selectedVariant?: string;
}
export function StickyMobileCTA({
  product,
  onAddToCart,
  onToggleWishlist,
  inWishlist,
  selectedVariant
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when scrolled past 400px
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <AnimatePresence>
      {isVisible && <motion.div initial={{
      y: 100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 100,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-premium-lg">
            <div className="container-custom py-4">
              <div className="flex items-center gap-3">
                {/* Product Info */}
                <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-semibold text-gray-900 truncate text-sm">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="font-serif font-bold text-rose-600 text-lg">
                      ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                    </p>
                    {selectedVariant && <span className="text-xs text-gray-500">
                        • {selectedVariant}
                      </span>}
                  </div>
                </div>

                {/* Actions */}
                <motion.button whileTap={{
              scale: 0.9
            }} onClick={onToggleWishlist} className={`p-3 rounded-full transition-colors ${inWishlist ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </motion.button>

                <Button onClick={onAddToCart} className="px-6">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
}