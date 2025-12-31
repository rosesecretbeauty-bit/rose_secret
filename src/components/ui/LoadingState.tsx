import React from 'react';
import { motion } from 'framer-motion';
export function LoadingSpinner() {
  return <div className="flex items-center justify-center p-12">
      <motion.div className="relative w-16 h-16" animate={{
      rotate: 360
    }} transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }}>
        <div className="absolute inset-0 border-4 border-rose-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-rose-600 rounded-full" />
      </motion.div>
    </div>;
}
export function ProductCardSkeleton() {
  return <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
    </div>;
}
export function PageLoader() {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <motion.div animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360]
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }} className="mb-6">
          <div className="text-5xl font-serif font-bold text-rose-600">RS</div>
        </motion.div>
        <motion.div animate={{
        opacity: [0.5, 1, 0.5]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className="text-sm text-gray-500 font-medium tracking-wider">
          Cargando experiencia premium...
        </motion.div>
      </div>
    </motion.div>;
}