import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Sparkles } from 'lucide-react';
interface FreeShippingProgressProps {
  current: number;
  threshold: number;
}
export function FreeShippingProgress({
  current,
  threshold
}: FreeShippingProgressProps) {
  const remaining = Math.max(0, threshold - current);
  const progress = Math.min(100, current / threshold * 100);
  const isComplete = current >= threshold;
  return <div className="space-y-3">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full" initial={{
        width: 0
      }} animate={{
        width: `${progress}%`
      }} transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }} />

        {/* Animated shimmer */}
        {!isComplete && <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{
        x: ['-100%', '200%']
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }} />}
      </div>

      {/* Message */}
      <div className="flex items-center justify-between text-sm">
        {isComplete ? <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} className="flex items-center gap-2 text-green-600 font-medium">
            <Sparkles className="h-4 w-4" />
            <span>¡Envío gratuito desbloqueado!</span>
          </motion.div> : <div className="flex items-center gap-2 text-gray-600">
            <Truck className="h-4 w-4" />
            <span>
              Añade{' '}
              <span className="font-bold text-rose-600">
                ${remaining.toFixed(2)}
              </span>{' '}
              más para envío gratis
            </span>
          </div>}
      </div>
    </div>;
}