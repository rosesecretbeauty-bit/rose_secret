// ============================================
// Insights Routes - Estadísticas de Usuario
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const insightsService = require('../services/insights.service');
const { query: queryValidator, validationResult } = require('express-validator');

// ============================================
// GET /api/user/insights
// ============================================
// Obtener estadísticas de gasto del usuario
router.get('/', authenticate, rateLimiters.private, [
  queryValidator('months').optional().isInt({ min: 1, max: 24 }).withMessage('months debe ser entre 1 y 24')
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
    const months = parseInt(req.query.months) || 6;

    const insights = await insightsService.getUserSpendingInsights(userId, months);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logError('Error getting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;

