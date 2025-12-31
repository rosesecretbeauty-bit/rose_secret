// ============================================
// Notification Service
// ============================================
// Servicio centralizado para gestionar notificaciones

const { query, transaction } = require('../db');
const emailService = require('./email.service');
const { error: logError, info } = require('../logger');

// ============================================
// Crear Notificación
// ============================================

async function createNotification({
  userId,
  type,
  channel,
  title,
  message,
  metadata = {},
}) {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, channel, title, message, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        channel,
        title,
        message,
        JSON.stringify(metadata),
      ]
    );

    const notificationId = result.insertId;

    // Si es email, enviar inmediatamente (no bloquea)
    if (channel === 'email') {
      sendEmailNotification(userId, { title, message, metadata }).catch(err => {
        logError('Error sending email notification:', err);
      });
    }

    // Actualizar sent_at si se envió
    if (channel === 'email') {
      await query(
        `UPDATE notifications SET sent_at = NOW() WHERE id = ?`,
        [notificationId]
      );
    }

    return {
      id: notificationId,
      user_id: userId,
      type,
      channel,
      title,
      message,
      metadata,
      created_at: new Date(),
    };
  } catch (error) {
    logError('Error creating notification:', error);
    throw error;
  }
}

// ============================================
// Enviar Notificación (Multi-canal)
// ============================================

async function sendNotification({
  userId,
  type,
  channels = ['in_app'],
  title,
  message,
  metadata = {},
  checkPreferences = true,
}) {
  try {
    // Verificar preferencias del usuario si se requiere
    if (checkPreferences) {
      const preferences = await getUserPreferences(userId);
      channels = channels.filter(channel => {
        const prefKey = `${channel}_${type}`;
        return preferences[prefKey] !== false;
      });
    }

    if (channels.length === 0) {
      info(`User ${userId} has disabled notifications for type ${type}`);
      return { sent: false, reason: 'user_preferences' };
    }

    const notifications = [];

    // Crear notificación para cada canal
    for (const channel of channels) {
      const notification = await createNotification({
        userId,
        type,
        channel,
        title,
        message,
        metadata,
      });
      notifications.push(notification);
    }

    return {
      sent: true,
      notifications,
    };
  } catch (error) {
    logError('Error sending notification:', error);
    throw error;
  }
}

// ============================================
// Enviar Email de Notificación
// ============================================

async function sendEmailNotification(userId, { title, message, metadata }) {
  try {
    // Obtener email del usuario
    const users = await query('SELECT email, first_name FROM users WHERE id = ? LIMIT 1', [userId]);
    if (users.length === 0) {
      throw new Error(`User ${userId} not found`);
    }

    const userEmail = users[0].email;
    const userName = users[0].first_name || 'Usuario';

    // Determinar template según tipo
    let template = 'notification';
    if (metadata.orderNumber) {
      template = 'order-created';
    } else if (metadata.paymentStatus === 'success') {
      template = 'payment-success';
    } else if (metadata.paymentStatus === 'failed') {
      template = 'payment-failed';
    }

    // Enviar email
    await emailService.sendEmail({
      to: userEmail,
      subject: title,
      template,
      data: {
        customerName: userName,
        message,
        ...metadata,
      },
    });

    return { success: true };
  } catch (error) {
    logError('Error sending email notification:', error);
    throw error;
  }
}

// ============================================
// Obtener Notificaciones del Usuario
// ============================================

async function getUserNotifications(userId, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      type,
      unread_only = false,
    } = options;

    let sql = `
      SELECT * FROM notifications
      WHERE user_id = ?
    `;
    const params = [userId];

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    if (unread_only) {
      sql += ` AND read_at IS NULL`;
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const notifications = await query(sql, params);

    // Contar no leídas
    const unreadCount = await query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = ? AND read_at IS NULL`,
      [userId]
    );

    return {
      notifications: notifications.map(n => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : {},
      })),
      unread_count: unreadCount[0]?.count || 0,
    };
  } catch (error) {
    logError('Error getting user notifications:', error);
    throw error;
  }
}

// ============================================
// Marcar como Leída
// ============================================

async function markAsRead(userId, notificationId = null) {
  try {
    if (notificationId) {
      // Marcar una notificación específica
      await query(
        `UPDATE notifications
         SET read_at = NOW()
         WHERE id = ? AND user_id = ? AND read_at IS NULL`,
        [notificationId, userId]
      );
    } else {
      // Marcar todas como leídas
      await query(
        `UPDATE notifications
         SET read_at = NOW()
         WHERE user_id = ? AND read_at IS NULL`,
        [userId]
      );
    }

    return { success: true };
  } catch (error) {
    logError('Error marking notification as read:', error);
    throw error;
  }
}

// ============================================
// Preferencias de Usuario
// ============================================

async function getUserPreferences(userId) {
  try {
    const prefs = await query(
      `SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (prefs.length === 0) {
      // Crear preferencias por defecto
      return await createDefaultPreferences(userId);
    }

    return prefs[0];
  } catch (error) {
    logError('Error getting user preferences:', error);
    throw error;
  }
}

async function createDefaultPreferences(userId) {
  try {
    await query(
      `INSERT INTO notification_preferences (user_id) VALUES (?)`,
      [userId]
    );
    return await getUserPreferences(userId);
  } catch (error) {
    logError('Error creating default preferences:', error);
    throw error;
  }
}

async function updateUserPreferences(userId, preferences) {
  try {
    const allowedKeys = [
      'email_order',
      'email_payment',
      'email_promo',
      'email_account',
      'in_app_order',
      'in_app_payment',
      'in_app_promo',
      'in_app_account',
      'in_app_system',
      'push_order',
      'push_payment',
      'push_promo',
    ];

    const updates = [];
    const values = [];

    allowedKeys.forEach(key => {
      if (preferences[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(preferences[key] ? 1 : 0);
      }
    });

    if (updates.length === 0) {
      return await getUserPreferences(userId);
    }

    values.push(userId);

    await query(
      `UPDATE notification_preferences
       SET ${updates.join(', ')}
       WHERE user_id = ?`,
      values
    );

    return await getUserPreferences(userId);
  } catch (error) {
    logError('Error updating user preferences:', error);
    throw error;
  }
}

// ============================================
// Contador de No Leídas
// ============================================

async function getUnreadCount(userId) {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = ? AND read_at IS NULL`,
      [userId]
    );

    return result[0]?.count || 0;
  } catch (error) {
    logError('Error getting unread count:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  sendNotification,
  getUserNotifications,
  markAsRead,
  getUserPreferences,
  updateUserPreferences,
  getUnreadCount,
};

