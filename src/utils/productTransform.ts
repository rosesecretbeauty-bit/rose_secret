// ============================================
// Product Transform Utility
// ============================================
// Centraliza la transformación de productos del backend al formato del frontend
// TODOS los productos que vengan del backend DEBEN pasar por esta función
// Esto evita lógica duplicada y garantiza consistencia

import { Product } from '../types';

/**
 * Tipo para producto del backend (formato API)
 */
export interface BackendProduct {
  id: number | string;
  name: string;
  description?: string;
  price: number | string;
  category_id?: number;
  category_name?: string;
  category?: string;
  brand?: string;
  stock?: number;
  available_stock?: number;
  image_url?: string;
  images?: Array<{ url: string; alt?: string; id?: number }> | string[];
  is_new?: boolean;
  is_bestseller?: boolean;
  is_featured?: boolean;
  compare_at_price?: number | string;
  variants?: any[];
  // Campos adicionales que pueden venir del detalle
  slug?: string;
  short_description?: string;
  sku?: string;
  has_variants?: boolean;
  // Campos legacy/compatibilidad
  rating?: number;
  reviews_count?: number;
  reviews?: number;
}

/**
 * Transforma un producto del backend al formato esperado por el frontend
 * 
 * @param backendProduct - Producto en formato del backend API
 * @returns Producto en formato del frontend
 */
export function transformProduct(backendProduct: BackendProduct): Product {
  // Convertir ID a string (backend usa number, frontend espera string)
  const id = typeof backendProduct.id === 'number' 
    ? backendProduct.id.toString() 
    : backendProduct.id;

  // Convertir precio a number (MySQL puede devolver como string)
  const price = typeof backendProduct.price === 'string'
    ? parseFloat(backendProduct.price) || 0
    : backendProduct.price || 0;

  // Manejar imágenes
  let images: string[] = [];
  if (backendProduct.images && Array.isArray(backendProduct.images)) {
    // Si es array de objetos {url, alt}, extraer URLs
    images = backendProduct.images.map(img => 
      typeof img === 'string' ? img : img.url
    );
  } else if (backendProduct.image_url) {
    // Si solo hay image_url (endpoint de lista), crear array con una imagen
    images = [backendProduct.image_url];
  }

  // Manejar categoría (puede venir como category_id, category_name o category)
  const category = backendProduct.category_name || 
                   backendProduct.category || 
                   (backendProduct.category_id ? backendProduct.category_id.toString() : '');

  // Convertir compare_at_price si existe
  const compareAtPrice = backendProduct.compare_at_price 
    ? (typeof backendProduct.compare_at_price === 'string' 
        ? parseFloat(backendProduct.compare_at_price) 
        : backendProduct.compare_at_price)
    : undefined;

  // Calcular discount si hay compare_at_price
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : undefined;

  // Manejar stock (priorizar available_stock si existe)
  const stock = backendProduct.available_stock !== undefined
    ? backendProduct.available_stock
    : backendProduct.stock;

  // Transformar variantes si existen
  const variants = backendProduct.variants?.map(v => ({
    size: v.name || v.size || '',
    price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
    stock: v.stock
  })) || [];

  return {
    id,
    name: backendProduct.name,
    description: backendProduct.description || '',
    price,
    category,
    brand: backendProduct.brand,
    images,
    // Rating y reviews: inicializar en 0 (vienen de tabla reviews, no implementado aún)
    rating: backendProduct.rating || 0,
    reviews: backendProduct.reviews_count || backendProduct.reviews || 0,
    // Flags: convertir snake_case a camelCase
    isNew: backendProduct.is_new || false,
    isBestSeller: backendProduct.is_bestseller || false,
    // Discount calculado si hay compare_at_price
    ...(discount && { discount }),
    // Stock
    ...(stock !== undefined && { stock }),
    // Variantes
    ...(variants.length > 0 && { variants }),
    // Campos adicionales si existen
    ...(backendProduct.sku && { sku: backendProduct.sku }),
    ...(backendProduct.short_description && { shortDescription: backendProduct.short_description }),
  };
}

/**
 * Transforma un array de productos del backend
 * 
 * @param backendProducts - Array de productos en formato del backend
 * @returns Array de productos en formato del frontend
 */
export function transformProducts(backendProducts: BackendProduct[]): Product[] {
  return backendProducts.map(transformProduct);
}

