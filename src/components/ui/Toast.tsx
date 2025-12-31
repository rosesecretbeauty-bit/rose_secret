import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '../../stores/toastStore';
function ToastItem({
  toast
}: {
  toast: ToastType;
}) {
  const removeToast = useToastStore(state => state.removeToast);
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };
  return <motion.div initial={{
    opacity: 0,
    y: 50,
    scale: 0.3
  }} animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2
    }
  }} className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm ${bgColors[toast.type]} max-w-md w-full`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900">
        {toast.message}
      </p>
      <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </motion.div>;
}
export function ToastContainer() {
  const toasts = useToastStore(state => state.toasts);
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => <ToastItem key={toast.id} toast={toast} />)}
      </AnimatePresence>
    </div>;
}