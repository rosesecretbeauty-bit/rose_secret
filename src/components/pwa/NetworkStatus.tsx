import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';
// Network Status Indicator - Shows online/offline status
// Provides feedback when connection is lost or restored
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setJustReconnected(true);
      // Hide "back online" message after 3 seconds
      setTimeout(() => {
        setShowStatus(false);
        setJustReconnected(false);
      }, 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      setJustReconnected(false);
    };
    // Listen for custom events from pwaConfig
    const handleNetworkStatus = (e: CustomEvent) => {
      if (e.detail.online) {
        handleOnline();
      } else {
        handleOffline();
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-status', handleNetworkStatus as EventListener);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-status', handleNetworkStatus as EventListener);
    };
  }, []);
  // Don't show if online and not just reconnected
  if (isOnline && !showStatus) {
    return null;
  }
  return <AnimatePresence>
      {showStatus && <motion.div initial={{
      opacity: 0,
      y: -50
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: -50
    }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className={`
            px-6 py-3 rounded-full shadow-premium backdrop-blur-xl flex items-center gap-3
            ${isOnline ? 'bg-green-500/90 text-white' : 'bg-gray-900/90 text-white'}
          `}>
            {isOnline ? <>
                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}>
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
                <span className="font-semibold text-sm">
                  {justReconnected ? '¡Conexión restaurada!' : 'En línea'}
                </span>
              </> : <>
                <WifiOff className="w-5 h-5 animate-pulse" />
                <div>
                  <p className="font-semibold text-sm">Sin conexión</p>
                  <p className="text-xs text-white/80">Modo offline activado</p>
                </div>
              </>}
          </div>
        </motion.div>}
    </AnimatePresence>;
}