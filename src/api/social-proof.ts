// src/api/social-proof.ts
// API functions for social proof activities

import { api } from './client';

// ============================================
// Types
// ============================================

export interface SocialActivity {
  id: string;
  type: 'purchased' | 'wishlisted' | 'reviewed';
  product_name: string;
  product_id: number;
  product_image: string | null;
  user_name: string; // Anonimizado (solo inicial)
  location: string;
  rating?: number; // Solo para reviews
  time_ago: string;
  timestamp: string;
}

export interface SocialProofResponse {
  success: boolean;
  data?: {
    activities: SocialActivity[];
    count: number;
  };
  message?: string;
}

// ============================================
// Get Recent Activities
// ============================================

export async function getRecentActivities(filters?: {
  limit?: number;
  hours?: number;
}): Promise<SocialProofResponse> {
  const params = new URLSearchParams();
  
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.hours) params.append('hours', filters.hours.toString());
  
  const query = params.toString();
  const endpoint = `/social-proof/recent-activities${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<SocialProofResponse>;
}

