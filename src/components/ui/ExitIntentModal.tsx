import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useToastStore } from '../../stores/toastStore';
export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem('exit_intent_shown');
    if (shown) return;
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
      }
    };
    // Add delay before activating
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 30000); // 30 seconds
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      message: '¡Código WELCOME10 aplicado! Revisa tu email.'
    });
    setIsOpen(false);
  };
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]" />

          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-premium-lg relative pointer-events-auto">
              {/* Close button */}
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 p-8 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-champagne/20 rounded-full blur-3xl" />

                <div className="relative">
                  <motion.div animate={{
                rotate: [0, 10, -10, 0]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="inline-block mb-4">
                    <Gift className="h-12 w-12" />
                  </motion.div>
                  <h2 className="font-serif text-3xl font-bold mb-3">
                    ¡Espera! Te mereces un regalo
                  </h2>
                  <p className="text-rose-100 text-lg">
                    Obtén{' '}
                    <span className="font-bold text-champagne">
                      10% de descuento
                    </span>{' '}
                    en tu primera compra
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />

                  <Button type="submit" fullWidth size="lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Obtener mi Descuento
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Usa el código{' '}
                  <span className="font-bold text-rose-600">WELCOME10</span> en
                  tu primera compra
                </p>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Además recibirás:
                  </p>
                  {['Acceso exclusivo a nuevas colecciones', 'Ofertas especiales solo para suscriptores', 'Regalo de cumpleaños'].map((benefit, idx) => <motion.div key={idx} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.1 + idx * 0.1
              }} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-rose-600">✓</span>
                      <span>{benefit}</span>
                    </motion.div>)}
                </div>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}