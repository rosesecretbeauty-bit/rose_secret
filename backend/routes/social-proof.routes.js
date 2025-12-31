// ============================================
// Social Proof Routes
// ============================================
// Rutas para obtener actividades sociales recientes (compras, wishlist, reviews)
// Datos anonimizados para privacidad

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');

// ============================================
// GET /api/social-proof/recent-activities
// ============================================
// Obtener actividades recientes anonimizadas
// Combina compras, wishlist y reviews recientes
router.get('/recent-activities', rateLimiters.public, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const hours = parseInt(req.query.hours) || 24; // Últimas 24 horas por defecto

    const activities = [];

    // 1. Compras recientes (últimas X horas)
    const recentPurchases = await query(`
      SELECT 
        o.id as order_id,
        o.created_at,
        oi.product_id,
        p.name as product_name,
        u.id as user_id,
        SUBSTRING(u.name, 1, 1) as user_initial,
        COALESCE(addr.city, u.location, 'Ciudad') as location
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      INNER JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses addr ON u.id = addr.user_id AND addr.is_default = 1
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        AND o.status != 'cancelled'
        AND p.is_active = TRUE
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [hours, limit]);

    for (const purchase of recentPurchases) {
      // Obtener imagen del producto
      const [image] = await query(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [purchase.product_id]);

      activities.push({
        id: `purchase-${purchase.order_id}`,
        type: 'purchased',
        product_name: purchase.product_name,
        product_id: purchase.product_id,
        product_image: image?.image_url || null,
        user_name: `${purchase.user_initial}.`, // Solo inicial
        location: purchase.location,
        time_ago: getTimeAgo(purchase.created_at),
        timestamp: purchase.created_at
      });
    }

    // 2. Wishlist recientes (últimas X horas)
    const recentWishlists = await query(`
      SELECT 
        w.id as wishlist_id,
        w.created_at,
        w.product_id,
        p.name as product_name,
        u.id as user_id,
        SUBSTRING(u.name, 1, 1) as user_initial,
        COALESCE(addr.city, u.location, 'Ciudad') as location
      FROM wishlists w
      INNER JOIN products p ON w.product_id = p.id
      INNER JOIN users u ON w.user_id = u.id
      LEFT JOIN addresses addr ON u.id = addr.user_id AND addr.is_default = 1
      WHERE w.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        AND p.is_active = TRUE
      ORDER BY w.created_at DESC
      LIMIT ?
    `, [hours, Math.floor(limit / 2)]);

    for (const wish of recentWishlists) {
      const [image] = await query(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [wish.product_id]);

      activities.push({
        id: `wishlist-${wish.wishlist_id}`,
        type: 'wishlisted',
        product_name: wish.product_name,
        product_id: wish.product_id,
        product_image: image?.image_url || null,
        user_name: `${wish.user_initial}.`,
        location: wish.location,
        time_ago: getTimeAgo(wish.created_at),
        timestamp: wish.created_at
      });
    }

    // 3. Reviews recientes (últimas X horas, solo 5 estrellas)
    const recentReviews = await query(`
      SELECT 
        r.id as review_id,
        r.created_at,
        r.product_id,
        r.rating,
        p.name as product_name,
        u.id as user_id,
        SUBSTRING(u.name, 1, 1) as user_initial,
        COALESCE(addr.city, u.location, 'Ciudad') as location
      FROM reviews r
      INNER JOIN products p ON r.product_id = p.id
      INNER JOIN users u ON r.user_id = u.id
      LEFT JOIN addresses addr ON u.id = addr.user_id AND addr.is_default = 1
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        AND r.rating >= 4
        AND p.is_active = TRUE
        AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [hours, Math.floor(limit / 3)]);

    for (const review of recentReviews) {
      const [image] = await query(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [review.product_id]);

      activities.push({
        id: `review-${review.review_id}`,
        type: 'reviewed',
        product_name: review.product_name,
        product_id: review.product_id,
        product_image: image?.image_url || null,
        user_name: `${review.user_initial}.`,
        location: review.location,
        rating: review.rating,
        time_ago: getTimeAgo(review.created_at),
        timestamp: review.created_at
      });
    }

    // Ordenar por timestamp más reciente y limitar
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: {
        activities: limitedActivities,
        count: limitedActivities.length
      }
    });
  } catch (error) {
    logError('Error getting social proof activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades sociales'
    });
  }
});

// Helper function para calcular tiempo relativo
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  return `Hace ${diffWeeks} sem`;
}

module.exports = router;

