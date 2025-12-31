import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}
export function SplashScreen({
  onComplete,
  duration = 2000
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  return <AnimatePresence>
      {isVisible && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 0.5
    }} className="fixed inset-0 z-[9999] bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <motion.div initial={{
          scale: 0.5,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }} className="mb-6">
              <Logo size="xl" animated />
            </motion.div>

            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.6
        }}>
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
                Rose Secret
              </h1>
              <p className="text-gray-500 italic text-lg">
                El poder de consentirte
              </p>
            </motion.div>

            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.8,
          duration: 0.4
        }} className="mt-8">
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => <motion.div key={i} className="w-2 h-2 bg-rose-600 rounded-full" animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }} transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }} />)}
              </div>
            </motion.div>
          </div>
        </motion.div>}
    </AnimatePresence>;
}