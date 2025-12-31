import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { promptInstall, isPWA } from '../../utils/pwaConfig';
// PWA Install Prompt - Encourages users to install the app
// Shows benefits and provides one-click installation
export function PWAInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  useEffect(() => {
    // Check if already installed
    if (isPWA()) {
      return;
    }
    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }
    // Listen for installable event
    const handleInstallable = () => {
      setIsInstallable(true);
    };
    window.addEventListener('pwa-installable', handleInstallable);
    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);
  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await promptInstall();
    if (accepted) {
      setIsInstallable(false);
    } else {
      setIsInstalling(false);
    }
  };
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };
  if (!isInstallable || isDismissed || isPWA()) {
    return null;
  }
  return <AnimatePresence>
      <motion.div initial={{
      opacity: 0,
      y: 100
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: 100
    }} className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-50 max-w-md">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-premium overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instala Rose Secret</h3>
                  <p className="text-sm text-white/80">
                    Acceso rápido desde tu inicio
                  </p>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Acceso instantáneo desde tu pantalla de inicio</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Funciona sin conexión</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Notificaciones de ofertas exclusivas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Experiencia de app nativa</span>
              </div>
            </div>

            {/* Install Button */}
            <button onClick={handleInstall} disabled={isInstalling} className="w-full bg-white text-rose-600 font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isInstalling ? <>
                  <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                  Instalando...
                </> : <>
                  <Download className="w-5 h-5" />
                  Instalar Ahora
                </>}
            </button>

            <p className="text-xs text-white/60 text-center mt-3">
              Gratis • Sin registro • Instalación instantánea
            </p>
          </div>

          {/* Animated indicator */}
          <motion.div className="h-1 bg-white/30" initial={{
          width: '100%'
        }} animate={{
          width: '0%'
        }} transition={{
          duration: 60,
          ease: 'linear'
        }} />
        </div>
      </motion.div>
    </AnimatePresence>;
}