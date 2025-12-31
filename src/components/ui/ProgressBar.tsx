import React from 'react';
import { motion } from 'framer-motion';
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  animated?: boolean;
}
export function ProgressBar({
  progress,
  height = 8,
  color = 'bg-rose-600',
  trackColor = 'bg-gray-200',
  showLabel = false,
  animated = true
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  return <div className="w-full">
      <div className={`relative ${trackColor} rounded-full overflow-hidden`} style={{
      height: `${height}px`
    }}>
        {animated ? <motion.div className={`absolute inset-y-0 left-0 ${color} rounded-full`} initial={{
        width: 0
      }} animate={{
        width: `${clampedProgress}%`
      }} transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }} /> : <div className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-500`} style={{
        width: `${clampedProgress}%`
      }} />}
      </div>
      {showLabel && <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>{Math.round(clampedProgress)}%</span>
          <span>100%</span>
        </div>}
    </div>;
}