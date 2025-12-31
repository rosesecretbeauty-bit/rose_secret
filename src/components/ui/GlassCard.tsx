import React from 'react';
import { motion } from 'framer-motion';
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  blur?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  glow?: boolean;
}
export function GlassCard({
  className = '',
  hover = false,
  blur = 'sm',
  border = true,
  glow = false,
  children,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} whileHover={hover ? {
    y: -4,
    boxShadow: glow ? '0 20px 40px -10px rgba(219, 112, 147, 0.3)' : '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
  } : undefined} className={`
        rounded-2xl overflow-hidden
        bg-white/60 ${blurClasses[blur]}
        ${border ? 'border border-white/50' : ''}
        shadow-sm
        transition-all duration-300
        ${className}
      `} {...props}>
      {children}
    </motion.div>;
}