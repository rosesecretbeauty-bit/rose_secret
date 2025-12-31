import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
interface CrossSellProps {
  currentProduct: Product;
  recommendations?: Product[];
}
export function CrossSell({
  currentProduct,
  recommendations = []
}: CrossSellProps) {
  const addItem = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  // Early return if no recommendations
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    addToast({
      type: 'success',
      message: `${product.name} añadido al carrito`
    });
  };
  const handleAddBundle = () => {
    addItem(currentProduct, 1);
    recommendations.forEach(product => addItem(product, 1));
    addToast({
      type: 'success',
      message: '¡Bundle completo añadido! Ahorra 15%'
    });
  };
  const bundlePrice = recommendations.reduce((sum, p) => sum + p.price, currentProduct.price);
  const bundleDiscount = bundlePrice * 0.15;
  const bundleTotal = bundlePrice - bundleDiscount;
  return <div className="bg-gradient-to-br from-rose-50 to-champagne/20 rounded-lg p-8 border border-rose-100">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl font-medium text-gray-900 mb-2">
              Completa tu Rutina
            </h3>
            <p className="text-gray-600">
              Combina estos productos y ahorra{' '}
              <span className="font-semibold text-rose-600">15%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 line-through">
              ${bundlePrice.toFixed(2)}
            </p>
            <p className="text-2xl font-serif font-bold text-rose-600">
              ${bundleTotal.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 font-medium">
              Ahorras ${bundleDiscount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {recommendations.map((product, index) => <motion.div key={product.id} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: index * 0.1
        }} className="bg-white rounded-lg p-4 border border-gray-100 hover:border-rose-200 transition-colors group">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                {product.name}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </span>
                <button onClick={() => handleAddToCart(product)} className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </motion.div>)}
        </div>

        <Button fullWidth size="lg" onClick={handleAddBundle} className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="mr-2 h-5 w-5" />
          Añadir Bundle Completo - Ahorra 15%
        </Button>
      </motion.div>
    </div>;
}