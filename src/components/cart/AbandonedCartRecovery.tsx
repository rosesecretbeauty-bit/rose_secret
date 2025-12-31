import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, Clock } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
export function AbandonedCartRecovery() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    items,
    getItemCount
  } = useCartStore();
  const itemCount = getItemCount();
  useEffect(() => {
    // Only show if cart has items
    if (itemCount === 0) {
      setIsVisible(false);
      return;
    }
    // Show after 30 seconds of inactivity or exit intent
    const timer = setTimeout(() => {
      const hasSeen = sessionStorage.getItem('abandoned_cart_seen');
      if (!hasSeen) {
        setIsVisible(true);
        sessionStorage.setItem('abandoned_cart_seen', 'true');
      }
    }, 30000);
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && itemCount > 0) {
        const hasSeen = sessionStorage.getItem('abandoned_cart_seen');
        if (!hasSeen) {
          setIsVisible(true);
          sessionStorage.setItem('abandoned_cart_seen', 'true');
        }
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [itemCount]);
  if (!isVisible || itemCount === 0) return null;
  return <AnimatePresence>
      <motion.div initial={{
      opacity: 0,
      y: 50,
      scale: 0.95
    }} animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }} exit={{
      opacity: 0,
      y: 50,
      scale: 0.95
    }} className="fixed bottom-6 left-6 z-50 max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-premium-lg border border-gray-100 overflow-hidden relative">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-100">
            <motion.div initial={{
            width: '100%'
          }} animate={{
            width: '0%'
          }} transition={{
            duration: 10,
            ease: 'linear'
          }} className="h-full bg-rose-500" onAnimationComplete={() => setIsVisible(false)} />
          </div>

          <button onClick={() => setIsVisible(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10">
            <X className="h-4 w-4" />
          </button>

          <div className="p-5 flex gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-rose-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-rose-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {itemCount}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-serif font-bold text-gray-900 mb-1">
                ¡No te olvides!
              </h3>
              <p className="text-sm text-gray-600 mb-3 leading-tight">
                Tus productos favoritos te están esperando. Completa tu compra
                ahora.
              </p>

              <div className="flex gap-2">
                <Link to="/checkout" className="flex-1">
                  <Button size="sm" fullWidth className="text-xs">
                    Finalizar Compra
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button size="sm" variant="outline" className="text-xs px-3">
                    Ver
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>;
}