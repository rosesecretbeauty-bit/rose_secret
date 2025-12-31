import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Check, Minus, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
import { Button } from '../ui/Button';
interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ProductComparison({
  isOpen,
  onClose
}: ProductComparisonProps) {
  const {
    items,
    removeItem,
    clearAll
  } = useComparisonStore();
  const addToCart = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  const handleAddToCart = (product: (typeof items)[0]) => {
    addToCart(product, 1);
    addToast({
      type: 'success',
      message: '¡Añadido al carrito!'
    });
  };
  const features = [{
    key: 'price',
    label: 'Precio'
  }, {
    key: 'rating',
    label: 'Valoración'
  }, {
    key: 'category',
    label: 'Categoría'
  }, {
    key: 'brand',
    label: 'Marca'
  }, {
    key: 'intensity',
    label: 'Intensidad'
  }, {
    key: 'longevity',
    label: 'Duración'
  }];
  const getValue = (product: (typeof items)[0], key: string) => {
    switch (key) {
      case 'price':
        return `$${parseFloat(product.price?.toString() || '0').toFixed(2)}`;
      case 'rating':
        return product.rating.toString();
      case 'category':
        return product.category;
      case 'brand':
        return product.brand || 'Rose Secret';
      case 'intensity':
        return product.intensity || '-';
      case 'longevity':
        return product.longevity || '-';
      default:
        return '-';
    }
  };
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
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
      }} className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Scale className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">
                    Comparar Productos
                  </h2>
                  <p className="text-sm text-gray-500">
                    {items.length} de 3 productos seleccionados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && <button onClick={clearAll} className="px-4 py-2 text-sm text-gray-600 hover:text-rose-600 transition-colors">
                    Limpiar todo
                  </button>}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-x-auto">
              {items.length === 0 ? <div className="text-center py-12">
                  <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay productos para comparar
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Añade productos desde la tienda para compararlos
                  </p>
                  <Link to="/shop" onClick={onClose}>
                    <Button>Ir a la tienda</Button>
                  </Link>
                </div> : <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 w-40"></th>
                      {items.map(product => <th key={product.id} className="p-4 min-w-[200px]">
                          <div className="relative">
                            <button onClick={() => removeItem(product.id)} className="absolute -top-2 -right-2 p-1 bg-gray-100 hover:bg-red-100 rounded-full transition-colors">
                              <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </button>
                            <Link to={`/product/${product.id}`} onClick={onClose}>
                              <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                              </div>
                              <h3 className="font-semibold text-gray-900 hover:text-rose-600 transition-colors line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>
                          </div>
                        </th>)}
                      {/* Empty slots */}
                      {[...Array(3 - items.length)].map((_, idx) => <th key={`empty-${idx}`} className="p-4 min-w-[200px]">
                          <Link to="/shop" onClick={onClose} className="block aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50/50 transition-colors">
                            <span className="text-gray-400 text-sm">
                              + Añadir producto
                            </span>
                          </Link>
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, idx) => <tr key={feature.key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-4 font-medium text-gray-700">
                          {feature.label}
                        </td>
                        {items.map(product => <td key={product.id} className="p-4 text-center">
                            {feature.key === 'rating' ? <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{getValue(product, feature.key)}</span>
                              </div> : <span className={feature.key === 'price' ? 'font-bold text-rose-600' : ''}>
                                {getValue(product, feature.key)}
                              </span>}
                          </td>)}
                        {[...Array(3 - items.length)].map((_, idx) => <td key={`empty-${idx}`} className="p-4 text-center text-gray-300">
                            <Minus className="h-4 w-4 mx-auto" />
                          </td>)}
                      </tr>)}
                    {/* Add to Cart row */}
                    <tr>
                      <td className="p-4"></td>
                      {items.map(product => <td key={product.id} className="p-4">
                          <Button onClick={() => handleAddToCart(product)} className="w-full">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Añadir
                          </Button>
                        </td>)}
                    </tr>
                  </tbody>
                </table>}
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}