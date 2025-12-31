// ============================================
// Reconciliation Routes (Admin Only)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { adminLimiter } = require('../middleware/rateLimit'); // Mantener para compatibilidad
const reconciliationService = require('../services/reconciliation.service');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');

// ============================================
// POST /api/admin/reconciliation/run
// ============================================
// Ejecutar job de reconciliación manualmente
router.post('/run', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const result = await reconciliationService.reconcilePendingPayments();

    // Registrar auditoría
    await auditService.logAudit(
      'RECONCILIATION_RUN',
      'system',
      null,
      null,
      { reconciled: result.reconciled, errors: result.errors, discrepancies: result.discrepancies },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('RECONCILIATION_RUN');

    res.json({
      success: true,
      message: 'Reconciliación completada',
      data: result
    });
  } catch (error) {
    logError('Error running reconciliation:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando reconciliación'
    });
  }
});

// ============================================
// POST /api/admin/reconciliation/order/:id
// ============================================
// Reconciliar un pedido específico
router.post('/order/:id', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reconciliationService.reconcileOrder(parseInt(id));

    // Registrar auditoría si se reconcilió
    if (result.reconciled) {
      await auditService.logAudit(
        'ORDER_RECONCILED',
        'order',
        parseInt(id),
        { status: result.oldStatus },
        { status: result.newStatus },
        req
      );
    }

    // Registrar métrica admin
    metricsService.recordAdminAction('ORDER_RECONCILED');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Error reconciling order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reconciliando pedido'
    });
  }
});

module.exports = router;

