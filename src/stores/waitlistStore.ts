// ============================================
// Waitlist Store - Zustand
// ============================================

import { create } from 'zustand';
import { getWaitlist, addToWaitlist, removeFromWaitlist, WaitlistItem } from '../api/waitlist';

interface WaitlistState {
  // Estado
  items: WaitlistItem[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadWaitlist: () => Promise<void>;
  addItem: (productId: number, variantId?: number) => Promise<void>;
  removeItem: (waitlistId: number) => Promise<void>;
  clearError: () => void;
}

export const useWaitlistStore = create<WaitlistState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadWaitlist: async () => {
    set({ loading: true, error: null });
    try {
      const items = await getWaitlist();
      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar lista de espera', loading: false });
    }
  },

  addItem: async (productId: number, variantId?: number) => {
    try {
      await addToWaitlist(productId, variantId);
      // Recargar lista
      await get().loadWaitlist();
    } catch (error: any) {
      set({ error: error.message || 'Error al agregar a lista de espera' });
      throw error;
    }
  },

  removeItem: async (waitlistId: number) => {
    try {
      await removeFromWaitlist(waitlistId);
      // Recargar lista
      await get().loadWaitlist();
    } catch (error: any) {
      set({ error: error.message || 'Error al remover de lista de espera' });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

