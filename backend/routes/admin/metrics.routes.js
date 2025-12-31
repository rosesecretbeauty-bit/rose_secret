// ============================================
// Admin Metrics Routes
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { rateLimiters } = require('../../security/rateLimiter');
const metricsService = require('../../metrics/metrics.service');
const cacheManager = require('../../cache'); // Auto-selecciona Redis si está disponible

// ============================================
// GET /api/v1/admin/metrics
// ============================================
router.get('/', authenticate, requireAdmin, rateLimiters.metrics, async (req, res) => {
  try {
    const metrics = metricsService.getMetrics();
    const cacheStats = cacheManager.getStats();
    
    res.json({
      success: true,
      data: {
        ...metrics,
        cache: cacheStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas'
    });
  }
});

module.exports = router;

