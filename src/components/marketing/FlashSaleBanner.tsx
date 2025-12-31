import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActivePromotions, calculateTimeLeft, Promotion } from '../../api/promotions';

export function FlashSaleBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar promociones activas para posición 'header'
    async function loadPromotions() {
      try {
        setIsLoading(true);
        const promotions = await getActivePromotions('header');
        
        // Tomar la primera promoción activa (mayor prioridad)
        if (promotions.length > 0) {
          const activePromo = promotions[0];
          setPromotion(activePromo);
          
          // Calcular tiempo restante
          const time = calculateTimeLeft(activePromo.end_date);
          if (time) {
            setTimeLeft(time);
            setIsVisible(true);
          } else {
            // Promoción expirada
            setIsVisible(false);
          }
        } else {
          // No hay promociones activas
          setIsVisible(false);
        }
      } catch (error) {
        // Silenciar errores, no mostrar banner
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadPromotions();
  }, []);

  // Actualizar countdown cada segundo
  useEffect(() => {
    if (!promotion || !timeLeft) return;

    const timer = setInterval(() => {
      const time = calculateTimeLeft(promotion.end_date);
      
      if (time) {
        setTimeLeft(time);
      } else {
        // Promoción expirada, ocultar banner
        setTimeLeft(null);
        setIsVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [promotion, timeLeft]);

  // No mostrar si está cargando, no hay promoción, o no está visible
  if (isLoading || !promotion || !isVisible || !timeLeft) return null;
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
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-rose-600 rotate-12 blur-[60px]" />
        </div>

        <div className="container-custom py-2 md:py-3 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-600 rounded-lg animate-pulse">
                <Zap className="h-4 w-4 text-white fill-current" />
              </div>
              <span className="font-bold text-sm md:text-base tracking-wide uppercase">
                Flash Sale
              </span>
            </div>

            <p className="text-sm md:text-base font-medium">
              {promotion.discount_percentage && (
                <span className="text-rose-400 font-bold">
                  {promotion.discount_percentage}% OFF
                </span>
              )}
              {promotion.discount_amount && (
                <span className="text-rose-400 font-bold">
                  ${promotion.discount_amount} OFF
                </span>
              )}
              {promotion.description && (
                <span> {promotion.description}</span>
              )}
              {!promotion.description && promotion.title && (
                <span> {promotion.title}</span>
              )}
            </p>

            {promotion.show_countdown && timeLeft && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 font-mono text-sm bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-rose-400 mr-1" />
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-gray-400">:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-rose-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>

                <Link 
                  to={promotion.cta_url || '/sale'} 
                  className="text-xs md:text-sm font-bold text-white hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  {promotion.cta_text} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {!promotion.show_countdown && (
              <Link 
                to={promotion.cta_url || '/sale'} 
                className="text-xs md:text-sm font-bold text-white hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                {promotion.cta_text} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        <button onClick={() => setIsVisible(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>;
}