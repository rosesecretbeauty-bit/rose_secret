// ============================================
// Coupon Input Component
// ============================================
// Componente para aplicar cupones en checkout

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useDiscountStore } from '../../stores/discountStore';
import { useToastStore } from '../../stores/toastStore';
import { trackEvent } from '../../analytics/analyticsClient';
import { useCartStore } from '../../stores/cartStore';

export function CouponInput() {
  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    appliedDiscounts,
    automaticDiscounts,
    isLoading,
    error,
    applyCoupon,
    removeDiscount,
    clearError,
  } = useDiscountStore();
  
  const { getCartTotal } = useCartStore();
  const addToast = useToastStore(state => state.addToast);

  // Todos los descuentos (manuales + automáticos)
  const allDiscounts = [...appliedDiscounts, ...automaticDiscounts];

  const handleApply = async () => {
    if (!code.trim()) {
      addToast({
        type: 'error',
        message: 'Ingresa un código de cupón',
      });
      return;
    }

    clearError();
    
    const cartTotalBefore = getCartTotal();
    const result = await applyCoupon(code.trim());

    if (result.success) {
      setCode('');
      setIsExpanded(false);
      
      // Obtener descuento aplicado para tracking
      const discountStore = useDiscountStore.getState();
      const appliedDiscount = discountStore.appliedDiscounts.find(
        d => d.code?.toUpperCase() === code.trim().toUpperCase()
      );
      const cartTotalAfter = discountStore.cartTotals?.total || 
        (cartTotalBefore - (appliedDiscount?.amount || 0));
      
      // Track analytics
      trackEvent('COUPON_APPLIED', {
        code: code.trim().toUpperCase(),
        discount_id: appliedDiscount?.discount_id || 0,
        amount: appliedDiscount?.amount || (cartTotalBefore - cartTotalAfter),
        cart_total_before: cartTotalBefore,
        cart_total_after: cartTotalAfter,
        currency: 'USD',
      });

      addToast({
        type: 'success',
        message: result.message || 'Cupón aplicado exitosamente',
      });
    } else {
      const cartTotal = getCartTotal();
      
      // Track analytics
      trackEvent('COUPON_FAILED', {
        code: code.trim().toUpperCase(),
        cart_total_before: cartTotal,
        error: result.message || 'Cupón inválido',
        currency: 'USD',
      });

      addToast({
        type: 'error',
        message: result.message || 'Cupón inválido',
      });
    }
  };

  const handleRemove = async (discountId: number, discountCode?: string) => {
    const cartTotalBefore = getCartTotal();
    
    await removeDiscount(discountId);
    
    const cartTotalAfter = getCartTotal();
    
    // Track analytics
    trackEvent('DISCOUNT_REMOVED', {
      code: discountCode,
      discount_id: discountId,
      amount: cartTotalBefore - cartTotalAfter,
      cart_total_before: cartTotalBefore,
      cart_total_after: cartTotalAfter,
      currency: 'USD',
    });

    addToast({
      type: 'info',
      message: 'Descuento removido',
    });
  };

  return (
    <div className="space-y-3">
      {/* Descuentos aplicados */}
      {allDiscounts.length > 0 && (
        <div className="space-y-2">
          {allDiscounts.map((discount) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {discount.is_automatic ? (
                  <Sparkles className="h-4 w-4 text-green-600" />
                ) : (
                  <Tag className="h-4 w-4 text-green-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {discount.label}
                    {discount.is_automatic && (
                      <span className="ml-2 text-xs text-green-600">(Automático)</span>
                    )}
                  </p>
                  <p className="text-xs text-green-700">
                    -${discount.amount.toFixed(2)}
                  </p>
                </div>
              </div>
              {!discount.is_automatic && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(discount.id, discount.code)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Input de cupón */}
      {!isExpanded && allDiscounts.length === 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 p-3 text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg hover:border-rose-300 transition-colors"
        >
          <Tag className="h-4 w-4" />
          <span>Tengo un código de cupón</span>
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Código de cupón"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApply();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleApply}
                disabled={isLoading || !code.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Aplicar'
                )}
              </Button>
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setCode('');
                    clearError();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

