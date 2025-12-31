import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
interface LookCardProps {
  look: {
    id: string;
    image: string;
    title: string;
    products: any[];
  };
}
export function LookCard({
  look
}: LookCardProps) {
  return <div className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <img src={look.image} alt={look.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

        {/* Hotspots */}
        {look.products.map((product, idx) => <motion.button key={product.id} initial={{
        scale: 0
      }} whileInView={{
        scale: 1
      }} className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 hover:bg-rose-600 hover:text-white transition-colors z-10" style={{
        top: `${20 + idx * 30}%`,
        left: `${30 + idx * 20}%`
      }}>
            <Plus className="h-4 w-4" />
          </motion.button>)}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button fullWidth className="bg-white text-gray-900 hover:bg-gray-100">
            Shop This Look
          </Button>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-serif font-bold text-gray-900">
        {look.title}
      </h3>
      <p className="text-sm text-gray-500">{look.products.length} Items</p>
    </div>;
}