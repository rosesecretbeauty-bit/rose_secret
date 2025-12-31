import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, Tag } from 'lucide-react';
import { getProducts } from '../api/products';
import { ProductGrid } from '../components/products/ProductGrid';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export function SalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSaleProducts() {
      try {
        setIsLoading(true);
        // Obtener todos los productos y filtrar los que tienen descuento
        const data = await getProducts({ limit: 100 });
        // Transform API products to match frontend Product type
        const transformedProducts = data.products.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          images: p.image_url ? [p.image_url] : [],
          rating: p.rating || 0,
          reviews: p.reviews_count || 0,
          isNew: p.is_new || false,
          isBestSeller: p.is_bestseller || false,
          stock: p.stock || 0,
          discount: p.discount_percentage || (p.original_price && p.price < p.original_price 
            ? Math.round(((p.original_price - p.price) / p.original_price) * 100) 
            : 0)
        }));
        // Filtrar productos con descuento
        const productsWithDiscount = transformedProducts.filter(p => p.discount && p.discount > 0);
        setSaleProducts(productsWithDiscount);
      } catch (error) {
        console.error('Error loading sale products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSaleProducts();
  }, []);
  if (isLoading) {
    return <PremiumLoader fullScreen text="Cargando ofertas..." />;
  }

  return <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-rose-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container-custom text-center relative z-10">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="inline-block p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Percent className="h-8 w-8 text-rose-200" />
          </motion.div>
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Exclusive Offers
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-rose-100 max-w-2xl mx-auto text-lg">
            Limited time opportunities on selected luxury items. Indulge in
            premium beauty for less.
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-12">
        {saleProducts.length > 0 ? <ProductGrid products={saleProducts} /> : <div className="text-center py-20">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              No active sales
            </h3>
            <p className="text-gray-500">
              Check back later for exclusive offers.
            </p>
          </div>}
      </div>
    </div>;
}