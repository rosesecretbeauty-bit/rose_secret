import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { Button } from '../ui/Button';
import { FreeShippingProgress } from './FreeShippingProgress';
export function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateQuantity,
    getCartTotal
  } = useCartStore();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 300], [1, 0]);
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 150) {
      toggleCart();
    }
  };
  return <AnimatePresence>
      {isOpen && <>
          {/* Overlay */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={toggleCart} style={{
        opacity
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

          {/* Drawer */}
          <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} drag="x" dragConstraints={{
        left: 0,
        right: 0
      }} dragElastic={{
        left: 0,
        right: 0.5
      }} onDragEnd={handleDragEnd} style={{
        x
      }} transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300
      }} className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white shadow-premium-lg z-50 flex flex-col touch-pan-y">
            {/* Drag Indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
              <div className="h-20 w-1 bg-white/50 rounded-l-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">
                    Tu Carrito
                  </h2>
                  <p className="text-sm text-gray-500">
                    {items.length}{' '}
                    {items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <motion.button whileHover={{
            scale: 1.1,
            rotate: 90
          }} whileTap={{
            scale: 0.9
          }} onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-champagne/20 border-b border-gray-100">
                <FreeShippingProgress current={getCartTotal()} threshold={150} />
              </div>}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Descubre nuestra colección y añade productos
                  </p>
                  <Link to="/shop" onClick={toggleCart}>
                    <Button>
                      Explorar Productos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div> : <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => <motion.div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20,
                height: 0
              }} transition={{
                delay: index * 0.05
              }} layout className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                        {/* Image */}
                        <Link to={`/product/${item.id}`} onClick={toggleCart} className="flex-shrink-0">
                          <div className="h-24 w-24 bg-white rounded-lg overflow-hidden">
                            <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.id}`} onClick={toggleCart} className="font-medium text-gray-900 hover:text-rose-600 transition-colors line-clamp-2 mb-1">
                            {item.name}
                          </Link>

                          {(item.selectedColor || item.selectedSize) && <div className="flex gap-2 text-xs text-gray-500 mb-2">
                              {item.selectedColor && <span className="flex items-center gap-1">
                                  <span className="h-3 w-3 rounded-full border border-gray-300" style={{
                        backgroundColor: item.selectedColor
                      }} />
                                </span>}
                              {item.selectedSize && <span>{item.selectedSize}</span>}
                            </div>}

                          <div className="flex items-center justify-between">
                            <p className="font-serif font-bold text-rose-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                <motion.button whileTap={{
                          scale: 0.9
                        }} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 transition-colors">
                                  <Minus className="h-3 w-3 text-gray-600" />
                                </motion.button>
                                <span className="px-3 text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <motion.button whileTap={{
                          scale: 0.9
                        }} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 transition-colors">
                                  <Plus className="h-3 w-3 text-gray-600" />
                                </motion.button>
                              </div>

                              <motion.button whileHover={{
                        scale: 1.1
                      }} whileTap={{
                        scale: 0.9
                      }} onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                </div>}
            </div>

            {/* Footer */}
            {items.length > 0 && <div className="border-t border-gray-100 p-6 space-y-4 bg-gradient-to-t from-gray-50 to-white">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-serif text-lg font-bold text-gray-900">
                    Total
                  </span>
                  <span className="font-serif text-2xl font-bold text-rose-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link to="/checkout" onClick={toggleCart}>
                    <Button fullWidth size="lg">
                      Finalizar Compra
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/shop" onClick={toggleCart}>
                    <Button fullWidth size="lg" variant="outline">
                      Seguir Comprando
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-gray-500">
                  Envío gratuito en pedidos superiores a $150
                </p>
              </div>}
          </motion.div>
        </>}
    </AnimatePresence>;
}