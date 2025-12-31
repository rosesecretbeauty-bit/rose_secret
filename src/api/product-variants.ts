// src/api/product-variants.ts

import { api } from './client';

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  stock: number;
  weight?: number;
  attributes: Record<string, any>; // JSON object: {size: "50ml", color: "red"}
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVariantData {
  name: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  stock?: number;
  weight?: number;
  attributes?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateVariantData {
  name?: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  stock?: number;
  weight?: number;
  attributes?: Record<string, any>;
  is_active?: boolean;
}

/**
 * Obtener todas las variantes de un producto
 */
export async function getVariantsByProduct(productId: number): Promise<ProductVariant[]> {
  const response = await api.get(`/admin/products/${productId}/variants`) as {
    success: boolean;
    data?: {
      variants: ProductVariant[];
    };
  };
  
  if (response.success && response.data) {
    return response.data.variants;
  }
  
  return [];
}

/**
 * Crear una nueva variante para un producto
 */
export async function createVariant(
  productId: number,
  data: CreateVariantData
): Promise<ProductVariant> {
  const response = await api.post(`/admin/products/${productId}/variants`, data) as {
    success: boolean;
    data?: {
      variant: ProductVariant;
    };
  };
  
  if (response.success && response.data) {
    return response.data.variant;
  }
  
  throw new Error('Error al crear variante');
}

/**
 * Actualizar una variante
 */
export async function updateVariant(
  productId: number,
  variantId: number,
  data: UpdateVariantData
): Promise<ProductVariant> {
  const response = await api.put(`/admin/products/${productId}/variants/${variantId}`, data) as {
    success: boolean;
    data?: {
      variant: ProductVariant;
    };
  };
  
  if (response.success && response.data) {
    return response.data.variant;
  }
  
  throw new Error('Error al actualizar variante');
}

/**
 * Eliminar una variante
 */
export async function deleteVariant(
  productId: number,
  variantId: number
): Promise<void> {
  const response = await api.delete(`/admin/products/${productId}/variants/${variantId}`) as {
    success: boolean;
  };
  
  if (!response.success) {
    throw new Error('Error al eliminar variante');
  }
}

