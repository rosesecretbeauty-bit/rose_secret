// ============================================
// Rutas de Direcciones de Usuario
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');

// ============================================
// GET /api/user/addresses
// ============================================
// Listar todas las direcciones del usuario autenticado
// ❌ NO CACHEABLE: Datos sensibles, específicos por usuario
// 🔒 RATE LIMITED: Privado (50 req/min por usuario)
router.get('/', authenticate, rateLimiters.private, async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await query(`
      SELECT 
        id,
        user_id,
        type,
        first_name,
        last_name,
        company,
        street,
        city,
        state,
        zip_code,
        country,
        phone,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        addresses
      }
    });
  } catch (error) {
    logError('Error obteniendo direcciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener direcciones'
    });
  }
});

// ============================================
// GET /api/user/addresses/:id
// ============================================
// Obtener una dirección específica (con ownership)
// ❌ NO CACHEABLE: Datos sensibles
// 🔒 RATE LIMITED: Privado (50 req/min por usuario)
router.get('/:id', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de dirección inválido')
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

    const { id } = req.params;
    const userId = req.user.id;

    const addresses = await query(`
      SELECT 
        id,
        user_id,
        type,
        first_name,
        last_name,
        company,
        street,
        city,
        state,
        zip_code,
        country,
        phone,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `, [id, userId]);

    if (addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        address: addresses[0]
      }
    });
  } catch (error) {
    logError('Error obteniendo dirección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dirección'
    });
  }
});

// ============================================
// POST /api/user/addresses
// ============================================
// Crear una nueva dirección
// Si is_default = true → desmarcar otras direcciones del usuario
// ❌ NO CACHEABLE: Datos sensibles
// 🔒 RATE LIMITED: Privado (20 req/min por usuario)
router.post('/', authenticate, rateLimiters.private, [
  body('type').optional().isIn(['billing', 'shipping', 'both']).withMessage('Tipo inválido'),
  body('first_name').trim().isLength({ min: 2, max: 255 }).withMessage('Nombre debe tener entre 2 y 255 caracteres'),
  body('last_name').trim().isLength({ min: 2, max: 255 }).withMessage('Apellido debe tener entre 2 y 255 caracteres'),
  body('company').optional().trim().isLength({ max: 255 }).withMessage('Empresa inválida'),
  body('street').trim().isLength({ min: 5, max: 255 }).withMessage('Dirección debe tener entre 5 y 255 caracteres'),
  body('city').trim().isLength({ min: 2, max: 255 }).withMessage('Ciudad debe tener entre 2 y 255 caracteres'),
  body('state').trim().isLength({ min: 2, max: 100 }).withMessage('Estado debe tener entre 2 y 100 caracteres'),
  body('zip_code').trim().isLength({ min: 3, max: 20 }).withMessage('Código postal debe tener entre 3 y 20 caracteres'),
  body('country').trim().isLength({ min: 2, max: 100 }).withMessage('País debe tener entre 2 y 100 caracteres'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Teléfono inválido'),
  body('is_default').optional().isBoolean().withMessage('is_default debe ser booleano')
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
    const {
      type = 'both',
      first_name,
      last_name,
      company,
      street,
      city,
      state,
      zip_code,
      country,
      phone,
      is_default = false
    } = req.body;

    // Verificar límite de direcciones (máximo 10)
    const countResult = await query(
      'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?',
      [userId]
    );
    const addressCount = countResult[0].count;

    if (addressCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Has alcanzado el límite de direcciones (10)'
      });
    }

    // Si se marca como default, desmarcar las demás
    if (is_default) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    // Crear dirección
    const result = await query(`
      INSERT INTO addresses (
        user_id, type, first_name, last_name, company,
        street, city, state, zip_code, country, phone, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      type,
      first_name,
      last_name,
      company || null,
      street,
      city,
      state,
      zip_code,
      country,
      phone || null,
      is_default
    ]);

    const addressId = result.insertId;

    // Obtener dirección creada
    const newAddress = await query(
      'SELECT * FROM addresses WHERE id = ? LIMIT 1',
      [addressId]
    );

    // Audit log
    await auditService.logAudit(
      'ADDRESS_CREATED',
      'address',
      addressId,
      null,
      { type, city, country },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Dirección creada exitosamente',
      data: {
        address: newAddress[0]
      }
    });
  } catch (error) {
    logError('Error creando dirección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear dirección'
    });
  }
});

// ============================================
// PUT /api/user/addresses/:id
// ============================================
// Actualizar una dirección existente
// Ownership estricto: solo el dueño puede actualizar
// ❌ NO CACHEABLE: Datos sensibles
// 🔒 RATE LIMITED: Privado (20 req/min por usuario)
router.put('/:id', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de dirección inválido'),
  body('type').optional().isIn(['billing', 'shipping', 'both']),
  body('first_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('last_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('company').optional().trim().isLength({ max: 255 }),
  body('street').optional().trim().isLength({ min: 5, max: 255 }),
  body('city').optional().trim().isLength({ min: 2, max: 255 }),
  body('state').optional().trim().isLength({ min: 2, max: 100 }),
  body('zip_code').optional().trim().isLength({ min: 3, max: 20 }),
  body('country').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('is_default').optional().isBoolean()
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

    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Verificar ownership y existencia
    const existing = await query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Si se marca como default, desmarcar las demás
    if (updates.is_default === true) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
        [userId, id]
      );
    }

    // Construir query de actualización
    const allowedFields = [
      'type', 'first_name', 'last_name', 'company',
      'street', 'city', 'state', 'zip_code', 'country', 'phone', 'is_default'
    ];
    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(id, userId);

    await query(
      `UPDATE addresses SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Obtener dirección actualizada
    const updated = await query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    // Audit log
    await auditService.logAudit(
      'ADDRESS_UPDATED',
      'address',
      id,
      existing[0],
      updated[0],
      req
    );

    res.json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: {
        address: updated[0]
      }
    });
  } catch (error) {
    logError('Error actualizando dirección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar dirección'
    });
  }
});

// ============================================
// PUT /api/user/addresses/:id/set-default
// ============================================
// Marcar una dirección como por defecto
// Desmarca automáticamente la anterior default
// ❌ NO CACHEABLE: Datos sensibles
// 🔒 RATE LIMITED: Privado (20 req/min por usuario)
router.put('/:id/set-default', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de dirección inválido')
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

    const { id } = req.params;
    const userId = req.user.id;

    // Verificar ownership y existencia
    const existing = await query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Desmarcar todas las demás direcciones del usuario
    await query(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );

    // Marcar esta como default
    await query(
      'UPDATE addresses SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    // Obtener dirección actualizada
    const updated = await query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    // Audit log
    await auditService.logAudit(
      'ADDRESS_UPDATED',
      'address',
      id,
      existing[0],
      updated[0],
      req
    );

    res.json({
      success: true,
      message: 'Dirección marcada como por defecto',
      data: {
        address: updated[0]
      }
    });
  } catch (error) {
    logError('Error marcando dirección como default:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar dirección como default'
    });
  }
});

// ============================================
// DELETE /api/user/addresses/:id
// ============================================
// Eliminar una dirección
// Ownership estricto: solo el dueño puede eliminar
// Si era default → reasignar otra (si existe)
// ❌ NO CACHEABLE: Datos sensibles
// 🔒 RATE LIMITED: Privado (20 req/min por usuario)
router.delete('/:id', authenticate, rateLimiters.private, [
  param('id').isInt().withMessage('ID de dirección inválido')
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

    const { id } = req.params;
    const userId = req.user.id;

    // Verificar ownership y existencia
    const existing = await query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    const wasDefault = existing[0].is_default;

    // Verificar si la dirección está en uso por algún pedido activo
    // (Opcional: solo si el pedido no está completado/cancelado)
    const ordersUsingAddress = await query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE user_id = ? 
        AND (
          shipping_name LIKE ? OR 
          shipping_street LIKE ?
        )
        AND status NOT IN ('delivered', 'cancelled', 'refunded')
      LIMIT 1
    `, [
      userId,
      `%${existing[0].first_name}%`,
      `%${existing[0].street}%`
    ]);

    // Nota: Esta validación es opcional y puede ser más estricta si se guarda address_id en orders
    // Por ahora, solo advertimos pero permitimos eliminar

    // Eliminar dirección
    await query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    // Si era default, promover otra dirección (si existe)
    if (wasDefault) {
      const otherAddresses = await query(
        'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (otherAddresses.length > 0) {
        await query(
          'UPDATE addresses SET is_default = TRUE WHERE id = ?',
          [otherAddresses[0].id]
        );
      }
    }

    // Audit log
    await auditService.logAudit(
      'ADDRESS_DELETED',
      'address',
      id,
      existing[0],
      null,
      req
    );

    res.json({
      success: true,
      message: 'Dirección eliminada exitosamente'
    });
  } catch (error) {
    logError('Error eliminando dirección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar dirección'
    });
  }
});

module.exports = router;

