// src/api/categories.ts
// API helpers para categorías

import { api } from './client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  product_count?: number; // Contador de productos
  children?: Category[];
  parent?: Category;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    flat: Category[];
  };
}

export interface CategoryResponse {
  success: boolean;
  data: {
    category: Category;
  };
}

export interface CategoryProductsResponse {
  success: boolean;
  data: {
    products: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Obtener todas las categorías con jerarquía
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories') as CategoriesResponse;
    if (response.success && response.data) {
      return response.data.flat; // Devolver versión plana para compatibilidad
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
}

/**
 * Obtener categorías con jerarquía completa
 */
export async function getCategoriesHierarchy(): Promise<Category[]> {
  try {
    const response = await api.get('/categories') as CategoriesResponse;
    if (response.success && response.data) {
      return response.data.categories; // Devolver versión jerárquica
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
}

/**
 * Obtener una categoría por ID
 */
export async function getCategory(id: number): Promise<Category | null> {
  try {
    const response = await api.get(`/categories/${id}`) as CategoryResponse;
    if (response.success && response.data) {
      return response.data.category;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    return null;
  }
}

/**
 * Obtener productos de una categoría por slug con filtros opcionales
 */
export async function getCategoryProducts(
  slug: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    price_min?: number;
    price_max?: number;
    featured?: boolean;
    stock?: 'in_stock' | 'out_of_stock';
    variants?: boolean;
  }
): Promise<CategoryProductsResponse['data'] | null> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.price_min !== undefined) params.append('price_min', filters.price_min.toString());
      if (filters.price_max !== undefined) params.append('price_max', filters.price_max.toString());
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters.stock) params.append('stock', filters.stock);
      if (filters.variants !== undefined) params.append('variants', filters.variants.toString());
    }

    const response = await api.get(
      `/categories/${slug}/products?${params.toString()}`
    ) as CategoryProductsResponse;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    // Si es un error de validación del backend, no loguear (es esperado)
    if (error?.response?.status === 400 && error?.response?.data?.message?.includes('validación')) {
      // Silencioso: error de validación del backend
      return null;
    }
    
    // Para otros errores, loguear normalmente
    console.error('Error obteniendo productos de categoría:', error);
    return null;
  }
}

/**
 * Obtener categoría por slug (endpoint directo)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await api.get(`/categories/slug/${slug}`) as CategoryResponse;
    if (response.success && response.data) {
      return response.data.category;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo categoría por slug:', error);
    return null;
  }
}

/**
 * Obtener categoría por ID
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const response = await api.get(`/categories/${id}`) as CategoryResponse;
    if (response.success && response.data) {
      return response.data.category;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo categoría por ID:', error);
    return null;
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

/**
 * Obtener todas las categorías (admin - incluye inactivas)
 */
export async function getAdminCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/admin/categories') as {
      success: boolean;
      data: { categories: Category[] };
    };
    if (response.success && response.data) {
      return response.data.categories;
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo categorías (admin):', error);
    throw error;
  }
}

/**
 * Crear categoría (admin)
 */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  try {
    const response = await api.post('/admin/categories', data) as {
      success: boolean;
      data: { category: Category };
      message?: string;
    };
    if (response.success && response.data) {
      return response.data.category;
    }
    throw new Error(response.message || 'Error al crear categoría');
  } catch (error: any) {
    console.error('Error creando categoría:', error);
    throw error;
  }
}

/**
 * Actualizar categoría (admin)
 */
export async function updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
  try {
    const response = await api.put(`/admin/categories/${id}`, data) as {
      success: boolean;
      data: { category: Category };
      message?: string;
    };
    if (response.success && response.data) {
      return response.data.category;
    }
    throw new Error(response.message || 'Error al actualizar categoría');
  } catch (error: any) {
    console.error('Error actualizando categoría:', error);
    throw error;
  }
}

/**
 * Eliminar categoría (admin)
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    const response = await api.delete(`/admin/categories/${id}`) as {
      success: boolean;
      message?: string;
    };
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar categoría');
    }
  } catch (error: any) {
    console.error('Error eliminando categoría:', error);
    throw error;
  }
}

