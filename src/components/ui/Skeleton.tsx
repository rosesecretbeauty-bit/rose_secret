// ============================================
// Skeleton Loader Component
// ============================================

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Skeleton específicos para componentes comunes
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="rectangular" height={300} className="w-full" />
      <Skeleton variant="text" height={24} width="80%" />
      <Skeleton variant="text" height={20} width="60%" />
      <Skeleton variant="text" height={32} width="40%" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" height={20} width="80%" />
        </td>
      ))}
    </tr>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" height={24} width="40%" />
          <Skeleton variant="text" height={16} width="60%" />
        </div>
        <Skeleton variant="rectangular" height={32} width={100} />
      </div>
      <Skeleton variant="text" height={20} width="30%" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={36} width={120} />
        <Skeleton variant="rectangular" height={36} width={120} />
      </div>
    </div>
  );
}
