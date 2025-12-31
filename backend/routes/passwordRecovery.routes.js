// ============================================
// Password Recovery Routes
// ============================================
// Sistema seguro de recuperación y cambio de contraseña

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError, info } = require('../logger');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const auditService = require('../services/audit.service');

// ============================================
// POST /api/password-recovery/request-email
// ============================================
// Solicitar recuperación de contraseña por email (requiere email verificado)
router.post('/request-email', rateLimiters.login, [
  body('email').isEmail().withMessage('Email inválido')
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

    const { email } = req.body;

    // Buscar usuario
    const users = await query(
      'SELECT id, email, name, email_verified FROM users WHERE email = ?',
      [email]
    );

    // Siempre retornar éxito para no revelar si el email existe
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Si el email existe y está verificado, recibirás un código de recuperación'
      });
    }

    const user = users[0];

    // Verificar que el email esté verificado
    if (!user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Tu correo electrónico no está verificado. Por favor verifica tu correo primero antes de recuperar tu contraseña.',
        requires_verification: true
      });
    }

    // Generar código de recuperación de 6 dígitos
    const recoveryCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira en 15 minutos

    // Crear tabla si no existe
    await query(
      `CREATE TABLE IF NOT EXISTS password_recovery_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        code VARCHAR(6) NOT NULL,
        method ENUM('email', 'phone') NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_code (code),
        INDEX idx_expires (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Eliminar códigos anteriores no usados
    await query(
      'DELETE FROM password_recovery_codes WHERE user_id = ? AND used = FALSE AND method = ?',
      [user.id, 'email']
    );

    // Guardar código
    await query(
      'INSERT INTO password_recovery_codes (user_id, code, method, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, recoveryCode, 'email', expiresAt]
    );

    // Enviar código por email
    try {
      await emailService.sendPasswordRecoveryEmail(user.email, recoveryCode, user.name);
    } catch (emailError) {
      logError('Error enviando email de recuperación:', emailError);
      // No fallar el proceso, el código ya está guardado
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_RECOVERY_REQUESTED',
      'security',
      user.id,
      null,
      { method: 'email', email: user.email },
      req
    ).catch(() => {});

    res.json({
      success: true,
      message: 'Código de recuperación enviado a tu correo electrónico'
    });
  } catch (error) {
    logError('Error en request-email recovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud de recuperación'
    });
  }
});

// ============================================
// POST /api/password-recovery/request-phone
// ============================================
// Solicitar recuperación de contraseña por teléfono (requiere teléfono verificado)
router.post('/request-phone', rateLimiters.login, [
  body('email').isEmail().withMessage('Email inválido'),
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

    const { email, phone } = req.body;

    // Normalizar teléfono antes de buscar usuario
    const smsService = require('../services/sms.service');
    const normalizedPhone = smsService.normalizeMexicanPhone(phone);
    
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Formato de teléfono inválido. Ingresa un número mexicano de 10 dígitos (ej: 7774486398 o +527774486398)'
      });
    }

    // Buscar usuario
    const users = await query(
      'SELECT id, email, name, phone, phone_verified FROM users WHERE email = ?',
      [email]
    );

    // Siempre retornar éxito para no revelar si el email existe
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Si el email existe y el teléfono está verificado, recibirás un código de recuperación'
      });
    }

    const user = users[0];

    // Normalizar teléfono del usuario para comparar
    const normalizedUserPhone = user.phone ? smsService.normalizeMexicanPhone(user.phone) : null;

    // Verificar que el teléfono coincida y esté verificado
    if (!normalizedUserPhone || normalizedUserPhone !== normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'El teléfono no coincide con el registrado en tu cuenta'
      });
    }

    if (!user.phone_verified) {
      return res.status(400).json({
        success: false,
        message: 'Tu teléfono no está verificado. Por favor verifica tu teléfono primero.',
        requires_verification: true
      });
    }

    // Generar código de recuperación de 6 dígitos
    const recoveryCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira en 15 minutos

    // Crear tabla si no existe
    await query(
      `CREATE TABLE IF NOT EXISTS password_recovery_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        code VARCHAR(6) NOT NULL,
        method ENUM('email', 'phone') NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_code (code),
        INDEX idx_expires (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Eliminar códigos anteriores no usados
    await query(
      'DELETE FROM password_recovery_codes WHERE user_id = ? AND used = FALSE AND method = ?',
      [user.id, 'phone']
    );

    // Guardar código
    await query(
      'INSERT INTO password_recovery_codes (user_id, code, method, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, recoveryCode, 'phone', expiresAt]
    );

    // Enviar código por SMS (normalizedPhone ya está definido arriba)
    try {
      // Enviar SMS (el número ya está normalizado)
      await smsService.sendOTPCode(normalizedPhone, recoveryCode, 'password_reset');
      
      res.json({
        success: true,
        message: 'Código de recuperación enviado al teléfono'
      });
    } catch (smsError) {
      logError('Error enviando SMS de recuperación:', smsError);
      
      // Verificar si es error de configuración de Twilio
      const isTwilioConfigError = smsError.message?.includes('Twilio no está configurado') || 
                                  smsError.message?.includes('TWILIO_PHONE_NUMBER');
      
      // En desarrollo o si Twilio no está configurado, mostrar código en consola
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment || isTwilioConfigError) {
        console.log(`📱 [DEV] Código de recuperación para ${normalizedPhone}: ${recoveryCode}`);
        res.json({
          success: true,
          message: isTwilioConfigError 
            ? 'Código generado (Twilio no configurado). Revisa la consola del servidor.'
            : 'Código de recuperación generado (modo desarrollo)',
          debug_code: recoveryCode
        });
      } else {
        // En producción con Twilio configurado, retornar error
        res.status(500).json({
          success: false,
          message: 'Error al enviar código de recuperación. Por favor intenta más tarde.'
        });
      }
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_RECOVERY_REQUESTED',
      'security',
      user.id,
      null,
      { method: 'phone', phone: user.phone },
      req
    ).catch(() => {});

    res.json({
      success: true,
      message: 'Código de recuperación enviado a tu teléfono'
    });
  } catch (error) {
    logError('Error en request-phone recovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud de recuperación'
    });
  }
});

// ============================================
// POST /api/password-recovery/verify-code
// ============================================
// Verificar código de recuperación
router.post('/verify-code', rateLimiters.login, [
  body('email').isEmail().withMessage('Email inválido'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Código debe tener 6 dígitos')
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

    const { email, code } = req.body;

    // Buscar usuario
    const users = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    const userId = users[0].id;

    // Buscar código válido
    const codes = await query(
      `SELECT id, expires_at, used, method 
       FROM password_recovery_codes 
       WHERE user_id = ? AND code = ? AND used = FALSE 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code]
    );

    if (codes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o ya utilizado'
      });
    }

    const codeData = codes[0];

    // Verificar expiración
    if (new Date(codeData.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Código expirado. Por favor solicita uno nuevo.'
      });
    }

    // Generar token temporal para cambio de contraseña (válido por 10 minutos)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setMinutes(tokenExpiresAt.getMinutes() + 10);

    // Guardar token en la misma tabla (marcar código como usado)
    await query(
      'UPDATE password_recovery_codes SET used = TRUE WHERE id = ?',
      [codeData.id]
    );

    // Crear tabla de tokens si no existe
    await query(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_token (token),
        INDEX idx_expires (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    // Eliminar tokens anteriores no usados
    await query(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE',
      [userId]
    );

    // Guardar token
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, resetToken, tokenExpiresAt]
    );

    res.json({
      success: true,
      message: 'Código verificado correctamente',
      reset_token: resetToken
    });
  } catch (error) {
    logError('Error verificando código de recuperación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar código'
    });
  }
});

// ============================================
// POST /api/password-recovery/reset
// ============================================
// Cambiar contraseña usando token de recuperación
router.post('/reset', rateLimiters.login, [
  body('reset_token').notEmpty().withMessage('Token requerido'),
  body('new_password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
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

    const { reset_token, new_password } = req.body;

    // Buscar token válido
    const tokens = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.email
       FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ? AND prt.used = FALSE
       ORDER BY prt.created_at DESC LIMIT 1`,
      [reset_token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o ya utilizado'
      });
    }

    const tokenData = tokens[0];

    // Verificar expiración
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Por favor solicita un nuevo código de recuperación.'
      });
    }

    // Hash de nueva contraseña
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, tokenData.user_id]
    );

    // Marcar token como usado
    await query(
      'UPDATE password_reset_tokens SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [tokenData.id]
    );

    // Invalidar todos los tokens de sesión del usuario (forzar re-login)
    // Esto se puede hacer invalidando tokens JWT si se guardan en BD

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_RESET_COMPLETED',
      'security',
      tokenData.user_id,
      null,
      { email: tokenData.email, method: 'recovery' },
      req
    ).catch(() => {});

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Por favor inicia sesión con tu nueva contraseña.'
    });
  } catch (error) {
    logError('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña'
    });
  }
});

// ============================================
// POST /api/password-recovery/change-with-verification
// ============================================
// Cambiar contraseña cuando el usuario está autenticado (requiere verificación)
router.post('/change-with-verification', authenticate, rateLimiters.private, [
  body('verification_code').notEmpty().withMessage('Código de verificación requerido'),
  body('new_password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
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
    const { verification_code, new_password, verification_method } = req.body; // 'email' o 'phone'

    // Verificar que el usuario tenga al menos un método verificado
    const users = await query(
      'SELECT email_verified, phone_verified FROM users WHERE id = ?',
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
        message: 'Debes tener al menos un método de contacto verificado (email o teléfono) para cambiar tu contraseña'
      });
    }

    // Verificar código según el método
    let codeValid = false;

    if (verification_method === 'email' && user.email_verified) {
      // Verificar código de email
      const emailCodes = await query(
        `SELECT id FROM email_verification_tokens evt
         INNER JOIN users u ON u.id = evt.user_id
         WHERE u.id = ? AND evt.token LIKE ? AND evt.expires_at > NOW()
         ORDER BY evt.created_at DESC LIMIT 1`,
        [userId, `%${verification_code}%`]
      );

      // O buscar en códigos de recuperación recientes
      const recoveryCodes = await query(
        `SELECT id FROM password_recovery_codes
         WHERE user_id = ? AND code = ? AND method = 'email' AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, verification_code]
      );

      codeValid = emailCodes.length > 0 || recoveryCodes.length > 0;
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
        message: 'Código de verificación inválido o expirado'
      });
    }

    // Hash de nueva contraseña
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Actualizar contraseña
    await query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, userId]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_CHANGED',
      'security',
      userId,
      null,
      { method: 'verified_change', verification_method },
      req
    ).catch(() => {});

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logError('Error en change-with-verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña'
    });
  }
});

module.exports = router;

