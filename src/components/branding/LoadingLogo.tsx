import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
export function LoadingLogo({
  size = 'md',
  text
}: LoadingLogoProps) {
  return <div className="flex flex-col items-center justify-center gap-4">
      <motion.div animate={{
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }}>
        <Logo size={size} />
      </motion.div>

      {text && <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-sm text-gray-500 font-medium">
          {text}
        </motion.p>}

      <div className="flex gap-2">
        {[0, 1, 2].map(i => <motion.div key={i} className="w-2 h-2 bg-rose-600 rounded-full" animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 1, 0.5]
      }} transition={{
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2
      }} />)}
      </div>
    </div>;
}