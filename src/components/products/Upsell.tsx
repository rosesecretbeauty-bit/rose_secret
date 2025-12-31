import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
interface UpsellProps {
  currentProduct: Product;
  premiumProduct: Product;
  onSelect: (product: Product) => void;
}
export function Upsell({
  currentProduct,
  premiumProduct,
  onSelect
}: UpsellProps) {
  const priceDiff = premiumProduct.price - currentProduct.price;
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="bg-gradient-to-br from-champagne/30 via-rose-50/50 to-champagne/30 rounded-xl p-6 border-2 border-champagne/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-champagne/20 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="champagne">Upgrade Premium</Badge>
              <TrendingUp className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="font-serif text-xl font-medium text-gray-900 mb-1">
              Mejora a la Versión Premium
            </h3>
            <p className="text-sm text-gray-600">
              Experimenta la máxima calidad con ingredientes exclusivos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Product */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Actual
            </p>
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <img src={currentProduct.images[0]} alt={currentProduct.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
              {currentProduct.name}
            </h4>
            <p className="text-lg font-serif font-bold text-gray-900">
              ${parseFloat(currentProduct.price?.toString() || '0').toFixed(2)}
            </p>
          </div>

          {/* Premium Product */}
          <div className="bg-gradient-to-br from-white to-champagne/30 backdrop-blur-sm rounded-lg p-4 border-2 border-rose-300 relative">
            <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Premium
            </div>
            <p className="text-xs text-rose-600 mb-2 uppercase tracking-wide font-semibold">
              Recomendado
            </p>
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden ring-2 ring-rose-300">
              <img src={premiumProduct.images[0]} alt={premiumProduct.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
              {premiumProduct.name}
            </h4>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-serif font-bold text-rose-600">
                ${parseFloat(premiumProduct.price?.toString() || '0').toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">+${parseFloat(priceDiff?.toString() || '0').toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-medium text-sm text-gray-900 mb-3">
            Beneficios Premium:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 mt-0.5">✓</span>
              <span>Ingredientes de origen orgánico certificado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 mt-0.5">✓</span>
              <span>Concentración 2x más potente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 mt-0.5">✓</span>
              <span>Packaging de lujo con aplicador premium</span>
            </li>
          </ul>
        </div>

        <Button fullWidth size="lg" onClick={() => onSelect(premiumProduct)} className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-600 hover:from-rose-700 hover:via-rose-800 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <Sparkles className="mr-2 h-5 w-5" />
          Cambiar a Premium (+${priceDiff.toFixed(2)})
        </Button>
      </div>
    </motion.div>;
}