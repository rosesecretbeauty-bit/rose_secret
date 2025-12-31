import React, { useCallback, lazy, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { Badge } from '../ui/Badge';
import { Ripple } from '../ui/Ripple';
interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}
export const ProductCard = memo(({
  product,
  index = 0,
  onQuickView
}: ProductCardProps) => {
  const addToCart = useCartStore(state => state.addItem);
  const {
    items: wishlistItems,
    addItem: addToWishlist
  } = useWishlistStore();
  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }, [product, addToCart]);
  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  }, [product, addToWishlist]);
  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }, [product, onQuickView]);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    delay: index * 0.05,
    ease: [0.25, 0.1, 0.25, 1]
  }} className="group relative">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isNew && <Badge variant="success" className="backdrop-blur-sm">
                Nuevo
              </Badge>}
            {product.discount && <Badge variant="error" className="backdrop-blur-sm">
                -{product.discount}%
              </Badge>}
          </div>

          {/* Wishlist Button */}
          <button onClick={handleWishlist} className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110" aria-label={isInWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}>
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`} />
          </button>

          {/* Product Image */}
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <button onClick={handleAddToCart} className="flex-1 relative overflow-hidden py-2.5 px-4 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                <Ripple />
                <ShoppingCart className="inline h-4 w-4 mr-2" />
                Agregar
              </button>
              {onQuickView && <button onClick={handleQuickView} className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors" aria-label="Vista rápida">
                  <Eye className="h-4 w-4 text-gray-700" />
                </button>}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
              {product.name}
            </h3>
          </div>

          {product.category && <p className="text-xs text-gray-500 uppercase tracking-wider">
              {product.category}
            </p>}

          <div className="flex items-center gap-2">
            {product.discount ? <>
                <span className="text-lg font-bold text-rose-600">
                  ${(parseFloat(product.price?.toString() || '0') * (1 - parseFloat(product.discount?.toString() || '0') / 100)).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </span>
              </> : <span className="text-lg font-bold text-gray-900">
                ${parseFloat(product.price?.toString() || '0').toFixed(2)}
              </span>}
          </div>

          {product.rating && <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <svg key={i} className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>)}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviewCount || 0})
              </span>
            </div>}
        </div>
      </motion.div>;
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return prevProps.product.id === nextProps.product.id && prevProps.product.price === nextProps.product.price && prevProps.product.discount === nextProps.product.discount && prevProps.index === nextProps.index;
});
ProductCard.displayName = 'ProductCard';