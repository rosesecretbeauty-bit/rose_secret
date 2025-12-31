import React from 'react';
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'champagne';
}
export function Badge({
  className = '',
  variant = 'primary',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary: 'bg-rose-600 text-white border-transparent',
    secondary: 'bg-rose-100 text-rose-800 border-transparent',
    outline: 'text-gray-900 border-gray-200',
    champagne: 'bg-champagne text-rose-900 border-transparent'
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>;
}