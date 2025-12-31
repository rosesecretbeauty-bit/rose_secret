// ============================================
// Review Service - Lógica de negocio de Reviews
// ============================================

const { query, transaction } = require('../db');
const { error: logError, info } = require('../logger');

/**
 * Recalcular y actualizar rating promedio del producto
 * Si la tabla products tiene campo rating_average, se actualiza
 * Si no, solo retorna el promedio calculado
 */
async function updateProductRating(productId) {
  try {
    // Calcular rating promedio de reviews aprobadas
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as average
      FROM reviews
      WHERE product_id = ? AND is_approved = TRUE
    `, [productId]);

    const stats = statsResult[0];
    const total = parseInt(stats.total) || 0;
    const average = stats.average ? parseFloat(stats.average) : null;

    // Intentar actualizar campo rating_average si existe
    // (compatible con MySQL y PostgreSQL)
    try {
      await query(`
        UPDATE products 
        SET rating_average = ?
        WHERE id = ?
      `, [average, productId]);
      
      info('Product rating updated', { productId, average, total });
    } catch (updateError) {
      // Si el campo no existe, no es error crítico
      // Solo logueamos (puede ser que la columna no exista aún)
      if (!updateError.message.includes('Unknown column') && 
          !updateError.message.includes('does not exist')) {
        logError('Error updating product rating_average', updateError, { productId });
      }
    }

    return {
      average: average ? Math.round(average * 10) / 10 : 0,
      total
    };
  } catch (error) {
    logError('Error updating product rating', error, { productId });
    throw error;
  }
}

/**
 * Verificar si usuario compró el producto
 * Busca en orders del usuario que contengan el producto
 * Retorna order_id si encuentra, null si no
 */
async function verifyPurchase(userId, productId) {
  try {
    // Buscar pedidos entregados o enviados del usuario que contengan el producto
    const orderResult = await query(`
      SELECT DISTINCT o.id as order_id
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? 
        AND oi.product_id = ?
        AND o.status IN ('delivered', 'shipped')
      ORDER BY o.created_at DESC
      LIMIT 1
    `, [userId, productId]);

    if (orderResult.length > 0) {
      return orderResult[0].order_id;
    }

    return null;
  } catch (error) {
    logError('Error verifying purchase', error, { userId, productId });
    return null; // No fallar si hay error, solo retornar null
  }
}

/**
 * Verificar si usuario ya votó una review
 */
async function hasUserVoted(userId, reviewId) {
  try {
    const votes = await query(`
      SELECT id, is_helpful
      FROM review_votes
      WHERE user_id = ? AND review_id = ?
      LIMIT 1
    `, [userId, reviewId]);

    return votes.length > 0 ? votes[0] : null;
  } catch (error) {
    logError('Error checking user vote', error, { userId, reviewId });
    return null;
  }
}

/**
 * Obtener rating promedio y estadísticas de un producto
 */
async function getProductRatingStats(productId) {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as average,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
        SUM(CASE WHEN verified_purchase = TRUE THEN 1 ELSE 0 END) as verified_count
      FROM reviews
      WHERE product_id = ? AND is_approved = TRUE
    `, [productId]);

    const stats = statsResult[0];
    const total = parseInt(stats.total) || 0;
    const average = stats.average ? parseFloat(stats.average) : 0;

    const distribution = {
      5: total > 0 ? Math.round((parseInt(stats.rating_5) / total) * 100) : 0,
      4: total > 0 ? Math.round((parseInt(stats.rating_4) / total) * 100) : 0,
      3: total > 0 ? Math.round((parseInt(stats.rating_3) / total) * 100) : 0,
      2: total > 0 ? Math.round((parseInt(stats.rating_2) / total) * 100) : 0,
      1: total > 0 ? Math.round((parseInt(stats.rating_1) / total) * 100) : 0
    };

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution,
      verified_count: parseInt(stats.verified_count) || 0
    };
  } catch (error) {
    logError('Error getting product rating stats', error, { productId });
    throw error;
  }
}

module.exports = {
  updateProductRating,
  verifyPurchase,
  hasUserVoted,
  getProductRatingStats
};

