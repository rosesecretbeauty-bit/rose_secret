import React from 'react';
import { motion } from 'framer-motion';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'glass' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
export function Card({
  className = '',
  hover = false,
  variant = 'default',
  padding = 'none',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white shadow-soft border border-gray-50',
    glass: 'bg-white/70 backdrop-blur-md border border-white/50 shadow-soft',
    outlined: 'bg-white border border-gray-200',
    flat: 'bg-gray-50 border border-transparent'
  };
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
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
    boxShadow: '0 10px 30px -10px rgba(219, 112, 147, 0.2)'
  } : undefined} className={`
        rounded-2xl overflow-hidden
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `} {...props}>
      {children}
    </motion.div>;
}
export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>;
}
export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-serif font-bold text-charcoal-900 ${className}`} {...props}>
      {children}
    </h3>;
}
export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-charcoal-500 mt-1 ${className}`} {...props}>
      {children}
    </p>;
}
export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>;
}
export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>;
}