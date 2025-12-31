import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Check } from 'lucide-react';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { getProductImage } from '../utils/productUtils';

export function BundleBuilderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const addToast = useToastStore(state => state.addToast);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({ limit: 20 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const toggleProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      if (selectedProducts.length >= 3) {
        addToast({
          type: 'warning',
          message: 'Solo puedes seleccionar 3 productos para el bundle.'
        });
        return;
      }
      setSelectedProducts([...selectedProducts, id]);
    }
  };
  const handleAddToCart = () => {
    selectedProducts.forEach(id => {
      const product = products.find(p => p.id.toString() === id);
      if (product) addItem(product);
    });
    addToast({
      type: 'success',
      message: 'Bundle agregado al carrito con 15% de descuento!'
    });
    setSelectedProducts([]);
  };
  const selectedItemsData = products.filter(p => selectedProducts.includes(p.id.toString()));
  const totalPrice = selectedItemsData.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price.toString())), 0);
  const discountedPrice = totalPrice * 0.85;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <PremiumLoader />
    </div>;
  }
  return <div className="bg-gray-50 min-h-screen pb-32">
      <div className="bg-rose-900 text-white py-12 mb-8">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">
            Build Your Custom Bundle
          </h1>
          <p className="text-rose-100">
            Select 3 items and save 15% on your entire set.
          </p>
        </div>
      </div>

      <div className="container-custom grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.slice(0, 8).map(product => {
          const isSelected = selectedProducts.includes(product.id.toString());
          const productImage = getProductImage(product.images);
          const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price.toString());
          return <motion.div key={product.id} whileHover={{
            y: -5
          }} className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-rose-500 shadow-lg' : 'border-transparent shadow-sm'}`} onClick={() => toggleProduct(product.id.toString())}>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                  <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                  {isSelected && <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                      <div className="bg-rose-500 text-white p-2 rounded-full">
                        <Check className="h-6 w-6" />
                      </div>
                    </div>}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-rose-600 font-medium">
                  ${productPrice.toFixed(2)}
                </p>
              </motion.div>;
        })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <GlassCard className="p-6">
              <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-600" />
                Your Bundle
              </h3>

              <div className="space-y-4 mb-6">
                {[0, 1, 2].map(index => {
                const item = selectedItemsData[index];
                const itemImage = item ? getProductImage(item.images) : '/placeholder-product.png';
                const itemPrice = item ? (typeof item.price === 'number' ? item.price : parseFloat(item.price.toString())) : 0;
                return <div key={index} className="h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {item ? <div className="flex items-center gap-3 w-full px-3">
                          <img src={itemImage} alt="" className="h-10 w-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${itemPrice.toFixed(2)}
                            </p>
                          </div>
                          <button onClick={e => {
                      e.stopPropagation();
                      toggleProduct(item.id.toString());
                    }} className="text-gray-400 hover:text-red-500">
                            <Plus className="h-4 w-4 rotate-45" />
                          </button>
                        </div> : <div className="flex items-center text-gray-400 text-sm">
                          <Plus className="h-4 w-4 mr-2" /> Seleccionar Item{' '}
                          {index + 1}
                        </div>}
                    </div>;
              })}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between text-gray-500 mb-2">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium mb-2">
                  <span>Bundle Discount (15%)</span>
                  <span>-${(totalPrice - discountedPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                  <span>Total</span>
                  <span>${discountedPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button fullWidth size="lg" disabled={selectedProducts.length !== 3} onClick={handleAddToCart}>
                Add Bundle to Cart
              </Button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>;
}