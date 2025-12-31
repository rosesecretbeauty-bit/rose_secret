// ============================================
// Insights Store - Zustand
// ============================================

import { create } from 'zustand';
import { getSpendingInsights, SpendingInsights } from '../api/insights';

interface InsightsState {
  // Estado
  insights: SpendingInsights | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadInsights: (months?: number) => Promise<void>;
  clearError: () => void;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  insights: null,
  loading: false,
  error: null,

  loadInsights: async (months = 6) => {
    set({ loading: true, error: null });
    try {
      const insights = await getSpendingInsights(months);
      set({ insights, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar estadísticas', loading: false });
    }
  },

  clearError: () => set({ error: null })
}));

