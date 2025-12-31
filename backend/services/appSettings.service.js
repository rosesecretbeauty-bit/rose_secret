// ============================================
// App Settings Service
// ============================================
// Gestiona las configuraciones generales de la plataforma

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener todas las configuraciones
 */
async function getAllSettings() {
  try {
    const settings = await query(`
      SELECT * FROM app_settings 
      ORDER BY category, label
    `);
    
    return settings.map(setting => ({
      id: setting.id,
      key: setting.setting_key,
      value: parseSettingValue(setting.setting_value, setting.setting_type),
      type: setting.setting_type,
      category: setting.category,
      label: setting.label,
      description: setting.description,
      isPublic: !!setting.is_public
    }));
  } catch (error) {
    logError('Error obteniendo configuraciones:', error);
    throw error;
  }
}

/**
 * Obtener configuraciones públicas (para frontend)
 */
async function getPublicSettings() {
  try {
    const settings = await query(`
      SELECT setting_key, setting_value, setting_type 
      FROM app_settings 
      WHERE is_public = 1
    `);
    
    const result = {};
    settings.forEach(setting => {
      result[setting.setting_key] = parseSettingValue(
        setting.setting_value, 
        setting.setting_type
      );
    });
    
    return result;
  } catch (error) {
    logError('Error obteniendo configuraciones públicas:', error);
    throw error;
  }
}

/**
 * Obtener configuración por clave
 */
async function getSetting(key) {
  try {
    const settings = await query(
      'SELECT * FROM app_settings WHERE setting_key = ?',
      [key]
    );
    
    if (settings.length === 0) {
      return null;
    }
    
    const setting = settings[0];
    return {
      id: setting.id,
      key: setting.setting_key,
      value: parseSettingValue(setting.setting_value, setting.setting_type),
      type: setting.setting_type,
      category: setting.category,
      label: setting.label,
      description: setting.description,
      isPublic: !!setting.is_public
    };
  } catch (error) {
    logError('Error obteniendo configuración:', error);
    throw error;
  }
}

/**
 * Guardar configuración
 */
async function saveSetting(key, value, options = {}) {
  try {
    const existing = await query(
      'SELECT id FROM app_settings WHERE setting_key = ?',
      [key]
    );
    
    const valueStr = stringifySettingValue(value, options.type || 'text');
    
    if (existing.length > 0) {
      // Actualizar
      await query(`
        UPDATE app_settings SET
          setting_value = ?,
          setting_type = ?,
          label = ?,
          description = ?,
          is_public = ?
        WHERE setting_key = ?
      `, [
        valueStr,
        options.type || 'text',
        options.label || null,
        options.description || null,
        options.isPublic ? 1 : 0,
        key
      ]);
    } else {
      // Crear nueva
      await query(`
        INSERT INTO app_settings (
          setting_key, setting_value, setting_type,
          category, label, description, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        key,
        valueStr,
        options.type || 'text',
        options.category || 'general',
        options.label || null,
        options.description || null,
        options.isPublic ? 1 : 0
      ]);
    }
    
    return await getSetting(key);
  } catch (error) {
    logError('Error guardando configuración:', error);
    throw error;
  }
}

/**
 * Guardar múltiples configuraciones
 */
async function saveSettings(settings) {
  try {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const result = await saveSetting(key, value.value, {
        type: value.type,
        category: value.category,
        label: value.label,
        description: value.description,
        isPublic: value.isPublic
      });
      results.push(result);
    }
    return results;
  } catch (error) {
    logError('Error guardando configuraciones:', error);
    throw error;
  }
}

/**
 * Eliminar configuración
 */
async function deleteSetting(key) {
  try {
    await query('DELETE FROM app_settings WHERE setting_key = ?', [key]);
    return { success: true };
  } catch (error) {
    logError('Error eliminando configuración:', error);
    throw error;
  }
}

/**
 * Parsear valor según tipo
 */
function parseSettingValue(value, type) {
  if (value === null || value === undefined) {
    return null;
  }
  
  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === '1' || value === 'true' || value === true;
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

/**
 * Convertir valor a string según tipo
 */
function stringifySettingValue(value, type) {
  if (value === null || value === undefined) {
    return null;
  }
  
  switch (type) {
    case 'boolean':
      return value ? '1' : '0';
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

module.exports = {
  getAllSettings,
  getPublicSettings,
  getSetting,
  saveSetting,
  saveSettings,
  deleteSetting
};

