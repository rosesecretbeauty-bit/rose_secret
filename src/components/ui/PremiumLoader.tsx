import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
interface PremiumLoaderProps {
  fullScreen?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}
export function PremiumLoader({
  fullScreen = false,
  text,
  size = 'md'
}: PremiumLoaderProps) {
  const sizeConfig = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  const loader = <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div animate={{
        rotate: 360
      }} transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }} className={`${sizeConfig[size]} border-4 border-gray-200 border-t-rose-600 rounded-full`} />
        <motion.div animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className={`absolute inset-0 ${sizeConfig[size]} border-4 border-rose-200 rounded-full`} />
      </div>
      {text && <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-sm font-medium text-gray-600">
          {text}
        </motion.p>}
    </div>;
  if (fullScreen) {
    return <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>;
  }
  return loader;
}