// ============================================
// Rutas de Inventario
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const { error: logError, info } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');
const inventoryService = require('../services/inventory.service');

// ============================================
// ENDPOINTS PÚBLICOS
// ============================================

// ============================================
// GET /api/variants/:id/stock
// ============================================
// Obtener stock disponible de una variante (público)
router.get('/variants/:id/stock', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'), // Cache corto para stock
  keyBuilder: (req) => `variant:stock:${req.params.id}:v${req.apiVersion || 1}`,
  vary: []
}), [
  param('id').isInt().withMessage('ID de variante inválido')
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

    const { id } = req.params;

    // Verificar que la variante existe y está activa
    const { query } = require('../db');
    const variants = await query(`
      SELECT id, product_id, is_active 
      FROM product_variants 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [id]);

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Solo mostrar stock si la variante está activa (para endpoints públicos)
    if (!variants[0].is_active) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Obtener información de inventario
    const inventoryInfo = await inventoryService.getInventoryInfo(id);

    res.json({
      success: true,
      data: {
        variant_id: parseInt(id),
        available_stock: inventoryInfo.available_stock,
        is_low_stock: inventoryInfo.is_low_stock,
        low_stock_threshold: inventoryInfo.low_stock_threshold
      }
    });
  } catch (error) {
    logError('Error getting variant stock', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener stock de la variante'
    });
  }
});

// ============================================
// ENDPOINTS ADMIN
// ============================================

// ============================================
// POST /api/admin/inventory/initialize
// ============================================
// Inicializar stock de una variante (admin)
router.post('/admin/inventory/initialize', authenticate, requireAdmin, rateLimiters.admin, [
  body('variant_id').isInt({ min: 1 }).withMessage('variant_id debe ser un número entero mayor a 0'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity debe ser un número entero mayor a 0'),
  body('reason').optional().trim().isLength({ max: 255 })
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

    const { variant_id, quantity, reason } = req.body;
    const userId = req.user.id;

    // Verificar que la variante existe
    const { query } = require('../db');
    const variants = await query(`
      SELECT id, product_id, name 
      FROM product_variants 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [variant_id]);

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Inicializar stock
    const result = await inventoryService.initializeStock(
      variant_id,
      quantity,
      userId,
      reason || 'Stock inicial'
    );

    // Registrar auditoría
    await auditService.logAudit(
      'INVENTORY_INITIALIZED',
      'inventory',
      variant_id,
      null,
      { variant_id, initial_stock: quantity, reason },
      req
    );

    // Invalidar cache
    cacheManager.del(`variant:stock:${variant_id}`);

    res.status(201).json({
      success: true,
      message: 'Stock inicializado exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error initializing inventory', error);
    
    if (error.message.includes('ya fue establecido')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al inicializar stock'
    });
  }
});

// ============================================
// POST /api/admin/inventory/adjust
// ============================================
// Ajustar stock de una variante (admin)
router.post('/admin/inventory/adjust', authenticate, requireAdmin, rateLimiters.admin, [
  body('variant_id').isInt({ min: 1 }).withMessage('variant_id debe ser un número entero mayor a 0'),
  body('quantity').isInt().withMessage('quantity debe ser un número entero').custom((value) => {
    if (value === 0) {
      throw new Error('quantity no puede ser 0');
    }
    return true;
  }),
  body('reason').trim().notEmpty().withMessage('reason es requerido').isLength({ max: 255 }),
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

    const { variant_id, quantity, reason, notes } = req.body;
    const userId = req.user.id;

    // Verificar que la variante existe
    const { query } = require('../db');
    const variants = await query(`
      SELECT id, product_id, name 
      FROM product_variants 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [variant_id]);

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Ajustar stock
    const result = await inventoryService.adjustStock(
      variant_id,
      quantity,
      userId,
      reason,
      notes
    );

    // Registrar auditoría
    await auditService.logAudit(
      'INVENTORY_ADJUSTED',
      'inventory',
      variant_id,
      { stock_before: result.balance_before },
      { stock_after: result.balance_after, adjustment: quantity, reason },
      req
    );

    // Registrar métrica
    metricsService.recordAdminAction('INVENTORY_ADJUSTED');

    // Invalidar cache
    cacheManager.del(`variant:stock:${variant_id}`);
    cacheManager.delPattern('^products:.*'); // Invalidar cache de productos

    res.json({
      success: true,
      message: `Stock ${quantity > 0 ? 'incrementado' : 'decrementado'} exitosamente`,
      data: result
    });
  } catch (error) {
    logError('Error adjusting inventory', error);
    
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al ajustar stock'
    });
  }
});

// ============================================
// GET /api/admin/inventory/:variant_id/movements
// ============================================
// Obtener historial de movimientos de inventario (admin)
router.get('/admin/inventory/:variant_id/movements', authenticate, requireAdmin, rateLimiters.admin, [
  param('variant_id').isInt({ min: 1 }).withMessage('ID de variante inválido'),
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('page debe ser mayor a 0'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100')
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

    const { variant_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verificar que la variante existe
    const { query } = require('../db');
    const variants = await query(`
      SELECT id, product_id, name 
      FROM product_variants 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [variant_id]);

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Obtener historial de movimientos
    const history = await inventoryService.getMovementHistory(variant_id, { page, limit });

    // Obtener información actual de inventario
    const inventoryInfo = await inventoryService.getInventoryInfo(variant_id);

    res.json({
      success: true,
      data: {
        variant_id: parseInt(variant_id),
        current_inventory: inventoryInfo,
        movements: history.movements,
        pagination: history.pagination
      }
    });
  } catch (error) {
    logError('Error getting inventory movements', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de movimientos'
    });
  }
});

module.exports = router;

