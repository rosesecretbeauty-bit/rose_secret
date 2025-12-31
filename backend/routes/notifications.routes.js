// ============================================
// Rutas de Notificaciones
// ============================================
// Sistema backend-driven de notificaciones

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query, param, body } = require('express-validator');
const { validationResult } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const notificationService = require('../services/notification.service');

// ============================================
// GET /api/notifications
// ============================================
// Obtener notificaciones del usuario
router.get('/', authenticate, rateLimiters.api, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit debe ser entre 1 y 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset debe ser >= 0'),
  query('type').optional().isIn(['order', 'payment', 'promo', 'account', 'system']).withMessage('Tipo inválido'),
  query('unread_only').optional().isBoolean().withMessage('unread_only debe ser boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;
    const unread_only = req.query.unread_only === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      limit,
      offset,
      type,
      unread_only,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
    });
  }
});

// ============================================
// POST /api/notifications/mark-read
// ============================================
// Marcar notificación como leída
router.post('/mark-read', authenticate, rateLimiters.api, [
  body('notification_id').optional().isInt({ min: 1 }).withMessage('notification_id inválido'),
  body('mark_all').optional().isBoolean().withMessage('mark_all debe ser boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { notification_id, mark_all } = req.body;

    if (!notification_id && !mark_all) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere notification_id o mark_all',
      });
    }

    await notificationService.markAsRead(
      userId,
      mark_all ? null : notification_id
    );

    res.json({
      success: true,
      message: mark_all ? 'Todas las notificaciones marcadas como leídas' : 'Notificación marcada como leída',
    });
  } catch (error) {
    logError('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar como leída',
    });
  }
});

// ============================================
// GET /api/notifications/unread-count
// ============================================
// Obtener contador de notificaciones no leídas
router.get('/unread-count', authenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    logError('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contador',
    });
  }
});

// ============================================
// GET /api/notifications/preferences
// ============================================
// Obtener preferencias de notificaciones
router.get('/preferences', authenticate, rateLimiters.api, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logError('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener preferencias',
    });
  }
});

// ============================================
// PUT /api/notifications/preferences
// ============================================
// Actualizar preferencias de notificaciones
router.put('/preferences', authenticate, rateLimiters.api, [
  body('email_order').optional().isBoolean(),
  body('email_payment').optional().isBoolean(),
  body('email_promo').optional().isBoolean(),
  body('email_account').optional().isBoolean(),
  body('in_app_order').optional().isBoolean(),
  body('in_app_payment').optional().isBoolean(),
  body('in_app_promo').optional().isBoolean(),
  body('in_app_account').optional().isBoolean(),
  body('in_app_system').optional().isBoolean(),
  body('push_order').optional().isBoolean(),
  body('push_payment').optional().isBoolean(),
  body('push_promo').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const preferences = await notificationService.updateUserPreferences(userId, req.body);

    res.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      data: preferences,
    });
  } catch (error) {
    logError('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar preferencias',
    });
  }
});

module.exports = router;

