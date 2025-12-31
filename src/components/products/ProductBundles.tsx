import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { getProducts } from '../../api/products';
import { Product } from '../../types';
import { BundleCard } from './BundleCard';

export function ProductBundles() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({ limit: 10 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Create bundles from real products
  const bundles = products.length >= 5 ? [{
    id: 'b1',
    name: 'The Signature Collection',
    description: 'Nuestros tres best-sellers en un set exclusivo para regalar o disfrutar.',
    products: products.slice(0, 3),
    discount: 15,
    image: products[0]?.images?.[0] || ''
  }, {
    id: 'b2',
    name: 'Morning Routine Kit',
    description: 'Empieza tu día con energía y frescura con este kit esencial.',
    products: products.slice(3, 5),
    discount: 10,
    image: products[3]?.images?.[0] || ''
  }] : [];

  if (isLoading) {
    return null; // Dejar que el componente padre maneje el loading
  }

  if (bundles.length === 0) {
    return null; // No mostrar si no hay productos suficientes
  }

  return <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-3 block">
            Curated Sets
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Packs Exclusivos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras combinaciones perfectas diseñadas para potenciar
            tu experiencia y ahorrar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {bundles.map((bundle, index) => <motion.div key={bundle.id} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.2
        }}>
              <BundleCard bundle={bundle} />
            </motion.div>)}
        </div>
      </div>
    </section>;
}