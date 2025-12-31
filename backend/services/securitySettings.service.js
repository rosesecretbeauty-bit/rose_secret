// ============================================
// Security Settings Service
// ============================================
// Gestiona las configuraciones de seguridad del sistema

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener configuración de seguridad
 */
async function getSecuritySettings() {
  try {
    const settings = await query('SELECT * FROM security_settings LIMIT 1');
    
    if (settings.length === 0) {
      // Crear configuración por defecto
      return await createDefaultSettings();
    }
    
    const setting = settings[0];
    return {
      id: setting.id,
      ipBlockingEnabled: !!setting.ip_blocking_enabled,
      ipBlockDurationMinutes: setting.ip_block_duration_minutes || 15,
      maxFailedAttempts: setting.max_failed_attempts || 5,
      suspiciousActivityWindowMinutes: setting.suspicious_activity_window_minutes || 15,
      rateLimitEnabled: !!setting.rate_limit_enabled,
      abuseDetectionEnabled: !!setting.abuse_detection_enabled,
      bruteForceProtectionEnabled: !!setting.brute_force_protection_enabled,
      updatedAt: setting.updated_at,
      updatedBy: setting.updated_by
    };
  } catch (error) {
    logError('Error obteniendo configuración de seguridad:', error);
    // Retornar valores por defecto en caso de error
    return getDefaultSettings();
  }
}

/**
 * Crear configuración por defecto
 */
async function createDefaultSettings() {
  try {
    await query(`
      INSERT INTO security_settings (
        ip_blocking_enabled,
        ip_block_duration_minutes,
        max_failed_attempts,
        suspicious_activity_window_minutes,
        rate_limit_enabled,
        abuse_detection_enabled,
        brute_force_protection_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [1, 15, 5, 15, 1, 1, 1]);
    
    return await getSecuritySettings();
  } catch (error) {
    logError('Error creando configuración por defecto:', error);
    return getDefaultSettings();
  }
}

/**
 * Obtener valores por defecto (sin BD)
 */
function getDefaultSettings() {
  return {
    id: null,
    ipBlockingEnabled: true,
    ipBlockDurationMinutes: 15,
    maxFailedAttempts: 5,
    suspiciousActivityWindowMinutes: 15,
    rateLimitEnabled: true,
    abuseDetectionEnabled: true,
    bruteForceProtectionEnabled: true,
    updatedAt: null,
    updatedBy: null
  };
}

/**
 * Actualizar configuración de seguridad
 */
async function updateSecuritySettings(data, userId = null) {
  try {
    const existing = await query('SELECT id FROM security_settings LIMIT 1');
    
    if (existing.length === 0) {
      // Crear nueva configuración
      await query(`
        INSERT INTO security_settings (
          ip_blocking_enabled,
          ip_block_duration_minutes,
          max_failed_attempts,
          suspicious_activity_window_minutes,
          rate_limit_enabled,
          abuse_detection_enabled,
          brute_force_protection_enabled,
          updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.ipBlockingEnabled !== false ? 1 : 0,
        data.ipBlockDurationMinutes || 15,
        data.maxFailedAttempts || 5,
        data.suspiciousActivityWindowMinutes || 15,
        data.rateLimitEnabled !== false ? 1 : 0,
        data.abuseDetectionEnabled !== false ? 1 : 0,
        data.bruteForceProtectionEnabled !== false ? 1 : 0,
        userId
      ]);
    } else {
      // Actualizar configuración existente
      await query(`
        UPDATE security_settings SET
          ip_blocking_enabled = ?,
          ip_block_duration_minutes = ?,
          max_failed_attempts = ?,
          suspicious_activity_window_minutes = ?,
          rate_limit_enabled = ?,
          abuse_detection_enabled = ?,
          brute_force_protection_enabled = ?,
          updated_by = ?
        WHERE id = ?
      `, [
        data.ipBlockingEnabled !== false ? 1 : 0,
        data.ipBlockDurationMinutes || 15,
        data.maxFailedAttempts || 5,
        data.suspiciousActivityWindowMinutes || 15,
        data.rateLimitEnabled !== false ? 1 : 0,
        data.abuseDetectionEnabled !== false ? 1 : 0,
        data.bruteForceProtectionEnabled !== false ? 1 : 0,
        userId,
        existing[0].id
      ]);
    }
    
    return await getSecuritySettings();
  } catch (error) {
    logError('Error actualizando configuración de seguridad:', error);
    throw error;
  }
}

module.exports = {
  getSecuritySettings,
  updateSecuritySettings,
  getDefaultSettings
};

