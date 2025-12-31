// ============================================
// Badges API Client
// ============================================

import { api } from './client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earned_at: string | null;
}

/**
 * Obtener badges del usuario
 */
export async function getBadges(): Promise<Badge[]> {
  const response = await api.get('/user/badges') as {
    success: boolean;
    data: { badges: Badge[] };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener badges');
  }
  
  return response.data.badges;
}

