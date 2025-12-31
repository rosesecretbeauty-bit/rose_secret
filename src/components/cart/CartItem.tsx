import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { CartItem as CartItemType } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useSwipeable } from 'react-swipeable';
interface CartItemProps {
  item: CartItemType;
}
export function CartItem({
  item
}: CartItemProps) {
  const {
    updateQuantity,
    removeItem
  } = useCartStore();
  const controls = useAnimation();
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      controls.start({
        x: -100,
        opacity: 0
      }).then(() => {
        removeItem(item.id);
      });
    },
    trackMouse: true,
    preventScrollOnSwipe: true
  });
  return <motion.div {...handlers} animate={controls} layout initial={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -100
  }} className="flex py-6 border-b border-gray-100 last:border-0 relative bg-white">
      {/* Swipe background action (visible when swiping) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center text-white -z-10">
        <Trash2 className="w-6 h-6" />
      </div>

      {/* Image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover object-center" />
      </div>

      {/* Content */}
      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3 className="font-serif line-clamp-1">{item.name}</h3>
            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
          {(item.selectedColor || item.selectedSize) && <div className="mt-1 flex gap-2 text-xs text-gray-500">
              {item.selectedColor && <span className="flex items-center">
                  Color:{' '}
                  <span className="ml-1 inline-block h-3 w-3 rounded-full border border-gray-200" style={{
              backgroundColor: item.selectedColor
            }} />
                </span>}
              {item.selectedSize && <span>Talla: {item.selectedSize}</span>}
            </div>}
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border border-gray-200 rounded-sm">
            <button type="button" className="p-1 hover:bg-gray-100 text-gray-600 transition-colors" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Disminuir cantidad">
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 min-w-[1.5rem] text-center font-medium">
              {item.quantity}
            </span>
            <button type="button" className="p-1 hover:bg-gray-100 text-gray-600 transition-colors" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar cantidad">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button type="button" className="font-medium text-rose-600 hover:text-rose-500 flex items-center transition-colors" onClick={() => removeItem(item.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </button>
        </div>
      </div>
    </motion.div>;
}