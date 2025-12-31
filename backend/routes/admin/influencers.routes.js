// ============================================
// Admin Influencers Routes
// ============================================
// Rutas administrativas para gestionar influencers

const express = require('express');
const router = express.Router();
const { query } = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { rateLimiters } = require('../../security/rateLimiter');
const { error: logError } = require('../../logger');
const auditService = require('../../services/audit.service');

// ============================================
// GET /api/admin/influencers
// ============================================
// Listar todos los influencers (incluyendo inactivos)
router.get('/', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const influencers = await query(`
      SELECT 
        id,
        name,
        role,
        image_url,
        bio,
        social_instagram,
        social_youtube,
        social_tiktok,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM influencers
      ORDER BY sort_order ASC, name ASC
    `);

    res.json({
      success: true,
      data: {
        influencers
      }
    });
  } catch (error) {
    logError('Error getting admin influencers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener influencers'
    });
  }
});

// ============================================
// POST /api/admin/influencers
// ============================================
// Crear influencer
router.post('/', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const {
      name,
      role,
      image_url,
      bio,
      social_instagram,
      social_youtube,
      social_tiktok,
      is_active = true,
      sort_order = 0
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y rol son requeridos'
      });
    }

    const result = await query(`
      INSERT INTO influencers (
        name, role, image_url, bio,
        social_instagram, social_youtube, social_tiktok,
        is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, role, image_url || null, bio || null, 
        social_instagram || null, social_youtube || null, social_tiktok || null,
        is_active ? 1 : 0, sort_order]);

    await auditService.logAudit(
      'INFLUENCER_CREATED',
      'influencer',
      result.insertId,
      null,
      { name, role },
      req
    );

    res.json({
      success: true,
      message: 'Influencer creado exitosamente',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    logError('Error creating influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear influencer'
    });
  }
});

// ============================================
// PUT /api/admin/influencers/:id
// ============================================
// Actualizar influencer
router.put('/:id', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      image_url,
      bio,
      social_instagram,
      social_youtube,
      social_tiktok,
      is_active,
      sort_order
    } = req.body;

    const [existing] = await query('SELECT * FROM influencers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Influencer no encontrado'
      });
    }

    await query(`
      UPDATE influencers SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        image_url = ?,
        bio = ?,
        social_instagram = ?,
        social_youtube = ?,
        social_tiktok = ?,
        is_active = COALESCE(?, is_active),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?
    `, [name, role, image_url, bio, 
        social_instagram, social_youtube, social_tiktok,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        sort_order, id]);

    await auditService.logAudit(
      'INFLUENCER_UPDATED',
      'influencer',
      parseInt(id),
      existing,
      req.body,
      req
    );

    res.json({
      success: true,
      message: 'Influencer actualizado exitosamente'
    });
  } catch (error) {
    logError('Error updating influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar influencer'
    });
  }
});

// ============================================
// DELETE /api/admin/influencers/:id
// ============================================
// Eliminar influencer
router.delete('/:id', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await query('SELECT * FROM influencers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Influencer no encontrado'
      });
    }

    await query('DELETE FROM influencers WHERE id = ?', [id]);

    await auditService.logAudit(
      'INFLUENCER_DELETED',
      'influencer',
      parseInt(id),
      existing,
      null,
      req
    );

    res.json({
      success: true,
      message: 'Influencer eliminado exitosamente'
    });
  } catch (error) {
    logError('Error deleting influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar influencer'
    });
  }
});

// ============================================
// POST /api/admin/influencers/:id/products
// ============================================
// Agregar producto a influencer
router.post('/:id/products', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, role, sort_order = 0 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'product_id es requerido'
      });
    }

    // Verificar que el influencer existe
    const [influencer] = await query('SELECT id FROM influencers WHERE id = ?', [id]);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer no encontrado'
      });
    }

    // Verificar que el producto existe
    const [product] = await query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await query(`
      INSERT INTO influencer_products (influencer_id, product_id, role, sort_order)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE role = VALUES(role), sort_order = VALUES(sort_order)
    `, [id, product_id, role || null, sort_order]);

    res.json({
      success: true,
      message: 'Producto agregado al influencer exitosamente'
    });
  } catch (error) {
    logError('Error adding product to influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar producto'
    });
  }
});

// ============================================
// DELETE /api/admin/influencers/:id/products/:productId
// ============================================
// Eliminar producto de influencer
router.delete('/:id/products/:productId', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { id, productId } = req.params;

    await query(`
      DELETE FROM influencer_products
      WHERE influencer_id = ? AND product_id = ?
    `, [id, productId]);

    res.json({
      success: true,
      message: 'Producto eliminado del influencer exitosamente'
    });
  } catch (error) {
    logError('Error removing product from influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto'
    });
  }
});

module.exports = router;

