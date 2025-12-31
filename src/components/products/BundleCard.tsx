import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discount: number; // Percentage
  image: string;
}
interface BundleCardProps {
  bundle: Bundle;
}
export function BundleCard({
  bundle
}: BundleCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  const totalPrice = bundle.products.reduce((sum, p) => sum + p.price, 0);
  const discountedPrice = totalPrice * (1 - bundle.discount / 100);
  const savings = totalPrice - discountedPrice;
  const handleAddBundle = () => {
    // Add all items to cart
    bundle.products.forEach(product => {
      addItem(product, 1);
    });
    addToast({
      type: 'success',
      message: `¡Pack ${bundle.name} añadido al carrito!`
    });
  };
  return <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-premium-lg transition-all duration-300 group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-rose-600 text-white shadow-lg">
            Ahorra {bundle.discount}%
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
          {bundle.name}
        </h3>
        <p className="text-gray-600 text-sm mb-6">{bundle.description}</p>

        {/* Included Products */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Incluye:
          </p>
          {bundle.products.map(product => <div key={product.id} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                </p>
              </div>
              <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            </div>)}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-green-600 font-medium">
              Ahorras ${savings.toFixed(2)}
            </p>
          </div>
          <Button onClick={handleAddBundle}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Añadir Pack
          </Button>
        </div>
      </div>
    </div>;
}