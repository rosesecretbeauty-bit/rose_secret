import React from 'react';
import { motion } from 'framer-motion';
interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
}
export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#E11D48',
  // Rose-600
  trackColor = '#F3F4F6',
  // Gray-100
  children,
  showPercentage = false
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value / 100 * circumference;
  return <div className="relative flex items-center justify-center" style={{
    width: size,
    height: size
  }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />

        {/* Progress */}
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} initial={{
        strokeDashoffset: circumference
      }} animate={{
        strokeDashoffset: offset
      }} transition={{
        duration: 1.5,
        ease: 'easeOut'
      }} strokeLinecap="round" />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? children : showPercentage && <span className="text-xl font-bold text-gray-900">
                {Math.round(value)}%
              </span>}
      </div>
    </div>;
}