import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Heart, Share2, Check, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToastStore } from '../../stores/toastStore';
import { Link } from 'react-router-dom';
interface QuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}
export function QuickView({
  product,
  isOpen,
  onClose
}: QuickViewProps) {
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist
  } = useWishlistStore();
  const addToast = useToastStore(state => state.addToast);
  const isWishlisted = isInWishlist(product.id);
  const handleAddToCart = () => {
    addItem(product, quantity);
    addToast({
      type: 'success',
      message: `Added ${product.name} to cart`
    });
    onClose();
  };
  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      addToast({
        type: 'info',
        message: 'Removed from wishlist'
      });
    } else {
      addToWishlist(product);
      addToast({
        type: 'success',
        message: 'Added to wishlist'
      });
    }
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.origin + `/product/${product.id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
        addToast({
          type: 'success',
          message: 'Link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors z-10">
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 bg-gray-50 relative">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              {product.isNew && <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full">
                  New Arrival
                </span>}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {product.brand || 'Rose Secret'}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {product.rating}
                    </span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-2xl font-medium text-gray-900">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </p>
              </div>

              <p className="text-gray-600 mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="mb-6">
                <span className="block text-sm font-medium text-gray-900 mb-3">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-3">
                  {['30ml', '50ml', '100ml'].map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {size}
                    </button>)}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button size="lg" fullWidth onClick={handleAddToCart} className="flex items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Añadir al Carrito
                </Button>

                <div className="flex gap-3">
                  <button onClick={toggleWishlist} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">
                      {isWishlisted ? 'Guardado' : 'Guardar'}
                    </span>
                  </button>

                  <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link to={`/product/${product.id}`} onClick={onClose} className="flex items-center justify-between text-sm font-medium text-gray-900 hover:text-rose-600 transition-colors group">
                  View Full Details
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}