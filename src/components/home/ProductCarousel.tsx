import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';
interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  autoPlay?: boolean;
  showNavigation?: boolean;
}
export function ProductCarousel({
  products,
  title,
  subtitle,
  autoPlay = false,
  showNavigation = true
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(4);
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);else if (window.innerWidth < 768) setItemsPerView(2);else if (window.innerWidth < 1024) setItemsPerView(3);else setItemsPerView(4);
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, products.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, products.length, itemsPerView]);
  const maxIndex = Math.max(0, products.length - itemsPerView);
  const navigate = (direction: 'prev' | 'next') => {
    setCurrentIndex(prev => {
      if (direction === 'next') {
        return prev >= maxIndex ? 0 : prev + 1;
      }
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };
  return <section className="py-24 bg-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            {subtitle && <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-3 block">
                {subtitle}
              </span>}
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">
              {title}
            </h2>
          </div>

          {showNavigation && products.length > itemsPerView && <div className="flex gap-2">
              <button onClick={() => navigate('prev')} className="p-3 bg-white border border-gray-200 rounded-full hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={() => navigate('next')} className="p-3 bg-white border border-gray-200 rounded-full hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>}
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={containerRef}>
          <motion.div className="flex gap-6" animate={{
          x: `-${currentIndex * (100 / itemsPerView + 1.5)}%`
        }} transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        }}>
            {products.map(product => <div key={product.id} className="flex">
                <ProductCard product={product} />
              </div>)}
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({
          length: maxIndex + 1
        }).map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-rose-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} />)}
        </div>
      </div>
    </section>;
}