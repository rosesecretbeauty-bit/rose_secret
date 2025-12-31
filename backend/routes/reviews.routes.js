// ============================================
// Rutas de Reviews - Sistema Completo
// ============================================

const express = require('express');
const router = express.Router();
const { query, transaction, queryWithConnection } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const { info, error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const reviewService = require('../services/review.service');

// ============================================
// GET /api/products/:id/reviews
// ============================================
// Listar reviews de un producto con paginación y filtros
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/products/:id/reviews', rateLimiters.public, [
  param('id').isInt().withMessage('ID de producto inválido'),
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  queryValidator('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating inválido'),
  queryValidator('sort').optional().isIn(['recent', 'helpful', 'rating_high', 'rating_low']).withMessage('sort inválido'),
  queryValidator('with_images').optional().isIn(['true', 'false']).withMessage('with_images inválido')
], cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'),
  keyBuilder: (req) => {
    const { page = 1, limit = 20, rating, sort, with_images } = req.query;
    return `product:${req.params.id}:reviews:${page}:${limit}:${rating || ''}:${sort || ''}:${with_images || ''}`;
  },
  vary: []
}), async (req, res) => {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const rating = req.query.rating ? parseInt(req.query.rating) : null;
    const sort = req.query.sort || 'recent';
    const withImages = req.query.with_images === 'true';
    const offset = (page - 1) * limit;

    // Verificar que el producto existe
    const productCheck = await query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Construir WHERE clause
    let whereClause = 'WHERE r.product_id = ? AND r.is_approved = TRUE';
    const queryParams = [id];

    if (rating) {
      whereClause += ' AND r.rating = ?';
      queryParams.push(rating);
    }

    if (withImages) {
      whereClause += ' AND EXISTS (SELECT 1 FROM review_images ri WHERE ri.review_id = r.id)';
    }

    // Construir ORDER BY según sort
    let orderBy = 'ORDER BY r.is_featured DESC, ';
    switch (sort) {
      case 'helpful':
        orderBy += 'r.helpful_count DESC, r.created_at DESC';
        break;
      case 'rating_high':
        orderBy += 'r.rating DESC, r.created_at DESC';
        break;
      case 'rating_low':
        orderBy += 'r.rating ASC, r.created_at DESC';
        break;
      case 'recent':
      default:
        orderBy += 'r.created_at DESC';
        break;
    }

    // Obtener reviews con información de usuario
    const reviews = await query(`
      SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.verified_purchase,
        r.helpful_count,
        r.not_helpful_count,
        r.is_featured,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.avatar as user_avatar
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Obtener imágenes de cada review
    for (let review of reviews) {
      const images = await query(`
        SELECT id, image_url, sort_order
        FROM review_images
        WHERE review_id = ?
        ORDER BY sort_order ASC, created_at ASC
      `, [review.id]);
      review.images = images.map(img => ({
        id: img.id,
        url: img.image_url,
        sort_order: img.sort_order
      }));
    }

    // Obtener respuestas (replies) de cada review
    for (let review of reviews) {
      const replies = await query(`
        SELECT 
          rr.id,
          rr.user_id,
          rr.content,
          rr.is_admin,
          rr.created_at,
          rr.updated_at,
          u.name as user_name,
          u.avatar as user_avatar
        FROM review_replies rr
        INNER JOIN users u ON rr.user_id = u.id
        WHERE rr.review_id = ?
        ORDER BY rr.created_at ASC
      `, [review.id]);
      review.replies = replies;
    }

    // Obtener total con los mismos filtros
    let countWhereClause = 'WHERE product_id = ? AND is_approved = TRUE';
    const countParams = [id];
    if (rating) {
      countWhereClause += ' AND rating = ?';
      countParams.push(rating);
    }
    if (withImages) {
      countWhereClause += ' AND EXISTS (SELECT 1 FROM review_images ri WHERE ri.review_id = reviews.id)';
    }

    const totalResult = await query(
      `SELECT COUNT(*) as total FROM reviews ${countWhereClause}`,
      countParams
    );
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logError('Error obteniendo reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reviews'
    });
  }
});

// ============================================
// GET /api/products/:id/reviews/stats
// ============================================
// Obtener estadísticas de reviews (promedio, distribución)
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/products/:id/reviews/stats', rateLimiters.public, [
  param('id').isInt().withMessage('ID de producto inválido')
], cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'),
  keyBuilder: (req) => `product:${req.params.id}:reviews:stats`,
  vary: []
}), async (req, res) => {
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

    // Verificar que el producto existe
    const productCheck = await query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Usar servicio para obtener stats
    const stats = await reviewService.getProductRatingStats(id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logError('Error obteniendo stats de reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// ============================================
// POST /api/products/:id/reviews
// ============================================
// Crear una review (requiere autenticación)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/products/:id/reviews', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de producto inválido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Contenido debe tener entre 10 y 2000 caracteres'),
  body('title').optional().trim().isLength({ max: 255 }).withMessage('Título inválido'),
  body('order_id').optional().isInt().withMessage('order_id inválido')
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
    const userId = req.user.id;
    const { rating, title, content, order_id } = req.body;

    // Verificar que el producto existe
    const productCheck = await query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario no haya ya escrito una review para este producto
    const existingReview = await query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya has escrito una review para este producto'
      });
    }

    // Verificar compra (automático si no se proporciona order_id)
    let verifiedPurchase = false;
    let finalOrderId = order_id || null;

    if (order_id) {
      // Si se proporciona order_id, verificar que el pedido contiene el producto
      const orderCheck = await query(`
        SELECT id 
        FROM orders 
        WHERE id = ? AND user_id = ? AND status IN ('delivered', 'shipped')
        LIMIT 1
      `, [order_id, userId]);

      if (orderCheck.length > 0) {
        const orderItemCheck = await query(`
          SELECT id 
          FROM order_items 
          WHERE order_id = ? AND product_id = ?
          LIMIT 1
        `, [order_id, id]);

        if (orderItemCheck.length > 0) {
          verifiedPurchase = true;
        }
      }
    } else {
      // Buscar automáticamente si el usuario compró el producto
      const foundOrderId = await reviewService.verifyPurchase(userId, id);
      if (foundOrderId) {
        verifiedPurchase = true;
        finalOrderId = foundOrderId;
      }
    }

    // Crear review
    const result = await query(`
      INSERT INTO reviews (
        product_id, user_id, order_id, rating, title, content, verified_purchase, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userId,
      finalOrderId,
      rating,
      title || null,
      content,
      verifiedPurchase,
      true // Auto-aprobar por ahora
    ]);

    const reviewId = result.insertId;

    // Actualizar rating promedio del producto
    await reviewService.updateProductRating(id);

    // Invalidar cache de reviews y stats
    cacheManager.delPattern(`^product:${id}:reviews:`);
    cacheManager.del(`product:${id}:reviews:stats`);
    cacheManager.del(`product:${id}`); // Invalidar producto también

    // Obtener review creada
    const newReview = await query(`
      SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.verified_purchase,
        r.helpful_count,
        r.not_helpful_count,
        r.is_featured,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.avatar as user_avatar
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
      LIMIT 1
    `, [reviewId]);

    // Audit log
    await auditService.logAudit('CREATE', 'review', reviewId, null, newReview[0], req);

    res.status(201).json({
      success: true,
      message: 'Review creada exitosamente',
      data: {
        review: newReview[0]
      }
    });
  } catch (error) {
    logError('Error creando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear review'
    });
  }
});

// ============================================
// PUT /api/reviews/:id
// ============================================
// Actualizar una review (solo el autor)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.put('/:id', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de review inválido'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
  body('content').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Contenido debe tener entre 10 y 2000 caracteres'),
  body('title').optional().trim().isLength({ max: 255 }).withMessage('Título inválido')
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
    const userId = req.user.id;
    const { rating, title, content } = req.body;

    // Verificar que la review existe y obtener información
    const reviewCheck = await query(
      'SELECT id, product_id, user_id, rating as old_rating FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Verificar ownership (solo el autor puede actualizar)
    if (reviewCheck[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta review'
      });
    }

    const productId = reviewCheck[0].product_id;
    const oldRating = reviewCheck[0].old_rating;
    const ratingChanged = rating && rating !== oldRating;

    // Construir UPDATE dinámico
    const updates = [];
    const updateValues = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      updateValues.push(rating);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      updateValues.push(title || null);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      updateValues.push(content);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    // Agregar updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    // Actualizar review
    await query(`
      UPDATE reviews 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Si cambió el rating, actualizar rating promedio del producto
    if (ratingChanged) {
      await reviewService.updateProductRating(productId);
    }

    // Invalidar cache
    cacheManager.delPattern(`^product:${productId}:reviews:`);
    cacheManager.del(`product:${productId}:reviews:stats`);
    cacheManager.del(`product:${productId}`);

    // Obtener review actualizada
    const updatedReview = await query(`
      SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.content,
        r.verified_purchase,
        r.helpful_count,
        r.not_helpful_count,
        r.is_featured,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.avatar as user_avatar
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
      LIMIT 1
    `, [id]);

    // Audit log
    await auditService.logAudit('UPDATE', 'review', id, reviewCheck[0], updatedReview[0], req);

    res.json({
      success: true,
      message: 'Review actualizada exitosamente',
      data: {
        review: updatedReview[0]
      }
    });
  } catch (error) {
    logError('Error actualizando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar review'
    });
  }
});

// ============================================
// DELETE /api/reviews/:id
// ============================================
// Eliminar una review (solo el autor o admin)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.delete('/:id', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de review inválido')
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
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Verificar que la review existe y obtener información
    const reviewCheck = await query(
      'SELECT id, product_id, user_id FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Verificar ownership (solo el autor o admin puede eliminar)
    if (!isAdmin && reviewCheck[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta review'
      });
    }

    const productId = reviewCheck[0].product_id;

    // Eliminar review (CASCADE eliminará imágenes, respuestas y votos)
    await query('DELETE FROM reviews WHERE id = ?', [id]);

    // Actualizar rating promedio del producto
    await reviewService.updateProductRating(productId);

    // Invalidar cache
    cacheManager.delPattern(`^product:${productId}:reviews:`);
    cacheManager.del(`product:${productId}:reviews:stats`);
    cacheManager.del(`product:${productId}`);

    // Audit log
    await auditService.logAudit('DELETE', 'review', id, reviewCheck[0], null, req);

    res.json({
      success: true,
      message: 'Review eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar review'
    });
  }
});

// ============================================
// POST /api/reviews/:id/vote
// ============================================
// Votar helpful/not helpful en una review
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/:id/vote', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de review inválido'),
  body('helpful').isBoolean().withMessage('helpful debe ser booleano')
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
    const userId = req.user.id;
    const { helpful } = req.body;

    // Verificar que la review existe
    const reviewCheck = await query(
      'SELECT id, product_id, user_id FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Verificar que el usuario no sea el autor de la review
    if (reviewCheck[0].user_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes votar tu propia review'
      });
    }

    const productId = reviewCheck[0].product_id;

    // Verificar si el usuario ya votó
    const existingVote = await reviewService.hasUserVoted(userId, id);

    if (existingVote) {
      // Si ya votó, actualizar el voto si cambió de helpful a not_helpful o viceversa
      if (existingVote.is_helpful !== helpful) {
        // Eliminar voto anterior y crear nuevo
        await query('DELETE FROM review_votes WHERE id = ?', [existingVote.id]);
        
        // Decrementar contador anterior
        if (existingVote.is_helpful) {
          await query('UPDATE reviews SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = ?', [id]);
        } else {
          await query('UPDATE reviews SET not_helpful_count = GREATEST(0, not_helpful_count - 1) WHERE id = ?', [id]);
        }

        // Crear nuevo voto
        await query(`
          INSERT INTO review_votes (review_id, user_id, is_helpful)
          VALUES (?, ?, ?)
        `, [id, userId, helpful]);

        // Incrementar nuevo contador
        if (helpful) {
          await query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
        } else {
          await query('UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = ?', [id]);
        }
      } else {
        // Ya votó de la misma manera, retornar éxito sin cambios
        return res.json({
          success: true,
          message: 'Ya has votado esta review de esta manera'
        });
      }
    } else {
      // Crear nuevo voto
      await query(`
        INSERT INTO review_votes (review_id, user_id, is_helpful)
        VALUES (?, ?, ?)
      `, [id, userId, helpful]);

      // Actualizar contador
      if (helpful) {
        await query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
      } else {
        await query('UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = ?', [id]);
      }
    }

    // Invalidar cache
    cacheManager.delPattern(`^product:${productId}:reviews:`);

    // Obtener conteos actualizados
    const updatedReview = await query(
      'SELECT helpful_count, not_helpful_count FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    res.json({
      success: true,
      message: 'Voto registrado exitosamente',
      data: {
        helpful_count: updatedReview[0].helpful_count,
        not_helpful_count: updatedReview[0].not_helpful_count
      }
    });
  } catch (error) {
    logError('Error votando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar voto'
    });
  }
});

// ============================================
// GET /api/reviews/:id/replies
// ============================================
// Listar respuestas de una review
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/:id/replies', rateLimiters.public, [
  param('id').isInt().withMessage('ID de review inválido')
], cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'),
  keyBuilder: (req) => `review:${req.params.id}:replies`,
  vary: []
}), async (req, res) => {
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

    // Verificar que la review existe
    const reviewCheck = await query(
      'SELECT id, product_id FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Obtener respuestas
    const replies = await query(`
      SELECT 
        rr.id,
        rr.user_id,
        rr.content,
        rr.is_admin,
        rr.created_at,
        rr.updated_at,
        u.name as user_name,
        u.avatar as user_avatar
      FROM review_replies rr
      INNER JOIN users u ON rr.user_id = u.id
      WHERE rr.review_id = ?
      ORDER BY rr.created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        replies
      }
    });
  } catch (error) {
    logError('Error obteniendo respuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener respuestas'
    });
  }
});

// ============================================
// POST /api/reviews/:id/replies
// ============================================
// Responder a una review (admin o usuario - solo admin puede responder a cualquier review)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/:id/replies', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de review inválido'),
  body('content').trim().isLength({ min: 5, max: 1000 }).withMessage('Contenido debe tener entre 5 y 1000 caracteres')
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
    const userId = req.user.id;
    const { content } = req.body;
    const isAdmin = req.user.role === 'admin';

    // Verificar que la review existe
    const reviewCheck = await query(
      'SELECT id, product_id, user_id FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Solo admin puede responder a cualquier review
    // (En el futuro se puede permitir que usuarios respondan a sus propias reviews)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden responder reviews'
      });
    }

    // Crear respuesta
    const result = await query(`
      INSERT INTO review_replies (review_id, user_id, content, is_admin)
      VALUES (?, ?, ?, ?)
    `, [id, userId, content, true]);

    const productId = reviewCheck[0].product_id;

    // Invalidar cache
    cacheManager.delPattern(`^product:${productId}:reviews:`);
    cacheManager.del(`review:${id}:replies`);

    // Obtener respuesta creada
    const newReply = await query(`
      SELECT 
        rr.id,
        rr.user_id,
        rr.content,
        rr.is_admin,
        rr.created_at,
        rr.updated_at,
        u.name as user_name,
        u.avatar as user_avatar
      FROM review_replies rr
      INNER JOIN users u ON rr.user_id = u.id
      WHERE rr.id = ?
      LIMIT 1
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Respuesta creada exitosamente',
      data: {
        reply: newReply[0]
      }
    });
  } catch (error) {
    logError('Error creando respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear respuesta'
    });
  }
});

// ============================================
// POST /api/reviews/:id/images
// ============================================
// Subir imágenes a una review (solo el autor)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/:id/images', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de review inválido'),
  body('images').isArray({ min: 1, max: 5 }).withMessage('Debe proporcionar entre 1 y 5 imágenes'),
  body('images.*').isURL().withMessage('Cada imagen debe ser una URL válida')
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
    const userId = req.user.id;
    const { images } = req.body;

    // Verificar que la review existe
    const reviewCheck = await query(
      'SELECT id, product_id, user_id FROM reviews WHERE id = ? LIMIT 1',
      [id]
    );

    if (reviewCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    // Verificar ownership (solo el autor puede agregar imágenes)
    if (reviewCheck[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar imágenes a esta review'
      });
    }

    // Verificar que no exceda el límite de imágenes (máximo 5)
    const existingImages = await query(
      'SELECT COUNT(*) as count FROM review_images WHERE review_id = ?',
      [id]
    );
    const currentCount = parseInt(existingImages[0].count) || 0;

    if (currentCount + images.length > 5) {
      return res.status(400).json({
        success: false,
        message: `El límite es de 5 imágenes. Ya tienes ${currentCount} y estás intentando agregar ${images.length}`
      });
    }

    const productId = reviewCheck[0].product_id;

    // Insertar imágenes
    const insertedImages = [];
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const sortOrder = currentCount + i + 1;

      const result = await query(`
        INSERT INTO review_images (review_id, image_url, sort_order)
        VALUES (?, ?, ?)
      `, [id, imageUrl, sortOrder]);

      insertedImages.push({
        id: result.insertId,
        image_url: imageUrl,
        sort_order: sortOrder
      });
    }

    // Invalidar cache
    cacheManager.delPattern(`^product:${productId}:reviews:`);

    res.status(201).json({
      success: true,
      message: 'Imágenes agregadas exitosamente',
      data: {
        images: insertedImages
      }
    });
  } catch (error) {
    logError('Error agregando imágenes a review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar imágenes'
    });
  }
});

module.exports = router;
