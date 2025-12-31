// ============================================
// App Config API Client
// ============================================

import { api } from './client';

export interface AppConfig {
  id: number;
  active: boolean;
  android_url?: string;
  ios_url?: string;
  web_url?: string;
  app_name: string;
  app_description?: string;
  app_rating?: number;
  app_reviews_count?: number;
  qr_code_url?: string;
  banner_text?: string;
  interstitial_enabled: boolean;
  interstitial_trigger_views: number;
}

export interface AppConfigResponse {
  success: boolean;
  data: AppConfig | null;
  message?: string;
}

/**
 * Obtener configuración activa de app
 * Retorna null si no hay app activa o no hay URLs válidas
 */
export async function getActiveAppConfig(): Promise<AppConfig | null> {
  try {
    const response = await api.get('/app-config') as AppConfigResponse;
    
    if (response.success && response.data) {
      // Validar que tenga al menos una URL válida
      const hasValidUrl = response.data.android_url || response.data.ios_url || response.data.web_url;
      if (hasValidUrl && response.data.active) {
        return response.data;
      }
    }
    
    return null;
  } catch (error) {
    // Silenciar errores, simplemente no mostrar la sección
    return null;
  }
}

/**
 * Obtener configuración completa de app (admin)
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  try {
    const response = await api.get('/app-config/admin') as AppConfigResponse;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo configuración de app:', error);
    throw error;
  }
}

/**
 * Actualizar configuración de app (admin)
 */
export async function updateAppConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  try {
    const response = await api.put('/app-config/admin', config) as AppConfigResponse;
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al actualizar configuración');
  } catch (error) {
    console.error('Error actualizando configuración de app:', error);
    throw error;
  }
}

