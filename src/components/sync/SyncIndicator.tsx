import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useDeviceSync } from '../../hooks/useDeviceSync';
export function SyncIndicator() {
  const {
    status,
    isOnline
  } = useDeviceSync();
  const statusConfig = {
    synced: {
      icon: Check,
      color: 'text-green-500',
      bg: 'bg-green-50',
      text: 'Sincronizado'
    },
    syncing: {
      icon: RefreshCw,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      text: 'Sincronizando...'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      text: 'Error de sincronización'
    },
    offline: {
      icon: CloudOff,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      text: 'Sin conexión'
    }
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  // Only show when syncing, error, or offline
  const shouldShow = status !== 'synced';
  return <AnimatePresence>
      {shouldShow && <motion.div initial={{
      opacity: 0,
      y: 50
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: 50
    }} className="fixed bottom-24 md:bottom-6 right-6 z-40">
          <div className={`${config.bg} ${config.color} px-4 py-2 rounded-full shadow-premium-lg flex items-center gap-2 text-sm font-medium`}>
            <Icon className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{config.text}</span>
          </div>
        </motion.div>}
    </AnimatePresence>;
}