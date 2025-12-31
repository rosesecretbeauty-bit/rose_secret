import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { getActiveAppConfig, AppConfig } from '../../api/appConfig';

export function AppDownloadInterstitial() {
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
        
        // Solo mostrar si está habilitado el intersticial y hay URLs válidas
        if (config && config.interstitial_enabled) {
          setAppConfig(config);
        } else {
          setAppConfig(null);
          return;
        }
      } catch (error) {
        // Silenciar errores, no mostrar intersticial
        setAppConfig(null);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    loadAppConfig();
  }, []);

  useEffect(() => {
    if (!appConfig || isLoading) return;

    // Check if mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      }
    };
    checkMobile();

    // Check page views
    const views = parseInt(localStorage.getItem('pageViews') || '0');
    localStorage.setItem('pageViews', (views + 1).toString());
    const hasClosed = localStorage.getItem('appBannerClosed');
    
    if (isMobile && views >= appConfig.interstitial_trigger_views && !hasClosed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, appConfig, isLoading]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('appBannerClosed', 'true');
  };

  const getAppUrl = () => {
    if (!appConfig) return null;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return appConfig.ios_url;
    } else if (/android/i.test(userAgent)) {
      return appConfig.android_url;
    }
    return appConfig.web_url || appConfig.android_url || appConfig.ios_url;
  };

  // No mostrar si no está cargando, no hay config, no es móvil, o no está visible
  if (isLoading || !appConfig || !isMobile || !isVisible) return null;

  const appUrl = getAppUrl();
  if (!appUrl) return null; // No hay URL válida
  return <AnimatePresence>
      {isVisible && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-6 shadow-2xl">
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg">
                RS
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {appConfig.app_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {appConfig.app_description || 'The best luxury shopping experience'}
                </p>
                {appConfig.app_rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        className={`h-3 w-3 ${s <= Math.floor(appConfig.app_rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      ({appConfig.app_rating}
                      {appConfig.app_reviews_count && ` • ${appConfig.app_reviews_count.toLocaleString()} reviews`})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                fullWidth 
                className="bg-black hover:bg-gray-800"
                onClick={() => appUrl && window.open(appUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" /> 
                {appConfig.ios_url && /iPad|iPhone|iPod/.test(navigator.userAgent) 
                  ? 'Download on App Store'
                  : appConfig.android_url && /android/i.test(navigator.userAgent)
                  ? 'Download on Google Play'
                  : 'Download App'}
              </Button>
              <Button fullWidth variant="outline" onClick={handleClose}>
                Continue in Browser
              </Button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}