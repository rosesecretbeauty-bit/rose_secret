// src/api/influencers.ts
// API functions for influencers

import { api } from './client';

// ============================================
// Types
// ============================================

export interface Influencer {
  id: number;
  name: string;
  role: string;
  image: string | null;
  bio: string | null;
  social: {
    instagram: string | null;
    youtube: string | null;
    tiktok: string | null;
  };
}

export interface InfluencerWithProducts extends Influencer {
  products: Array<{
    id: number;
    name: string;
    description: string | null;
    short_description: string | null;
    price: number;
    compare_at_price: number | null;
    brand: string | null;
    images: string[];
    role: string | null;
  }>;
}

export interface InfluencersResponse {
  success: boolean;
  data?: {
    influencers: Influencer[];
  };
  message?: string;
}

export interface InfluencerResponse {
  success: boolean;
  data?: {
    influencer: InfluencerWithProducts;
  };
  message?: string;
}

export interface InfluencerProductsResponse {
  success: boolean;
  data?: {
    products: Array<{
      id: number;
      name: string;
      description: string | null;
      price: number;
      images: string[];
      role: string | null;
    }>;
  };
  message?: string;
}

// ============================================
// Get All Influencers
// ============================================

export async function getInfluencers(): Promise<InfluencersResponse> {
  return api.get('/influencers') as Promise<InfluencersResponse>;
}

// ============================================
// Get Influencer by ID
// ============================================

export async function getInfluencer(id: number): Promise<InfluencerResponse> {
  return api.get(`/influencers/${id}`) as Promise<InfluencerResponse>;
}

// ============================================
// Get Influencer Products
// ============================================

export async function getInfluencerProducts(id: number): Promise<InfluencerProductsResponse> {
  return api.get(`/influencers/${id}/products`) as Promise<InfluencerProductsResponse>;
}

