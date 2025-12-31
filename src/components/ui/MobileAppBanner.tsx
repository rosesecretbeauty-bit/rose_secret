import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Star } from 'lucide-react';
import { Button } from './Button';
import { getActiveAppConfig, AppConfig } from '../../api/appConfig';

export function MobileAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar configuración de app
    async function loadAppConfig() {
      try {
        setIsLoading(true);
        const config = await getActiveAppConfig();
        
        // Solo mostrar si hay configuración activa con URLs válidas
        if (config) {
          setAppConfig(config);
          
          // Check if user has dismissed banner before
          const dismissed = localStorage.getItem('app-banner-dismissed');
          if (!dismissed) {
            setTimeout(() => setIsVisible(true), 3000);
          }
        } else {
          // No hay app configurada, no mostrar banner
          setAppConfig(null);
          setIsVisible(false);
        }
      } catch (error) {
        // Silenciar errores, no mostrar banner
        setAppConfig(null);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppConfig();

    // Simple mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  // No mostrar si está cargando, no hay config, o no está visible
  if (isLoading || !appConfig || !isVisible) return null;

  // Determinar URL según dispositivo
  const getAppUrl = () => {
    if (isMobile) {
      // Detectar iOS vs Android
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        return appConfig.ios_url;
      } else if (/android/i.test(userAgent)) {
        return appConfig.android_url;
      }
    }
    // Desktop: usar web_url o primera disponible
    return appConfig.web_url || appConfig.android_url || appConfig.ios_url;
  };

  const appUrl = getAppUrl();
  if (!appUrl) return null; // No hay URL válida, no mostrar
  return <AnimatePresence>
      <motion.div initial={{
      height: 0,
      opacity: 0
    }} animate={{
      height: 'auto',
      opacity: 1
    }} exit={{
      height: 0,
      opacity: 0
    }} className="bg-gray-900 text-white relative overflow-hidden">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={handleDismiss} className="text-gray-400 hover:text-white transition-colors" aria-label="Cerrar banner">
                <X className="h-5 w-5" />
              </button>

              <div className="h-10 w-10 bg-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/50">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              <div className="hidden sm:block">
                <p className="font-medium text-sm">
                  Descarga la App de Rose Secret
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <span>4.9 • Ofertas exclusivas en la app</span>
                </div>
              </div>

              <div className="sm:hidden">
                <p className="font-medium text-sm">App Rose Secret</p>
                <p className="text-xs text-gray-400">Ofertas exclusivas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isMobile ? (
                <Button 
                  size="sm" 
                  className="bg-white text-gray-900 hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => appUrl && window.open(appUrl, '_blank')}
                >
                  Abrir App
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  {appConfig.qr_code_url && (
                    <>
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-400">
                          Escanea para descargar
                        </p>
                      </div>
                      <div className="h-10 w-10 bg-white p-1 rounded hidden md:block">
                        <img 
                          src={appConfig.qr_code_url} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => appUrl && window.open(appUrl, '_blank')}
                  >
                    {appConfig.web_url ? 'Abrir App Web' : 'Descargar App'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>;
}