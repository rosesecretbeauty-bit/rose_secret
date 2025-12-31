// ============================================
// Payment Methods Store - Zustand
// ============================================

import { create } from 'zustand';
import {
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  PaymentMethod
} from '../api/paymentMethods';

interface PaymentMethodsState {
  // Estado
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadMethods: () => Promise<void>;
  addMethod: (stripePaymentMethodId: string) => Promise<void>;
  removeMethod: (paymentMethodId: number) => Promise<void>;
  setDefault: (paymentMethodId: number) => Promise<void>;
  clearError: () => void;
}

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  methods: [],
  loading: false,
  error: null,

  loadMethods: async () => {
    set({ loading: true, error: null });
    try {
      const methods = await getPaymentMethods();
      set({ methods, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar métodos de pago', loading: false });
    }
  },

  addMethod: async (stripePaymentMethodId: string) => {
    try {
      await addPaymentMethod(stripePaymentMethodId);
      // Recargar métodos
      await get().loadMethods();
    } catch (error: any) {
      set({ error: error.message || 'Error al guardar método de pago' });
      throw error;
    }
  },

  removeMethod: async (paymentMethodId: number) => {
    try {
      await removePaymentMethod(paymentMethodId);
      // Recargar métodos
      await get().loadMethods();
    } catch (error: any) {
      set({ error: error.message || 'Error al eliminar método de pago' });
      throw error;
    }
  },

  setDefault: async (paymentMethodId: number) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
      // Recargar métodos
      await get().loadMethods();
    } catch (error: any) {
      set({ error: error.message || 'Error al marcar método como predeterminado' });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

