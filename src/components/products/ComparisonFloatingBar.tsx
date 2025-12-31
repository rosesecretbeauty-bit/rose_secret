import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
export function ComparisonFloatingBar() {
  const {
    items,
    removeItem,
    clearAll
  } = useComparisonStore();
  if (items.length === 0) return null;
  return <AnimatePresence>
      <motion.div initial={{
      y: 100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 100,
      opacity: 0
    }} className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-premium-lg border border-gray-200/50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 px-1">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Scale className="h-5 w-5 text-rose-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Comparar
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {items.length} de 3
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {items.map(product => <motion.div key={product.id} layout initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} exit={{
              scale: 0.8,
              opacity: 0
            }} className="relative group">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => removeItem(product.id)} className="absolute -top-2 -right-2 p-1 bg-white text-red-500 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 scale-75 hover:scale-100">
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>)}

              {/* Empty slots */}
              {[...Array(3 - items.length)].map((_, idx) => <div key={`empty-${idx}`} className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
                  <span className="text-xs text-gray-400 font-medium">
                    {idx + 1 + items.length}
                  </span>
                </div>)}
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <Link to="/comparison">
              <Button size="sm" className="shadow-lg shadow-rose-500/20 whitespace-nowrap">
                Ver Tabla <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>

            <button onClick={clearAll} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Limpiar todo">
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>;
}