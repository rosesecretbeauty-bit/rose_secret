// src/api/blogs.ts

import { api } from './client';

export interface Blog {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogImage {
  id: number;
  blog_id: number;
  image_url: string;
  alt_text?: string;
  type: 'content' | 'gallery';
  sort_order: number;
  created_at: string;
}

/**
 * Subir imagen de portada de blog usando Cloudinary
 */
export async function uploadBlogCoverImage(
  blogId: number,
  file: File
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/blogs/${blogId}/cover`, {
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
    console.error('Error subiendo imagen de portada:', error);
    throw error;
  }
}

/**
 * Subir imagen de contenido de blog usando Cloudinary
 */
export async function uploadBlogContentImage(
  blogId: number,
  file: File,
  altText?: string
): Promise<BlogImage> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (altText) {
      formData.append('alt_text', altText);
    }

    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiBaseUrl}/images/blogs/${blogId}/content`, {
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
      blog_id: blogId,
      image_url: data.data.url,
      alt_text: data.data.alt_text || undefined,
      type: 'content',
      sort_order: data.data.sort_order,
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error subiendo imagen de contenido:', error);
    throw error;
  }
}

/**
 * Eliminar imagen de contenido de blog
 */
export async function deleteBlogContentImage(
  blogId: number,
  imageId: number
): Promise<void> {
  try {
    const response = await api.delete(`/images/blogs/${blogId}/content/${imageId}`) as {
      success: boolean;
      message?: string;
    };
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar imagen');
    }
  } catch (error: any) {
    console.error('Error eliminando imagen de contenido:', error);
    throw error;
  }
}

