// ============================================
// Discount Store
// ============================================
// Zustand store para gestionar descuentos aplicados

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppliedDiscount, CartTotals } from '../discounts/discountTypes';
import {
  applyDiscount as applyDiscountAPI,
  removeDiscount as removeDiscountAPI,
  getAutomaticDiscounts as getAutomaticDiscountsAPI,
} from '../discounts/discountClient';
import { calculateCartTotal } from '../discounts/discountUtils';

interface DiscountStore {
  // Estado
  appliedDiscounts: AppliedDiscount[];
  automaticDiscounts: AppliedDiscount[];
  cartTotals: CartTotals | null;
  isLoading: boolean;
  error: string | null;
  lastAppliedCode: string | null;

  // Acciones
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeDiscount: (discountId: number) => Promise<void>;
  loadAutomaticDiscounts: () => Promise<void>;
  clearDiscounts: () => Promise<void>;
  refreshTotals: () => Promise<void>;
  clearError: () => void;
}

const initialCartTotals: CartTotals = {
  subtotal: 0,
  discounts: [],
  discount_total: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  currency: 'USD',
};

export const useDiscountStore = create<DiscountStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      appliedDiscounts: [],
      automaticDiscounts: [],
      cartTotals: null,
      isLoading: false,
      error: null,
      lastAppliedCode: null,

      // Aplicar cupón manual
      applyCoupon: async (code: string) => {
        try {
          set({ isLoading: true, error: null });

          const result = await applyDiscountAPI(code);

          if (!result.success || !result.valid) {
            set({
              isLoading: false,
              error: result.message || 'Cupón inválido',
            });
            return {
              success: false,
              message: result.message || 'Cupón inválido',
            };
          }

          // Si el backend devuelve cart_totals, usarlos
          if (result.cart_totals) {
            const discounts = result.cart_totals.discounts || [];
            
            set({
              appliedDiscounts: discounts.filter((d: AppliedDiscount) => !d.is_automatic),
              automaticDiscounts: discounts.filter((d: AppliedDiscount) => d.is_automatic),
              cartTotals: result.cart_totals,
              isLoading: false,
              error: null,
              lastAppliedCode: code.toUpperCase(),
            });
          } else if (result.discount) {
            // Fallback: construir desde discount (solo visual)
            const { useCartStore } = await import('./cartStore');
            const cartStore = useCartStore.getState();
            const subtotal = cartStore.getCartTotal();

            const newDiscount: AppliedDiscount = {
              id: result.discount.id,
              discount_id: result.discount.id,
              type: result.discount.type,
              code: result.discount.code,
              label: result.discount.code || result.discount.name || 'Descuento',
              amount: result.calculated_amount || 0,
              amount_type: result.discount.amount_type,
              original_amount: result.discount.amount,
              applies_to: result.discount.applies_to,
              is_automatic: false,
            };

            const updatedDiscounts = [...get().appliedDiscounts, newDiscount];
            const cartTotals = calculateCartTotal(subtotal, updatedDiscounts);

            set({
              appliedDiscounts: updatedDiscounts,
              cartTotals,
              isLoading: false,
              error: null,
              lastAppliedCode: code.toUpperCase(),
            });
          }

          return {
            success: true,
            message: result.message || 'Cupón aplicado exitosamente',
          };
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al aplicar cupón',
          });
          return {
            success: false,
            message: error.message || 'Error al aplicar cupón',
          };
        }
      },

      // Remover descuento
      removeDiscount: async (discountId: number) => {
        try {
          set({ isLoading: true, error: null });

          const discount = get().appliedDiscounts.find((d) => d.id === discountId);
          const result = await removeDiscountAPI(discountId, discount?.code);

          if (result.success && result.cart_totals) {
            // Backend devuelve totales actualizados
            set({
              appliedDiscounts: result.cart_totals.discounts.filter(
                (d: AppliedDiscount) => !d.is_automatic
              ),
              automaticDiscounts: result.cart_totals.discounts.filter(
                (d: AppliedDiscount) => d.is_automatic
              ),
              cartTotals: result.cart_totals,
              isLoading: false,
            });
          } else {
            // Remover localmente
            const updatedDiscounts = get().appliedDiscounts.filter(
              (d) => d.id !== discountId
            );

            // Recalcular totales (solo visual)
            const { useCartStore } = await import('./cartStore');
            const cartStore = useCartStore.getState();
            const subtotal = cartStore.getCartTotal();
            const cartTotals = calculateCartTotal(subtotal, updatedDiscounts);

            set({
              appliedDiscounts: updatedDiscounts,
              cartTotals,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al remover descuento',
          });
        }
      },

      // Cargar descuentos automáticos
      loadAutomaticDiscounts: async () => {
        try {
          set({ isLoading: true, error: null });

          const result = await getAutomaticDiscountsAPI();

          if (result.success) {
            const previousAutoDiscounts = get().automaticDiscounts;
            const previousTotal = get().cartTotals?.total || 0;
            
            if (result.cart_totals) {
              // Backend devuelve totales completos
              set({
                automaticDiscounts: result.discounts,
                appliedDiscounts: result.cart_totals.discounts.filter(
                  (d: AppliedDiscount) => !d.is_automatic
                ),
                cartTotals: result.cart_totals,
                isLoading: false,
              });
              
              // Track nuevos descuentos automáticos
              if (result.discounts.length > 0) {
                const { trackEvent } = await import('../analytics/analyticsClient');
                result.discounts.forEach((discount: AppliedDiscount) => {
                  // Solo trackear si es nuevo (no estaba en previousAutoDiscounts)
                  const isNew = !previousAutoDiscounts.find(d => d.id === discount.id);
                  if (isNew) {
                    trackEvent('DISCOUNT_APPLIED', {
                      discount_id: discount.discount_id,
                      amount: discount.amount,
                      cart_total_before: previousTotal,
                      cart_total_after: result.cart_totals!.total,
                      currency: 'USD',
                      is_automatic: true,
                    });
                  }
                });
              }
            } else {
              // Solo actualizar descuentos automáticos
              set({
                automaticDiscounts: result.discounts,
                isLoading: false,
              });
            }
          }
        } catch (error: any) {
          console.error('Error loading automatic discounts:', error);
          set({
            isLoading: false,
            error: null, // No mostrar error para descuentos automáticos
          });
        }
      },

      // Limpiar todos los descuentos
      clearDiscounts: async () => {
        try {
          // Remover todos los descuentos manuales
          const manualDiscounts = get().appliedDiscounts;
          for (const discount of manualDiscounts) {
            await get().removeDiscount(discount.id);
          }

          set({
            appliedDiscounts: [],
            cartTotals: null,
            lastAppliedCode: null,
          });
        } catch (error) {
          console.error('Error clearing discounts:', error);
        }
      },

      // Refrescar totales desde el backend
      refreshTotals: async () => {
        try {
          // Recargar descuentos automáticos (esto también actualiza totales)
          await get().loadAutomaticDiscounts();
        } catch (error) {
          console.error('Error refreshing totals:', error);
        }
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'rose-secret-discounts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appliedDiscounts: state.appliedDiscounts,
        lastAppliedCode: state.lastAppliedCode,
      }),
    }
  )
);

