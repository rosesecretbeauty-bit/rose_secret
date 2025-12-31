import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Clock } from 'lucide-react';
import { getProducts } from '../../api/products';
import { Product } from '../../types';

export function ContextualNav() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // Only show on product or shop pages
  const shouldShow = location.pathname.includes('/product/') || location.pathname.includes('/shop');

  const loadSuggestedProducts = async () => {
    try {
      const response = await getProducts({ limit: 3 });
      if (response.products) {
        setSuggestedProducts(response.products.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  };

  // Cargar productos sugeridos cuando se muestra el componente
  useEffect(() => {
    if (shouldShow && suggestedProducts.length === 0) {
      loadSuggestedProducts();
    }
  }, [shouldShow, location.pathname]);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 200 && currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  if (!shouldShow) return null;
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
    }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-premium-lg rounded-full px-6 py-3 border border-gray-200 hidden md:flex items-center gap-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-rose-600 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-rose-600 transition-colors">
              Tienda
            </Link>
            {location.pathname.includes('product') && <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium truncate max-w-[150px]">
                  Producto Actual
                </span>
              </>}
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* Suggestions */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sugerencias
            </span>
            <div className="flex -space-x-2">
              {suggestedProducts.map(p => (
                <Link 
                  key={p.id} 
                  to={`/product/${p.id}`} 
                  className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden hover:scale-110 transition-transform hover:z-10 shadow-sm"
                >
                  <img 
                    src={p.images?.[0] || 'https://via.placeholder.com/32'} 
                    alt={p.name} 
                    className="w-full h-full object-cover" 
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* Recently Viewed */}
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors">
            <Clock className="w-4 h-4" />
            <span>Visto recientemente</span>
          </button>
        </motion.div>}
    </AnimatePresence>;
}