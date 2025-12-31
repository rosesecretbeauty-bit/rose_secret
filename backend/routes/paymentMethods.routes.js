// ============================================
// Payment Methods Routes - Métodos de Pago Guardados
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const paymentMethodsService = require('../services/paymentMethods.service');
const { body, validationResult, param } = require('express-validator');

// ============================================
// GET /api/user/payment-methods
// ============================================
// Obtener métodos de pago del usuario
router.get('/', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const methods = await paymentMethodsService.getUserPaymentMethods(userId);

    res.json({
      success: true,
      data: { methods }
    });
  } catch (error) {
    logError('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métodos de pago'
    });
  }
});

// ============================================
// POST /api/user/payment-methods
// ============================================
// Agregar método de pago
router.post('/', authenticate, rateLimiters.payment, [
  body('stripe_payment_method_id').trim().notEmpty().withMessage('stripe_payment_method_id es requerido')
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
    const stripePaymentMethodId = req.body.stripe_payment_method_id;

    const result = await paymentMethodsService.addPaymentMethod(userId, stripePaymentMethodId);

    res.status(201).json({
      success: true,
      message: 'Método de pago guardado exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error adding payment method:', error);
    
    if (error.message.includes('ya está guardado') ||
        error.message.includes('no está configurado') ||
        error.message.includes('tipo tarjeta')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al guardar método de pago'
    });
  }
});

// ============================================
// DELETE /api/user/payment-methods/:id
// ============================================
// Eliminar método de pago
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
    const paymentMethodId = parseInt(req.params.id);

    await paymentMethodsService.removePaymentMethod(userId, paymentMethodId);

    res.json({
      success: true,
      message: 'Método de pago eliminado exitosamente'
    });
  } catch (error) {
    logError('Error removing payment method:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar método de pago'
    });
  }
});

// ============================================
// PUT /api/user/payment-methods/:id/default
// ============================================
// Marcar método de pago como default
router.put('/:id/default', authenticate, rateLimiters.private, [
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
    const paymentMethodId = parseInt(req.params.id);

    await paymentMethodsService.setDefaultPaymentMethod(userId, paymentMethodId);

    res.json({
      success: true,
      message: 'Método de pago marcado como predeterminado'
    });
  } catch (error) {
    logError('Error setting default payment method:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al marcar método de pago como predeterminado'
    });
  }
});

module.exports = router;

