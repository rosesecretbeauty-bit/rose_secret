import React, { useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, Scale, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToastStore } from '../../stores/toastStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import { QuickView } from './QuickView';
import { useImageLazyLoad } from '../../hooks/useImageLazyLoad';
import { getBlurDataURL } from '../../utils/imageOptimization';
import { getProductImage } from '../../utils/productUtils';
interface ProductCardProps {
  product: Product;
}
export function ProductCard({
  product
}: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist
  } = useWishlistStore();
  const {
    addItem: addToComparison,
    removeItem: removeFromComparison,
    isInComparison
  } = useComparisonStore();
  const addToast = useToastStore(state => state.addToast);
  const inWishlist = isInWishlist(product.id);
  const inComparison = isInComparison(product.id);
  
  // Safe image handling - ensure images array exists and has at least one image
  const productImage = getProductImage(product.images);
  
  // Lazy load implementation
  const {
    imgRef,
    isLoaded
  } = useImageLazyLoad({
    src: productImage,
    threshold: 0.1
  });
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    addToast({
      type: 'success',
      message: '¡Añadido al carrito!'
    });
  };
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        addToast({
          type: 'info',
          message: 'Eliminado de favoritos'
        });
      } else {
        await addToWishlist(product);
        addToast({
          type: 'success',
          message: '¡Añadido a favoritos!'
        });
      }
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message?.includes('sesión') || error.message?.includes('login')) {
        addToast({
          type: 'error',
          message: 'Debes iniciar sesión para usar la wishlist'
        });
      } else if (error.message?.includes('ya está')) {
        // Ya está en wishlist, no mostrar error
        return;
      } else {
        addToast({
          type: 'error',
          message: error.message || 'Error al actualizar wishlist'
        });
      }
    }
  };
  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inComparison) {
      removeFromComparison(product.id);
      addToast({
        type: 'info',
        message: 'Eliminado de comparación'
      });
    } else {
      addToComparison(product);
      addToast({
        type: 'success',
        message: 'Añadido a comparación'
      });
    }
  };
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowQuickView(true);
  };
  return <>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true,
      margin: '-50px'
    }} transition={{
      duration: 0.5
    }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="h-full group">
        <Link to={`/product/${product.id}`} className="block h-full">
          <div className="relative h-full bg-white rounded-xl overflow-hidden transition-all duration-500 hover:shadow-premium-lg border border-stone-100 hover:border-rose-200 flex flex-col">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
              {/* Blur placeholder */}
              <div className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} style={{
              backgroundImage: `url(${getBlurDataURL()})`
            }} />

              <motion.img ref={imgRef} src={isLoaded ? productImage : ''} alt={product.name} className={`h-full w-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} animate={{
              scale: isHovered ? 1.08 : 1
            }} transition={{
              duration: 0.7,
              ease: [0.33, 1, 0.68, 1]
            }} />

              {/* Gradient overlay on hover */}
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" initial={{
              opacity: 0
            }} animate={{
              opacity: isHovered ? 1 : 0
            }} transition={{
              duration: 0.3
            }} />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.isNew && <Badge variant="champagne" className="shadow-sm backdrop-blur-md bg-white/90 text-stone-900 border-none">
                    NUEVO
                  </Badge>}
                {product.isBestSeller && <Badge variant="secondary" className="shadow-sm backdrop-blur-md bg-rose-100/90 text-rose-800 border-none">
                    BESTSELLER
                  </Badge>}
                {product.discount && <Badge className="bg-rose-600 text-white shadow-sm border-none">
                    -{product.discount}%
                  </Badge>}
              </div>

              {/* Quick Actions - Desktop */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={handleToggleWishlist} className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 ${inWishlist ? 'bg-rose-600 text-white' : 'bg-white/90 text-stone-600 hover:text-rose-600'}`} title="Añadir a favoritos">
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>

                <button onClick={handleQuickView} className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-stone-600 hover:text-rose-600 transition-all duration-300 hover:scale-110" title="Vista rápida">
                  <Eye className="h-5 w-5" />
                </button>

                <button onClick={handleAddToCart} className="p-3 bg-stone-900 rounded-full shadow-lg text-white hover:bg-rose-600 transition-all duration-300 hover:scale-110" title="Añadir al carrito">
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Quick Add (Visible on touch/mobile only logic handled by CSS usually, here simplified) */}
              <button onClick={handleAddToCart} className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full shadow-md text-stone-900 md:hidden z-20">
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] sm:text-xs text-rose-600 uppercase tracking-widest font-medium">
                  {product.brand || 'Rose Secret'}
                </p>
                {product.rating > 0 && <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-stone-500">
                      {product.rating}
                    </span>
                  </div>}
              </div>

              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 mb-2 line-clamp-2 group-hover:text-rose-700 transition-colors duration-300">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-auto">
                <span className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </span>
                {product.originalPrice && <span className="text-xs sm:text-sm text-stone-400 line-through">
                    ${parseFloat(product.originalPrice?.toString() || '0').toFixed(2)}
                  </span>}
              </div>

              {/* Low Stock Indicator */}
              {!product.stock || product.stock < 10 ? <p className="text-[10px] text-orange-600 font-medium mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Solo quedan {product.stock}{' '}
                  unidades
                </p> : null}
            </div>
          </div>
        </Link>
      </motion.div>

      <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>;
}