import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
interface BundleCanvasProps {
  slots: any[];
  onRemove: (index: number) => void;
}
export function BundleCanvas({
  slots,
  onRemove
}: BundleCanvasProps) {
  const maxSlots = 3;
  const filledSlots = slots.length;
  const emptySlots = maxSlots - filledSlots;
  return <div className="flex justify-center gap-4 md:gap-8 py-8">
      {slots.map((product, index) => <motion.div key={`${product.id}-${index}`} initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} className="relative w-24 h-24 md:w-40 md:h-40">
          <button onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md z-10 hover:bg-red-50 hover:text-red-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="w-full h-full rounded-xl overflow-hidden border-2 border-rose-200 shadow-lg bg-white">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-8 left-0 w-full text-center">
            <p className="text-xs font-medium truncate">{product.name}</p>
            <p className="text-xs text-gray-500">${product.price}</p>
          </div>
        </motion.div>)}

      {[...Array(emptySlots)].map((_, index) => <div key={`empty-${index}`} className="w-24 h-24 md:w-40 md:h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-xs font-medium">Add Item</span>
        </div>)}
    </div>;
}