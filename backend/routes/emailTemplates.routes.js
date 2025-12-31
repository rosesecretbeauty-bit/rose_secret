// ============================================
// Email Templates Routes
// ============================================
// Rutas para gestionar plantillas de correo

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const emailTemplateService = require('../services/emailTemplate.service');
const { logError } = require('../logger');

/**
 * GET /api/email-templates
 * Obtener todas las plantillas (admin)
 */
router.get('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logError('Error obteniendo plantillas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas'
    });
  }
});

/**
 * GET /api/email-templates/:id
 * Obtener una plantilla por ID (admin)
 */
router.get('/:id', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const template = await emailTemplateService.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logError('Error obteniendo plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantilla'
    });
  }
});

/**
 * POST /api/email-templates
 * Crear nueva plantilla (admin)
 */
router.post('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const template = await emailTemplateService.saveTemplate(req.body);
    res.status(201).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      data: template
    });
  } catch (error) {
    logError('Error creando plantilla:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear plantilla'
    });
  }
});

/**
 * PUT /api/email-templates/:id
 * Actualizar plantilla (admin)
 */
router.put('/:id', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const template = await emailTemplateService.saveTemplate({
      ...req.body,
      id: req.params.id
    });
    res.json({
      success: true,
      message: 'Plantilla actualizada exitosamente',
      data: template
    });
  } catch (error) {
    logError('Error actualizando plantilla:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar plantilla'
    });
  }
});

/**
 * DELETE /api/email-templates/:id
 * Eliminar plantilla (admin)
 */
router.delete('/:id', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    await emailTemplateService.deleteTemplate(req.params.id);
    res.json({
      success: true,
      message: 'Plantilla eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar plantilla'
    });
  }
});

/**
 * PATCH /api/email-templates/:id/toggle
 * Activar/desactivar plantilla (admin)
 */
router.patch('/:id/toggle', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const template = await emailTemplateService.toggleTemplate(req.params.id, isActive);
    res.json({
      success: true,
      message: `Plantilla ${isActive ? 'activada' : 'desactivada'} exitosamente`,
      data: template
    });
  } catch (error) {
    logError('Error cambiando estado de plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de plantilla'
    });
  }
});

module.exports = router;

