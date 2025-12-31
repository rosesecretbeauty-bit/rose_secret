// ============================================
// Admin Audit Routes
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { rateLimiters } = require('../../security/rateLimiter');
const auditService = require('../../services/audit.service');
const { query } = require('../../db');

// ============================================
// GET /api/v1/admin/audit
// ============================================
router.get('/', authenticate, requireAdmin, rateLimiters.audit, async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      entity, 
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const filters = {
      userId: userId ? parseInt(userId) : null,
      action,
      entity,
      entityId: entityId ? parseInt(entityId) : null,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Remover filtros null/undefined
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const logs = await auditService.getAuditLogs(filters);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs de auditoría'
    });
  }
});

module.exports = router;

