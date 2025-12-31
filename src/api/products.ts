// src/api/products.ts

import { api } from './client';
import { Product } from '../types';

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
}

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; pagination: any }> {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const query = params.toString();
  const endpoint = `/products${query ? `?${query}` : ''}`;
  
  const response = await api.get(endpoint);
  return response.data;
}

export async function getProduct(id: string): Promise<any> {
  try {
    const response = await api.get(`/products/${id}`) as {
      success: boolean;
      data?: {
        product: any;
      };
      message?: string;
    };
    
    if (response.success && response.data?.product) {
      return response.data.product;
    }
    
    // Si no hay producto en la respuesta, lanzar error
    throw new Error(response.message || 'Producto no encontrado');
  } catch (error: any) {
    // Si el error ya tiene un mensaje, propagarlo
    if (error.message) {
      throw error;
    }
    // Si es un error de red o desconocido, lanzar error genérico
    throw new Error('Error al obtener el producto');
  }
}

// ============================================
// PRODUCT IMAGES API
// ============================================

/**
 * Obtener todas las imágenes de un producto
 */
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const response = await api.get(`/admin/products/${productId}/images`) as {
      success: boolean;
      data?: {
        images: any[];
      };
    };
    
    if (response.success && response.data) {
      return response.data.images.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || '',
        is_primary: img.is_primary || false,
        sort_order: img.sort_order || 0
      }));
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    throw error;
  }
}

/**
 * Añadir imagen a un producto
 */
export async function addProductImage(
  productId: number,
  imageUrl: string,
  options?: {
    alt_text?: string;
    is_primary?: boolean;
    sort_order?: number;
  }
): Promise<ProductImage> {
  try {
    const response = await api.post(`/admin/products/${productId}/images`, {
      image_url: imageUrl,
      alt_text: options?.alt_text,
      is_primary: options?.is_primary || false,
      sort_order: options?.sort_order
    }) as {
      success: boolean;
      data?: {
        image: any;
      };
      message?: string;
    };
    
    if (response.success && response.data) {
      const img = response.data.image;
      return {
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || '',
        is_primary: img.is_primary || false,
        sort_order: img.sort_order || 0
      };
    }
    throw new Error(response.message || 'Error al añadir imagen');
  } catch (error: any) {
    console.error('Error añadiendo imagen:', error);
    throw error;
  }
}

/**
 * Actualizar imagen de producto
 */
export async function updateProductImage(
  productId: number,
  imageId: number,
  updates: {
    alt_text?: string;
    is_primary?: boolean;
    sort_order?: number;
  }
): Promise<ProductImage> {
  try {
    const response = await api.put(`/admin/products/${productId}/images/${imageId}`, updates) as {
      success: boolean;
      data?: {
        image: any;
      };
      message?: string;
    };
    
    if (response.success && response.data) {
      const img = response.data.image;
      return {
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || '',
        is_primary: img.is_primary || false,
        sort_order: img.sort_order || 0
      };
    }
    throw new Error(response.message || 'Error al actualizar imagen');
  } catch (error: any) {
    console.error('Error actualizando imagen:', error);
    throw error;
  }
}

/**
 * Eliminar imagen de producto
 */
export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  try {
    const response = await api.delete(`/admin/products/${productId}/images/${imageId}`) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar imagen');
    }
  } catch (error: any) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
}

/**
 * Subir imagen principal (cover) de un producto usando Cloudinary
 */
export async function uploadProductCoverImage(
  productId: number,
  file: File
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/products/${productId}/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al subir imagen');
    }

    return data.data;
  } catch (error: any) {
    console.error('Error subiendo imagen principal:', error);
    throw error;
  }
}

/**
 * Subir imagen a la galería de un producto usando Cloudinary
 */
export async function uploadProductGalleryImage(
  productId: number,
  file: File,
  altText?: string
): Promise<ProductImage> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (altText) {
      formData.append('alt_text', altText);
    }

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/products/${productId}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al subir imagen');
    }

    return {
      id: data.data.id,
      url: data.data.url,
      alt: data.data.alt_text || '',
      is_primary: false,
      sort_order: data.data.sort_order
    };
  } catch (error: any) {
    console.error('Error subiendo imagen a galería:', error);
    throw error;
  }
}

/**
 * Eliminar imagen de galería de un producto
 */
export async function deleteProductGalleryImage(
  productId: number,
  imageId: number
): Promise<void> {
  try {
    const response = await api.delete(`/images/products/${productId}/gallery/${imageId}`) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar imagen');
    }
  } catch (error: any) {
    console.error('Error eliminando imagen de galería:', error);
    throw error;
  }
}

/**
 * Reordenar imágenes de un producto
 */
export async function reorderProductImages(
  productId: number,
  imageIds: number[]
): Promise<void> {
  try {
    const response = await api.put(`/admin/products/${productId}/images/reorder`, {
      image_ids: imageIds
    }) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al reordenar imágenes');
    }
  } catch (error: any) {
    console.error('Error reordenando imágenes:', error);
    throw error;
  }
}

// ============================================
// PRODUCT VARIANTS API
// ============================================

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  weight?: number;
  attributes?: any;
  is_active: boolean;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtener todas las variantes de un producto
 */
export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  try {
    const response = await api.get(`/admin/products/${productId}/variants`) as {
      success: boolean;
      data?: {
        variants: any[];
      };
    };
    
    if (response.success && response.data) {
      return response.data.variants.map((v: any) => ({
        ...v,
        is_default: v.is_default || false
      }));
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo variantes:', error);
    throw error;
  }
}

/**
 * Crear variante de producto
 */
export async function createProductVariant(
  productId: number,
  data: {
    name: string;
    price: number;
    sku?: string;
    compare_at_price?: number;
    stock?: number;
    weight?: number;
    attributes?: any;
    is_active?: boolean;
  }
): Promise<ProductVariant> {
  try {
    const response = await api.post(`/admin/products/${productId}/variants`, data) as {
      success: boolean;
      data?: {
        variant: any;
      };
      message?: string;
    };
    
    if (response.success && response.data) {
      return response.data.variant;
    }
    throw new Error(response.message || 'Error al crear variante');
  } catch (error: any) {
    console.error('Error creando variante:', error);
    throw error;
  }
}

/**
 * Actualizar variante de producto
 */
export async function updateProductVariant(
  productId: number,
  variantId: number,
  updates: {
    name?: string;
    price?: number;
    sku?: string;
    compare_at_price?: number;
    stock?: number;
    weight?: number;
    attributes?: any;
    is_active?: boolean;
  }
): Promise<ProductVariant> {
  try {
    const response = await api.put(`/admin/products/${productId}/variants/${variantId}`, updates) as {
      success: boolean;
      data?: {
        variant: any;
      };
      message?: string;
    };
    
    if (response.success && response.data) {
      return response.data.variant;
    }
    throw new Error(response.message || 'Error al actualizar variante');
  } catch (error: any) {
    console.error('Error actualizando variante:', error);
    throw error;
  }
}

/**
 * Eliminar variante de producto
 */
export async function deleteProductVariant(productId: number, variantId: number): Promise<void> {
  try {
    const response = await api.delete(`/admin/products/${productId}/variants/${variantId}`) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar variante');
    }
  } catch (error: any) {
    console.error('Error eliminando variante:', error);
    throw error;
  }
}

// ============================================
// STOCK VALIDATION API
// ============================================

export interface StockValidationRequest {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface StockValidationResponse {
  success: boolean;
  message?: string;
  data?: {
    available_stock: number;
    requested_quantity: number;
    has_variants: boolean;
    variant_id?: number;
  };
}

export interface StockInfo {
  product_id: number;
  variant_id?: number;
  has_variants: boolean;
  available_stock: number;
}

/**
 * Validar stock antes de agregar al carrito
 */
export async function validateStock(
  productId: number,
  quantity: number,
  variantId?: number
): Promise<StockValidationResponse> {
  try {
    const response = await api.post('/stock/validate', {
      product_id: productId,
      variant_id: variantId,
      quantity
    }) as StockValidationResponse;
    
    return response;
  } catch (error: any) {
    console.error('Error validando stock:', error);
    // Si el error viene del backend con estructura conocida, retornarlo
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Obtener información de stock de un producto
 */
export async function getStockInfo(
  productId: number,
  variantId?: number
): Promise<StockInfo> {
  try {
    const url = variantId 
      ? `/stock/${productId}?variant_id=${variantId}`
      : `/stock/${productId}`;
    
    const response = await api.get(url) as {
      success: boolean;
      data?: StockInfo;
    };
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Error al obtener información de stock');
  } catch (error: any) {
    console.error('Error obteniendo información de stock:', error);
    throw error;
  }
}

