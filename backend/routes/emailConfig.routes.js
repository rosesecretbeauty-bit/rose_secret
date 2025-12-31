// ============================================
// Email Config Routes
// ============================================
// Rutas para gestionar configuración de emails

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const emailConfigService = require('../services/emailConfig.service');
const { logError } = require('../logger');

/**
 * GET /api/email-config
 * Obtener configuración de email (admin)
 */
router.get('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const config = await emailConfigService.getEmailConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logError('Error obteniendo configuración de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de email'
    });
  }
});

/**
 * PUT /api/email-config
 * Actualizar configuración de email (admin)
 */
router.put('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const config = await emailConfigService.updateEmailConfig(req.body);
    res.json({
      success: true,
      message: 'Configuración de email actualizada exitosamente',
      data: config
    });
  } catch (error) {
    logError('Error actualizando configuración de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración de email'
    });
  }
});

module.exports = router;

