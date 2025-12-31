// ============================================
// Rutas de Carrito (Sistema Completo con Reservas de Stock)
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { optionalAuthenticate } = require('../middleware/optionalAuth');
const { authenticate, requireAdmin } = require('../middleware/auth');
const cartService = require('../services/cart.service');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { userSpecificKeys } = require('../cache/cacheKeys');
const { getTTL } = require('../cache/cacheConfig');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError, info } = require('../logger');
const auditService = require('../services/audit.service');

// ============================================
// GET /api/cart
// ============================================
// Obtener carrito completo (usuario autenticado o guest)
router.get('/', optionalAuthenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    // Obtener o crear carrito (puede generar sessionId si no se proporciona)
    const cartId = await cartService.getOrCreateCart(userId, sessionId);
    
    // Obtener carrito completo
    const cart = await cartService.getCart(cartId);

    // Si es usuario autenticado, cachear
    if (userId) {
      const cacheKey = userSpecificKeys.cart(userId, req.apiVersion || 1);
      await cacheManager.set(cacheKey, cart, getTTL('USER_CART'));
    }

    // Preparar respuesta
    const response = {
      success: true,
      data: cart
    };

    // Si es guest y el cartId es un sessionId (string), incluirlo en la respuesta
    // para que el frontend pueda guardarlo
    if (!userId && typeof cartId === 'string' && cartId.startsWith('guest_')) {
      response.sessionId = cartId;
      // También agregar header para que el frontend lo pueda leer
      res.setHeader('X-Session-Id', cartId);
    }

    res.json(response);
  } catch (error) {
    logError('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito'
    });
  }
});

// ============================================
// POST /api/cart/items
// ============================================
// Agregar item al carrito con reserva de stock
router.post('/items', optionalAuthenticate, rateLimiters.api, [
  body('product_id').isInt({ min: 1 }).withMessage('product_id debe ser un número válido'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity debe ser al menos 1'),
  body('variant_id').optional().isInt({ min: 1 }).withMessage('variant_id debe ser un número válido'),
  body('price_snapshot').isFloat({ min: 0.01 }).withMessage('price_snapshot debe ser un número válido mayor a 0')
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

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    const { product_id, variant_id, quantity, price_snapshot } = req.body;

    // Validar sessionId para guests
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId es requerido en header x-session-id para usuarios no autenticados'
      });
    }

    // Obtener o crear carrito
    const cartId = await cartService.getOrCreateCart(userId, sessionId);

    // Agregar item usando el servicio (reserva stock automáticamente)
    const result = await cartService.addItem(cartId, {
      product_id,
      variant_id: variant_id || null,
      quantity,
      price_snapshot
    });

    // Si es guest, retornar datos para manejar en frontend
    if (result.is_guest) {
      return res.json({
        success: true,
        message: 'Producto añadido al carrito (no se reserva stock para guests)',
        data: {
          item: result,
          is_guest: true
        }
      });
    }

    // Invalidar cache si es usuario autenticado
    if (userId) {
      cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));
    }

    // Obtener carrito actualizado
    const cart = await cartService.getCart(cartId);

    res.json({
      success: true,
      message: 'Producto añadido al carrito con reserva de stock',
      data: cart
    });
  } catch (error) {
    logError('Error añadiendo al carrito:', error);
    
    // Si es error de stock, retornar mensaje específico
    if (error.message?.includes('Stock') || error.message?.includes('stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al añadir al carrito'
    });
  }
});

// ============================================
// PUT /api/cart/items/:id
// ============================================
// Actualizar cantidad de un item con ajuste de reserva de stock
router.put('/items/:id', optionalAuthenticate, rateLimiters.api, [
  param('id').isInt({ min: 1 }).withMessage('ID de item inválido'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity debe ser al menos 1')
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

    const userId = req.user?.id || null;
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    // Solo usuarios autenticados pueden actualizar (guests manejan en frontend)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Debes iniciar sesión para actualizar el carrito'
      });
    }

    // Actualizar item usando el servicio (ajusta reserva automáticamente)
    await cartService.updateItem(cartItemId, quantity, userId);

    // Invalidar cache
    cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));

    // Obtener carrito actualizado
    const cart = await cartService.getCart(userId);

    res.json({
      success: true,
      message: 'Cantidad actualizada y reserva de stock ajustada',
      data: cart
    });
  } catch (error) {
    logError('Error actualizando item del carrito:', error);
    
    if (error.message?.includes('Stock') || error.message?.includes('stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar item del carrito'
    });
  }
});

// ============================================
// DELETE /api/cart/items/:id
// ============================================
// Eliminar item del carrito y liberar reserva de stock
router.delete('/items/:id', optionalAuthenticate, rateLimiters.api, [
  param('id').isInt({ min: 1 }).withMessage('ID de item inválido')
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

    const userId = req.user?.id || null;
    const cartItemId = parseInt(req.params.id);

    // Solo usuarios autenticados pueden eliminar (guests manejan en frontend)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Debes iniciar sesión para eliminar items del carrito'
      });
    }

    // Eliminar item usando el servicio (libera reserva automáticamente)
    await cartService.removeItem(cartItemId, userId);

    // Invalidar cache
    cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));

    // Obtener carrito actualizado
    const cart = await cartService.getCart(userId);

    res.json({
      success: true,
      message: 'Item eliminado del carrito y reserva de stock liberada',
      data: cart
    });
  } catch (error) {
    logError('Error eliminando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar item del carrito'
    });
  }
});

// ============================================
// POST /api/cart/clear
// ============================================
// Vaciar carrito y liberar todas las reservas de stock
router.post('/clear', optionalAuthenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    // Validar que haya algún identificador
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Debes estar autenticado o proporcionar sessionId'
      });
    }

    // Obtener o crear carrito
    const cartId = await cartService.getOrCreateCart(userId, sessionId);

    // Vaciar carrito (libera todas las reservas automáticamente)
    await cartService.clearCart(cartId);

    // Invalidar cache si es usuario autenticado
    if (userId) {
      cacheManager.del(userSpecificKeys.cart(userId, req.apiVersion || 1));
    }

    res.json({
      success: true,
      message: 'Carrito vaciado y todas las reservas de stock liberadas',
      data: {
        items: [],
        subtotal: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    logError('Error vaciando carrito:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al vaciar carrito'
    });
  }
});

// ============================================
// POST /api/cart/expire
// ============================================
// Expirar carritos y liberar reservas (uso interno / cron)
// Requiere autenticación admin o clave secreta
router.post('/expire', authenticate, requireAdmin, rateLimiters.admin, [
  body('max_age_minutes').optional().isInt({ min: 1 }).withMessage('max_age_minutes debe ser un número mayor a 0')
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

    const { max_age_minutes } = req.body;

    // Expirar carritos
    const result = await cartService.expireCarts(max_age_minutes);

    // Registrar auditoría
    await auditService.logAudit(
      'CARTS_EXPIRED',
      'cart',
      null,
      null,
      { expired_count: result.expired, released_stock_count: result.released },
      req
    );

    res.json({
      success: true,
      message: 'Carritos expirados procesados exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error expirando carritos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al expirar carritos'
    });
  }
});

module.exports = router;
