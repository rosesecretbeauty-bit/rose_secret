// ============================================
// Loyalty Store - Zustand
// ============================================

import { create } from 'zustand';
import {
  getLoyaltyInfo,
  getLoyaltyTiers,
  getLoyaltyRewards,
  redeemReward,
  getLoyaltyTransactions,
  LoyaltyInfo,
  LoyaltyTier,
  LoyaltyReward,
  LoyaltyTransaction
} from '../api/loyalty';

interface LoyaltyState {
  // Estado
  info: LoyaltyInfo | null;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadLoyaltyInfo: () => Promise<void>;
  loadTiers: () => Promise<void>;
  loadRewards: () => Promise<void>;
  loadTransactions: (limit?: number, offset?: number) => Promise<void>;
  redeem: (rewardId: number) => Promise<void>;
  clearError: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
  info: null,
  tiers: [],
  rewards: [],
  transactions: [],
  loading: false,
  error: null,

  loadLoyaltyInfo: async () => {
    set({ loading: true, error: null });
    try {
      const info = await getLoyaltyInfo();
      set({ info, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar información de loyalty', loading: false });
    }
  },

  loadTiers: async () => {
    try {
      const tiers = await getLoyaltyTiers();
      set({ tiers });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar tiers' });
    }
  },

  loadRewards: async () => {
    try {
      const rewards = await getLoyaltyRewards();
      set({ rewards });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar recompensas' });
    }
  },

  loadTransactions: async (limit = 50, offset = 0) => {
    try {
      const transactions = await getLoyaltyTransactions(limit, offset);
      set({ transactions });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar transacciones' });
    }
  },

  redeem: async (rewardId: number) => {
    try {
      const result = await redeemReward(rewardId);
      // Recargar información para actualizar puntos
      await get().loadLoyaltyInfo();
      return result;
    } catch (error: any) {
      set({ error: error.message || 'Error al canjear recompensa' });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

