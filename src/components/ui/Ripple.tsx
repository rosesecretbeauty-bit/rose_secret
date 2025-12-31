import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface RippleProps {
  color?: string;
  duration?: number;
}
interface RippleItem {
  x: number;
  y: number;
  size: number;
  id: number;
}
export function useRipple() {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple: RippleItem = {
      x,
      y,
      size,
      id: Date.now()
    };
    setRipples(prev => [...prev, newRipple]);
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };
  return {
    ripples,
    addRipple
  };
}
export function Ripple({
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 600
}: RippleProps & {
  ripples: RippleItem[];
}) {
  return <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      <AnimatePresence>
        {/* Ripples will be rendered by the parent */}
      </AnimatePresence>
    </span>;
}
interface RippleContainerProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
export function RippleContainer({
  children,
  color = 'rgba(255, 255, 255, 0.5)',
  className = '',
  onClick
}: RippleContainerProps) {
  const {
    ripples,
    addRipple
  } = useRipple();
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    addRipple(e);
    onClick?.(e);
  };
  return <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <AnimatePresence>
          {ripples.map(ripple => <motion.span key={ripple.id} className="absolute rounded-full" style={{
          left: ripple.x,
          top: ripple.y,
          width: ripple.size,
          height: ripple.size,
          backgroundColor: color
        }} initial={{
          scale: 0,
          opacity: 1
        }} animate={{
          scale: 2,
          opacity: 0
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.6,
          ease: 'easeOut'
        }} />)}
        </AnimatePresence>
      </span>
    </div>;
}