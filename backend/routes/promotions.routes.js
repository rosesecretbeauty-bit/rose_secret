// ============================================
// Promotions Routes
// ============================================
// Rutas para gestionar promociones y flash sales

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { optionalAuthenticate } = require('../middleware/optionalAuth');
const { authorize } = require('../middleware/authorize');
const { rateLimiters } = require('../security/rateLimiter');
const promotionService = require('../services/promotion.service');
const { logError } = require('../logger');

/**
 * GET /api/promotions/active
 * Obtener promociones activas (público)
 * Query params: position (opcional) - 'header', 'top', 'homepage', 'floating'
 */
router.get('/active', rateLimiters.public, async (req, res) => {
  try {
    const { position } = req.query;
    const promotions = await promotionService.getActivePromotions(position || null);
    
    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    logError('Error obteniendo promociones activas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener promociones'
    });
  }
});

/**
 * GET /api/promotions
 * Obtener todas las promociones (admin)
 */
router.get('/', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions(req.query);
    
    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    logError('Error obteniendo promociones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener promociones'
    });
  }
});

/**
 * POST /api/promotions
 * Crear nueva promoción (admin)
 */
router.post('/', authenticate, authorize('promotions.create'), rateLimiters.admin, async (req, res) => {
  try {
    const result = await promotionService.createPromotion(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Promoción creada exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error creando promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear promoción'
    });
  }
});

/**
 * PUT /api/promotions/:id
 * Actualizar promoción (admin)
 */
router.put('/:id', authenticate, authorize('promotions.update'), rateLimiters.admin, async (req, res) => {
  try {
    const result = await promotionService.updatePromotion(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Promoción actualizada exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error actualizando promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar promoción'
    });
  }
});

/**
 * DELETE /api/promotions/:id
 * Eliminar promoción (admin)
 */
router.delete('/:id', authenticate, authorize('promotions.delete'), rateLimiters.admin, async (req, res) => {
  try {
    const result = await promotionService.deletePromotion(req.params.id);
    
    res.json({
      success: true,
      message: 'Promoción eliminada exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error eliminando promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar promoción'
    });
  }
});

module.exports = router;

