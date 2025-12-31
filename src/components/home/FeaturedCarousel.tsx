import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';
interface FeaturedCarouselProps {
  products: Product[];
}
export function FeaturedCarousel({
  products
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Responsive items per view
  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  };
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  };
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);
  return <div className="relative group" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      <div className="overflow-hidden py-8 -my-8 px-4 -mx-4">
        <motion.div className="flex gap-6" animate={{
        x: `-${currentIndex * (100 / 4)}%`
      }} transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}>
          {products.map(product => <div key={product.id} className="min-w-[85%] sm:min-w-[45%] lg:min-w-[23%] flex-shrink-0">
              <ProductCard product={product} />
            </div>)}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-premium text-gray-800 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-300 hover:bg-white hover:text-rose-600 z-10">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-premium text-gray-800 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-300 hover:bg-white hover:text-rose-600 z-10">
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {products.slice(0, products.length - 3).map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-rose-600' : 'w-2 bg-gray-300 hover:bg-rose-300'}`} />)}
      </div>
    </div>;
}