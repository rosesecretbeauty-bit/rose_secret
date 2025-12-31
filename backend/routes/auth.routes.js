// ============================================
// Rutas de Autenticación
// ============================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const { authenticate, invalidateToken } = require('../middleware/auth');
const { rateLimiters } = require('../security/rateLimiter');
const { bruteForceProtection } = require('../middleware/bruteForce');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');

// ============================================
// POST /api/auth/register
// ============================================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Juan Pérez
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuario registrado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register', rateLimiters.register, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('name').trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres')
], async (req, res) => {
  try {
    // Validar inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const { email, password, name } = req.body;

    // Verificar si el email ya existe
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Validar que JWT_SECRET esté definido antes de crear usuario
    if (!process.env.JWT_SECRET) {
      logError('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    // Crear usuario
    let result;
    try {
      result = await query(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, passwordHash, name]
      );
      
      // Verificar que se insertó correctamente
      if (!result || !result.insertId) {
        logError('Error: INSERT no retornó insertId', { result });
        throw new Error('Error al insertar usuario en la base de datos');
      }
      
      const { info } = require('../logger');
      info('Usuario insertado exitosamente', { insertId: result.insertId, email });
    } catch (dbError) {
      logError('Error en INSERT de usuario:', dbError);
      // Si es error de duplicado, retornar mensaje específico
      if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
      throw dbError; // Re-lanzar para que el catch general lo maneje
    }

    // Generar token JWT para autenticación
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Obtener usuario creado
    const users = await query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [result.insertId]
    );
    
    // Verificar que se encontró el usuario
    if (!users || users.length === 0) {
      logError('Error: Usuario no encontrado después de insertar', { insertId: result.insertId });
      throw new Error('Error al recuperar usuario después del registro');
    }

    // Generar token de verificación de email
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailService = require('../services/email.service');
    
    // Guardar token de verificación en la tabla email_verification_tokens
    // El token expira en 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    try {
      await query(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [result.insertId, verificationToken, expiresAt]
      );
      
      // Enviar email de verificación (no esperar respuesta para no bloquear)
      emailService.sendEmailVerificationEmail(users[0].email, verificationToken, users[0].name)
        .catch(err => {
          logError('Error enviando email de verificación:', err);
        });
    } catch (emailTokenError) {
      // No fallar el registro si falla la creación del token
      logError('Error creando token de verificación de email:', emailTokenError);
    }

    // Registrar auditoría
    await auditService.logAudit(
      'USER_REGISTER',
      'user',
      users[0].id,
      null,
      { email: users[0].email, name: users[0].name },
      req,
      {
        user_id: users[0].id,
        email: users[0].email,
        registration_method: 'email_password',
      }
    );

    // Registrar métrica
    metricsService.recordRegistration();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: users[0],
        token
      }
    });
  } catch (error) {
    logError('Error en registro:', error);
    
    // Log detallado del error para debugging
    console.error('Error completo en registro:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Mensaje más específico según el tipo de error
    let errorMessage = 'Error al registrar usuario';
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      errorMessage = 'El email ya está registrado';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      errorMessage = 'Error de conexión con la base de datos';
    } else if (error.sqlMessage) {
      errorMessage = `Error en la base de datos: ${error.sqlMessage}`;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          code: error.code,
          errno: error.errno,
          sqlMessage: error.sqlMessage
        }
      })
    });
  }
});

// ============================================
// POST /api/auth/login
// ============================================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', rateLimiters.login, bruteForceProtection, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password requerido')
], async (req, res) => {
  try {
    // Validar inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Buscar usuario con roles (usar prepared statements para prevenir SQL injection)
    const users = await query(
      `SELECT u.id, u.email, u.password_hash, u.name, u.role, u.avatar,
              u.email_verified, u.email_verified_at, u.phone, u.phone_verified,
              GROUP_CONCAT(DISTINCT r.id) as role_ids,
              GROUP_CONCAT(DISTINCT r.name) as role_names
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = ?
       GROUP BY u.id`,
      [email]
    );

    // Mensaje genérico para no revelar si el email existe
    const genericError = {
      success: false,
      message: 'Credenciales inválidas'
    };

    if (users.length === 0) {
      // Usar delay para prevenir timing attacks
      await bcrypt.compare(password, '$2a$10$dummyhashfordelay'); // Hash dummy para delay constante
      return res.status(401).json(genericError);
    }

    const user = users[0];

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json(genericError);
    }

    // Validar que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      logError('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    // Validar que JWT_SECRET esté definido
    if (!process.env.JWT_SECRET) {
      logError('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Actualizar last_login_at
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Remover password_hash de la respuesta
    delete user.password_hash;
    
    // Parsear roles
    user.role_ids = user.role_ids ? user.role_ids.split(',').map(Number) : [];
    user.role_names = user.role_names ? user.role_names.split(',') : [];
    
    // Determinar rol principal: usar role_names si existe, sino usar role
    let primaryRole = user.role || 'customer';
    if (user.role_names && user.role_names.length > 0) {
      // Si tiene rol admin en role_names, usar admin como rol principal
      if (user.role_names.includes('admin')) {
        primaryRole = 'admin';
      } else if (user.role_names.includes('manager')) {
        primaryRole = 'manager';
      } else {
        primaryRole = user.role_names[0] || user.role || 'customer';
      }
    }

    // Registrar auditoría
    await auditService.logAudit('LOGIN', 'user', user.id, null, { email: user.email, role: primaryRole, role_names: user.role_names }, req);

    // Registrar métrica
    metricsService.recordLogin();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: primaryRole,
          role_names: user.role_names, // Incluir roles del RBAC
          avatar: user.avatar || null,
          email_verified: user.email_verified === true || user.email_verified === 1,
          email_verified_at: user.email_verified_at,
          phone: user.phone || null,
          phone_verified: user.phone_verified === true || user.phone_verified === 1
        },
        token
      }
    });
  } catch (error) {
    logError('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión' 
    });
  }
});

// ============================================
// POST /api/auth/logout
// ============================================
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.post('/logout', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await invalidateToken(token);
    }

    // Registrar auditoría
    await auditService.logAudit('LOGOUT', 'user', req.user.id, null, null, req);
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    logError('Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cerrar sesión' 
    });
  }
});

// ============================================
// GET /api/auth/me
// ============================================
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// 🔒 RATE LIMITED: Privado (100 req/min por usuario)
router.get('/me', authenticate, rateLimiters.private, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logError('Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener perfil' 
    });
  }
});

// ============================================
// POST /api/auth/verify-email
// ============================================
// Verificar correo electrónico con token
router.post('/verify-email', rateLimiters.login, [
  body('token').trim().notEmpty().withMessage('Token requerido')
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

    const { token } = req.body;

    // Buscar token de verificación en la tabla email_verification_tokens
    const tokens = await query(
      `SELECT evt.user_id, evt.expires_at, u.id, u.email, u.email_verified, u.name 
       FROM email_verification_tokens evt
       INNER JOIN users u ON u.id = evt.user_id
       WHERE evt.token = ? AND evt.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o expirado'
      });
    }

    const tokenData = tokens[0];
    const user = {
      id: tokenData.id,
      email: tokenData.email,
      email_verified: tokenData.email_verified,
      name: tokenData.name
    };

    // Si ya está verificado, retornar éxito y eliminar el token
    if (user.email_verified) {
      // Limpiar token usado
      await query(
        'DELETE FROM email_verification_tokens WHERE token = ?',
        [token]
      );
      
      return res.json({
        success: true,
        message: 'Tu correo electrónico ya está verificado'
      });
    }

    // Marcar email como verificado y eliminar token
    await query(
      'UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // Eliminar token usado
    await query(
      'DELETE FROM email_verification_tokens WHERE token = ?',
      [token]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'EMAIL_VERIFIED',
      'user',
      user.id,
      null,
      { email: user.email },
      req
    );

    res.json({
      success: true,
      message: 'Correo electrónico verificado exitosamente'
    });
  } catch (error) {
    logError('Error en verify-email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar correo electrónico' 
    });
  }
});

// ============================================
// POST /api/auth/resend-verification
// ============================================
// Reenviar email de verificación
router.post('/resend-verification', rateLimiters.login, [
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
    const crypto = require('crypto');
    const emailService = require('../services/email.service');

    // Buscar usuario
    const users = await query(
      'SELECT id, email, name, email_verified FROM users WHERE email = ?',
      [email]
    );

    // Siempre retornar éxito para no revelar si el email existe
    if (users.length > 0) {
      const user = users[0];
      
      // Si ya está verificado, no hacer nada pero retornar éxito
      if (user.email_verified) {
        return res.json({
          success: true,
          message: 'Tu correo electrónico ya está verificado'
        });
      }

      // Generar nuevo token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Eliminar tokens anteriores del usuario
      await query(
        'DELETE FROM email_verification_tokens WHERE user_id = ?',
        [user.id]
      );
      
      // Guardar nuevo token en la tabla email_verification_tokens
      // El token expira en 24 horas
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await query(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, verificationToken, expiresAt]
      );
      
      // Enviar email (no esperar respuesta)
      emailService.sendEmailVerificationEmail(user.email, verificationToken, user.name)
        .catch(err => {
          logError('Error enviando email de verificación:', err);
        });
    }
    
    // Siempre retornar éxito
    res.json({
      success: true,
      message: 'Si el email existe y no está verificado, recibirás un nuevo email de verificación'
    });
  } catch (error) {
    logError('Error en resend-verification:', error);
    res.json({
      success: true,
      message: 'Si el email existe y no está verificado, recibirás un nuevo email de verificación'
    });
  }
});

// ============================================
// POST /api/auth/forgot-password
// ============================================
// Solicitar recuperación de contraseña
// Rate limiting estricto para prevenir abuso
router.post('/forgot-password', rateLimiters.login, [
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
    const crypto = require('crypto');
    const emailService = require('../services/email.service');

    // Buscar usuario (no revelar si existe o no por seguridad)
    const users = await query(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );

    // Siempre retornar éxito para no revelar si el email existe
    // Pero solo enviar email si el usuario existe
    if (users.length > 0) {
      const user = users[0];
      
      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Calcular fecha de expiración (1 hora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Invalidar tokens previos del usuario
      await query(
        'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
        [user.id]
      );
      
      // Guardar nuevo token
      await query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [user.id, resetToken, expiresAt, req.ip, req.get('user-agent') || null]
      );
      
      // Enviar email (no esperar respuesta para no revelar timing)
      emailService.sendPasswordResetEmail(user.email, resetToken, user.name)
        .catch(err => {
          logError('Error enviando email de recuperación:', err);
          // No fallar el request si el email falla
        });
      
      // Registrar auditoría
      await auditService.logAudit(
        'PASSWORD_RESET_REQUESTED',
        'user',
        user.id,
        null,
        { email: user.email },
        req
      );
    }
    
    // Siempre retornar éxito (no revelar si el email existe)
    res.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña'
    });
  } catch (error) {
    logError('Error en forgot-password:', error);
    // En caso de error, también retornar éxito genérico
    res.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña'
    });
  }
});

// ============================================
// POST /api/auth/reset-password
// ============================================
// Restablecer contraseña con token
// Rate limiting estricto para prevenir abuso
router.post('/reset-password', rateLimiters.login, [
  body('token').trim().notEmpty().withMessage('Token requerido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
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

    const { token, password } = req.body;

    // Buscar token válido
    const tokens = await query(
      `SELECT prt.*, u.id as user_id, u.email, u.name 
       FROM password_reset_tokens prt
       INNER JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.'
      });
    }

    const resetToken = tokens[0];
    const userId = resetToken.user_id;

    // Hash de nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Actualizar contraseña del usuario
    await query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, userId]
    );

    // Marcar token como usado
    await query(
      'UPDATE password_reset_tokens SET used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [resetToken.id]
    );

    // Invalidar todos los tokens activos del usuario por seguridad
    await query(
      'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0 AND id != ?',
      [userId, resetToken.id]
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PASSWORD_RESET_COMPLETED',
      'user',
      userId,
      null,
      { email: resetToken.email },
      req
    );

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    logError('Error en reset-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al restablecer contraseña' 
    });
  }
});

module.exports = router;

