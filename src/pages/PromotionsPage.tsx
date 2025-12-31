import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Percent, Copy, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../stores/toastStore';
import { getActivePromotions, Promotion } from '../api/promotions';

export function PromotionsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getActivePromotions();
      setPromotions(data || []);
    } catch (error: any) {
      console.error('Error loading promotions:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar promociones'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === 'percentage' && promo.discount_percentage) {
      return `${promo.discount_percentage}%`;
    } else if (promo.discount_type === 'fixed' && promo.discount_amount) {
      return `€${promo.discount_amount}`;
    }
    return promo.discount_type === 'percentage' ? 'Descuento' : 'Oferta';
  };

  const formatExpiry = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha de expiración';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getPromoCode = (promo: Promotion): string | null => {
    // Si la promoción tiene código, extraerlo del título o usar un código generado
    // Por ahora, usar el título como código si no hay campo code
    return promo.title.toUpperCase().replace(/\s+/g, '') || null;
  };
  const copyCode = (code: string | null) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast({
      type: 'success',
      message: `Código ${code} copiado al portapapeles`
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };
  return <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-16">
      <div className="container-custom max-w-5xl">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
            <Percent className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Promociones Activas
          </h1>
          <p className="text-lg text-gray-600">
            Aprovecha nuestras ofertas exclusivas y ahorra en tus compras
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No hay promociones activas en este momento</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, index) => <motion.div key={promo.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-white">
                <h3 className="text-2xl font-serif font-bold mb-2">
                  {promo.title}
                </h3>
                <p className="text-4xl font-bold">{formatDiscount(promo)}</p>
                <p className="text-rose-100 mt-2">{promo.description || promo.title}</p>
              </div>

              <div className="p-6">
                {promo.end_date && (
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Válido hasta {formatExpiry(promo.end_date)}
                    </span>
                  </div>
                )}

                {getPromoCode(promo) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <code className="font-mono font-bold text-lg text-gray-900">
                      {getPromoCode(promo)}
                    </code>
                    <button onClick={() => copyCode(getPromoCode(promo))} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      {copiedCode === getPromoCode(promo) ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                    </button>
                  </div>
                )}

                {promo.description && (
                  <p className="text-xs text-gray-500 mb-4">{promo.description}</p>
                )}

                {getPromoCode(promo) ? (
                  <Button fullWidth onClick={() => copyCode(getPromoCode(promo))}>
                    Copiar Código
                  </Button>
                ) : (
                  <Button fullWidth onClick={() => window.location.href = promo.cta_url || '/shop'}>
                    {promo.cta_text || 'Ver Ofertas'}
                  </Button>
                )}
              </div>
            </motion.div>)}
          </div>
        )}
      </div>
    </div>;
}