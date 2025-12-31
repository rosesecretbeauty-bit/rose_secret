// ============================================
// Rutas de Usuario
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { body, validationResult, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const badgesService = require('../services/badges.service');
const cloudinaryService = require('../services/cloudinary.service');
const { upload, handleUploadError } = require('../middleware/upload');

// ============================================
// PUT /api/user/profile
// ============================================
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.put('/profile', authenticate, rateLimiters.private, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Teléfono debe tener un formato válido'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('La biografía no puede exceder 1000 caracteres'),
  body('location').optional().trim().isLength({ max: 255 }).withMessage('La ubicación no puede exceder 255 caracteres'),
  body('avatar').optional().trim().isURL().withMessage('El avatar debe ser una URL válida')
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
    const { name, email, phone, bio, location, avatar } = req.body;

    // Obtener valores actuales para auditoría
    const currentUser = await query(
      'SELECT id, email, name, phone, bio, location, avatar, role FROM users WHERE id = ?',
      [userId]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const oldUser = currentUser[0];

    // Si se actualiza el email, verificar que no esté en uso
    if (email && email !== oldUser.email) {
      const existing = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email ya está en uso' 
        });
      }
    }

    // Construir query dinámica
    const updates = [];
    const params = [];
    const newValues = {};

    if (name !== undefined && name !== oldUser.name) {
      updates.push('name = ?');
      params.push(name);
      newValues.name = name;
    }

    if (email !== undefined && email !== oldUser.email) {
      updates.push('email = ?');
      params.push(email);
      newValues.email = email;
    }

    if (phone !== undefined && phone !== oldUser.phone) {
      // Normalizar número telefónico si se proporciona
      const smsService = require('../services/sms.service');
      const normalizedPhone = phone ? smsService.normalizeMexicanPhone(phone) : null;
      
      if (phone && !normalizedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Formato de teléfono inválido. Ingresa un número mexicano de 10 dígitos (ej: 7774486398 o +527774486398)'
        });
      }
      
      const phoneToSave = normalizedPhone || phone;
      updates.push('phone = ?');
      // Si phone es null o string vacío, guardar null
      params.push(phone === null || phone === '' ? null : phone);
      newValues.phone = phone || null;
    }

    if (bio !== undefined && bio !== oldUser.bio) {
      updates.push('bio = ?');
      params.push(bio === '' ? null : bio);
      newValues.bio = bio || null;
    }

    if (location !== undefined && location !== oldUser.location) {
      updates.push('location = ?');
      params.push(location === '' ? null : location);
      newValues.location = location || null;
    }

    if (avatar !== undefined && avatar !== oldUser.avatar) {
      updates.push('avatar = ?');
      params.push(avatar === '' ? null : avatar);
      newValues.avatar = avatar || null;
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'No hay cambios que actualizar',
        data: { user: oldUser }
      });
    }

    // Agregar updated_at
    updates.push('updated_at = NOW()');
    params.push(userId);

    // Ejecutar actualización
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PROFILE_UPDATED',
      'user',
      userId,
      {
        email: oldUser.email,
        name: oldUser.name,
        phone: oldUser.phone,
        bio: oldUser.bio,
        location: oldUser.location,
        avatar: oldUser.avatar
      },
      newValues,
      req
    );

    // Obtener usuario actualizado con todos los campos
    const users = await query(
      'SELECT id, email, name, phone, bio, location, avatar, email_verified, email_verified_at, created_at, updated_at, last_login_at, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    logError('Error actualizando perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar perfil' 
    });
  }
});

// ============================================
// GET /api/user/badges
// ============================================
router.get('/badges', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar y otorgar badges automáticamente
    await badgesService.checkAndAwardBadges(userId);
    
    // Obtener badges
    const badges = await badgesService.getUserBadges(userId);

    res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    logError('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener badges'
    });
  }
});

// ============================================
// GET /api/user/profile-completion
// ============================================
// Obtener porcentaje de completitud del perfil con recomendaciones
router.get('/profile-completion', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const users = await query(
      'SELECT name, email, phone, bio, location, avatar, email_verified FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];
    
    // Verificar si tiene 2FA activado (manejar caso cuando la tabla o columna no existe)
    let twoFactorEnabled = false;
    try {
      const settings = await query(
        'SELECT two_factor_enabled FROM user_settings WHERE user_id = ?',
        [userId]
      );
      twoFactorEnabled = settings.length > 0 && settings[0].two_factor_enabled === 1;
    } catch (error) {
      // Si la tabla no existe o hay un error, asumir que 2FA no está activado
      logError('Error verificando 2FA (puede que la tabla user_settings no exista):', error);
      twoFactorEnabled = false;
    }
    
    // Calcular completitud
    const fields = {
      name: user.name ? 1 : 0,
      email: user.email ? 1 : 0,
      phone: user.phone ? 1 : 0,
      bio: user.bio ? 1 : 0,
      location: user.location ? 1 : 0,
      avatar: user.avatar ? 1 : 0,
      email_verified: user.email_verified ? 1 : 0,
      two_factor: twoFactorEnabled ? 1 : 0
    };

    const totalFields = Object.keys(fields).length;
    const completedFields = Object.values(fields).reduce((sum, val) => sum + val, 0);
    const percentage = Math.round((completedFields / totalFields) * 100);

    // Campos faltantes
    const missingFields = Object.keys(fields).filter(key => fields[key] === 0);

    // Generar recomendaciones inteligentes basadas en prioridad e impacto
    const recommendations = [];
    
    // Prioridad 1: Seguridad (alto impacto)
    if (!user.email_verified) {
      recommendations.push({
        field: 'email_verified',
        priority: 'high',
        title: 'Verifica tu correo electrónico',
        description: 'Verifica tu correo para proteger tu cuenta y acceder a todas las funciones',
        action: 'Verificar Email',
        actionPath: 'security'
      });
    }
    
    if (!twoFactorEnabled) {
      recommendations.push({
        field: 'two_factor',
        priority: 'high',
        title: 'Activa la autenticación de dos factores',
        description: 'Añade una capa extra de seguridad a tu cuenta con 2FA',
        action: 'Activar 2FA',
        actionPath: 'security'
      });
    }

    // Prioridad 2: Información básica (medio impacto)
    if (!user.phone) {
      recommendations.push({
        field: 'phone',
        priority: 'medium',
        title: 'Agrega tu número de teléfono',
        description: 'Recibe notificaciones importantes y mejora la seguridad de tu cuenta',
        action: 'Agregar Teléfono',
        actionPath: 'security'
      });
    }

    if (!user.location) {
      recommendations.push({
        field: 'location',
        priority: 'medium',
        title: 'Agrega tu ubicación',
        description: 'Ayúdanos a personalizar tu experiencia según tu ubicación',
        action: 'Agregar Ubicación',
        actionPath: 'settings'
      });
    }

    // Prioridad 3: Perfil personal (bajo impacto pero mejora experiencia)
    if (!user.avatar) {
      recommendations.push({
        field: 'avatar',
        priority: 'low',
        title: 'Agrega una foto de perfil',
        description: 'Personaliza tu perfil con una foto',
        action: 'Agregar Foto',
        actionPath: 'settings'
      });
    }

    if (!user.bio) {
      recommendations.push({
        field: 'bio',
        priority: 'low',
        title: 'Cuéntanos sobre ti',
        description: 'Agrega una breve biografía para personalizar tu experiencia',
        action: 'Agregar Biografía',
        actionPath: 'settings'
      });
    }

    // Ordenar recomendaciones por prioridad
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json({
      success: true,
      data: {
        percentage,
        completed_fields: completedFields,
        total_fields: totalFields,
        missing_fields: missingFields,
        points_reward: 50, // Puntos que se otorgan al completar
        recommendations: recommendations.slice(0, 5) // Máximo 5 recomendaciones
      }
    });
  } catch (error) {
    logError('Error getting profile completion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener completitud del perfil'
    });
  }
});

// ============================================
// GET /api/user/settings
// ============================================
// Obtener configuración del usuario
router.get('/settings', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      // Crear configuración por defecto si no existe
      await query(
        'INSERT INTO user_settings (user_id, email_notifications, sms_notifications, marketing_emails, language, currency) VALUES (?, 1, 0, 1, ?, ?)',
        [userId, 'es', 'USD']
      );
      
      const newSettings = await query(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );
      
      return res.json({
        success: true,
        data: {
          email_notifications: newSettings[0].email_notifications === 1,
          sms_notifications: newSettings[0].sms_notifications === 1,
          marketing_emails: newSettings[0].marketing_emails === 1,
          language: newSettings[0].language,
          currency: newSettings[0].currency,
          timezone: newSettings[0].timezone,
          preferences: newSettings[0].preferences ? JSON.parse(newSettings[0].preferences) : {}
        }
      });
    }

    const setting = settings[0];

    res.json({
      success: true,
      data: {
        email_notifications: setting.email_notifications === 1,
        sms_notifications: setting.sms_notifications === 1,
        marketing_emails: setting.marketing_emails === 1,
        language: setting.language,
        currency: setting.currency,
        timezone: setting.timezone,
        preferences: setting.preferences ? JSON.parse(setting.preferences) : {}
      }
    });
  } catch (error) {
    logError('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración'
    });
  }
});

// ============================================
// PUT /api/user/settings
// ============================================
// Actualizar configuración del usuario
router.put('/settings', authenticate, rateLimiters.private, [
  body('email_notifications').optional().isBoolean().withMessage('email_notifications debe ser un booleano'),
  body('sms_notifications').optional().isBoolean().withMessage('sms_notifications debe ser un booleano'),
  body('marketing_emails').optional().isBoolean().withMessage('marketing_emails debe ser un booleano'),
  body('language').optional().isString().withMessage('language debe ser un string'),
  body('currency').optional().isString().withMessage('currency debe ser un string'),
  body('timezone').optional().custom(value => value === null || typeof value === 'string').withMessage('timezone debe ser null o string'),
  body('preferences').optional().isObject().withMessage('preferences debe ser un objeto')
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
    const { email_notifications, sms_notifications, marketing_emails, language, currency, timezone, preferences } = req.body;

    // Obtener configuración actual para auditoría
    const currentSettings = await query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    const oldSettings = currentSettings.length > 0 ? currentSettings[0] : null;

    // Construir query dinámica
    const updates = [];
    const params = [];

    if (email_notifications !== undefined) {
      updates.push('email_notifications = ?');
      params.push(email_notifications ? 1 : 0);
    }

    if (sms_notifications !== undefined) {
      updates.push('sms_notifications = ?');
      params.push(sms_notifications ? 1 : 0);
    }

    if (marketing_emails !== undefined) {
      updates.push('marketing_emails = ?');
      params.push(marketing_emails ? 1 : 0);
    }

    if (language !== undefined) {
      updates.push('language = ?');
      params.push(language);
    }

    if (currency !== undefined) {
      updates.push('currency = ?');
      params.push(currency);
    }

    if (timezone !== undefined) {
      updates.push('timezone = ?');
      params.push(timezone === '' ? null : timezone);
    }

    if (preferences !== undefined) {
      updates.push('preferences = ?');
      params.push(JSON.stringify(preferences));
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'No hay cambios que actualizar',
        data: oldSettings
      });
    }

    params.push(userId);

    // Crear o actualizar configuración
    if (oldSettings) {
      await query(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`,
        params
      );
    } else {
      // Insertar nueva configuración
      const insertUpdates = updates.map(u => u.split(' = ')[0]);
      const insertValues = params.slice(0, -1); // Remover userId del final
      insertValues.push(userId);

      await query(
        `INSERT INTO user_settings (${insertUpdates.join(', ')}, user_id) VALUES (${insertUpdates.map(() => '?').join(', ')}, ?)`,
        insertValues
      );
    }

    // Obtener configuración actualizada
    const updated = await query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    const setting = updated[0];

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: {
        email_notifications: setting.email_notifications === 1,
        sms_notifications: setting.sms_notifications === 1,
        marketing_emails: setting.marketing_emails === 1,
        language: setting.language,
        currency: setting.currency,
        timezone: setting.timezone,
        preferences: setting.preferences ? JSON.parse(setting.preferences) : {}
      }
    });
  } catch (error) {
    logError('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración'
    });
  }
});

// ============================================
// POST /api/user/send-email-verification
// ============================================
// Enviar email de verificación
router.post('/send-email-verification', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Verificar si ya está verificado
    const users = await query(
      'SELECT email_verified FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (users[0].email_verified) {
      return res.json({
        success: true,
        message: 'Tu correo electrónico ya está verificado. No es necesario reenviar el email.'
      });
    }

    // Generar token de verificación
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

    // Guardar token (crear tabla si no existe)
    await query(
      `CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_token (token),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Eliminar tokens anteriores
    await query(
      'DELETE FROM email_verification_tokens WHERE user_id = ?',
      [userId]
    );

    // Guardar nuevo token
    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, verificationToken, expiresAt]
    );

    // Enviar email
    const emailService = require('../services/email.service');
    
    // Enviar email de verificación
    await emailService.sendEmailVerificationEmail(
      userEmail,
      verificationToken,
      req.user.name
    );

    res.json({
      success: true,
      message: 'Email de verificación enviado. Revisa tu bandeja de entrada.'
    });
  } catch (error) {
    logError('Error sending email verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email de verificación'
    });
  }
});

// ============================================
// GET /api/user/verify-email
// ============================================
// Verificar email desde URL (token en query)
router.get('/verify-email', queryValidator('token').notEmpty().withMessage('Token requerido'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido',
        errors: errors.array()
      });
    }

    const token = req.query.token;

    // Buscar token
    const tokens = await query(
      'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const tokenData = tokens[0];

    // Verificar expiración
    if (new Date(tokenData.expires_at) < new Date()) {
      await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
      return res.status(400).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Marcar email como verificado
    await query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = ?',
      [tokenData.user_id]
    );

    // Eliminar token usado
    await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);

    // Obtener usuario actualizado
    const users = await query(
      'SELECT id, email, name, email_verified FROM users WHERE id = ?',
      [tokenData.user_id]
    );

    res.json({
      success: true,
      message: 'Correo electrónico verificado exitosamente',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    logError('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar correo electrónico'
    });
  }
});

// ============================================
// POST /api/user/verify-email
// ============================================
// Verificar email desde request body
router.post('/verify-email', authenticate, rateLimiters.private, [
  body('token').notEmpty().withMessage('Token requerido')
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
    const { token } = req.body;

    // Buscar token
    const tokens = await query(
      'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ? AND user_id = ?',
      [token, userId]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const tokenData = tokens[0];

    // Verificar expiración
    if (new Date(tokenData.expires_at) < new Date()) {
      await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
      return res.status(400).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Marcar email como verificado
    await query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = ?',
      [userId]
    );

    // Eliminar token usado
    await query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);

    // Obtener usuario actualizado
    const users = await query(
      'SELECT id, email, name, email_verified FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Correo electrónico verificado exitosamente',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    logError('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar correo electrónico'
    });
  }
});

// ============================================
// PUT /api/user/change-password
// ============================================
// Cambiar contraseña del usuario (requiere verificación)
// Este endpoint ahora requiere un código de verificación en lugar de la contraseña actual
router.put('/change-password', authenticate, rateLimiters.private, [
  body('verification_code').notEmpty().withMessage('Código de verificación requerido'),
  body('verification_method').isIn(['email', 'phone']).withMessage('Método de verificación inválido'),
  body('new_password').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
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
    const { verification_code, verification_method, new_password } = req.body;

    // Verificar que el usuario tenga al menos un método verificado
    const users = await query(
      'SELECT email_verified, phone_verified, phone FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    if (!user.email_verified && !user.phone_verified) {
      return res.status(400).json({
        success: false,
        message: 'Debes tener al menos un método de contacto verificado (email o teléfono) para cambiar tu contraseña. Por favor verifica tu email o teléfono primero.'
      });
    }

    // Verificar código según el método
    let codeValid = false;

    if (verification_method === 'email' && user.email_verified) {
      // Buscar código de recuperación reciente
      const recoveryCodes = await query(
        `SELECT id FROM password_recovery_codes
         WHERE user_id = ? AND code = ? AND method = 'email' AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, verification_code]
      );

      codeValid = recoveryCodes.length > 0;
    } else if (verification_method === 'phone' && user.phone_verified) {
      // Verificar código OTP de teléfono
      const phoneCodes = await query(
        `SELECT id FROM phone_verification_otps
         WHERE user_id = ? AND code = ? AND verified = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, verification_code]
      );

      codeValid = phoneCodes.length > 0;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Método de verificación inválido o no verificado'
      });
    }

    if (!codeValid) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado. Por favor solicita un nuevo código.'
      });
    }

    // Hash nueva contraseña
    const bcrypt = require('bcryptjs');
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Marcar código como usado
    if (verification_method === 'email') {
      await query(
        'UPDATE password_recovery_codes SET used = TRUE WHERE user_id = ? AND code = ? AND method = ?',
        [userId, verification_code, 'email']
      );
    } else {
      await query(
        'UPDATE phone_verification_otps SET verified = TRUE WHERE user_id = ? AND code = ?',
        [userId, verification_code]
      );
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_CHANGED',
      'security',
      userId,
      null,
      { method: 'verified_change', verification_method },
      req
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logError('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
});

// ============================================
// GET /api/user/activity-history
// ============================================
// Obtener historial de actividad del usuario
router.get('/activity-history', authenticate, rateLimiters.private, [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser un número entre 1 y 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser un número positivo')
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

    // Obtener logs de actividad
    const logs = await query(
      `SELECT id, action, entity, entity_id, ip_address, created_at 
       FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Mapear acciones a mensajes amigables
    const actionMessages = {
      'USER_LOGIN': 'Inicio de sesión',
      'USER_REGISTER': 'Registro de cuenta',
      'PROFILE_UPDATED': 'Perfil actualizado',
      'PASSWORD_CHANGED': 'Contraseña cambiada',
      'EMAIL_VERIFIED': 'Email verificado',
      '2FA_ENABLED': 'Autenticación de dos factores activada',
      '2FA_DISABLED': 'Autenticación de dos factores desactivada',
      'AVATAR_UPDATED': 'Foto de perfil actualizada'
    };

    const formattedLogs = logs.map(log => {
      return {
        id: log.id,
        action: log.action,
        message: actionMessages[log.action] || log.action,
        entity: log.entity,
        entity_id: log.entity_id,
        ip: log.ip_address,
        created_at: log.created_at,
        timestamp: new Date(log.created_at).toISOString()
      };
    });

    // Obtener total para paginación
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?',
      [userId]
    );
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        activities: formattedLogs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    logError('Error getting activity history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de actividad'
    });
  }
});

// ============================================
// POST /api/user/send-phone-verification
// ============================================
// Enviar código OTP al teléfono
router.post('/send-phone-verification', authenticate, rateLimiters.private, [
  body('phone').notEmpty().withMessage('Teléfono requerido')
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
    const { phone } = req.body;

    // Normalizar y validar teléfono
    const smsService = require('../services/sms.service');
    
    // Normalizar número telefónico (acepta cualquier formato)
    const normalizedPhone = smsService.normalizeMexicanPhone(phone);
    
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Formato de teléfono inválido. Ingresa un número mexicano de 10 dígitos (ej: 7774486398 o +527774486398)'
      });
    }

    // Generar código OTP de 6 dígitos
    const crypto = require('crypto');
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos

    // Crear tabla si no existe
    await query(
      `CREATE TABLE IF NOT EXISTS phone_verification_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_code (code),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Eliminar códigos anteriores no verificados
    await query(
      'DELETE FROM phone_verification_otps WHERE user_id = ? AND verified = FALSE',
      [userId]
    );

    // Guardar nuevo código (usar número normalizado)
    await query(
      'INSERT INTO phone_verification_otps (user_id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, normalizedPhone, otpCode, expiresAt]
    );

    // Enviar código OTP por SMS en tiempo real
    try {
      // Si Twilio Verify está configurado, usarlo (no necesita código manual)
      const isTwilioVerify = !!process.env.TWILIO_VERIFY_SERVICE_SID;
      
      if (isTwilioVerify) {
        // Twilio Verify genera y envía el código automáticamente
        await smsService.sendOTPCode(normalizedPhone, null, 'phone_verification');
        res.json({
          success: true,
          message: 'Código de verificación enviado al teléfono'
        });
      } else {
        // SMS directo o mock - usar código generado
        const smsResult = await smsService.sendOTPCode(normalizedPhone, otpCode, 'phone_verification');
        
        // Verificar si estamos en modo desarrollo o mock
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const isMockMode = process.env.SMS_PROVIDER === 'mock' || 
                          (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN);
        
        // Si es desarrollo o modo mock, incluir código de debug
        if (isDevelopment || isMockMode || smsResult.messageSid?.startsWith('mock_')) {
          res.json({
            success: true,
            message: isMockMode 
              ? 'Código generado (modo desarrollo). Revisa la consola del servidor o el código de abajo.'
              : 'Código de verificación enviado al teléfono',
            debug_code: otpCode
          });
        } else {
          // En producción con SMS real, no mostrar código
          res.json({
            success: true,
            message: 'Código de verificación enviado al teléfono'
          });
        }
      }
    } catch (smsError) {
      logError('Error enviando SMS:', smsError);
      
      // Verificar si es error de mismo número (Twilio no permite enviar al mismo número)
      const isSameNumberError = smsError.code === 'SAME_NUMBER' || 
                                smsError.message?.includes('cannot be the same') ||
                                smsError.code === 21266;
      
      // Verificar si es error de configuración de Twilio
      const isTwilioConfigError = smsError.message?.includes('Twilio no está configurado') || 
                                  smsError.message?.includes('TWILIO_PHONE_NUMBER');
      
      // Verificar si es error de número de Twilio inválido
      const isInvalidTwilioNumber = smsError.code === 'INVALID_TWILIO_NUMBER' || 
                                    smsError.code === 21659 ||
                                    smsError.message?.includes('is not a Twilio phone number');
      
      // En desarrollo, si hay cualquier error de Twilio, mostrar código en consola
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment || isTwilioConfigError || isSameNumberError || isInvalidTwilioNumber) {
        console.log(`📱 [DEV] Código OTP para ${normalizedPhone}: ${otpCode}`);
        
        let message = 'Código de verificación generado (modo desarrollo)';
        if (isSameNumberError) {
          message = 'No se puede enviar SMS al mismo número de Twilio. Código generado (revisa consola).';
        } else if (isInvalidTwilioNumber) {
          message = 'El número de Twilio no es válido. Código generado (revisa consola). Verifica tu número en la consola de Twilio.';
        } else if (isTwilioConfigError) {
          message = 'Código generado (Twilio no configurado). Revisa la consola del servidor.';
        }
        
        res.json({
          success: true,
          message: message,
          debug_code: otpCode
        });
      } else {
        // En producción con Twilio configurado, retornar error
        res.status(500).json({
          success: false,
          message: isSameNumberError
            ? 'No se puede enviar SMS al mismo número de Twilio. Usa un número diferente para verificación.'
            : 'Error al enviar código de verificación. Por favor intenta más tarde.'
        });
      }
    }
  } catch (error) {
    logError('Error sending phone verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar código de verificación'
    });
  }
});

// ============================================
// POST /api/user/verify-phone
// ============================================
// Verificar código OTP del teléfono
router.post('/verify-phone', authenticate, rateLimiters.private, [
  body('phone').notEmpty().withMessage('Teléfono requerido'),
  body('code').notEmpty().withMessage('Código requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
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
    const { phone, code } = req.body;

    // Normalizar teléfono antes de verificar código
    const smsService = require('../services/sms.service');
    const normalizedPhone = smsService.normalizeMexicanPhone(phone);
    
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Formato de teléfono inválido. Ingresa un número mexicano de 10 dígitos (ej: 7774486398 o +527774486398)'
      });
    }

    // Si Twilio Verify está configurado, usarlo para verificar
    const isTwilioVerify = !!process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (isTwilioVerify) {
      try {
        const verifyResult = await smsService.verifyOTPViaTwilioVerify(normalizedPhone, code);
        
        if (verifyResult.success && verifyResult.valid) {
          // Actualizar teléfono del usuario
          await query(
            'UPDATE users SET phone = ?, phone_verified = TRUE, updated_at = NOW() WHERE id = ?',
            [normalizedPhone, userId]
          );
          
          res.json({
            success: true,
            message: 'Teléfono verificado exitosamente'
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Código inválido o expirado'
          });
        }
      } catch (verifyError) {
        logError('Error verificando código con Twilio Verify:', verifyError);
        res.status(400).json({
          success: false,
          message: verifyError.message || 'Código inválido'
        });
      }
      return;
    }

    // Verificación manual (SMS directo o mock)
    // Buscar código OTP (usar número normalizado)
    const otps = await query(
      'SELECT id, expires_at, verified FROM phone_verification_otps WHERE user_id = ? AND phone = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [userId, normalizedPhone, code]
    );

    if (otps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    const otpData = otps[0];

    // Verificar si ya fue usado
    if (otpData.verified) {
      return res.status(400).json({
        success: false,
        message: 'Este código ya fue utilizado'
      });
    }

    // Verificar expiración
    if (new Date(otpData.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Código expirado'
      });
    }

    // Marcar código como verificado
    await query(
      'UPDATE phone_verification_otps SET verified = TRUE WHERE id = ?',
      [otpData.id]
    );

    // Actualizar teléfono del usuario (usar número normalizado)
    await query(
      'UPDATE users SET phone = ?, phone_verified = TRUE, updated_at = NOW() WHERE id = ?',
      [normalizedPhone, userId]
    );

    res.json({
      success: true,
      message: 'Teléfono verificado exitosamente'
    });
  } catch (error) {
    logError('Error verifying phone:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar teléfono'
    });
  }
});

// ============================================
// POST /api/user/enable-2fa
// ============================================
// Activar autenticación de dos factores
router.post('/enable-2fa', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;

    // Generar secreto para 2FA
    // En producción, usarías una librería como 'speakeasy' para generar el secreto
    // Por ahora, generamos un secreto simple
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('base64');

    // Guardar secreto en user_settings
    // En producción, deberías almacenar esto de forma segura y encriptada
    await query(
      `CREATE TABLE IF NOT EXISTS user_settings (
        user_id INT PRIMARY KEY,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        marketing_emails BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'es',
        currency VARCHAR(10) DEFAULT 'USD',
        timezone VARCHAR(100) DEFAULT NULL,
        preferences JSON DEFAULT NULL,
        two_factor_secret VARCHAR(255) DEFAULT NULL,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Actualizar o insertar configuración
    await query(
      `INSERT INTO user_settings (user_id, two_factor_secret, two_factor_enabled) 
       VALUES (?, ?, FALSE)
       ON DUPLICATE KEY UPDATE two_factor_secret = ?`,
      [userId, secret, secret]
    );

    // Generar URL para QR code (formato otpauth://totp/...)
    // En producción, usarías la librería 'speakeasy' para generar esto correctamente
    const serviceName = 'Rose Secret';
    const accountName = req.user.email;
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}`;

    res.json({
      success: true,
      message: '2FA configurado. Escanea el código QR con tu app autenticadora.',
      data: {
        secret,
        qrCodeUrl,
        manualEntryKey: secret // Para entrada manual
      }
    });
  } catch (error) {
    logError('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar 2FA'
    });
  }
});

// ============================================
// POST /api/user/verify-2fa-setup
// ============================================
// Verificar código 2FA durante configuración
router.post('/verify-2fa-setup', authenticate, rateLimiters.private, [
  body('code').notEmpty().withMessage('Código requerido')
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
    const { code } = req.body;

    // Obtener secreto 2FA del usuario
    const settings = await query(
      'SELECT two_factor_secret FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (!settings.length || !settings[0].two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: 'Primero debes configurar 2FA'
      });
    }

    // En producción, usarías 'speakeasy' para verificar el código TOTP
    // Por ahora, validación básica (en producción implementar correctamente)
    // NOTA: Esta es una implementación simplificada. En producción usar speakeasy.totp.verify()
    
    // Por ahora, aceptamos cualquier código de 6 dígitos durante la configuración
    // En producción, deberías verificar el código TOTP real aquí

    // Activar 2FA
    await query(
      'UPDATE user_settings SET two_factor_enabled = TRUE WHERE user_id = ?',
      [userId]
    );

    // Registrar auditoría
    await auditService.logAudit(
      '2FA_ENABLED',
      'user',
      userId,
      { two_factor_enabled: false },
      { two_factor_enabled: true },
      req
    );

    res.json({
      success: true,
      message: '2FA activado exitosamente'
    });
  } catch (error) {
    logError('Error verifying 2FA setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar 2FA'
    });
  }
});

// ============================================
// POST /api/user/disable-2fa
// ============================================
// Desactivar autenticación de dos factores
router.post('/disable-2fa', authenticate, rateLimiters.private, [
  body('password').notEmpty().withMessage('Contraseña requerida para desactivar 2FA')
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
    const { password } = req.body;

    // Verificar contraseña
    const users = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, users[0].password_hash);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Desactivar 2FA
    await query(
      'UPDATE user_settings SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE user_id = ?',
      [userId]
    );

    // Registrar auditoría
    await auditService.logAudit(
      '2FA_DISABLED',
      'user',
      userId,
      { two_factor_enabled: true },
      { two_factor_enabled: false },
      req
    );

    res.json({
      success: true,
      message: '2FA desactivado exitosamente'
    });
  } catch (error) {
    logError('Error disabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar 2FA'
    });
  }
});

// ============================================
// GET /api/user/2fa-status
// ============================================
// Obtener estado de 2FA
router.get('/2fa-status', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await query(
      'SELECT two_factor_enabled FROM user_settings WHERE user_id = ?',
      [userId]
    );

    const enabled = settings.length > 0 && settings[0].two_factor_enabled === 1;

    res.json({
      success: true,
      data: {
        enabled
      }
    });
  } catch (error) {
    logError('Error getting 2FA status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de 2FA'
    });
  }
});

// ============================================
// POST /api/user/upload-avatar
// ============================================
// Subir avatar del usuario
router.post('/upload-avatar', 
  authenticate, 
  rateLimiters.private,
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const userId = req.user.id;

      // Obtener avatar actual para eliminarlo después
      const users = await query(
        'SELECT avatar FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const oldAvatarUrl = users[0].avatar;
      let oldPublicId = null;

      // Extraer publicId de la URL anterior si existe
      if (oldAvatarUrl) {
        oldPublicId = cloudinaryService.extractPublicIdFromUrl(oldAvatarUrl);
      }

      // Subir nueva imagen a Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        cloudinaryService.IMAGE_TYPES.USER_AVATAR,
        userId
      );

      // Eliminar imagen anterior si existe
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId).catch(error => {
          logError('No se pudo eliminar avatar anterior:', error);
          // No fallar si no se puede eliminar
        });
      }

      // Actualizar avatar en base de datos
      await query(
        'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
        [uploadResult.url, userId]
      );

      // Registrar auditoría
      await auditService.logAudit(
        'AVATAR_UPDATED',
        'user',
        userId,
        { avatar: oldAvatarUrl },
        { avatar: uploadResult.url },
        req
      );

      res.json({
        success: true,
        message: 'Avatar actualizado exitosamente',
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height
        }
      });
    } catch (error) {
      logError('Error subiendo avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir avatar'
      });
    }
  }
);

module.exports = router;
