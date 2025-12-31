// ============================================
// Rutas de Variantes de Productos
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { productKeys } = require('../cache/cacheKeys');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');

// ============================================
// GET /api/admin/products/:productId/variants
// ============================================
// Obtener todas las variantes de un producto
router.get('/admin/products/:productId/variants', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido')
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

    const { productId } = req.params;

    // Verificar que el producto existe
    const productCheck = await query('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Obtener todas las variantes
    const variants = await query(`
      SELECT 
        id,
        product_id,
        name,
        sku,
        price,
        compare_at_price,
        stock,
        weight,
        attributes,
        is_active,
        created_at,
        updated_at
      FROM product_variants
      WHERE product_id = ?
      ORDER BY created_at ASC, name ASC
    `, [productId]);
    
    // Marcar la primera variante como default implícitamente
    if (variants.length > 0) {
      variants.forEach((variant, index) => {
        variant.is_default = index === 0;
      });
    }

    // Parsear attributes JSON si existe
    for (let variant of variants) {
      if (variant.attributes) {
        try {
          variant.attributes = typeof variant.attributes === 'string' 
            ? JSON.parse(variant.attributes) 
            : variant.attributes;
        } catch (e) {
          variant.attributes = {};
        }
      } else {
        variant.attributes = {};
      }
    }

    res.json({
      success: true,
      data: {
        variants
      }
    });
  } catch (error) {
    logError('Error obteniendo variantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variantes'
    });
  }
});

// ============================================
// POST /api/admin/products/:productId/variants
// ============================================
// Añadir una nueva variante a un producto
router.post('/admin/products/:productId/variants', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  body('name').trim().notEmpty().withMessage('Nombre de variante requerido'),
  body('price').isFloat({ min: 0.01 }).withMessage('Precio debe ser mayor a 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
  body('sku').optional().trim(),
  body('compare_at_price').optional().isFloat({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('attributes').optional().isObject().withMessage('Attributes debe ser un objeto'),
  body('is_active').optional().isBoolean()
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

    const { productId } = req.params;
    const { name, sku, price, compare_at_price, stock, weight, attributes, is_active, is_default } = req.body;

    // Verificar que el producto existe
    const productCheck = await query('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar SKU único si se proporciona
    if (sku) {
      const skuCheck = await query('SELECT id FROM product_variants WHERE sku = ? LIMIT 1', [sku]);
      if (skuCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU ya existe'
        });
      }
    }

    // Validar precio requerido
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Precio requerido y debe ser mayor a 0'
      });
    }

    // Si se marca como default, desmarcar las demás (aunque no tengamos campo is_default en BD,
    // podemos usar created_at para determinar el orden, la primera es default implícitamente)
    // Por ahora, simplemente insertamos y el orden se maneja por created_at

    // Insertar nueva variante
    const result = await query(
      `INSERT INTO product_variants (
        product_id, name, sku, price, compare_at_price,
        stock, weight, attributes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        name,
        sku || null,
        price || null,
        compare_at_price || null,
        stock !== undefined ? stock : 0,
        weight || null,
        attributes ? JSON.stringify(attributes) : null,
        is_active !== undefined ? is_active : true
      ]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_CREATED',
      'product_variant',
      result.insertId,
      null,
      { product_id: productId, name, price, stock },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_VARIANT_CREATED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    // Obtener variante creada
    const variants = await query(
      'SELECT * FROM product_variants WHERE id = ?',
      [result.insertId]
    );

    const variant = variants[0];
    if (variant.attributes) {
      try {
        variant.attributes = typeof variant.attributes === 'string' 
          ? JSON.parse(variant.attributes) 
          : variant.attributes;
      } catch (e) {
        variant.attributes = {};
      }
    } else {
      variant.attributes = {};
    }

    res.status(201).json({
      success: true,
      message: 'Variante creada exitosamente',
      data: {
        variant
      }
    });
  } catch (error) {
    logError('Error creando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear variante'
    });
  }
});

// ============================================
// PUT /api/admin/products/:productId/variants/:variantId
// ============================================
// Actualizar una variante
router.put('/admin/products/:productId/variants/:variantId', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  param('variantId').isInt().withMessage('ID de variante inválido'),
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('attributes').optional().isObject()
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

    const { productId, variantId } = req.params;
    const { name, sku, price, compare_at_price, stock, weight, attributes, is_active } = req.body;

    // Verificar que la variante existe y pertenece al producto
    const existing = await query(
      'SELECT * FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1',
      [variantId, productId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    const oldVariant = existing[0];

    // Validar precio si se actualiza
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Precio debe ser mayor a 0'
      });
    }

    // Verificar SKU único si se proporciona y cambió
    if (sku && sku !== oldVariant.sku) {
      const skuCheck = await query('SELECT id FROM product_variants WHERE sku = ? AND id != ? LIMIT 1', [sku, variantId]);
      if (skuCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU ya existe'
        });
      }
    }

    // Construir query de actualización
    const updates = [];
    const params = [];
    const newValues = {};

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
      newValues.name = name;
    }
    if (sku !== undefined) {
      updates.push('sku = ?');
      params.push(sku);
      newValues.sku = sku;
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
      newValues.price = price;
    }
    if (compare_at_price !== undefined) {
      updates.push('compare_at_price = ?');
      params.push(compare_at_price);
      newValues.compare_at_price = compare_at_price;
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
      newValues.stock = stock;
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      params.push(weight);
      newValues.weight = weight;
    }
    if (attributes !== undefined) {
      updates.push('attributes = ?');
      params.push(JSON.stringify(attributes));
      newValues.attributes = attributes;
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
      newValues.is_active = is_active;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    params.push(variantId);

    await query(
      `UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_UPDATED',
      'product_variant',
      variantId,
      oldVariant,
      newValues,
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_VARIANT_UPDATED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    // Obtener variante actualizada
    const variants = await query(
      'SELECT * FROM product_variants WHERE id = ?',
      [variantId]
    );

    const variant = variants[0];
    if (variant.attributes) {
      try {
        variant.attributes = typeof variant.attributes === 'string' 
          ? JSON.parse(variant.attributes) 
          : variant.attributes;
      } catch (e) {
        variant.attributes = {};
      }
    } else {
      variant.attributes = {};
    }

    res.json({
      success: true,
      message: 'Variante actualizada exitosamente',
      data: {
        variant
      }
    });
  } catch (error) {
    logError('Error actualizando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar variante'
    });
  }
});

// ============================================
// DELETE /api/admin/products/:productId/variants/:variantId
// ============================================
// Eliminar una variante
router.delete('/admin/products/:productId/variants/:variantId', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  param('variantId').isInt().withMessage('ID de variante inválido')
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

    const { productId, variantId } = req.params;

    // Verificar que la variante existe y pertenece al producto
    const existing = await query(
      'SELECT * FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1',
      [variantId, productId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    const variantToDelete = existing[0];

    // Verificar que no sea la única variante del producto
    const variantCount = await query(
      'SELECT COUNT(*) as count FROM product_variants WHERE product_id = ? AND is_active = TRUE',
      [productId]
    );

    if (variantCount[0].count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la única variante del producto. El producto debe tener al menos una variante activa.'
      });
    }

    // Verificar si hay items en carrito con esta variante
    const cartItems = await query(
      'SELECT COUNT(*) as count FROM cart_items WHERE variant_id = ?',
      [variantId]
    );

    if (cartItems[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar: hay items en carrito con esta variante'
      });
    }

    // Verificar si hay items en pedidos con esta variante
    const orderItems = await query(
      'SELECT COUNT(*) as count FROM order_items WHERE variant_id = ?',
      [variantId]
    );

    if (orderItems[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar: hay items en pedidos con esta variante'
      });
    }

    // Eliminar variante
    await query(
      'DELETE FROM product_variants WHERE id = ? AND product_id = ?',
      [variantId, productId]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_DELETED',
      'product_variant',
      variantId,
      variantToDelete,
      null,
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_VARIANT_DELETED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    res.json({
      success: true,
      message: 'Variante eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar variante'
    });
  }
});

module.exports = router;

