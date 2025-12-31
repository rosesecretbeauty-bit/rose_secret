import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}
export function PullToRefresh({
  onRefresh,
  children
}: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();
  const threshold = 80;
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (startY > 0 && window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;
        if (distance > 0) {
          // Add resistance
          setPullDistance(Math.min(distance * 0.5, 150));
        }
      }
    };
    const handleTouchEnd = async () => {
      if (pullDistance > threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setStartY(0);
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, onRefresh]);
  return <div className="relative min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none" style={{
      height: pullDistance
    }}>
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
          <RefreshCw className={`w-6 h-6 text-rose-600 ${isRefreshing ? 'animate-spin' : ''}`} style={{
          transform: `rotate(${pullDistance * 2}deg)`
        }} />
        </div>
      </motion.div>
      <motion.div animate={{
      y: isRefreshing ? threshold : 0
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30
    }}>
        {children}
      </motion.div>
    </div>;
}