import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}
export function Confetti({
  isActive,
  duration = 3000,
  particleCount = 50
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
  }>>([]);
  useEffect(() => {
    if (isActive) {
      const colors = ['#E11D48', '#DB7093', '#F59E0B', '#9333EA', '#FFB6C1'];
      const newParticles = Array.from({
        length: particleCount
      }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, particleCount]);
  return <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => <motion.div key={particle.id} initial={{
        x: `${particle.x}vw`,
        y: '-10vh',
        rotate: 0,
        opacity: 1
      }} animate={{
        y: '110vh',
        rotate: particle.rotation + 720,
        opacity: [1, 1, 0]
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 3 + Math.random() * 2,
        ease: 'easeIn'
      }} className="absolute w-3 h-3 rounded-sm" style={{
        backgroundColor: particle.color,
        left: 0,
        top: 0
      }} />)}
      </AnimatePresence>
    </div>;
}