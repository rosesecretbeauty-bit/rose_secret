// ============================================
// Security Settings Routes
// ============================================
// Rutas para gestionar configuraciones de seguridad

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const securitySettingsService = require('../services/securitySettings.service');
const { invalidateConfigCache: invalidateIPCache } = require('../security/ipReputation');
const { invalidateConfigCache: invalidateBruteForceCache } = require('../middleware/bruteForce');
const { logError } = require('../logger');

/**
 * GET /api/security-settings
 * Obtener configuración de seguridad (admin)
 */
router.get('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const settings = await securitySettingsService.getSecuritySettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logError('Error obteniendo configuración de seguridad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de seguridad'
    });
  }
});

/**
 * PUT /api/security-settings
 * Actualizar configuración de seguridad (admin)
 */
router.put('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const settings = await securitySettingsService.updateSecuritySettings(req.body, userId);
    
    // Invalidar caches de seguridad para aplicar cambios inmediatamente
    invalidateIPCache();
    invalidateBruteForceCache();
    
    res.json({
      success: true,
      message: 'Configuración de seguridad actualizada exitosamente',
      data: settings
    });
  } catch (error) {
    logError('Error actualizando configuración de seguridad:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar configuración de seguridad'
    });
  }
});

module.exports = router;

