// ============================================
// Rutas de Imágenes de Productos
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
// GET /api/admin/products/:productId/images
// ============================================
// Obtener todas las imágenes de un producto
router.get('/admin/products/:productId/images', authenticate, requireAdmin, rateLimiters.admin, [
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

    // Obtener todas las imágenes ordenadas por sort_order
    const images = await query(`
      SELECT 
        id,
        product_id,
        image_url,
        alt_text,
        sort_order,
        is_primary,
        created_at
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `, [productId]);

    res.json({
      success: true,
      data: {
        images
      }
    });
  } catch (error) {
    logError('Error obteniendo imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener imágenes'
    });
  }
});

// ============================================
// POST /api/admin/products/:productId/images
// ============================================
// Añadir una nueva imagen a un producto
router.post('/admin/products/:productId/images', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  body('image_url').trim().notEmpty().isURL().withMessage('URL de imagen inválida'),
  body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text muy largo'),
  body('is_primary').optional().isBoolean().withMessage('is_primary debe ser booleano'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order debe ser un número')
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
    const { image_url, alt_text, is_primary, sort_order } = req.body;

    // Verificar que el producto existe
    const productCheck = await query('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si se marca como principal, desmarcar las demás
    if (is_primary) {
      await query(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
        [productId]
      );
    }

    // Si no se especifica sort_order, usar el máximo + 1
    let finalSortOrder = sort_order;
    if (finalSortOrder === undefined) {
      const maxOrder = await query(
        'SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?',
        [productId]
      );
      finalSortOrder = (maxOrder[0]?.max_order ?? -1) + 1;
    }

    // Insertar nueva imagen
    const result = await query(
      `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, image_url, alt_text || null, finalSortOrder, is_primary || false]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_IMAGE_ADDED',
      'product_image',
      result.insertId,
      null,
      { product_id: productId, image_url, is_primary },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_IMAGE_ADDED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    // Obtener imagen creada
    const images = await query(
      'SELECT * FROM product_images WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Imagen añadida exitosamente',
      data: {
        image: images[0]
      }
    });
  } catch (error) {
    logError('Error añadiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al añadir imagen'
    });
  }
});

// ============================================
// PUT /api/admin/products/:productId/images/:imageId
// ============================================
// Actualizar una imagen (orden, alt_text, is_primary)
router.put('/admin/products/:productId/images/:imageId', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  param('imageId').isInt().withMessage('ID de imagen inválido'),
  body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text muy largo'),
  body('is_primary').optional().isBoolean().withMessage('is_primary debe ser booleano'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order debe ser un número')
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

    const { productId, imageId } = req.params;
    const { alt_text, is_primary, sort_order } = req.body;

    // Verificar que la imagen existe y pertenece al producto
    const existing = await query(
      'SELECT * FROM product_images WHERE id = ? AND product_id = ? LIMIT 1',
      [imageId, productId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const oldImage = existing[0];

    // Si se marca como principal, desmarcar las demás
    if (is_primary && !oldImage.is_primary) {
      await query(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ? AND id != ?',
        [productId, imageId]
      );
    }

    // Construir query de actualización
    const updates = [];
    const params = [];
    const newValues = {};

    if (alt_text !== undefined) {
      updates.push('alt_text = ?');
      params.push(alt_text);
      newValues.alt_text = alt_text;
    }
    if (is_primary !== undefined) {
      updates.push('is_primary = ?');
      params.push(is_primary);
      newValues.is_primary = is_primary;
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      params.push(sort_order);
      newValues.sort_order = sort_order;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    params.push(imageId);

    await query(
      `UPDATE product_images SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_IMAGE_UPDATED',
      'product_image',
      imageId,
      oldImage,
      newValues,
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_IMAGE_UPDATED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    // Obtener imagen actualizada
    const images = await query(
      'SELECT * FROM product_images WHERE id = ?',
      [imageId]
    );

    res.json({
      success: true,
      message: 'Imagen actualizada exitosamente',
      data: {
        image: images[0]
      }
    });
  } catch (error) {
    logError('Error actualizando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar imagen'
    });
  }
});

// ============================================
// PUT /api/admin/products/:productId/images/reorder
// ============================================
// Reordenar todas las imágenes de un producto
router.put('/admin/products/:productId/images/reorder', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  body('image_ids').isArray().withMessage('image_ids debe ser un array'),
  body('image_ids.*').isInt().withMessage('Cada ID debe ser un número')
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
    const { image_ids } = req.body;

    // Verificar que el producto existe
    const productCheck = await query('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que todas las imágenes pertenecen al producto
    const placeholders = image_ids.map(() => '?').join(',');
    const imageCheck = await query(
      `SELECT id FROM product_images WHERE id IN (${placeholders}) AND product_id = ?`,
      [...image_ids, productId]
    );

    if (imageCheck.length !== image_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Algunas imágenes no pertenecen a este producto'
      });
    }

    // Actualizar sort_order de cada imagen
    for (let i = 0; i < image_ids.length; i++) {
      await query(
        'UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?',
        [i, image_ids[i], productId]
      );
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_IMAGES_REORDERED',
      'product',
      productId,
      null,
      { image_ids },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_IMAGES_REORDERED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    res.json({
      success: true,
      message: 'Imágenes reordenadas exitosamente'
    });
  } catch (error) {
    logError('Error reordenando imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar imágenes'
    });
  }
});

// ============================================
// DELETE /api/admin/products/:productId/images/:imageId
// ============================================
// Eliminar una imagen de un producto
router.delete('/admin/products/:productId/images/:imageId', authenticate, requireAdmin, rateLimiters.admin, [
  param('productId').isInt().withMessage('ID de producto inválido'),
  param('imageId').isInt().withMessage('ID de imagen inválido')
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

    const { productId, imageId } = req.params;

    // Verificar que la imagen existe y pertenece al producto
    const existing = await query(
      'SELECT * FROM product_images WHERE id = ? AND product_id = ? LIMIT 1',
      [imageId, productId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const imageToDelete = existing[0];

    // Eliminar imagen
    await query(
      'DELETE FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    // Si era la imagen principal, marcar la primera restante como principal
    if (imageToDelete.is_primary) {
      const remainingImages = await query(
        'SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1',
        [productId]
      );

      if (remainingImages.length > 0) {
        await query(
          'UPDATE product_images SET is_primary = TRUE WHERE id = ?',
          [remainingImages[0].id]
        );
      }
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_IMAGE_DELETED',
      'product_image',
      imageId,
      imageToDelete,
      null,
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_IMAGE_DELETED');

    // Invalidar cache del producto
    cacheManager.del(productKeys.detail(productId));
    cacheManager.delPattern(productKeys.pattern.all);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
});

module.exports = router;

