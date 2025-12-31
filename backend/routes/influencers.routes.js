// ============================================
// Influencers Routes
// ============================================
// Rutas para gestionar influencers y sus colecciones

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');

// ============================================
// GET /api/influencers
// ============================================
// Obtener lista de influencers activos (público)
router.get('/', rateLimiters.public, async (req, res) => {
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
        sort_order
      FROM influencers
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC
    `);

    res.json({
      success: true,
      data: {
        influencers: influencers.map(i => ({
          id: i.id,
          name: i.name,
          role: i.role,
          image: i.image_url,
          bio: i.bio,
          social: {
            instagram: i.social_instagram,
            youtube: i.social_youtube,
            tiktok: i.social_tiktok
          }
        }))
      }
    });
  } catch (error) {
    logError('Error getting influencers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener influencers'
    });
  }
});

// ============================================
// GET /api/influencers/:id
// ============================================
// Obtener influencer específico con sus productos
router.get('/:id', rateLimiters.public, async (req, res) => {
  try {
    const { id } = req.params;

    const [influencer] = await query(`
      SELECT 
        id,
        name,
        role,
        image_url,
        bio,
        social_instagram,
        social_youtube,
        social_tiktok,
        sort_order
      FROM influencers
      WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer no encontrado'
      });
    }

    // Obtener productos asociados
    const products = await query(`
      SELECT 
        p.id,
        p.name,
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
        ip.role as product_role,
        ip.sort_order
      FROM influencer_products ip
      INNER JOIN products p ON ip.product_id = p.id
      WHERE ip.influencer_id = ? AND p.is_active = TRUE
      ORDER BY ip.sort_order ASC
    `, [id]);

    // Obtener imágenes de productos
    for (const product of products) {
      const images = await query(`
        SELECT image_url, is_primary
        FROM product_images
        WHERE product_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [product.id]);
      product.image_url = images[0]?.image_url || null;
    }

    res.json({
      success: true,
      data: {
        influencer: {
          id: influencer.id,
          name: influencer.name,
          role: influencer.role,
          image: influencer.image_url,
          bio: influencer.bio,
          social: {
            instagram: influencer.social_instagram,
            youtube: influencer.social_youtube,
            tiktok: influencer.social_tiktok
          },
          products: products.map(p => ({
            ...p,
            images: p.image_url ? [p.image_url] : [],
            role: p.product_role
          }))
        }
      }
    });
  } catch (error) {
    logError('Error getting influencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener influencer'
    });
  }
});

// ============================================
// GET /api/influencers/:id/products
// ============================================
// Obtener productos de un influencer específico
router.get('/:id/products', rateLimiters.public, async (req, res) => {
  try {
    const { id } = req.params;

    const products = await query(`
      SELECT 
        p.id,
        p.name,
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
        ip.role as product_role,
        ip.sort_order
      FROM influencer_products ip
      INNER JOIN products p ON ip.product_id = p.id
      WHERE ip.influencer_id = ? AND p.is_active = TRUE
      ORDER BY ip.sort_order ASC
      LIMIT 20
    `, [id]);

    // Obtener imágenes de productos
    for (const product of products) {
      const images = await query(`
        SELECT image_url
        FROM product_images
        WHERE product_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [product.id]);
      product.image_url = images[0]?.image_url || null;
    }

    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          ...p,
          images: p.image_url ? [p.image_url] : [],
          role: p.product_role
        }))
      }
    });
  } catch (error) {
    logError('Error getting influencer products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos del influencer'
    });
  }
});

module.exports = router;

