import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  const sizeClasses = {
    sm: 'max-w-xs sm:max-w-md',
    md: 'max-w-sm sm:max-w-lg md:max-w-xl',
    lg: 'max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl',
    xl: 'max-w-lg sm:max-w-4xl md:max-w-5xl lg:max-w-6xl',
    full: 'max-w-full mx-2 sm:mx-4 md:mx-6 lg:mx-8'
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-serif font-medium text-gray-900 dark:text-white pr-2 sm:pr-4 break-words flex-1">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}