// src/api/banners.ts

import { api } from './client';

export interface Banner {
  id: number;
  type: 'home' | 'promotion' | 'sidebar' | 'popup';
  title?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  status: 'active' | 'inactive' | 'scheduled';
  start_date?: string;
  end_date?: string;
  display_order: number;
  click_count: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener todos los banners
 */
export async function getBanners(type?: Banner['type']): Promise<Banner[]> {
  try {
    const endpoint = type ? `/banners?type=${type}` : '/banners';
    const response = await api.get(endpoint) as {
      success: boolean;
      data?: {
        banners: Banner[];
      };
    };
    
    if (response.success && response.data) {
      return response.data.banners;
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo banners:', error);
    throw error;
  }
}

/**
 * Subir banner usando Cloudinary
 */
export async function uploadBanner(
  file: File,
  data: {
    type: Banner['type'];
    title?: string;
    link_url?: string;
    link_text?: string;
    status?: Banner['status'];
  }
): Promise<Banner> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', data.type);
    if (data.title) formData.append('title', data.title);
    if (data.link_url) formData.append('link_url', data.link_url);
    if (data.link_text) formData.append('link_text', data.link_text);
    if (data.status) formData.append('status', data.status);

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Error al subir banner');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error subiendo banner:', error);
    throw error;
  }
}

/**
 * Actualizar banner (opcionalmente con nueva imagen)
 */
export async function updateBanner(
  bannerId: number,
  updates: {
    title?: string;
    link_url?: string;
    link_text?: string;
    status?: Banner['status'];
  },
  newImageFile?: File
): Promise<Banner> {
  try {
    const formData = new FormData();
    
    if (newImageFile) {
      formData.append('image', newImageFile);
    }
    if (updates.title !== undefined) formData.append('title', updates.title);
    if (updates.link_url !== undefined) formData.append('link_url', updates.link_url || '');
    if (updates.link_text !== undefined) formData.append('link_text', updates.link_text || '');
    if (updates.status !== undefined) formData.append('status', updates.status);

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Error al actualizar banner');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error actualizando banner:', error);
    throw error;
  }
}

/**
 * Eliminar banner
 */
export async function deleteBanner(bannerId: number): Promise<void> {
  try {
    const response = await api.delete(`/images/banners/${bannerId}`) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar banner');
    }
  } catch (error: any) {
    console.error('Error eliminando banner:', error);
    throw error;
  }
}

