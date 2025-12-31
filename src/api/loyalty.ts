// ============================================
// Loyalty API Client
// ============================================

import { api } from './client';

export interface LoyaltyInfo {
  current_points: number;
  lifetime_points: number;
  current_tier: {
    id: number;
    name: string;
    slug: string;
    min_points: number;
    points_multiplier: number;
    benefits: string[];
    color: string;
  } | null;
  next_tier: {
    id: number;
    name: string;
    slug: string;
    min_points: number;
  } | null;
  points_to_next: number;
}

export interface LoyaltyTier {
  id: number;
  name: string;
  slug: string;
  min_points: number;
  points_multiplier: number;
  benefits: string[];
  color: string;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string | null;
  points_cost: number;
  reward_type: string | null;
  reward_value: number | null;
  icon: string | null;
  stock_remaining: number | null;
}

export interface LoyaltyTransaction {
  id: number;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  source: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Obtener información de loyalty del usuario
 */
export async function getLoyaltyInfo(): Promise<LoyaltyInfo> {
  const response = await api.get('/user/loyalty') as {
    success: boolean;
    data: LoyaltyInfo;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener información de loyalty');
  }
  
  return response.data;
}

/**
 * Obtener todos los tiers disponibles
 */
export async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const response = await api.get('/user/loyalty/tiers') as {
    success: boolean;
    data: { tiers: LoyaltyTier[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener tiers');
  }
  
  return response.data.tiers;
}

/**
 * Obtener recompensas disponibles
 */
export async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  const response = await api.get('/user/loyalty/rewards') as {
    success: boolean;
    data: { rewards: LoyaltyReward[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener recompensas');
  }
  
  return response.data.rewards;
}

/**
 * Canjear puntos por recompensa
 */
export async function redeemReward(rewardId: number): Promise<{
  redemption_id: number;
  remaining_points: number;
  reward: {
    id: number;
    name: string;
    description: string | null;
  };
}> {
  const response = await api.post('/user/loyalty/redeem', {
    reward_id: rewardId
  }) as {
    success: boolean;
    data: {
      redemption_id: number;
      remaining_points: number;
      reward: {
        id: number;
        name: string;
        description: string | null;
      };
    };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al canjear recompensa');
  }
  
  return response.data;
}

/**
 * Obtener historial de transacciones
 */
export async function getLoyaltyTransactions(limit = 50, offset = 0): Promise<LoyaltyTransaction[]> {
  const response = await api.get(`/user/loyalty/transactions?limit=${limit}&offset=${offset}`) as {
    success: boolean;
    data: { transactions: LoyaltyTransaction[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener historial de transacciones');
  }
  
  return response.data.transactions;
}

