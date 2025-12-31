import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowUp } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useScrollDirection } from '../../hooks/useScrollDirection';
export function FloatingActionButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollDirection = useScrollDirection();
  const cartItemCount = useCartStore(state => state.getItemCount());
  const toggleCart = useCartStore(state => state.toggleCart);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const shouldShow = scrollDirection !== 'down' || window.scrollY < 100;
  return <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 md:hidden">
      <AnimatePresence>
        {/* Scroll to Top */}
        {showScrollTop && shouldShow && <motion.button 
          key="scroll-top"
          initial={{
            scale: 0,
            opacity: 0
          }} 
          animate={{
            scale: 1,
            opacity: 1
          }} 
          exit={{
            scale: 0,
            opacity: 0
          }} 
          whileHover={{
            scale: 1.1
          }} 
          whileTap={{
            scale: 0.9
          }} 
          onClick={scrollToTop} 
          className="h-14 w-14 bg-white shadow-premium-lg rounded-full flex items-center justify-center text-gray-600 hover:text-rose-600 transition-colors border border-gray-200"
        >
            <ArrowUp className="h-6 w-6" />
          </motion.button>}

        {/* Cart FAB */}
        {shouldShow && cartItemCount > 0 && <motion.button 
          key="cart-fab"
          initial={{
            scale: 0,
            opacity: 0
          }} 
          animate={{
            scale: 1,
            opacity: 1
          }} 
          exit={{
            scale: 0,
            opacity: 0
          }} 
          whileHover={{
            scale: 1.1
          }} 
          whileTap={{
            scale: 0.9
          }} 
          onClick={toggleCart} 
          className="relative h-16 w-16 bg-gradient-to-br from-rose-600 to-rose-700 shadow-premium-lg shadow-rose-500/30 rounded-full flex items-center justify-center text-white"
        >
            <ShoppingBag className="h-7 w-7" />
            <motion.span initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} className="absolute -top-1 -right-1 h-6 w-6 bg-champagne text-gray-900 text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              {cartItemCount}
            </motion.span>

            {/* Pulse animation */}
            <motion.div className="absolute inset-0 rounded-full bg-rose-400" animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          </motion.button>}
      </AnimatePresence>
    </div>;
}