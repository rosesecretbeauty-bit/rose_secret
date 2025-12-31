import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../components/products/ProductCard';
import { Link } from 'react-router-dom'; // retained original import intention

// ---- Original broken lines preserved as comments ----
// import React = ;
// call;
// name = "write";
// fileName = "pages/HomePage, { useRef } from 'react';
// import { ChevronLeft, ChevronRight, tsx } from ">import React from 'react';
// import { ProductCard } from ;
// from;
// 'react-router-dom';
// import { motion, use } from './ProductCard';
// Scroll, useTransform;
// from;
// 'framer-motion';
// import { ArrowRight, Star, Shielexport, function, ProductCarousel } from ({ products, title }: ProductCarouselProps) => {
// const scrollContainerRef = useRef<HTMLDivElement>(dCheck, Truck, Sparkles, Gift, Clock, Awarnull);
// d;
// from;
// 'lucide-react';
// import { Button } from '../components      const scrollAmount = 300;
// const currentScroll = scrollContainerRef.current.scrollLeft;
// const target;
// /ui/Button;
// ';
// import { ProductGrid } from '../components/products/ProductScroll = direction === ';
// left;
// '
// ? currentScroll - scrollAmount
// : currentScroll + scrollGrid;
// ';
// import { ProductCarousel } from '../components/home/ProductAmount;
// scrollContainerRef.current.scrollTo({
// left: targetScroll,
// behavior: Carousel, ': ,
// import: { TestimonialsSection, 'smooth':
// }
// });
// }; // stray closing brace from broken code
// return (<div className="relative group } from '../components/home/TestimonialsSection'
// import { BrandStory } from '../components/home/BrandStory'
// import { News">
// export function="relative">
// .isNew).slice(0, 4)
//   const featuredPerf          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-umes = products.filter((p) => p.category === 'perfumes4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text').slice(0, 8-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-3)
//   return (
//     <div className="overflow-hidden">
//       {/* Hero Section - Ultra00 hover:text-rose-600 hover:scale-110"
//         aria-label Luxury */}
//       <section className="relative h-screen w=" Scroll right/>"
//         >
//           <ChevronRight className="h-6 w-6"/>
//         -full overflow-hidden">
//         {/* Background with</button>

//     {/* Carousel Container */}
//         <div ref={scrollContainerRef} parallax/> */}
//         <motion.div className="absolute inset-0" style={{ y: heroY }} className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//           {products.map((product, index) => (<motion.div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
//               <ProductCard product={product}/>
//             </motion.div>))}
//         </></div>
//       </div>);
// div >
// ;

interface ProductCarouselProps {
  products: Product[];
  title?: string;
}
export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };
  return <div className="relative">
      {title &&
    // MASKED_CODE_1:51-54
    <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {/* Navigation Buttons */}
      <button onClick={() => scroll('left')} className="absolute left- HomePage() {
  const { scrollY } = useScroll()
  const heroY0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 = useTransform(scrollY, [0, 500], [0, 150])
  const hero w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600Opacity = useTransform(scrollY, [0, 300], [1, 0])

  const best opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-rose-600 hover:Sellers = products.filter((p) => p.isBestSeller).slice(0, 8scale-110" aria-label="Scroll left">
        <ChevronLeft className="h-6)
  const newArrivals = products.filter((p) => p w-6" />
      </button>

      <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10" onClick={() => scroll('left')} aria-label="Scroll left">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10" onClick={() => scroll('right')} aria-label="Scroll right">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory" style={{
      scrollBehavior: 'smooth'
    }}>
        {products.map((product, index) => <motion.div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: index * 0.1
      }}>
            <ProductCard product={product} />
          </motion.div>)}
      </div>
    </div>;
};