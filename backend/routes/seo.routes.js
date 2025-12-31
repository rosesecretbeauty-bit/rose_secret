// ============================================
// SEO Routes
// ============================================
// Rutas para gestión de SEO (metadata básica)
// Nota: Scanner completo de SEO requiere servicio externo

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');

// ============================================
// GET /api/seo/pages
// ============================================
// Obtener metadata SEO de páginas públicas (sin auth)
router.get('/pages', rateLimiters.public, async (req, res) => {
  try {
    // Por ahora retornamos estructura básica
    // En el futuro se puede extender con tabla seo_metadata
    const pages = [
      {
        path: '/',
        title: 'Rose Secret | Luxury Perfumes & Cosmetics',
        description: 'Discover our exclusive collection of luxury perfumes and cosmetics. Shop top brands and find your signature scent at Rose Secret.',
        keywords: 'luxury perfumes, cosmetics, fragrances, beauty products'
      },
      {
        path: '/shop',
        title: 'Shop Luxury Fragrances - Rose Secret',
        description: 'Browse our curated collection of luxury fragrances. Find your perfect scent from top international brands.',
        keywords: 'shop perfumes, fragrances, luxury scents'
      }
    ];

    res.json({
      success: true,
      data: {
        pages
      }
    });
  } catch (error) {
    logError('Error getting SEO pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadata SEO'
    });
  }
});

// ============================================
// GET /api/admin/seo/analyze
// ============================================
// Analizar SEO de una URL (placeholder - requiere servicio externo)
router.get('/admin/seo/analyze', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL es requerida'
      });
    }

    // TODO: Integrar con servicio de análisis SEO (ej: Lighthouse CI, SEO API, etc.)
    // Por ahora retornamos estructura básica
    res.json({
      success: true,
      message: 'Análisis SEO requiere integración con servicio externo',
      data: {
        url,
        score: 0,
        status: 'pending',
        note: 'Para análisis completo, configure un servicio de análisis SEO (Lighthouse, SEO API, etc.)'
      }
    });
  } catch (error) {
    logError('Error analyzing SEO:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar SEO'
    });
  }
});

module.exports = router;

