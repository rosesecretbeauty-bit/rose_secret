// ============================================
// Prometheus Metrics Endpoint
// ============================================
// FASE 4: Endpoint para exportar métricas en formato Prometheus

const express = require('express');
const router = express.Router();
const { exportPrometheus } = require('../metrics/prometheus');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');

/**
 * GET /api/metrics
 * Exportar métricas en formato Prometheus
 * Requiere autenticación y rol admin
 */
router.get('/', 
  authenticate, 
  requireAdmin, 
  rateLimiters.metrics,
  async (req, res) => {
    try {
      const prometheusMetrics = exportPrometheus();
      
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(prometheusMetrics);
    } catch (error) {
      // No usar error handler aquí para evitar loops
      res.status(500).send('# Error generating metrics\n');
    }
  }
);

module.exports = router;

