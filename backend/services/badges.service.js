// ============================================
// Badges Service - Sistema de Logros y Badges
// ============================================

const { query } = require('../db');
const { error: logError } = require('../logger');

/**
 * Definición de badges disponibles
 */
const AVAILABLE_BADGES = {
  'first-purchase': {
    id: 'first-purchase',
    name: 'First Purchase',
    description: 'Made your first purchase',
    icon: 'shopping-bag',
    checkFunction: 'checkFirstPurchase'
  },
  'loyalty-tier': {
    id: 'loyalty-tier',
    name: 'Loyalty Member',
    description: 'Reached a loyalty tier',
    icon: 'sparkles',
    checkFunction: 'checkLoyaltyTier'
  },
  'early-adopter': {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of our first customers',
    icon: 'star',
    checkFunction: 'checkEarlyAdopter'
  },
  'vip': {
    id: 'vip',
    name: 'VIP Member',
    description: 'Platinum tier member',
    icon: 'crown',
    checkFunction: 'checkVIP'
  }
};

/**
 * Verificar si usuario tiene badge
 */
async function hasBadge(userId, badgeId) {
  try {
    const badges = await query(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badgeId]
    );

    return badges.length > 0;
  } catch (error) {
    logError('Error checking badge:', error);
    return false;
  }
}

/**
 * Obtener todos los badges del usuario con estado
 */
async function getUserBadges(userId) {
  try {
    // Obtener badges ganados
    const earnedBadges = await query(
      'SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );

    const earnedIds = earnedBadges.map(b => b.badge_id);

    // Retornar todos los badges con estado
    return Object.values(AVAILABLE_BADGES).map(badge => {
      const earned = earnedBadges.find(b => b.badge_id === badge.id);
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        unlocked: earned !== undefined,
        earned_at: earned ? earned.earned_at : null
      };
    });
  } catch (error) {
    logError('Error getting user badges:', error);
    throw error;
  }
}

/**
 * Verificar y otorgar badges automáticamente
 */
async function checkAndAwardBadges(userId) {
  try {
    const newBadges = [];

    // Verificar first-purchase
    if (!(await hasBadge(userId, 'first-purchase'))) {
      const orders = await query(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status IN ("paid", "delivered", "completed")',
        [userId]
      );

      if (orders[0].count > 0) {
        await awardBadge(userId, 'first-purchase', 'First purchase completed');
        newBadges.push('first-purchase');
      }
    }

    // Verificar loyalty-tier
    if (!(await hasBadge(userId, 'loyalty-tier'))) {
      const points = await query(
        'SELECT current_points FROM loyalty_points WHERE user_id = ?',
        [userId]
      );

      if (points.length > 0 && points[0].current_points >= 500) {
        await awardBadge(userId, 'loyalty-tier', 'Reached loyalty tier');
        newBadges.push('loyalty-tier');
      }
    }

    // Verificar early-adopter (usuarios registrados en los primeros 30 días)
    if (!(await hasBadge(userId, 'early-adopter'))) {
      const users = await query(
        'SELECT created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length > 0) {
        const createdAt = new Date(users[0].created_at);
        const earlyAdopterDate = new Date('2025-12-01'); // Ajustar según fecha de lanzamiento
        
        if (createdAt <= earlyAdopterDate) {
          await awardBadge(userId, 'early-adopter', 'Early adopter');
          newBadges.push('early-adopter');
        }
      }
    }

    // Verificar VIP (Platinum tier)
    if (!(await hasBadge(userId, 'vip'))) {
      const points = await query(
        `SELECT lp.tier_id, lt.slug 
         FROM loyalty_points lp
         INNER JOIN loyalty_tiers lt ON lp.tier_id = lt.id
         WHERE lp.user_id = ?`,
        [userId]
      );

      if (points.length > 0 && points[0].slug === 'platinum') {
        await awardBadge(userId, 'vip', 'Platinum tier member');
        newBadges.push('vip');
      }
    }

    return newBadges;
  } catch (error) {
    logError('Error checking badges:', error);
    throw error;
  }
}

/**
 * Otorgar badge a usuario
 */
async function awardBadge(userId, badgeId, description = null) {
  try {
    // Verificar que no lo tenga ya
    if (await hasBadge(userId, badgeId)) {
      return null;
    }

    const badge = AVAILABLE_BADGES[badgeId];
    if (!badge) {
      throw new Error(`Badge ${badgeId} no existe`);
    }

    await query(
      `INSERT INTO user_badges (user_id, badge_id, badge_name, badge_icon, badge_description)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, badge.id, badge.name, badge.icon, description || badge.description]
    );

    return {
      id: badge.id,
      name: badge.name,
      description: description || badge.description,
      icon: badge.icon
    };
  } catch (error) {
    logError('Error awarding badge:', error);
    throw error;
  }
}

module.exports = {
  getUserBadges,
  hasBadge,
  checkAndAwardBadges,
  awardBadge
};

