// ============================================
// Payment Routes - Sistema Completo y Desacoplado
// ============================================
// Integración directa con order.service
// NO modifica órdenes ni inventario directamente

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError, info } = require('../logger');
const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const auditService = require('../services/audit.service');

// ============================================
// POST /api/payments
// ============================================
// Crear intento de pago para una orden
router.post('/', authenticate, rateLimiters.payment, [
  body('order_id').isInt({ min: 1 }).withMessage('order_id debe ser un número válido'),
  body('provider').optional().isIn(['stripe', 'paypal', 'manual']).withMessage('Proveedor inválido'),
  body('provider_data').optional().isObject().withMessage('provider_data debe ser un objeto')
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
    const orderId = parseInt(req.body.order_id);
    const provider = req.body.provider || 'stripe';
    const providerData = req.body.provider_data || {};

    // Validar que la orden pertenece al usuario
    const order = await orderService.getOrderById(orderId, userId);

    // Crear pago
    const payment = await paymentService.createPayment(orderId, provider, providerData);

    // Registrar auditoría
    await auditService.logAudit(
      'PAYMENT_CREATED',
      'payment',
      payment.id,
      null,
      { order_id: orderId, provider, amount: payment.amount },
      req
    );

    // Retornar datos necesarios para el frontend
    let responseData = {
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      }
    };

    // Si es Stripe, incluir clientSecret
    if (provider === 'stripe' && payment.provider_payload && payment.provider_payload.clientSecret) {
      responseData.clientSecret = payment.provider_payload.clientSecret;
    }

    res.status(201).json({
      success: true,
      message: 'Intento de pago creado exitosamente',
      data: responseData
    });
  } catch (error) {
    logError('Error creating payment:', error);
    
    if (error.message?.includes('no encontrada') || error.message?.includes('Solo se pueden crear pagos')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear intento de pago'
    });
  }
});

// ============================================
// POST /api/payments/create-intent
// ============================================
// Crear Payment Intent para Stripe (alias específico para frontend)
router.post('/create-intent', authenticate, rateLimiters.payment, [
  body('order_id').isInt({ min: 1 }).withMessage('order_id debe ser un número válido')
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
    const orderId = parseInt(req.body.order_id);

    // Validar que la orden pertenece al usuario
    const order = await orderService.getOrderById(orderId, userId);

    // Crear pago con Stripe
    const payment = await paymentService.createPayment(orderId, 'stripe', {});

    // Registrar auditoría
    await auditService.logAudit(
      'PAYMENT_CREATED',
      'payment',
      payment.id,
      null,
      { order_id: orderId, provider: 'stripe', amount: payment.amount },
      req
    );

    // Retornar datos necesarios para Stripe
    let responseData = {
      order_id: payment.order_id,
      order_number: order.order_number,
      amount: payment.amount
    };

    // Incluir clientSecret si está disponible
    if (payment.provider_payload && payment.provider_payload.clientSecret) {
      responseData.clientSecret = payment.provider_payload.clientSecret;
    }

    res.status(201).json({
      success: true,
      message: 'Intención de pago creada exitosamente',
      data: responseData
    });
  } catch (error) {
    logError('Error creating payment intent:', error);
    
    if (error.message?.includes('no encontrada') || error.message?.includes('Solo se pueden crear pagos')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear intención de pago'
    });
  }
});

// ============================================
// GET /api/payments/orders/:orderId/status
// ============================================
// Obtener estado de pago de una orden
router.get('/orders/:orderId/status', authenticate, rateLimiters.public, [
  param('orderId').isInt({ min: 1 }).withMessage('ID de orden inválido')
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
    const orderId = parseInt(req.params.orderId);

    // Validar que la orden pertenece al usuario
    const order = await orderService.getOrderById(orderId, userId);

    // Obtener pagos de la orden
    const payments = await paymentService.getPaymentsByOrderId(orderId);

    // Obtener el pago más reciente
    const latestPayment = payments.length > 0 ? payments[0] : null;

    res.json({
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        order_status: order.status,
        payment_status: order.payment_status,
        payment: latestPayment ? {
          id: latestPayment.id,
          payment_intent_id: latestPayment.external_reference,
          amount: latestPayment.amount,
          currency: latestPayment.currency,
          status: latestPayment.status,
          payment_method: latestPayment.provider,
          failure_reason: latestPayment.failure_reason,
          created_at: latestPayment.created_at,
          updated_at: latestPayment.updated_at
        } : null
      }
    });
  } catch (error) {
    logError('Error getting payment status:', error);
    
    if (error.message?.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de pago'
    });
  }
});

// ============================================
// POST /api/payments/confirm
// ============================================
// Confirmar pago usando payment_intent_id y order_id (más flexible)
router.post('/confirm', authenticate, rateLimiters.payment, [
  body('payment_intent_id').trim().isLength({ min: 1 }).withMessage('payment_intent_id es requerido'),
  body('order_id').isInt({ min: 1 }).withMessage('order_id debe ser un número válido')
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
    const orderId = parseInt(req.body.order_id);
    const paymentIntentId = req.body.payment_intent_id;

    // Validar que la orden pertenece al usuario
    const order = await orderService.getOrderById(orderId, userId);

    // Buscar pago por external_reference (payment_intent_id)
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    const payment = payments.find(p => p.external_reference === paymentIntentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado para esta orden'
      });
    }

    // Confirmar pago (idempotente)
    const confirmedPayment = await paymentService.confirmPayment(payment.id, {});

    // Obtener orden actualizada
    const updatedOrder = await orderService.getOrderById(orderId, userId);

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: {
        order_id: updatedOrder.id,
        status: updatedOrder.status,
        alreadyProcessed: confirmedPayment.status === 'paid' && payment.status === 'paid'
      }
    });
  } catch (error) {
    logError('Error confirming payment:', error);
    
    if (error.message?.includes('no encontrado') || error.message?.includes('No se puede confirmar')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al confirmar pago'
    });
  }
});

// ============================================
// POST /api/payments/:id/confirm
// ============================================
// Confirmar pago (idempotente)
router.post('/:id/confirm', authenticate, rateLimiters.payment, [
  param('id').isInt({ min: 1 }).withMessage('ID de pago inválido'),
  body('provider_data').optional().isObject().withMessage('provider_data debe ser un objeto')
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

    const paymentId = parseInt(req.params.id);
    const providerData = req.body.provider_data || {};

    // Validar que el pago pertenece a una orden del usuario
    const payment = await paymentService.getPaymentById(paymentId);
    const order = await orderService.getOrderById(payment.order_id, req.user.id);

    // Confirmar pago (idempotente)
    const confirmedPayment = await paymentService.confirmPayment(paymentId, providerData);

    // Obtener orden actualizada
    const updatedOrder = await orderService.getOrderById(payment.order_id, req.user.id);

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: {
        payment: {
          id: confirmedPayment.id,
          order_id: confirmedPayment.order_id,
          status: confirmedPayment.status,
          amount: confirmedPayment.amount
        },
        order: {
          id: updatedOrder.id,
          order_number: updatedOrder.order_number,
          status: updatedOrder.status,
          payment_status: updatedOrder.payment_status
        }
      }
    });
  } catch (error) {
    logError('Error confirming payment:', error);
    
    if (error.message?.includes('no encontrado') || error.message?.includes('No se puede confirmar')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al confirmar pago'
    });
  }
});

// ============================================
// POST /api/payments/:id/fail
// ============================================
// Marcar pago como fallido
router.post('/:id/fail', authenticate, rateLimiters.payment, [
  param('id').isInt({ min: 1 }).withMessage('ID de pago inválido'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Motivo inválido'),
  body('provider_data').optional().isObject().withMessage('provider_data debe ser un objeto')
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

    const paymentId = parseInt(req.params.id);
    const reason = req.body.reason || 'Pago fallido';
    const providerData = req.body.provider_data || {};

    // Validar que el pago pertenece a una orden del usuario
    const payment = await paymentService.getPaymentById(paymentId);
    const order = await orderService.getOrderById(payment.order_id, req.user.id);

    // Marcar como fallido
    const failedPayment = await paymentService.failPayment(paymentId, reason, providerData);

    // Obtener orden actualizada
    const updatedOrder = await orderService.getOrderById(payment.order_id, req.user.id);

    res.json({
      success: true,
      message: 'Pago marcado como fallido',
      data: {
        payment: {
          id: failedPayment.id,
          order_id: failedPayment.order_id,
          status: failedPayment.status,
          failure_reason: failedPayment.failure_reason
        },
        order: {
          id: updatedOrder.id,
          order_number: updatedOrder.order_number,
          status: updatedOrder.status,
          payment_status: updatedOrder.payment_status
        }
      }
    });
  } catch (error) {
    logError('Error failing payment:', error);
    
    if (error.message?.includes('no encontrado') || error.message?.includes('No se puede marcar')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al marcar pago como fallido'
    });
  }
});

// ============================================
// ENDPOINTS ADMIN
// ============================================

// ============================================
// GET /api/admin/payments
// ============================================
// Listar todos los pagos (admin)
router.get('/admin/payments', authenticate, requireAdmin, rateLimiters.admin, [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded']),
  queryValidator('provider').optional().isIn(['stripe', 'paypal', 'manual']),
  queryValidator('order_id').optional().isInt({ min: 1 })
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const provider = req.query.provider;
    const orderId = req.query.order_id ? parseInt(req.query.order_id) : null;

    const result = await paymentService.listAllPayments({
      page,
      limit,
      status,
      provider,
      orderId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Error listing payments (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
});

// ============================================
// GET /api/admin/payments/:id
// ============================================
// Obtener pago individual (admin)
router.get('/admin/payments/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt({ min: 1 }).withMessage('ID de pago inválido')
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

    const paymentId = parseInt(req.params.id);

    const payment = await paymentService.getPaymentById(paymentId);

    // Obtener orden asociada
    const order = await orderService.getOrderById(payment.order_id);

    res.json({
      success: true,
      data: {
        payment,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          payment_status: order.payment_status
        }
      }
    });
  } catch (error) {
    logError('Error getting payment (admin):', error);
    
    if (error.message?.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener pago'
    });
  }
});

// ============================================
// POST /api/admin/payments/:id/refund
// ============================================
// Reembolsar pago (admin)
router.post('/admin/payments/:id/refund', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt({ min: 1 }).withMessage('ID de pago inválido'),
  body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Motivo es requerido (max 500 caracteres)'),
  body('provider_data').optional().isObject().withMessage('provider_data debe ser un objeto')
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

    const paymentId = parseInt(req.params.id);
    const reason = req.body.reason;
    const providerData = req.body.provider_data || {};
    const userId = req.user.id;

    // Reembolsar pago
    const refundedPayment = await paymentService.refundPayment(paymentId, userId, reason, providerData);

    // Obtener orden actualizada
    const updatedOrder = await orderService.getOrderById(refundedPayment.order_id);

    // Registrar auditoría
    await auditService.logAudit(
      'PAYMENT_REFUNDED',
      'payment',
      paymentId,
      { previous_status: 'paid' },
      { new_status: 'refunded', reason, order_id: refundedPayment.order_id },
      req
    );

    res.json({
      success: true,
      message: 'Pago reembolsado exitosamente',
      data: {
        payment: {
          id: refundedPayment.id,
          order_id: refundedPayment.order_id,
          status: refundedPayment.status,
          failure_reason: refundedPayment.failure_reason
        },
        order: {
          id: updatedOrder.id,
          order_number: updatedOrder.order_number,
          status: updatedOrder.status,
          payment_status: updatedOrder.payment_status
        }
      }
    });
  } catch (error) {
    logError('Error refunding payment (admin):', error);
    
    if (error.message?.includes('no encontrado') || error.message?.includes('Solo se pueden reembolsar')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al reembolsar pago'
    });
  }
});

module.exports = router;
