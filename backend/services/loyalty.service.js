// ============================================
// Loyalty Service - Sistema de Puntos y Recompensas
// ============================================

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info, warn } = require('../logger');

/**
 * Obtener o crear registro de puntos para usuario
 */
async function getOrCreateLoyaltyPoints(userId) {
  try {
    let points = await query(
      'SELECT * FROM loyalty_points WHERE user_id = ?',
      [userId]
    );

    if (points.length === 0) {
      // Crear registro inicial con tier Bronze (id=1)
      const result = await query(
        `INSERT INTO loyalty_points (user_id, current_points, lifetime_points, tier_id) 
         VALUES (?, 0, 0, 1)`,
        [userId]
      );
      
      points = await query(
        'SELECT * FROM loyalty_points WHERE user_id = ?',
        [userId]
      );
    }

    return points[0];
  } catch (error) {
    logError('Error getting/creating loyalty points:', error);
    throw error;
  }
}

/**
 * Obtener información completa de loyalty del usuario
 */
async function getUserLoyaltyInfo(userId) {
  try {
    const points = await getOrCreateLoyaltyPoints(userId);
    
    // Obtener tier actual
    const tier = await query(
      'SELECT * FROM loyalty_tiers WHERE id = ?',
      [points.tier_id]
    );

    // Obtener siguiente tier
    const nextTier = await query(
      'SELECT * FROM loyalty_tiers WHERE min_points > ? AND is_active = 1 ORDER BY min_points ASC LIMIT 1',
      [points.current_points]
    );

    // Calcular puntos para siguiente tier
    const pointsToNext = nextTier.length > 0 
      ? nextTier[0].min_points - points.current_points 
      : 0;

    // Obtener tier actual completo
    const currentTier = tier[0] || null;

    return {
      current_points: points.current_points,
      lifetime_points: points.lifetime_points,
      current_tier: currentTier ? {
        id: currentTier.id,
        name: currentTier.name,
        slug: currentTier.slug,
        min_points: currentTier.min_points,
        points_multiplier: parseFloat(currentTier.points_multiplier),
        benefits: currentTier.benefits ? currentTier.benefits.split('\n') : [],
        color: currentTier.color
      } : null,
      next_tier: nextTier.length > 0 ? {
        id: nextTier[0].id,
        name: nextTier[0].name,
        slug: nextTier[0].slug,
        min_points: nextTier[0].min_points
      } : null,
      points_to_next: pointsToNext
    };
  } catch (error) {
    logError('Error getting user loyalty info:', error);
    throw error;
  }
}

/**
 * Obtener todos los tiers disponibles
 */
async function getAllTiers() {
  try {
    const tiers = await query(
      'SELECT * FROM loyalty_tiers WHERE is_active = 1 ORDER BY min_points ASC'
    );

    return tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      slug: tier.slug,
      min_points: tier.min_points,
      points_multiplier: parseFloat(tier.points_multiplier),
      benefits: tier.benefits ? tier.benefits.split('\n') : [],
      color: tier.color
    }));
  } catch (error) {
    logError('Error getting tiers:', error);
    throw error;
  }
}

/**
 * Obtener recompensas disponibles
 */
async function getAvailableRewards() {
  try {
    const rewards = await query(
      'SELECT * FROM loyalty_rewards WHERE is_active = 1 ORDER BY points_cost ASC'
    );

    return rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      points_cost: reward.points_cost,
      reward_type: reward.reward_type,
      reward_value: reward.reward_value ? parseFloat(reward.reward_value) : null,
      icon: reward.icon,
      stock_remaining: reward.stock_remaining
    }));
  } catch (error) {
    logError('Error getting rewards:', error);
    throw error;
  }
}

/**
 * Agregar puntos al usuario (por compra, etc.)
 */
async function addPoints(userId, points, source, sourceId = null, orderId = null, description = null) {
  try {
    return await transaction(async (connection) => {
      // Obtener puntos actuales
      const currentPoints = await getOrCreateLoyaltyPoints(userId);
      
      // Calcular nuevos totales
      const newCurrentPoints = currentPoints.current_points + points;
      const newLifetimePoints = currentPoints.lifetime_points + points;

      // Verificar si sube de tier
      const newTier = await queryWithConnection(connection,
        'SELECT * FROM loyalty_tiers WHERE min_points <= ? AND is_active = 1 ORDER BY min_points DESC LIMIT 1',
        [newCurrentPoints]
      );

      const tierId = newTier.length > 0 ? newTier[0].id : currentPoints.tier_id;

      // Actualizar puntos
      await queryWithConnection(connection,
        `UPDATE loyalty_points 
         SET current_points = ?, lifetime_points = ?, tier_id = ?
         WHERE user_id = ?`,
        [newCurrentPoints, newLifetimePoints, tierId, userId]
      );

      // Registrar transacción
      await queryWithConnection(connection,
        `INSERT INTO loyalty_transactions 
         (user_id, points, type, source, source_id, order_id, description)
         VALUES (?, ?, 'earned', ?, ?, ?, ?)`,
        [userId, points, source, sourceId, orderId, description]
      );

      return {
        current_points: newCurrentPoints,
        lifetime_points: newLifetimePoints,
        tier_id: tierId,
        tier_upgraded: tierId !== currentPoints.tier_id
      };
    });
  } catch (error) {
    logError('Error adding points:', error);
    throw error;
  }
}

/**
 * Canjear puntos por recompensa
 */
async function redeemReward(userId, rewardId) {
  try {
    return await transaction(async (connection) => {
      // Verificar recompensa
      const rewards = await queryWithConnection(connection,
        'SELECT * FROM loyalty_rewards WHERE id = ? AND is_active = 1',
        [rewardId]
      );

      if (rewards.length === 0) {
        throw new Error('Recompensa no encontrada o no disponible');
      }

      const reward = rewards[0];

      // Verificar stock
      if (reward.stock_limit !== null && (reward.stock_remaining === null || reward.stock_remaining <= 0)) {
        throw new Error('Recompensa agotada');
      }

      // Obtener puntos del usuario
      const userPoints = await getOrCreateLoyaltyPoints(userId);

      if (userPoints.current_points < reward.points_cost) {
        throw new Error(`No tienes suficientes puntos. Necesitas ${reward.points_cost}, tienes ${userPoints.current_points}`);
      }

      // Descontar puntos
      const newPoints = userPoints.current_points - reward.points_cost;
      await queryWithConnection(connection,
        'UPDATE loyalty_points SET current_points = ? WHERE user_id = ?',
        [newPoints, userId]
      );

      // Registrar transacción
      await queryWithConnection(connection,
        `INSERT INTO loyalty_transactions 
         (user_id, points, type, source, reward_id, description)
         VALUES (?, ?, 'redeemed', 'reward_redemption', ?, ?)`,
        [userId, -reward.points_cost, rewardId, `Canjeado: ${reward.name}`]
      );

      // Crear redención
      const redemptionResult = await queryWithConnection(connection,
        `INSERT INTO loyalty_redemptions 
         (user_id, reward_id, points_used, status)
         VALUES (?, ?, ?, 'pending')`,
        [userId, rewardId, reward.points_cost]
      );

      // Actualizar stock si aplica
      if (reward.stock_limit !== null) {
        await queryWithConnection(connection,
          'UPDATE loyalty_rewards SET stock_remaining = stock_remaining - 1 WHERE id = ?',
          [rewardId]
        );
      }

      return {
        redemption_id: redemptionResult.insertId,
        remaining_points: newPoints,
        reward: {
          id: reward.id,
          name: reward.name,
          description: reward.description
        }
      };
    });
  } catch (error) {
    logError('Error redeeming reward:', error);
    throw error;
  }
}

/**
 * Obtener historial de transacciones
 */
async function getTransactionHistory(userId, limit = 50, offset = 0) {
  try {
    const transactions = await query(
      `SELECT * FROM loyalty_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return transactions.map(t => ({
      id: t.id,
      points: t.points,
      type: t.type,
      source: t.source,
      description: t.description,
      created_at: t.created_at
    }));
  } catch (error) {
    logError('Error getting transaction history:', error);
    throw error;
  }
}

module.exports = {
  getOrCreateLoyaltyPoints,
  getUserLoyaltyInfo,
  getAllTiers,
  getAvailableRewards,
  addPoints,
  redeemReward,
  getTransactionHistory
};

