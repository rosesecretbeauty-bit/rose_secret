// ============================================
// Rutas de Validación de Stock
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const stockService = require('../services/stock.service');
const { error: logError } = require('../logger');
const { rateLimiters } = require('../security/rateLimiter');

// ============================================
// POST /api/stock/validate
// ============================================
// Validar stock antes de agregar al carrito
router.post('/stock/validate', rateLimiters.api, [
  body('product_id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('variant_id').optional().isInt({ min: 1 }).withMessage('ID de variante inválido'),
  body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
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

    const { product_id, variant_id, quantity } = req.body;

    // Validar stock usando el servicio centralizado
    const validation = await stockService.validateStock(
      product_id,
      variant_id || null,
      quantity
    );

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message || 'Stock insuficiente',
        data: {
          available_stock: validation.available_stock,
          requested_quantity: quantity
        }
      });
    }

    // Obtener información completa de stock para respuesta
    const stockInfo = await stockService.getStockInfo(product_id, variant_id || null);

    res.json({
      success: true,
      message: 'Stock disponible',
      data: {
        available_stock: validation.available_stock,
        requested_quantity: quantity,
        has_variants: stockInfo.has_variants,
        variant_id: variant_id || stockInfo.variant_id || null
      }
    });
  } catch (error) {
    logError('Error validando stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar stock'
    });
  }
});

// ============================================
// GET /api/stock/:productId
// ============================================
// Obtener información de stock de un producto
router.get('/stock/:productId', rateLimiters.api, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const variantId = req.query.variant_id ? parseInt(req.query.variant_id) : null;

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }

    const stockInfo = await stockService.getStockInfo(productId, variantId);
    const availableStock = await stockService.getAvailableStock(productId, variantId);

    res.json({
      success: true,
      data: {
        product_id: productId,
        variant_id: variantId || stockInfo.variant_id || null,
        has_variants: stockInfo.has_variants,
        available_stock: availableStock
      }
    });
  } catch (error) {
    logError('Error obteniendo información de stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de stock'
    });
  }
});

module.exports = router;

