import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Badge } from '../components/ui/Badge';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export function PreOrdersPage() {
  const [preOrderProducts, setPreOrderProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({ limit: 4 });
        setPreOrderProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <PremiumLoader />
    </div>;
  }
  return <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="container-custom text-center relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="inline-block p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Clock className="h-8 w-8 text-indigo-200" />
          </motion.div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Pre-Order Exclusives
          </h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
            Secure your access to upcoming launches before anyone else. Reserve
            now, ship later.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {preOrderProducts.map((product, index) => <div key={product.id} className="relative">
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-indigo-600 text-white border-none shadow-lg">
                  Ships in 2 weeks
                </Badge>
              </div>
              <ProductCard product={product} />
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Release Date: Oct 15, 2024</span>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}