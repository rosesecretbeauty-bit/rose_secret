// ============================================
// App Config Routes
// ============================================
// Rutas para gestionar configuración de app móvil

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const appConfigService = require('../services/appConfig.service');
const { logError } = require('../logger');

/**
 * GET /api/app-config
 * Obtener configuración activa de app (público)
 * ✅ CACHEABLE: Datos de configuración que cambian poco
 * FASE 2: Cache agregado con TTL de 5 minutos
 */
router.get('/', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('APP_CONFIG') || 300, // 5 minutos por defecto
  keyBuilder: () => 'app:config:active',
  vary: []
}), async (req, res) => {
  try {
    const config = await appConfigService.getActiveAppConfig();
    
    if (!config) {
      return res.json({
        success: true,
        data: null,
        message: 'App download no disponible'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logError('Error obteniendo configuración de app:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de app'
    });
  }
});

/**
 * GET /api/app-config/admin
 * Obtener configuración completa (admin)
 */
router.get('/admin', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const config = await appConfigService.getAppConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logError('Error obteniendo configuración de app (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de app'
    });
  }
});

/**
 * PUT /api/app-config/admin
 * Actualizar configuración de app (admin)
 */
router.put('/admin', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const result = await appConfigService.updateAppConfig(req.body);
    
    // FASE 2: Invalidar cache cuando se actualiza la configuración
    cacheManager.del('app:config:active');
    cacheManager.del('app:config:admin');
    
    res.json({
      success: true,
      message: 'Configuración de app actualizada',
      data: result
    });
  } catch (error) {
    logError('Error actualizando configuración de app:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración de app'
    });
  }
});

module.exports = router;

