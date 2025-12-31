// src/api/product-images.ts

import { api } from './client';

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

/**
 * Obtener todas las imágenes de un producto
 */
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  const response = await api.get(`/admin/products/${productId}/images`) as {
    success: boolean;
    data?: {
      images: ProductImage[];
    };
  };
  
  if (response.success && response.data) {
    return response.data.images;
  }
  
  return [];
}

/**
 * Añadir una nueva imagen a un producto
 */
export async function addProductImage(
  productId: number,
  data: {
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
    sort_order?: number;
  }
): Promise<ProductImage> {
  const response = await api.post(`/admin/products/${productId}/images`, data) as {
    success: boolean;
    data?: {
      image: ProductImage;
    };
  };
  
  if (response.success && response.data) {
    return response.data.image;
  }
  
  throw new Error('Error al añadir imagen');
}

/**
 * Actualizar una imagen de producto
 */
export async function updateProductImage(
  productId: number,
  imageId: number,
  data: {
    alt_text?: string;
    is_primary?: boolean;
    sort_order?: number;
  }
): Promise<ProductImage> {
  const response = await api.put(`/admin/products/${productId}/images/${imageId}`, data) as {
    success: boolean;
    data?: {
      image: ProductImage;
    };
  };
  
  if (response.success && response.data) {
    return response.data.image;
  }
  
  throw new Error('Error al actualizar imagen');
}

/**
 * Reordenar imágenes de un producto
 */
export async function reorderProductImages(
  productId: number,
  imageIds: number[]
): Promise<void> {
  const response = await api.put(`/admin/products/${productId}/images/reorder`, {
    image_ids: imageIds
  }) as {
    success: boolean;
  };
  
  if (!response.success) {
    throw new Error('Error al reordenar imágenes');
  }
}

/**
 * Eliminar una imagen de producto
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  const response = await api.delete(`/admin/products/${productId}/images/${imageId}`) as {
    success: boolean;
  };
  
  if (!response.success) {
    throw new Error('Error al eliminar imagen');
  }
}

