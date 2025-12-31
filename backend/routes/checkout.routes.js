// ============================================
// Rutas de Checkout
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { userSpecificKeys } = require('../cache/cacheKeys');

// ============================================
// POST /api/checkout
// ============================================
// Crear orden desde carrito
// Requiere autenticación (los guests deben iniciar sesión primero)
router.post('/', authenticate, rateLimiters.checkout, [
  // Dirección de envío (requerida)
  body('shipping_name').trim().notEmpty().withMessage('Nombre completo requerido'),
  body('shipping_street').trim().notEmpty().withMessage('Dirección requerida'),
  body('shipping_city').trim().notEmpty().withMessage('Ciudad requerida'),
  body('shipping_state').trim().notEmpty().withMessage('Estado requerido'),
  body('shipping_zip').trim().notEmpty().withMessage('Código postal requerido'),
  body('shipping_country').trim().notEmpty().withMessage('País requerido'),
  body('shipping_phone').optional().trim(),
  
  // Totales (opcionales, se calculan en backend)
  body('subtotal').optional().isFloat({ min: 0 }),
  body('shipping_cost').optional().isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('total').optional().isFloat({ min: 0 })
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

    const userId = req.user.id; // Requerido por authenticate middleware
    
    // Obtener carrito para calcular totales si no se proporcionan
    const cart = await cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    // Calcular totales (usar los proporcionados o calcular desde carrito)
    const subtotal = req.body.subtotal !== undefined 
      ? parseFloat(req.body.subtotal) 
      : cart.total;
    const shippingCost = req.body.shipping_cost !== undefined 
      ? parseFloat(req.body.shipping_cost) 
      : 0;
    const tax = req.body.tax !== undefined 
      ? parseFloat(req.body.tax) 
      : 0;
    const total = req.body.total !== undefined 
      ? parseFloat(req.body.total) 
      : subtotal + shippingCost + tax;

    // Preparar datos de dirección
    const addressPayload = {
      shipping_name: req.body.shipping_name,
      shipping_street: req.body.shipping_street,
      shipping_city: req.body.shipping_city,
      shipping_state: req.body.shipping_state,
      shipping_zip: req.body.shipping_zip,
      shipping_country: req.body.shipping_country,
      shipping_phone: req.body.shipping_phone || null
    };

    // Crear orden usando el servicio
    const order = await orderService.createOrderFromCart(
      userId,
      addressPayload,
      { subtotal, shipping_cost: shippingCost, tax, total }
    );

    // Invalidar cache del carrito
    cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        order
      }
    });
  } catch (error) {
    logError('Error en checkout:', error);
    
    // Errores específicos de stock
    if (error.message?.includes('Stock') || error.message?.includes('stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar checkout'
    });
  }
});

module.exports = router;

