// ============================================
// Rutas de Banners
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { param, query: queryValidator, validationResult } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');

// ============================================
// GET /api/banners
// Obtener todos los banners (filtrado por tipo opcional)
// ============================================
router.get('/', [
  queryValidator('type').optional().isIn(['home', 'promotion', 'sidebar', 'popup'])
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

    const { type } = req.query;

    let sql = 'SELECT * FROM banners WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const banners = await query(sql, params);

    res.json({
      success: true,
      data: {
        banners
      }
    });
  } catch (error) {
    logError('Error obteniendo banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener banners'
    });
  }
});

// ============================================
// GET /api/banners/:id
// Obtener un banner por ID
// ============================================
router.get('/:id', [
  param('id').isInt().withMessage('ID inválido')
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

    const banners = await query('SELECT * FROM banners WHERE id = ?', [id]);

    if (banners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        banner: banners[0]
      }
    });
  } catch (error) {
    logError('Error obteniendo banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener banner'
    });
  }
});

module.exports = router;

