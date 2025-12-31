import React from 'react';
import { motion } from 'framer-motion';
import { useRipple } from './Ripple';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'champagne';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const {
    ripples,
    addRipple
  } = useRipple();
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-soft hover:shadow-medium hover:from-rose-500 hover:to-rose-700 focus:ring-rose-500',
    secondary: 'bg-lavender-100 text-lavender-900 hover:bg-lavender-200 shadow-sm hover:shadow-md focus:ring-lavender-500',
    outline: 'border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 focus:ring-rose-500 bg-transparent',
    ghost: 'text-charcoal-600 hover:bg-rose-50 hover:text-rose-700 focus:ring-rose-500',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 focus:ring-red-500',
    champagne: 'bg-gradient-to-r from-champagne-300 to-champagne-500 text-white shadow-soft hover:shadow-medium hover:from-champagne-400 hover:to-champagne-600 focus:ring-champagne-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
    icon: 'p-2.5'
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      addRipple(e);
      onClick?.(e);
    }
  };
  return <motion.button whileHover={{
    scale: disabled || isLoading ? 1 : 1.02
  }} whileTap={{
    scale: disabled || isLoading ? 1 : 0.98
  }} className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `} disabled={disabled || isLoading} onClick={handleClick} {...props}>
      {/* Ripple Effect */}
      <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <AnimatePresence>
          {ripples.map(ripple => <motion.span key={ripple.id} className="absolute rounded-full" style={{
          left: ripple.x,
          top: ripple.y,
          width: ripple.size,
          height: ripple.size,
          backgroundColor: variant === 'outline' || variant === 'ghost' ? 'rgba(219, 112, 147, 0.1)' : 'rgba(255, 255, 255, 0.3)'
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

      {/* Content */}
      {isLoading ? <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {children && <span>Cargando...</span>}
        </> : <>
          {leftIcon}
          {children}
          {rightIcon}
        </>}
    </motion.button>;
}