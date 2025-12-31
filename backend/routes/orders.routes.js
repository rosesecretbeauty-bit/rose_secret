// ============================================
// Rutas de Órdenes (Sistema Completo de Venta)
// ============================================
// Integración directa con Carrito e Inventario

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { userSpecificKeys } = require('../cache/cacheKeys');
const { error: logError, info } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');
const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');
const emailService = require('../services/email.service');
const { validateOrderStatusTransition } = require('../middleware/businessValidation');

// ============================================
// POST /api/orders
// ============================================
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear orden desde carrito
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_id:
 *                 type: integer
 *                 description: ID de dirección guardada (opcional si se envía address)
 *               address:
 *                 type: object
 *                 description: Dirección manual (opcional si se envía address_id)
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Crear orden desde carrito
router.post('/', authenticate, rateLimiters.checkout, [
  // address_id es opcional (si viene, se usa; si no, se requieren campos manuales)
  body('address_id').optional().isInt().withMessage('ID de dirección inválido'),
  
  // Campos manuales (requeridos solo si no viene address_id)
  body('shipping_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('shipping_street').optional().trim().isLength({ min: 5, max: 255 }),
  body('shipping_city').optional().trim().isLength({ min: 2, max: 255 }),
  body('shipping_state').optional().trim().isLength({ min: 2, max: 100 }),
  body('shipping_zip').optional().trim().isLength({ min: 3, max: 20 }),
  body('shipping_country').optional().trim().isLength({ min: 2, max: 100 }),
  body('shipping_phone').optional().trim().isLength({ max: 20 }),
  
  // Totales (opcionales, se calculan desde el carrito)
  body('subtotal').optional().isFloat({ min: 0 }),
  body('shipping_cost').optional().isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('discount').optional().isFloat({ min: 0 })
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
    const { address_id, shipping_name, shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country, shipping_phone } = req.body;

    // ============================================
    // 1. OBTENER Y VALIDAR DIRECCIÓN
    // ============================================
    const { query } = require('../db');
    let shippingAddress = null;

    if (address_id) {
      const addresses = await query(`
        SELECT 
          first_name, last_name, company,
          street, city, state, zip_code, country, phone
        FROM addresses
        WHERE id = ? AND user_id = ?
        LIMIT 1
      `, [address_id, userId]);

      if (addresses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada o no pertenece al usuario'
        });
      }

      const addr = addresses[0];
      shippingAddress = {
        shipping_name: `${addr.first_name} ${addr.last_name}`,
        shipping_street: addr.street,
        shipping_city: addr.city,
        shipping_state: addr.state,
        shipping_zip: addr.zip_code,
        shipping_country: addr.country,
        shipping_phone: addr.phone || null
      };
    } else {
      if (!shipping_name || !shipping_street || !shipping_city || !shipping_state || !shipping_zip || !shipping_country) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar address_id o todos los campos de dirección manual'
        });
      }

      shippingAddress = {
        shipping_name,
        shipping_street,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        shipping_phone: shipping_phone || null
      };
    }

    // ============================================
    // 2. OBTENER CARRITO Y CALCULAR TOTALES
    // ============================================
    const cart = await cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El carrito está vacío' 
      });
    }

    // Usar subtotal del carrito (con precios congelados)
    const subtotal = cart.subtotal;
    const shippingCost = parseFloat(req.body.shipping_cost) || 0;
    const tax = parseFloat(req.body.tax) || 0;
    const discount = parseFloat(req.body.discount) || 0;
    const total = subtotal + shippingCost + tax - discount;

    // ============================================
    // 3. CREAR ORDEN DESDE CARRITO
    // ============================================
    const order = await orderService.createOrderFromCart(
      userId,
      shippingAddress,
      {
        subtotal,
        shipping_cost: shippingCost,
        tax,
        discount,
        total
      }
    );

    // ============================================
    // 4. AUDIT LOG
    // ============================================
    await auditService.logAudit(
      'ORDER_CREATED',
      'order',
      order.id,
      null,
      { order_number: order.order_number, total, items_count: order.items.length },
      req,
      {
        order_number: order.order_number,
        total: order.total,
        user_id: userId,
        items_count: order.items.length,
      }
    );

    // ============================================
    // 5. ENVIAR NOTIFICACIONES (NO BLOQUEA)
    // ============================================
    const notificationService = require('../services/notification.service');
    
    // Notificación in-app y email
    notificationService.sendNotification({
      userId,
      type: 'order',
      channels: ['in_app', 'email'],
      title: `Pedido #${order.order_number} creado`,
      message: `Tu pedido ha sido creado exitosamente. Total: $${order.total.toFixed(2)}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        link: `/account/orders/${order.id}`,
      },
    }).catch(err => {
      logError('Error enviando notificación de pedido creado:', err);
    });

    // Email tradicional (mantener compatibilidad)
    const users = await query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
    const userEmail = users[0]?.email;

    if (userEmail) {
      emailService.sendOrderCreatedEmail(userEmail, order).catch(err => {
        logError('Error enviando email de pedido creado:', err);
      });
    }

    // ============================================
    // 6. INVALIDAR CACHE
    // ============================================
    // NO vaciamos el carrito aquí - se vaciará al confirmar el pago
    // Solo invalidamos el cache para que se actualice
    cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));

    // ============================================
    // 7. RESPUESTA
    // ============================================
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        order
      }
    });
  } catch (error) {
    logError('Error creando orden:', error);
    
    if (error.message?.includes('carrito está vacío') || error.message?.includes('Stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al crear orden' 
    });
  }
});

// ============================================
// GET /api/orders
// ============================================
// Listar órdenes del usuario
router.get('/', authenticate, rateLimiters.private, [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['pending', 'paid', 'cancelled', 'failed', 'refunded'])
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const result = await orderService.listUserOrders(userId, {
      page,
      limit,
      status
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Error obteniendo órdenes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener órdenes' 
    });
  }
});

// ============================================
// GET /api/orders/:id
// ============================================
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener detalle de orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la orden
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Obtener orden individual
router.get('/:id', authenticate, rateLimiters.private, [
  param('id').isInt({ min: 1 }).withMessage('ID de orden inválido')
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
    const orderId = parseInt(req.params.id);

    const order = await orderService.getOrderById(orderId, userId);

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    logError('Error obteniendo orden:', error);
    
    if (error.message?.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener orden' 
    });
  }
});

// ============================================
// ENDPOINTS ADMIN
// ============================================

// ============================================
// GET /api/admin/orders
// ============================================
// Listar todas las órdenes (admin)
router.get('/admin/orders', authenticate, requireAdmin, rateLimiters.admin, [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['pending', 'paid', 'cancelled', 'failed', 'refunded']),
  queryValidator('user_id').optional().isInt({ min: 1 })
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
    const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

    const result = await orderService.listAllOrders({
      page,
      limit,
      status,
      userId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Error obteniendo órdenes (admin):', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener órdenes' 
    });
  }
});

// ============================================
// GET /api/admin/orders/:id
// ============================================
// Obtener orden individual (admin)
router.get('/admin/orders/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt({ min: 1 }).withMessage('ID de orden inválido')
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

    const orderId = parseInt(req.params.id);

    const order = await orderService.getOrderById(orderId); // Sin userId para admin

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    logError('Error obteniendo orden (admin):', error);
    
    if (error.message?.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener orden' 
    });
  }
});

// ============================================
// PUT /api/admin/orders/:id/status
// ============================================
// Cambiar estado de una orden (admin)
router.put('/admin/orders/:id/status', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt({ min: 1 }).withMessage('ID de orden inválido'),
  body('status').isIn(['pending', 'paid', 'cancelled', 'failed', 'refunded']).withMessage('Estado inválido'),
  body('notes').optional().trim()
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

    const orderId = parseInt(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user.id;

    // Obtener orden actual para validar transición
    const currentOrder = await orderService.getOrderById(orderId);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Validar transición de estado
    try {
      validateOrderStatusTransition(currentOrder.status, status);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Cambiar estado (maneja inventario automáticamente)
    const order = await orderService.changeOrderStatus(orderId, status, userId, notes);

    // Registrar auditoría
    await auditService.logAudit(
      'ORDER_STATUS_CHANGED',
      'order',
      orderId,
      { previous_status: order.previous_status },
      { new_status: status, notes },
      req
    );

    // Registrar métrica
    metricsService.recordAdminAction('ORDER_STATUS_CHANGED');

    res.json({
      success: true,
      message: `Estado de orden cambiado a ${status}`,
      data: {
        order
      }
    });
  } catch (error) {
    logError('Error cambiando estado de orden:', error);
    
    if (error.message?.includes('no encontrada') || error.message?.includes('No se puede')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al cambiar estado de orden' 
    });
  }
});

module.exports = router;
