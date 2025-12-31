import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  const colors = {
    danger: {
      icon: 'text-red-500 bg-red-50',
      button: 'danger' as const
    },
    warning: {
      icon: 'text-amber-500 bg-amber-50',
      button: 'primary' as const
    },
    info: {
      icon: 'text-blue-500 bg-blue-50',
      button: 'primary' as const
    }
  };
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${colors[variant].icon}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{message}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant={colors[variant].button} onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}