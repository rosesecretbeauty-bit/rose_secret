// ============================================
// Waitlist Routes - Lista de Espera de Productos
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const waitlistService = require('../services/waitlist.service');
const { body, validationResult, param } = require('express-validator');

// ============================================
// GET /api/user/waitlist
// ============================================
// Obtener waitlist del usuario
router.get('/', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await waitlistService.getUserWaitlist(userId);

    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    logError('Error getting waitlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de espera'
    });
  }
});

// ============================================
// POST /api/user/waitlist
// ============================================
// Agregar producto a waitlist
router.post('/', authenticate, rateLimiters.private, [
  body('product_id').isInt({ min: 1 }).withMessage('product_id debe ser un número válido'),
  body('variant_id').optional().isInt({ min: 1 }).withMessage('variant_id debe ser un número válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const productId = parseInt(req.body.product_id);
    const variantId = req.body.variant_id ? parseInt(req.body.variant_id) : null;

    const result = await waitlistService.addToWaitlist(userId, productId, variantId);

    res.status(201).json({
      success: true,
      message: 'Producto agregado a tu lista de espera',
      data: result
    });
  } catch (error) {
    logError('Error adding to waitlist:', error);
    
    if (error.message.includes('ya está en tu lista') ||
        error.message.includes('no encontrado') ||
        error.message.includes('no disponible')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al agregar a lista de espera'
    });
  }
});

// ============================================
// DELETE /api/user/waitlist/:id
// ============================================
// Remover de waitlist
router.delete('/:id', authenticate, rateLimiters.private, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const waitlistId = parseInt(req.params.id);

    await waitlistService.removeFromWaitlist(userId, waitlistId);

    res.json({
      success: true,
      message: 'Producto removido de tu lista de espera'
    });
  } catch (error) {
    logError('Error removing from waitlist:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al remover de lista de espera'
    });
  }
});

module.exports = router;

