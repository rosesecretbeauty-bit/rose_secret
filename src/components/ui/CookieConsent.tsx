import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import { Button } from './Button';
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay slightly to not overwhelm user immediately
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setIsVisible(false);
  };
  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
  };
  return <AnimatePresence>
      {isVisible && <motion.div initial={{
      y: 100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 100,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 20,
      stiffness: 100
    }} className="fixed bottom-0 left-0 right-0 z-[110] p-4 md:p-6" // High z-index to stay above everything
    >
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-premium-xl border border-gray-100 overflow-hidden">
            {!showPreferences ? <div className="p-6 md:flex items-center gap-6">
                <div className="hidden md:flex h-16 w-16 bg-rose-50 rounded-full items-center justify-center flex-shrink-0">
                  <Cookie className="h-8 w-8 text-rose-600" />
                </div>

                <div className="flex-1 mb-6 md:mb-0">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Cookie className="md:hidden h-5 w-5 text-rose-600" />
                    Valoramos tu privacidad
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Utilizamos cookies para mejorar tu experiencia, analizar el
                    tráfico y personalizar el contenido. Al hacer clic en
                    "Aceptar todo", aceptas el uso de todas las cookies.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
                  <Button variant="outline" onClick={() => setShowPreferences(true)} className="flex-1">
                    Personalizar
                  </Button>
                  <Button onClick={handleAcceptAll} className="flex-1">
                    Aceptar todo
                  </Button>
                </div>
              </div> : <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-rose-600" />
                    Preferencias de Cookies
                  </h3>
                  <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="mt-1">
                      <input type="checkbox" checked={preferences.essential} disabled className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5 cursor-not-allowed opacity-70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Esenciales (Requeridas)
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Necesarias para que el sitio funcione correctamente. No
                        se pueden desactivar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-rose-200 transition-colors">
                    <div className="mt-1">
                      <input type="checkbox" checked={preferences.analytics} onChange={e => setPreferences({
                  ...preferences,
                  analytics: e.target.checked
                })} className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5 cursor-pointer" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Analíticas
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Nos ayudan a entender cómo interactúas con el sitio para
                        mejorarlo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-rose-200 transition-colors">
                    <div className="mt-1">
                      <input type="checkbox" checked={preferences.marketing} onChange={e => setPreferences({
                  ...preferences,
                  marketing: e.target.checked
                })} className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5 cursor-pointer" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Marketing
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Utilizadas para mostrarte publicidad relevante según tus
                        intereses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowPreferences(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    Guardar Preferencias
                  </Button>
                </div>
              </div>}
          </div>
        </motion.div>}
    </AnimatePresence>;
}