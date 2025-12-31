// ============================================
// Promotion Service
// ============================================
// Gestiona promociones y flash sales dinámicas

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener promociones activas
 * Solo retorna promociones que:
 * - active = true
 * - Fecha actual está entre start_date y end_date
 */
async function getActivePromotions(position = null) {
  try {
    let sql = `
      SELECT * FROM promotions 
      WHERE active = 1 
      AND NOW() >= start_date 
      AND NOW() <= end_date
    `;
    const params = [];

    if (position) {
      sql += ' AND banner_position = ?';
      params.push(position);
    }

    sql += ' ORDER BY priority DESC, created_at DESC';

    const promotions = await query(sql, params);

    return promotions.map(p => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      discount_percentage: p.discount_percentage ? parseFloat(p.discount_percentage) : null,
      discount_amount: p.discount_amount ? parseFloat(p.discount_amount) : null,
      discount_type: p.discount_type,
      start_date: p.start_date,
      end_date: p.end_date,
      cta_text: p.cta_text || 'Comprar Ahora',
      cta_url: p.cta_url,
      banner_position: p.banner_position,
      target_categories: p.target_categories ? JSON.parse(p.target_categories) : null,
      target_products: p.target_products ? JSON.parse(p.target_products) : null,
      min_purchase: p.min_purchase ? parseFloat(p.min_purchase) : null,
      max_discount: p.max_discount ? parseFloat(p.max_discount) : null,
      image_url: p.image_url,
      background_color: p.background_color,
      text_color: p.text_color,
      show_countdown: !!p.show_countdown,
      priority: p.priority || 0,
    }));
  } catch (error) {
    logError('Error obteniendo promociones activas:', error);
    return [];
  }
}

/**
 * Obtener todas las promociones (para admin)
 */
async function getAllPromotions(filters = {}) {
  try {
    let sql = 'SELECT * FROM promotions WHERE 1=1';
    const params = [];

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.active !== undefined) {
      sql += ' AND active = ?';
      params.push(filters.active ? 1 : 0);
    }

    sql += ' ORDER BY priority DESC, created_at DESC';

    const promotions = await query(sql, params);

    return promotions.map(p => ({
      ...p,
      target_categories: p.target_categories ? JSON.parse(p.target_categories) : null,
      target_products: p.target_products ? JSON.parse(p.target_products) : null,
    }));
  } catch (error) {
    logError('Error obteniendo promociones:', error);
    return [];
  }
}

/**
 * Crear nueva promoción
 */
async function createPromotion(data) {
  try {
    const result = await query(`
      INSERT INTO promotions (
        type, title, description, discount_percentage, discount_amount, discount_type,
        start_date, end_date, active, cta_text, cta_url, banner_position,
        target_categories, target_products, min_purchase, max_discount,
        usage_limit, image_url, background_color, text_color, show_countdown, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.type || 'banner',
      data.title,
      data.description || null,
      data.discount_percentage || null,
      data.discount_amount || null,
      data.discount_type || 'percentage',
      data.start_date,
      data.end_date,
      data.active !== undefined ? (data.active ? 1 : 0) : 1,
      data.cta_text || 'Comprar Ahora',
      data.cta_url || null,
      data.banner_position || 'header',
      data.target_categories ? JSON.stringify(data.target_categories) : null,
      data.target_products ? JSON.stringify(data.target_products) : null,
      data.min_purchase || null,
      data.max_discount || null,
      data.usage_limit || null,
      data.image_url || null,
      data.background_color || null,
      data.text_color || null,
      data.show_countdown !== undefined ? (data.show_countdown ? 1 : 0) : 1,
      data.priority || 0,
    ]);

    return { success: true, id: result.insertId };
  } catch (error) {
    logError('Error creando promoción:', error);
    throw error;
  }
}

/**
 * Actualizar promoción
 */
async function updatePromotion(id, data) {
  try {
    await query(`
      UPDATE promotions SET
        type = ?,
        title = ?,
        description = ?,
        discount_percentage = ?,
        discount_amount = ?,
        discount_type = ?,
        start_date = ?,
        end_date = ?,
        active = ?,
        cta_text = ?,
        cta_url = ?,
        banner_position = ?,
        target_categories = ?,
        target_products = ?,
        min_purchase = ?,
        max_discount = ?,
        usage_limit = ?,
        image_url = ?,
        background_color = ?,
        text_color = ?,
        show_countdown = ?,
        priority = ?
      WHERE id = ?
    `, [
      data.type || 'banner',
      data.title,
      data.description || null,
      data.discount_percentage || null,
      data.discount_amount || null,
      data.discount_type || 'percentage',
      data.start_date,
      data.end_date,
      data.active !== undefined ? (data.active ? 1 : 0) : 1,
      data.cta_text || 'Comprar Ahora',
      data.cta_url || null,
      data.banner_position || 'header',
      data.target_categories ? JSON.stringify(data.target_categories) : null,
      data.target_products ? JSON.stringify(data.target_products) : null,
      data.min_purchase || null,
      data.max_discount || null,
      data.usage_limit || null,
      data.image_url || null,
      data.background_color || null,
      data.text_color || null,
      data.show_countdown !== undefined ? (data.show_countdown ? 1 : 0) : 1,
      data.priority || 0,
      id,
    ]);

    return { success: true };
  } catch (error) {
    logError('Error actualizando promoción:', error);
    throw error;
  }
}

/**
 * Eliminar promoción
 */
async function deletePromotion(id) {
  try {
    await query('DELETE FROM promotions WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    logError('Error eliminando promoción:', error);
    throw error;
  }
}

module.exports = {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};

