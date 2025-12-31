import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;
  const showTooltip = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };
  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  };
  return <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      <AnimatePresence>
        {isVisible && <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} transition={{
        duration: 0.15
      }} className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}>
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
              {content}
              <div className={`absolute ${arrowClasses[position]} w-0 h-0 border-4 border-transparent`} />
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}