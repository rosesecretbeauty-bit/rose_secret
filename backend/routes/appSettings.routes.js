// ============================================
// App Settings Routes
// ============================================
// Rutas para gestionar configuraciones generales de la plataforma

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache');
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const appSettingsService = require('../services/appSettings.service');
const { logError } = require('../logger');

/**
 * GET /api/app-settings/public
 * Obtener configuraciones públicas (sin auth)
 */
router.get('/public', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('APP_CONFIG') || 300,
  keyBuilder: () => 'app:settings:public',
  vary: []
}), async (req, res) => {
  try {
    const settings = await appSettingsService.getPublicSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logError('Error obteniendo configuraciones públicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones'
    });
  }
});

/**
 * GET /api/app-settings
 * Obtener todas las configuraciones (admin)
 */
router.get('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const settings = await appSettingsService.getAllSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logError('Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones'
    });
  }
});

/**
 * GET /api/app-settings/:key
 * Obtener una configuración por clave (admin)
 */
router.get('/:key', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const setting = await appSettingsService.getSetting(req.params.key);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    logError('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración'
    });
  }
});

/**
 * PUT /api/app-settings/:key
 * Actualizar una configuración (admin)
 */
router.put('/:key', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const setting = await appSettingsService.saveSetting(
      req.params.key,
      req.body.value,
      {
        type: req.body.type,
        category: req.body.category,
        label: req.body.label,
        description: req.body.description,
        isPublic: req.body.isPublic
      }
    );
    
    // Invalidar cache
    cacheManager.del('app:settings:public');
    
    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: setting
    });
  } catch (error) {
    logError('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración'
    });
  }
});

/**
 * POST /api/app-settings/batch
 * Actualizar múltiples configuraciones (admin)
 */
router.post('/batch', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const settings = await appSettingsService.saveSettings(req.body);
    
    // Invalidar cache
    cacheManager.del('app:settings:public');
    
    res.json({
      success: true,
      message: 'Configuraciones actualizadas exitosamente',
      data: settings
    });
  } catch (error) {
    logError('Error actualizando configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuraciones'
    });
  }
});

/**
 * DELETE /api/app-settings/:key
 * Eliminar configuración (admin)
 */
router.delete('/:key', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    await appSettingsService.deleteSetting(req.params.key);
    
    // Invalidar cache
    cacheManager.del('app:settings:public');
    
    res.json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar configuración'
    });
  }
});

module.exports = router;

