// ============================================
// Loyalty Routes - Sistema de Puntos y Recompensas
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const loyaltyService = require('../services/loyalty.service');
const { body, validationResult, param, query: queryValidator } = require('express-validator');

// ============================================
// GET /api/user/loyalty
// ============================================
// Obtener información de loyalty del usuario
router.get('/', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const loyaltyInfo = await loyaltyService.getUserLoyaltyInfo(userId);

    res.json({
      success: true,
      data: loyaltyInfo
    });
  } catch (error) {
    logError('Error getting loyalty info:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de loyalty'
    });
  }
});

// ============================================
// GET /api/user/loyalty/tiers
// ============================================
// Obtener todos los tiers disponibles
router.get('/tiers', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const tiers = await loyaltyService.getAllTiers();

    res.json({
      success: true,
      data: { tiers }
    });
  } catch (error) {
    logError('Error getting tiers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tiers'
    });
  }
});

// ============================================
// GET /api/user/loyalty/rewards
// ============================================
// Obtener recompensas disponibles
router.get('/rewards', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const rewards = await loyaltyService.getAvailableRewards();

    res.json({
      success: true,
      data: { rewards }
    });
  } catch (error) {
    logError('Error getting rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recompensas'
    });
  }
});

// ============================================
// POST /api/user/loyalty/redeem
// ============================================
// Canjear puntos por recompensa
router.post('/redeem', authenticate, rateLimiters.private, [
  body('reward_id').isInt({ min: 1 }).withMessage('reward_id debe ser un número válido')
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
    const rewardId = parseInt(req.body.reward_id);

    const result = await loyaltyService.redeemReward(userId, rewardId);

    res.json({
      success: true,
      message: 'Recompensa canjeada exitosamente',
      data: result
    });
  } catch (error) {
    logError('Error redeeming reward:', error);
    
    if (error.message.includes('No tienes suficientes puntos') || 
        error.message.includes('no encontrada') ||
        error.message.includes('agotada')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al canjear recompensa'
    });
  }
});

// ============================================
// GET /api/user/loyalty/transactions
// ============================================
// Obtener historial de transacciones
router.get('/transactions', authenticate, rateLimiters.private, [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser >= 0')
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
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await loyaltyService.getTransactionHistory(userId, limit, offset);

    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    logError('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de transacciones'
    });
  }
});

module.exports = router;

