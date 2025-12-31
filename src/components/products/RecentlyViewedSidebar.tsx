import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, History } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
interface RecentlyViewedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
export function RecentlyViewedSidebar({
  isOpen,
  onClose
}: RecentlyViewedSidebarProps) {
  const {
    products,
    clearAll
  } = useRecentlyViewed();
  const addItem = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    addToast({
      type: 'success',
      message: 'Added to cart'
    });
  };
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />

          {/* Sidebar */}
          <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-rose-600" />
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Recently Viewed
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {products.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <History className="h-12 w-12 mb-4 opacity-20" />
                  <p>No recently viewed products</p>
                  <Button variant="outline" className="mt-4" onClick={onClose}>
                    Start Browsing
                  </Button>
                </div> : products.map(product => <motion.div key={product.id} layout initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-rose-200 hover:shadow-sm transition-all bg-white">
                    <Link to={`/product/${product.id}`} onClick={onClose} className="shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${product.id}`} onClick={onClose}>
                          <h3 className="font-medium text-gray-900 truncate hover:text-rose-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-rose-600 font-bold text-sm">
                          ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                        </p>
                      </div>
                      <button onClick={() => handleAddToCart(product)} className="text-xs font-medium text-gray-600 hover:text-rose-600 flex items-center gap-1 transition-colors mt-2">
                        <ShoppingBag className="h-3 w-3" /> Añadir al Carrito
                      </button>
                    </div>
                  </motion.div>)}
            </div>

            {products.length > 0 && <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button variant="outline" fullWidth onClick={clearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear History
                </Button>
              </div>}
          </motion.div>
        </>}
    </AnimatePresence>;
}