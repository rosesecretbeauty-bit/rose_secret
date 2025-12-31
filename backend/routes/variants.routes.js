// ============================================
// Rutas de Variantes y Atributos de Productos
// ============================================

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { productKeys } = require('../cache/cacheKeys');
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const { error: logError, info } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');
const variantService = require('../services/variant.service');
const attributeService = require('../services/attribute.service');

// ============================================
// ENDPOINTS PÚBLICOS
// ============================================

// ============================================
// GET /api/products/:id/variants
// ============================================
// Obtener todas las variantes de un producto (público)
router.get('/products/:id/variants', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'),
  keyBuilder: (req) => productKeys.variants(req.params.id, req.apiVersion || 1),
  vary: []
}), [
  param('id').isInt().withMessage('ID de producto inválido')
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

    // Verificar que el producto existe y está activo
    const products = await query(`
      SELECT id, name, price 
      FROM products 
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Obtener variantes activas del producto
    const variants = await variantService.getProductVariants(id, false);

    res.json({
      success: true,
      data: {
        product_id: parseInt(id),
        variants
      }
    });
  } catch (error) {
    logError('Error getting product variants', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variantes del producto'
    });
  }
});

// ============================================
// GET /api/variants/:id
// ============================================
// Obtener una variante por ID (público)
router.get('/variants/:id', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('PRODUCTS_DETAIL'),
  keyBuilder: (req) => `variant:${req.params.id}:v${req.apiVersion || 1}`,
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

    const variant = await variantService.getVariantById(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Verificar que el producto esté activo
    const products = await query(`
      SELECT id, name 
      FROM products 
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `, [variant.product_id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto asociado no encontrado o inactivo'
      });
    }

    // Solo devolver si la variante está activa (para endpoints públicos)
    if (!variant.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        variant
      }
    });
  } catch (error) {
    logError('Error getting variant', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variante'
    });
  }
});

// ============================================
// ENDPOINTS ADMIN
// ============================================

// ============================================
// POST /api/admin/products/:id/attributes
// ============================================
// Asignar atributos a un producto (admin)
router.post('/admin/products/:id/attributes', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID de producto inválido'),
  body('attribute_ids').isArray({ min: 0 }).withMessage('attribute_ids debe ser un array'),
  body('attribute_ids.*').isInt().withMessage('Cada attribute_id debe ser un número entero')
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
    const { attribute_ids } = req.body;

    // Verificar que el producto existe
    const products = await query('SELECT id, name FROM products WHERE id = ? LIMIT 1', [id]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Asignar atributos
    await attributeService.assignAttributesToProduct(id, attribute_ids);

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_ATTRIBUTES_ASSIGNED',
      'product',
      id,
      null,
      { attribute_ids },
      req
    );

    // Invalidar cache
    cacheManager.del(productKeys.detail(id));
    cacheManager.del(productKeys.variants(id));

    // Obtener atributos asignados
    const productAttributes = await attributeService.getProductAttributes(id);

    res.json({
      success: true,
      message: 'Atributos asignados exitosamente',
      data: {
        product_id: parseInt(id),
        attributes: productAttributes
      }
    });
  } catch (error) {
    logError('Error assigning attributes to product', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al asignar atributos al producto'
    });
  }
});

// ============================================
// POST /api/admin/products/:id/variants
// ============================================
// Crear una nueva variante para un producto (admin)
router.post('/admin/products/:id/variants', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID de producto inválido'),
  body('name').optional().trim(),
  body('sku').optional().trim(),
  body('price').isFloat({ min: 0.01 }).withMessage('Precio debe ser mayor a 0'),
  body('compare_at_price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
  body('weight').optional().isFloat({ min: 0 }),
  body('image_url').optional().isURL().withMessage('image_url debe ser una URL válida'),
  body('is_active').optional().isBoolean(),
  body('is_default').optional().isBoolean(),
  body('attribute_values').optional().isArray().withMessage('attribute_values debe ser un array'),
  body('attribute_values.*.attribute_id').optional().isInt(),
  body('attribute_values.*.attribute_value_id').optional().isInt()
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
    const { 
      name, 
      sku, 
      price, 
      compare_at_price, 
      stock, 
      weight, 
      image_url, 
      is_active, 
      is_default,
      attribute_values 
    } = req.body;

    // Verificar que el producto existe
    const products = await query('SELECT id, name FROM products WHERE id = ? LIMIT 1', [id]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Validar SKU único si se proporciona
    if (sku) {
      const existing = await query(
        'SELECT id FROM product_variants WHERE sku = ? AND deleted_at IS NULL LIMIT 1',
        [sku]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU ya existe'
        });
      }
    }

    // Validar valores de atributos si se proporcionan
    if (attribute_values && attribute_values.length > 0) {
      const validation = await attributeService.validateAttributeValues(attribute_values);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Verificar combinación duplicada
      const isDuplicate = await variantService.hasDuplicateCombination(id, attribute_values);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Esta combinación de atributos ya existe para este producto'
        });
      }
    }

    // Crear variante
    const variantId = await variantService.createVariant(
      id,
      {
        name,
        sku,
        price,
        compare_at_price,
        stock,
        weight,
        image_url,
        is_active: is_active !== undefined ? is_active : true,
        is_default: is_default || false
      },
      attribute_values
    );

    // Obtener variante creada
    const variant = await variantService.getVariantById(variantId);

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_CREATED',
      'product_variant',
      variantId,
      null,
      { product_id: id, price, stock, sku },
      req
    );

    // Registrar métrica
    metricsService.recordAdminAction('PRODUCT_VARIANT_CREATED');

    // Invalidar cache
    cacheManager.del(productKeys.detail(id));
    cacheManager.del(productKeys.variants(id));
    cacheManager.delPattern(productKeys.pattern.all);

    res.status(201).json({
      success: true,
      message: 'Variante creada exitosamente',
      data: {
        variant
      }
    });
  } catch (error) {
    logError('Error creating variant', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear variante'
    });
  }
});

// ============================================
// PUT /api/admin/variants/:id
// ============================================
// Actualizar una variante (admin)
router.put('/admin/variants/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID de variante inválido'),
  body('name').optional().trim().notEmpty(),
  body('sku').optional().trim(),
  body('price').optional().isFloat({ min: 0.01 }),
  body('compare_at_price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('image_url').optional().isURL(),
  body('is_active').optional().isBoolean(),
  body('attribute_values').optional().isArray(),
  body('attribute_values.*.attribute_id').optional().isInt(),
  body('attribute_values.*.attribute_value_id').optional().isInt()
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
    const { 
      name, 
      sku, 
      price, 
      compare_at_price, 
      stock, 
      weight, 
      image_url, 
      is_active,
      attribute_values 
    } = req.body;

    // Verificar que la variante existe
    const existing = await variantService.getVariantById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    const oldVariant = { ...existing };

    // Validar SKU único si cambió
    if (sku && sku !== existing.sku) {
      const skuCheck = await query(
        'SELECT id FROM product_variants WHERE sku = ? AND id != ? AND deleted_at IS NULL LIMIT 1',
        [sku, id]
      );
      if (skuCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU ya existe'
        });
      }
    }

    // Validar valores de atributos si se proporcionan
    if (attribute_values && attribute_values.length > 0) {
      const validation = await attributeService.validateAttributeValues(attribute_values);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Verificar combinación duplicada (excluyendo esta variante)
      const isDuplicate = await variantService.hasDuplicateCombination(
        existing.product_id, 
        attribute_values, 
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Esta combinación de atributos ya existe para este producto'
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
      params.push(sku || null);
      newValues.sku = sku;
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
      newValues.price = price;
    }
    if (compare_at_price !== undefined) {
      updates.push('compare_at_price = ?');
      params.push(compare_at_price || null);
      newValues.compare_at_price = compare_at_price;
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
      newValues.stock = stock;
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      params.push(weight || null);
      newValues.weight = weight;
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url || null);
      newValues.image_url = image_url;
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
      newValues.is_active = is_active;
    }

    if (updates.length > 0) {
      params.push(id);
      await query(
        `UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Actualizar valores de atributos si se proporcionan
    if (attribute_values !== undefined) {
      await attributeService.setVariantAttributeValues(id, attribute_values);
      newValues.attribute_values = attribute_values;
    }

    // Obtener variante actualizada
    const variant = await variantService.getVariantById(id);

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_UPDATED',
      'product_variant',
      id,
      oldVariant,
      newValues,
      req
    );

    // Registrar métrica
    metricsService.recordAdminAction('PRODUCT_VARIANT_UPDATED');

    // Invalidar cache
    cacheManager.del(productKeys.detail(existing.product_id));
    cacheManager.del(productKeys.variants(existing.product_id));
    cacheManager.delPattern(productKeys.pattern.all);

    res.json({
      success: true,
      message: 'Variante actualizada exitosamente',
      data: {
        variant
      }
    });
  } catch (error) {
    logError('Error updating variant', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar variante'
    });
  }
});

// ============================================
// DELETE /api/admin/variants/:id
// ============================================
// Eliminar una variante (soft delete) (admin)
router.delete('/admin/variants/:id', authenticate, requireAdmin, rateLimiters.admin, [
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

    // Verificar que la variante existe
    const variant = await variantService.getVariantById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Verificar si se puede eliminar
    const canDelete = await variantService.canDeleteVariant(id);
    if (!canDelete.canDelete) {
      return res.status(400).json({
        success: false,
        message: canDelete.reason
      });
    }

    // Soft delete: marcar como eliminada (deleted_at)
    await query(
      'UPDATE product_variants SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE WHERE id = ?',
      [id]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_DELETED',
      'product_variant',
      id,
      variant,
      null,
      req
    );

    // Registrar métrica
    metricsService.recordAdminAction('PRODUCT_VARIANT_DELETED');

    // Invalidar cache
    cacheManager.del(productKeys.detail(variant.product_id));
    cacheManager.del(productKeys.variants(variant.product_id));
    cacheManager.delPattern(productKeys.pattern.all);

    res.json({
      success: true,
      message: 'Variante eliminada exitosamente'
    });
  } catch (error) {
    logError('Error deleting variant', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar variante'
    });
  }
});

// ============================================
// PUT /api/admin/variants/:id/toggle-active
// ============================================
// Activar/desactivar una variante (admin)
router.put('/admin/variants/:id/toggle-active', authenticate, requireAdmin, rateLimiters.admin, [
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

    const variant = await variantService.getVariantById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Toggle is_active
    const newStatus = !variant.is_active;
    await query(
      'UPDATE product_variants SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_TOGGLED',
      'product_variant',
      id,
      { is_active: variant.is_active },
      { is_active: newStatus },
      req
    );

    // Invalidar cache
    cacheManager.del(productKeys.detail(variant.product_id));
    cacheManager.del(productKeys.variants(variant.product_id));

    res.json({
      success: true,
      message: `Variante ${newStatus ? 'activada' : 'desactivada'} exitosamente`,
      data: {
        variant_id: parseInt(id),
        is_active: newStatus
      }
    });
  } catch (error) {
    logError('Error toggling variant active status', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de variante'
    });
  }
});

// ============================================
// PUT /api/admin/variants/:id/default
// ============================================
// Marcar una variante como por defecto (admin)
router.put('/admin/variants/:id/default', authenticate, requireAdmin, rateLimiters.admin, [
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

    const variant = await variantService.getVariantById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    // Verificar que la variante esté activa
    if (!variant.is_active) {
      return res.status(400).json({
        success: false,
        message: 'No se puede marcar como default una variante inactiva'
      });
    }

    // Marcar como default
    await variantService.setDefaultVariant(id);

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_VARIANT_SET_DEFAULT',
      'product_variant',
      id,
      { is_default: variant.is_default },
      { is_default: true },
      req
    );

    // Invalidar cache
    cacheManager.del(productKeys.detail(variant.product_id));
    cacheManager.del(productKeys.variants(variant.product_id));

    res.json({
      success: true,
      message: 'Variante marcada como por defecto exitosamente',
      data: {
        variant_id: parseInt(id),
        is_default: true
      }
    });
  } catch (error) {
    logError('Error setting default variant', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al marcar variante como default'
    });
  }
});

module.exports = router;

