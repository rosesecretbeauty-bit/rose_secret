// ============================================
// Waitlist Service - Lista de Espera de Productos
// ============================================

const { query } = require('../db');
const { error: logError, info } = require('../logger');

/**
 * Obtener waitlist del usuario
 */
async function getUserWaitlist(userId) {
  try {
    const items = await query(
      `SELECT 
         w.id,
         w.product_id,
         w.variant_id,
         w.notified,
         w.notified_at,
         w.created_at,
         p.name as product_name,
         p.slug as product_slug,
         p.price,
         pv.name as variant_name,
         pv.price as variant_price,
         (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as image_url
       FROM waitlist w
       INNER JOIN products p ON w.product_id = p.id
       LEFT JOIN product_variants pv ON w.variant_id = pv.id
       WHERE w.user_id = ? AND p.is_active = 1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_slug: item.product_slug,
      variant_name: item.variant_name,
      price: item.variant_price ? parseFloat(item.variant_price) : parseFloat(item.price),
      image_url: item.image_url,
      notified: item.notified === 1,
      notified_at: item.notified_at,
      created_at: item.created_at
    }));
  } catch (error) {
    logError('Error getting user waitlist:', error);
    throw error;
  }
}

/**
 * Agregar producto a waitlist
 */
async function addToWaitlist(userId, productId, variantId = null) {
  try {
    // Verificar si ya está en waitlist
    const existing = await query(
      'SELECT id FROM waitlist WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [userId, productId, variantId, variantId]
    );

    if (existing.length > 0) {
      throw new Error('Este producto ya está en tu lista de espera');
    }

    // Verificar que el producto existe y está activo
    const products = await query(
      'SELECT id, name, is_active FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      throw new Error('Producto no encontrado');
    }

    if (products[0].is_active === 0) {
      throw new Error('Producto no disponible');
    }

    // Si hay variant_id, verificar que existe
    if (variantId) {
      const variants = await query(
        'SELECT id FROM product_variants WHERE id = ? AND product_id = ? AND is_active = 1',
        [variantId, productId]
      );

      if (variants.length === 0) {
        throw new Error('Variante no encontrada');
      }
    }

    // Agregar a waitlist
    const result = await query(
      'INSERT INTO waitlist (user_id, product_id, variant_id) VALUES (?, ?, ?)',
      [userId, productId, variantId]
    );

    info('Producto agregado a waitlist', { userId, productId, variantId, waitlistId: result.insertId });

    return {
      id: result.insertId,
      product_id: productId,
      variant_id: variantId
    };
  } catch (error) {
    logError('Error adding to waitlist:', error);
    throw error;
  }
}

/**
 * Remover de waitlist
 */
async function removeFromWaitlist(userId, waitlistId) {
  try {
    // Verificar que pertenece al usuario
    const items = await query(
      'SELECT id FROM waitlist WHERE id = ? AND user_id = ?',
      [waitlistId, userId]
    );

    if (items.length === 0) {
      throw new Error('Item no encontrado en tu lista de espera');
    }

    await query(
      'DELETE FROM waitlist WHERE id = ? AND user_id = ?',
      [waitlistId, userId]
    );

    return { success: true };
  } catch (error) {
    logError('Error removing from waitlist:', error);
    throw error;
  }
}

module.exports = {
  getUserWaitlist,
  addToWaitlist,
  removeFromWaitlist
};

