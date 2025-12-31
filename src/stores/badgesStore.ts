// ============================================
// Badges Store - Zustand
// ============================================

import { create } from 'zustand';
import { getBadges, Badge } from '../api/badges';

interface BadgesState {
  // Estado
  badges: Badge[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadBadges: () => Promise<void>;
  clearError: () => void;
}

export const useBadgesStore = create<BadgesState>((set) => ({
  badges: [],
  loading: false,
  error: null,

  loadBadges: async () => {
    set({ loading: true, error: null });
    try {
      const badges = await getBadges();
      set({ badges, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar badges', loading: false });
    }
  },

  clearError: () => set({ error: null })
}));

