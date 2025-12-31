// ============================================
// Rutas de Wishlist
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { userSpecificKeys } = require('../cache/cacheKeys');
const { getTTL } = require('../cache/cacheConfig');
const { rateLimiters } = require('../security/rateLimiter');
const { info, error: logError } = require('../logger');

// ============================================
// GET /api/wishlist
// ============================================
// ⚠️ CACHEABLE CONDICIONAL: Datos de usuario, cache aislado por userId
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
// TTL: 30s (configurable via CACHE_TTL_USER_WISHLIST)
// Cache solo para usuarios autenticados, aislado por usuario
router.get('/', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = userSpecificKeys.wishlist(userId, req.apiVersion || 1);

    // Query optimizado con cache y explicit SELECTs (aislado por usuario)
    const wishlistItems = await cacheManager.getOrSet(cacheKey, async () => {
      const items = await query(`
        SELECT 
          w.id,
          w.created_at,
          p.id as product_id,
          p.name,
          p.slug,
          p.description,
          p.short_description,
          p.price,
          p.compare_at_price,
          p.brand,
          p.sku,
          p.stock,
          p.is_active,
          p.is_featured,
          p.is_new,
          p.is_bestseller,
          c.name as category_name,
          c.slug as category_slug
        FROM wishlists w
        INNER JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ? AND p.is_active = TRUE
        ORDER BY w.created_at DESC
      `, [userId]);

      // Verificar si cada producto tiene variantes activas
      for (let item of items) {
        const variants = await query(
          'SELECT COUNT(*) as count FROM product_variants WHERE product_id = ? AND is_active = TRUE',
          [item.product_id]
        );
        item.has_variants = (variants[0]?.count || 0) > 0;
      }

      return items;
    }, getTTL('USER_WISHLIST')); // TTL centralizado

    // Obtener imagen principal de cada producto
    for (let item of wishlistItems) {
      const images = await query(
        'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
        [item.product_id]
      );
      item.image_url = images.length > 0 ? images[0].image_url : null;
      
      // Las imágenes solo vienen de product_images, no hay fallback a products.image_url
    }

    res.json({
      success: true,
      data: {
        items: wishlistItems,
        count: wishlistItems.length
      }
    });
  } catch (error) {
    logError('Error obteniendo wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener wishlist' 
    });
  }
});

// ============================================
// POST /api/wishlist
// ============================================
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/', authenticate, rateLimiters.private, [
  body('product_id').isInt().withMessage('product_id debe ser un número')
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
    const { product_id } = req.body;

    // Verificar que el producto existe y está activo
    const products = await query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE LIMIT 1',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    // Verificar si el producto ya está en la wishlist
    const existingItems = await query(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, product_id]
    );

    if (existingItems.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El producto ya está en tu wishlist' 
      });
    }

    // Añadir a la wishlist
    await query(
      'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );

    // Invalidar cache de wishlist
    cacheManager.del(userSpecificKeys.wishlist(userId, req.apiVersion || 1));

    // Obtener wishlist actualizada con información completa
    const wishlistItems = await query(`
      SELECT 
        w.id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.compare_at_price,
        p.brand,
        p.sku,
        p.stock,
        p.is_active,
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        c.name as category_name,
        c.slug as category_slug
      FROM wishlists w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ? AND p.is_active = TRUE
      ORDER BY w.created_at DESC
    `, [userId]);

    // Verificar si cada producto tiene variantes activas
    for (let item of wishlistItems) {
      const variants = await query(
        'SELECT COUNT(*) as count FROM product_variants WHERE product_id = ? AND is_active = TRUE',
        [item.product_id]
      );
      item.has_variants = (variants[0]?.count || 0) > 0;
    }

    // Obtener imagen principal de cada producto
    for (let item of wishlistItems) {
      const images = await query(
        'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
        [item.product_id]
      );
      item.image_url = images.length > 0 ? images[0].image_url : null;
      
      // Las imágenes solo vienen de product_images, no hay fallback a products.image_url
    }

    res.json({
      success: true,
      message: 'Producto añadido a la wishlist',
      data: {
        items: wishlistItems,
        count: wishlistItems.length
      }
    });
  } catch (error) {
    logError('Error añadiendo a wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al añadir a wishlist' 
    });
  }
});

// ============================================
// DELETE /api/wishlist/:productId
// ============================================
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.delete('/:productId', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Verificar que el item pertenece al usuario
    const result = await query(
      'DELETE FROM wishlists WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado en tu wishlist' 
      });
    }

    // Invalidar cache de wishlist
    cacheManager.del(userSpecificKeys.wishlist(userId, req.apiVersion || 1));

    res.json({
      success: true,
      message: 'Producto eliminado de la wishlist'
    });
  } catch (error) {
    logError('Error eliminando de wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar de wishlist' 
    });
  }
});

// ============================================
// GET /api/wishlist/count
// ============================================
// Obtener cantidad de items en wishlist
router.get('/count', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT COUNT(*) as count FROM wishlists w INNER JOIN products p ON w.product_id = p.id WHERE w.user_id = ? AND p.is_active = TRUE',
      [userId]
    );

    res.json({
      success: true,
      data: {
        count: result[0].count || 0
      }
    });
  } catch (error) {
    logError('Error obteniendo count de wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener count de wishlist'
    });
  }
});

module.exports = router;

