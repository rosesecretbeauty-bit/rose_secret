// ============================================
// Rutas de Descuentos y Cupones
// ============================================
// Sistema backend-driven de descuentos

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../db');
const { authenticate } = require('../middleware/auth');
const { optionalAuthenticate } = require('../middleware/optionalAuth');
const { body, validationResult } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError, info } = require('../logger');
const cartService = require('../services/cart.service');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { userSpecificKeys } = require('../cache/cacheKeys');

// ============================================
// POST /api/discounts/apply
// ============================================
// Aplicar un cupón o descuento al carrito
router.post('/apply', optionalAuthenticate, rateLimiters.api, [
  body('code').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Código inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    const { code } = req.body;

    // Si no hay código, buscar descuentos automáticos
    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Código de cupón requerido',
      });
    }

    // Obtener carrito actual
    const cartId = await cartService.getOrCreateCart(userId, sessionId);
    const cart = await cartService.getCart(cartId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'El carrito está vacío',
        error_code: 'NOT_APPLICABLE',
      });
    }

    const subtotal = cart.subtotal;

    // Buscar cupón por código
    const coupons = await query(
      `SELECT * FROM coupons 
       WHERE code = ? AND is_active = TRUE 
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (expires_at IS NULL OR expires_at >= NOW())
       LIMIT 1`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Código de cupón no encontrado o inválido',
        error_code: 'INVALID',
      });
    }

    const coupon = coupons[0];

    // Validar condiciones
    if (coupon.min_purchase && subtotal < parseFloat(coupon.min_purchase)) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: `El cupón requiere una compra mínima de $${coupon.min_purchase}`,
        error_code: 'MIN_PURCHASE',
      });
    }

    // Validar límite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Este cupón ha alcanzado su límite de uso',
        error_code: 'USAGE_LIMIT',
      });
    }

    // Validar uso por usuario (si está autenticado)
    if (userId && coupon.user_limit) {
      const userUsage = await query(
        `SELECT COUNT(*) as count FROM coupon_usage 
         WHERE coupon_id = ? AND user_id = ?`,
        [coupon.id, userId]
      );

      if (userUsage[0].count >= coupon.user_limit) {
        return res.status(200).json({
          success: true,
          valid: false,
          message: 'Ya has usado este cupón el máximo de veces permitido',
          error_code: 'ALREADY_USED',
        });
      }
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === 'fixed') {
      discountAmount = Math.min(parseFloat(coupon.value), subtotal);
    } else {
      // percentage
      discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount));
      }
    }

    // Preparar respuesta con totales
    const shipping = 0; // Por ahora shipping gratis
    const tax = subtotal * 0.16; // 16% de impuestos
    const total = Math.max(0, subtotal - discountAmount + shipping + tax);

    const appliedDiscount = {
      id: coupon.id,
      discount_id: coupon.id,
      type: 'coupon',
      code: coupon.code,
      label: coupon.code,
      amount: discountAmount,
      amount_type: coupon.type === 'fixed' ? 'fixed' : 'percentage',
      original_amount: parseFloat(coupon.value),
      applies_to: 'cart',
      is_automatic: false,
    };

    const cartTotals = {
      subtotal,
      discounts: [appliedDiscount],
      discount_total: discountAmount,
      shipping,
      tax,
      total,
      currency: 'USD',
    };

    res.json({
      success: true,
      valid: true,
      message: `Cupón "${coupon.code}" aplicado exitosamente`,
      discount: {
        id: coupon.id,
        type: 'coupon',
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        amount: parseFloat(coupon.value),
        amount_type: coupon.type === 'fixed' ? 'fixed' : 'percentage',
        applies_to: 'cart',
        min_purchase: coupon.min_purchase ? parseFloat(coupon.min_purchase) : null,
        max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
        starts_at: coupon.starts_at,
        ends_at: coupon.expires_at,
        is_active: coupon.is_active,
      },
      calculated_amount: discountAmount,
      cart_totals: cartTotals,
    });

    // Auditoría: Cupón aplicado
    if (userId) {
      const auditService = require('../services/audit.service');
      auditService.logAudit(
        'COUPON_APPLIED',
        'coupon',
        coupon.id,
        null,
        {
          code: coupon.code,
          discount_amount: discountAmount,
          cart_subtotal: subtotal,
        },
        req,
        {
          coupon_id: coupon.id,
          coupon_code: coupon.code,
          discount_amount: discountAmount,
        }
      ).catch(err => {
        logError('Error logging coupon audit:', err);
      });

      // Enviar notificación in-app cuando se aplica un cupón
      const notificationService = require('../services/notification.service');
      notificationService.sendNotification({
        userId,
        type: 'promo',
        channels: ['in_app'],
        title: `Cupón "${coupon.code}" aplicado`,
        message: `Has ahorrado $${discountAmount.toFixed(2)} con tu cupón.`,
        metadata: {
          couponCode: coupon.code,
          discountAmount,
          link: '/checkout',
        },
      }).catch(err => {
        logError('Error sending coupon notification:', err);
      });
    }
  } catch (error) {
    logError('Error applying discount:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Error al aplicar descuento',
    });
  }
});

// ============================================
// POST /api/discounts/remove
// ============================================
// Remover un descuento aplicado
router.post('/remove', optionalAuthenticate, rateLimiters.api, [
  body('discount_id').isInt({ min: 1 }).withMessage('ID de descuento inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    const { discount_id } = req.body;

    // Obtener carrito actual
    const cartId = await cartService.getOrCreateCart(userId, sessionId);
    const cart = await cartService.getCart(cartId);

    const subtotal = cart.subtotal;
    const shipping = 0;
    const tax = subtotal * 0.16;
    const total = subtotal + shipping + tax;

    const cartTotals = {
      subtotal,
      discounts: [],
      discount_total: 0,
      shipping,
      tax,
      total,
      currency: 'USD',
    };

    res.json({
      success: true,
      message: 'Descuento removido exitosamente',
      cart_totals: cartTotals,
    });
  } catch (error) {
    logError('Error removing discount:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover descuento',
    });
  }
});

// ============================================
// GET /api/discounts/automatic
// ============================================
// Obtener descuentos automáticos aplicables al carrito actual
router.get('/automatic', optionalAuthenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    // Obtener carrito actual
    const cartId = await cartService.getOrCreateCart(userId, sessionId);
    const cart = await cartService.getCart(cartId);

    if (!cart.items || cart.items.length === 0) {
      return res.json({
        success: true,
        discounts: [],
        cart_totals: {
          subtotal: 0,
          discounts: [],
          discount_total: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          currency: 'USD',
        },
      });
    }

    const subtotal = cart.subtotal;

    // Buscar promociones automáticas activas
    // Por ahora, no hay promociones automáticas implementadas
    // Este endpoint está listo para cuando se implementen
    const automaticDiscounts = [];

    // Calcular totales
    const discountTotal = automaticDiscounts.reduce((sum, d) => sum + d.amount, 0);
    const shipping = 0;
    const tax = subtotal * 0.16;
    const total = Math.max(0, subtotal - discountTotal + shipping + tax);

    const cartTotals = {
      subtotal,
      discounts: automaticDiscounts,
      discount_total: discountTotal,
      shipping,
      tax,
      total,
      currency: 'USD',
    };

    res.json({
      success: true,
      discounts: automaticDiscounts,
      cart_totals: cartTotals,
    });
  } catch (error) {
    logError('Error getting automatic discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener descuentos automáticos',
    });
  }
});

// ============================================
// POST /api/discounts/validate
// ============================================
// Validar un código de cupón sin aplicarlo
router.post('/validate', rateLimiters.api, [
  body('code').trim().isLength({ min: 1, max: 50 }).withMessage('Código inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const { code } = req.body;

    // Buscar cupón
    const coupons = await query(
      `SELECT * FROM coupons 
       WHERE code = ? AND is_active = TRUE 
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (expires_at IS NULL OR expires_at >= NOW())
       LIMIT 1`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.json({
        success: true,
        valid: false,
        message: 'Código de cupón no encontrado o inválido',
        error_code: 'INVALID',
      });
    }

    const coupon = coupons[0];

    // Verificar si está expirado
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({
        success: true,
        valid: false,
        message: 'Este cupón ha expirado',
        error_code: 'EXPIRED',
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Cupón válido',
      discount: {
        id: coupon.id,
        type: 'coupon',
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        amount: parseFloat(coupon.value),
        amount_type: coupon.type === 'fixed' ? 'fixed' : 'percentage',
        applies_to: 'cart',
        min_purchase: coupon.min_purchase ? parseFloat(coupon.min_purchase) : null,
        max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
        starts_at: coupon.starts_at,
        ends_at: coupon.expires_at,
        is_active: coupon.is_active,
      },
    });
  } catch (error) {
    logError('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Error al validar cupón',
    });
  }
});

module.exports = router;

