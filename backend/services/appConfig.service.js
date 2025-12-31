// ============================================
// App Config Service
// ============================================
// Gestiona la configuración de descarga de app móvil

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener configuración activa de app
 * Solo retorna si active = true y hay al menos una URL válida
 */
async function getActiveAppConfig() {
  try {
    const configs = await query(`
      SELECT * FROM app_download_config 
      WHERE active = 1 
      AND (android_url IS NOT NULL OR ios_url IS NOT NULL OR web_url IS NOT NULL)
      LIMIT 1
    `);

    if (configs.length === 0) {
      return null;
    }

    const config = configs[0];
    
    // Validar que tenga al menos una URL válida
    const hasValidUrl = config.android_url || config.ios_url || config.web_url;
    
    if (!hasValidUrl) {
      return null;
    }

    return {
      id: config.id,
      active: !!config.active,
      android_url: config.android_url,
      ios_url: config.ios_url,
      web_url: config.web_url,
      app_name: config.app_name || 'Rose Secret',
      app_description: config.app_description,
      app_rating: config.app_rating ? parseFloat(config.app_rating) : null,
      app_reviews_count: config.app_reviews_count || null,
      qr_code_url: config.qr_code_url,
      banner_text: config.banner_text,
      interstitial_enabled: !!config.interstitial_enabled,
      interstitial_trigger_views: config.interstitial_trigger_views || 3,
    };
  } catch (error) {
    logError('Error obteniendo configuración de app:', error);
    return null;
  }
}

/**
 * Obtener configuración completa (para admin)
 */
async function getAppConfig() {
  try {
    const configs = await query('SELECT * FROM app_download_config LIMIT 1');
    
    if (configs.length === 0) {
      return null;
    }

    const config = configs[0];
    
    return {
      id: config.id,
      active: !!config.active,
      android_url: config.android_url,
      ios_url: config.ios_url,
      web_url: config.web_url,
      app_name: config.app_name || 'Rose Secret',
      app_description: config.app_description,
      app_rating: config.app_rating ? parseFloat(config.app_rating) : null,
      app_reviews_count: config.app_reviews_count || null,
      qr_code_url: config.qr_code_url,
      banner_text: config.banner_text,
      interstitial_enabled: !!config.interstitial_enabled,
      interstitial_trigger_views: config.interstitial_trigger_views || 3,
      created_at: config.created_at,
      updated_at: config.updated_at,
    };
  } catch (error) {
    logError('Error obteniendo configuración de app:', error);
    return null;
  }
}

/**
 * Actualizar configuración de app
 */
async function updateAppConfig(data) {
  try {
    const existing = await query('SELECT id FROM app_download_config LIMIT 1');
    
    if (existing.length === 0) {
      // Crear nueva configuración
      await query(`
        INSERT INTO app_download_config (
          active, android_url, ios_url, web_url, app_name, app_description,
          app_rating, app_reviews_count, qr_code_url, banner_text,
          interstitial_enabled, interstitial_trigger_views
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.active ? 1 : 0,
        data.android_url || null,
        data.ios_url || null,
        data.web_url || null,
        data.app_name || 'Rose Secret',
        data.app_description || null,
        data.app_rating || null,
        data.app_reviews_count || null,
        data.qr_code_url || null,
        data.banner_text || null,
        data.interstitial_enabled ? 1 : 0,
        data.interstitial_trigger_views || 3,
      ]);
    } else {
      // Actualizar configuración existente
      await query(`
        UPDATE app_download_config SET
          active = ?,
          android_url = ?,
          ios_url = ?,
          web_url = ?,
          app_name = ?,
          app_description = ?,
          app_rating = ?,
          app_reviews_count = ?,
          qr_code_url = ?,
          banner_text = ?,
          interstitial_enabled = ?,
          interstitial_trigger_views = ?
        WHERE id = ?
      `, [
        data.active ? 1 : 0,
        data.android_url || null,
        data.ios_url || null,
        data.web_url || null,
        data.app_name || 'Rose Secret',
        data.app_description || null,
        data.app_rating || null,
        data.app_reviews_count || null,
        data.qr_code_url || null,
        data.banner_text || null,
        data.interstitial_enabled ? 1 : 0,
        data.interstitial_trigger_views || 3,
        existing[0].id,
      ]);
    }

    // Retornar configuración actualizada
    const updated = await query('SELECT * FROM app_download_config LIMIT 1');
    if (updated.length === 0) {
      throw new Error('No se pudo obtener la configuración actualizada');
    }

    const config = updated[0];
    
    return {
      id: config.id,
      active: !!config.active,
      android_url: config.android_url,
      ios_url: config.ios_url,
      web_url: config.web_url,
      app_name: config.app_name || 'Rose Secret',
      app_description: config.app_description,
      app_rating: config.app_rating ? parseFloat(config.app_rating) : null,
      app_reviews_count: config.app_reviews_count || null,
      qr_code_url: config.qr_code_url,
      banner_text: config.banner_text,
      interstitial_enabled: !!config.interstitial_enabled,
      interstitial_trigger_views: config.interstitial_trigger_views || 3,
      created_at: config.created_at,
      updated_at: config.updated_at,
    };
  } catch (error) {
    logError('Error actualizando configuración de app:', error);
    throw error;
  }
}

module.exports = {
  getActiveAppConfig,
  getAppConfig,
  updateAppConfig,
};

