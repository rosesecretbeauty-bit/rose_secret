import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isDeleting?: boolean;
}
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  return <AnimatePresence>
      {isOpen && <>
          {/* Overlay */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-md w-full shadow-premium-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {title}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 break-words">
                  {message}
                </p>
                {itemName && (
                  <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-300 break-words">
                      {itemName}
                    </p>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={onClose} 
                  disabled={isDeleting}
                  className="text-xs sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  fullWidth 
                  onClick={onConfirm} 
                  isLoading={isDeleting} 
                  className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}