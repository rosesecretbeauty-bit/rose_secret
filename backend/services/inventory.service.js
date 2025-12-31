// ============================================
// Inventory Service - Sistema Completo de Inventario
// ============================================
// Este servicio maneja todo el inventario de forma transaccional
// NUNCA se edita stock directamente - todo pasa por movimientos

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info, warn } = require('../logger');

/**
 * Tipos de movimiento de inventario
 */
const MOVEMENT_TYPES = {
  INITIAL: 'initial',
  ADJUSTMENT: 'adjustment',
  SALE: 'sale',
  RESERVATION: 'reservation',
  RELEASE: 'release',
  RETURN: 'return'
};

/**
 * Obtener o crear registro de inventario para una variante
 * @param {Object} connection - Conexión de transacción
 * @param {number} variantId - ID de la variante
 * @returns {Promise<Object>} Registro de inventario
 */
async function getOrCreateInventory(connection, variantId) {
  try {
    // Intentar obtener inventario existente con bloqueo
    const existing = await queryWithConnection(connection, `
      SELECT * FROM inventory 
      WHERE variant_id = ? 
      FOR UPDATE
    `, [variantId]);

    if (existing.length > 0) {
      return existing[0];
    }

    // Si no existe, crear registro inicial
    const result = await queryWithConnection(connection, `
      INSERT INTO inventory (variant_id, available_stock, reserved_stock, total_stock)
      VALUES (?, 0, 0, 0)
    `, [variantId]);

    const inventoryId = result.insertId || result[0]?.id;

    // Obtener el registro creado
    const created = await queryWithConnection(connection, `
      SELECT * FROM inventory WHERE id = ?
    `, [inventoryId]);

    return created[0];
  } catch (error) {
    logError('Error getting or creating inventory', error, { variantId });
    throw error;
  }
}

/**
 * Obtener stock disponible de una variante (sin transacción)
 * @param {number} variantId - ID de la variante
 * @returns {Promise<number>} Stock disponible
 */
async function getAvailableStock(variantId) {
  try {
    const inventory = await query(`
      SELECT available_stock 
      FROM inventory 
      WHERE variant_id = ?
      LIMIT 1
    `, [variantId]);

    if (inventory.length === 0) {
      // Si no existe registro de inventario, retornar 0
      return 0;
    }

    return inventory[0].available_stock || 0;
  } catch (error) {
    logError('Error getting available stock', error, { variantId });
    return 0; // En caso de error, retornar 0 para evitar sobreventa
  }
}

/**
 * Obtener stock reservado de una variante
 * @param {number} variantId - ID de la variante
 * @returns {Promise<number>} Stock reservado
 */
async function getReservedStock(variantId) {
  try {
    const inventory = await query(`
      SELECT reserved_stock 
      FROM inventory 
      WHERE variant_id = ?
      LIMIT 1
    `, [variantId]);

    if (inventory.length === 0) {
      return 0;
    }

    return inventory[0].reserved_stock || 0;
  } catch (error) {
    logError('Error getting reserved stock', error, { variantId });
    return 0;
  }
}

/**
 * Obtener información completa de inventario de una variante
 * @param {number} variantId - ID de la variante
 * @returns {Promise<Object>} Información de inventario
 */
async function getInventoryInfo(variantId) {
  try {
    const inventory = await query(`
      SELECT 
        available_stock,
        reserved_stock,
        total_stock,
        low_stock_threshold,
        updated_at
      FROM inventory 
      WHERE variant_id = ?
      LIMIT 1
    `, [variantId]);

    if (inventory.length === 0) {
      return {
        available_stock: 0,
        reserved_stock: 0,
        total_stock: 0,
        low_stock_threshold: 5,
        is_low_stock: false
      };
    }

    const inv = inventory[0];
    return {
      available_stock: inv.available_stock || 0,
      reserved_stock: inv.reserved_stock || 0,
      total_stock: inv.total_stock || 0,
      low_stock_threshold: inv.low_stock_threshold || 5,
      is_low_stock: (inv.available_stock || 0) <= (inv.low_stock_threshold || 5),
      updated_at: inv.updated_at
    };
  } catch (error) {
    logError('Error getting inventory info', error, { variantId });
    return {
      available_stock: 0,
      reserved_stock: 0,
      total_stock: 0,
      low_stock_threshold: 5,
      is_low_stock: false
    };
  }
}

/**
 * Registrar un movimiento de inventario (función interna)
 * @param {Object} connection - Conexión de transacción
 * @param {Object} movementData - Datos del movimiento
 * @returns {Promise<number>} ID del movimiento creado
 */
async function recordMovement(connection, movementData) {
  try {
    const {
      variantId,
      movementType,
      quantity,
      balanceBefore,
      balanceAfter,
      reservedBefore = 0,
      reservedAfter = 0,
      reason = null,
      referenceType = null,
      referenceId = null,
      userId = null,
      notes = null
    } = movementData;

    // Validar tipo de movimiento
    if (!Object.values(MOVEMENT_TYPES).includes(movementType)) {
      throw new Error(`Tipo de movimiento inválido: ${movementType}`);
    }

    // Insertar movimiento
    const result = await queryWithConnection(connection, `
      INSERT INTO inventory_movements (
        variant_id, movement_type, quantity, balance_before, balance_after,
        reserved_before, reserved_after, reason, reference_type, reference_id,
        user_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      variantId,
      movementType,
      quantity,
      balanceBefore,
      balanceAfter,
      reservedBefore,
      reservedAfter,
      reason,
      referenceType,
      referenceId,
      userId,
      notes
    ]);

    const movementId = result.insertId || (Array.isArray(result) && result[0]?.id) || result.id;

    info('Inventory movement recorded', {
      movementId,
      variantId,
      movementType,
      quantity,
      balanceAfter
    });

    return movementId;
  } catch (error) {
    logError('Error recording inventory movement', error, movementData);
    throw error;
  }
}

/**
 * Actualizar inventario después de un movimiento
 * @param {Object} connection - Conexión de transacción
 * @param {number} variantId - ID de la variante
 * @param {number} availableStock - Nuevo stock disponible
 * @param {number} reservedStock - Nuevo stock reservado
 * @param {number} totalStock - Nuevo total stock
 */
async function updateInventory(connection, variantId, availableStock, reservedStock, totalStock) {
  try {
    // Actualizar o insertar inventario
    const isPostgreSQL = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');
    
    if (isPostgreSQL) {
      await queryWithConnection(connection, `
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, total_stock, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (variant_id) 
        DO UPDATE SET 
          available_stock = EXCLUDED.available_stock,
          reserved_stock = EXCLUDED.reserved_stock,
          total_stock = EXCLUDED.total_stock,
          updated_at = CURRENT_TIMESTAMP
      `, [variantId, availableStock, reservedStock, totalStock]);
    } else {
      await queryWithConnection(connection, `
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, total_stock, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          available_stock = VALUES(available_stock),
          reserved_stock = VALUES(reserved_stock),
          total_stock = VALUES(total_stock),
          updated_at = CURRENT_TIMESTAMP
      `, [variantId, availableStock, reservedStock, totalStock]);
    }

    // También actualizar el campo stock en product_variants para compatibilidad
    await queryWithConnection(connection, `
      UPDATE product_variants 
      SET stock = ? 
      WHERE id = ?
    `, [availableStock, variantId]);
  } catch (error) {
    logError('Error updating inventory', error, { variantId, availableStock, reservedStock });
    throw error;
  }
}

/**
 * Inicializar stock de una variante
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad inicial
 * @param {number} userId - ID del usuario (opcional)
 * @param {string} reason - Motivo (opcional)
 * @returns {Promise<Object>} Resultado de la inicialización
 */
async function initializeStock(variantId, quantity, userId = null, reason = null) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad inicial debe ser mayor a 0');
    }

    return await transaction(async (connection) => {
      // Obtener o crear inventario con bloqueo
      const inventory = await getOrCreateInventory(connection, variantId);

      // Verificar si ya existe stock inicial
      const existingInitial = await queryWithConnection(connection, `
        SELECT id FROM inventory_movements 
        WHERE variant_id = ? AND movement_type = 'initial'
        LIMIT 1
      `, [variantId]);

      if (existingInitial.length > 0) {
        throw new Error('El stock inicial ya fue establecido para esta variante. Use ajuste para modificar.');
      }

      const balanceBefore = inventory.available_stock || 0;
      const balanceAfter = quantity;

      // Registrar movimiento
      await recordMovement(connection, {
        variantId,
        movementType: MOVEMENT_TYPES.INITIAL,
        quantity,
        balanceBefore,
        balanceAfter,
        reason: reason || 'Stock inicial',
        userId
      });

      // Actualizar inventario
      await updateInventory(connection, variantId, balanceAfter, 0, quantity);

      return {
        variant_id: variantId,
        initial_stock: quantity,
        available_stock: balanceAfter
      };
    });
  } catch (error) {
    logError('Error initializing stock', error, { variantId, quantity });
    throw error;
  }
}

/**
 * Ajustar stock (incremento o decremento manual)
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad (positiva para incremento, negativa para decremento)
 * @param {number} userId - ID del usuario
 * @param {string} reason - Motivo del ajuste
 * @param {string} notes - Notas adicionales
 * @returns {Promise<Object>} Resultado del ajuste
 */
async function adjustStock(variantId, quantity, userId, reason, notes = null) {
  try {
    if (quantity === 0) {
      throw new Error('La cantidad del ajuste no puede ser 0');
    }

    return await transaction(async (connection) => {
      // Obtener inventario con bloqueo
      const inventory = await getOrCreateInventory(connection, variantId);

      const balanceBefore = inventory.available_stock || 0;
      const balanceAfter = balanceBefore + quantity;

      // Validar que no quede stock negativo
      if (balanceAfter < 0) {
        throw new Error(`Stock insuficiente. Disponible: ${balanceBefore}, Ajuste: ${quantity}`);
      }

      // Registrar movimiento
      await recordMovement(connection, {
        variantId,
        movementType: MOVEMENT_TYPES.ADJUSTMENT,
        quantity,
        balanceBefore,
        balanceAfter,
        reservedBefore: inventory.reserved_stock || 0,
        reservedAfter: inventory.reserved_stock || 0,
        reason: reason || 'Ajuste manual',
        referenceType: 'adjustment',
        userId,
        notes
      });

      // Actualizar inventario
      const totalStock = (inventory.total_stock || 0) + (quantity > 0 ? quantity : 0);
      await updateInventory(connection, variantId, balanceAfter, inventory.reserved_stock || 0, totalStock);

      return {
        variant_id: variantId,
        adjustment: quantity,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      };
    });
  } catch (error) {
    logError('Error adjusting stock', error, { variantId, quantity });
    throw error;
  }
}

/**
 * Reservar stock (para carrito u orden pendiente)
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad a reservar
 * @param {string} referenceType - Tipo de referencia (cart, order)
 * @param {number} referenceId - ID de la referencia
 * @returns {Promise<Object>} Resultado de la reserva
 */
async function reserveStock(variantId, quantity, referenceType, referenceId) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad a reservar debe ser mayor a 0');
    }

    // FASE 3: Usar lock distribuido si Redis está disponible, sino usar lock de DB
    const lockKey = `stock:variant:${variantId}`;
    
    return await withDistributedLock(lockKey, async () => {
      return await transaction(async (connection) => {
      // Obtener inventario con bloqueo
      const inventory = await getOrCreateInventory(connection, variantId);

      const availableBefore = inventory.available_stock || 0;
      const reservedBefore = inventory.reserved_stock || 0;

      // Validar stock disponible
      if (availableBefore < quantity) {
        throw new Error(`Stock insuficiente para reservar. Disponible: ${availableBefore}, Solicitado: ${quantity}`);
      }

      const availableAfter = availableBefore - quantity;
      const reservedAfter = reservedBefore + quantity;

      // Registrar movimiento
      await recordMovement(connection, {
        variantId,
        movementType: MOVEMENT_TYPES.RESERVATION,
        quantity: -quantity, // Negativo porque reduce disponible
        balanceBefore: availableBefore,
        balanceAfter: availableAfter,
        reservedBefore,
        reservedAfter,
        reason: `Reserva para ${referenceType}`,
        referenceType,
        referenceId
      });

      // Actualizar inventario
      await updateInventory(
        connection,
        variantId,
        availableAfter,
        reservedAfter,
        inventory.total_stock || 0
      );

        return {
          variant_id: variantId,
          reserved_quantity: quantity,
          available_before: availableBefore,
          available_after: availableAfter,
          reserved_after: reservedAfter
        };
      });
    }, {
      ttlMs: 5000, // 5 segundos
      maxRetries: 3,
      retryDelayMs: 100,
      useDatabaseLock: true
    });
  } catch (error) {
    logError('Error reserving stock', error, { variantId, quantity, referenceType, referenceId });
    throw error;
  }
}

/**
 * Liberar stock reservado
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad a liberar
 * @param {string} referenceType - Tipo de referencia
 * @param {number} referenceId - ID de la referencia
 * @returns {Promise<Object>} Resultado de la liberación
 */
async function releaseStock(variantId, quantity, referenceType, referenceId) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad a liberar debe ser mayor a 0');
    }

    // FASE 3: Usar lock distribuido si Redis está disponible
    const lockKey = `stock:variant:${variantId}`;
    
    return await withDistributedLock(lockKey, async () => {
      return await transaction(async (connection) => {
        // Obtener inventario con bloqueo
        const inventory = await getOrCreateInventory(connection, variantId);

        const availableBefore = inventory.available_stock || 0;
        const reservedBefore = inventory.reserved_stock || 0;

        // Validar que haya suficiente stock reservado
        if (reservedBefore < quantity) {
          warn('Attempting to release more stock than reserved', {
            variantId,
            reservedBefore,
            quantity
          });
          // Liberar solo lo que hay disponible
          quantity = reservedBefore;
        }

        const availableAfter = availableBefore + quantity;
        const reservedAfter = reservedBefore - quantity;

        // Registrar movimiento
        await recordMovement(connection, {
          variantId,
          movementType: MOVEMENT_TYPES.RELEASE,
          quantity, // Positivo porque aumenta disponible
          balanceBefore: availableBefore,
          balanceAfter: availableAfter,
          reservedBefore,
          reservedAfter,
          reason: `Liberación de reserva para ${referenceType}`,
          referenceType,
          referenceId
        });

        // Actualizar inventario
        await updateInventory(
          connection,
          variantId,
          availableAfter,
          reservedAfter,
          inventory.total_stock || 0
        );

        return {
          variant_id: variantId,
          released_quantity: quantity,
          available_before: availableBefore,
          available_after: availableAfter,
          reserved_after: reservedAfter
        };
      });
    }, {
      ttlMs: 5000,
      maxRetries: 3,
      retryDelayMs: 100,
      useDatabaseLock: true
    });
  } catch (error) {
    logError('Error releasing stock', error, { variantId, quantity, referenceType, referenceId });
    throw error;
  }
}

/**
 * Registrar venta (descuento permanente del stock)
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad vendida
 * @param {number} orderId - ID de la orden
 * @returns {Promise<Object>} Resultado de la venta
 */
async function recordSale(variantId, quantity, orderId) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad vendida debe ser mayor a 0');
    }

    return await transaction(async (connection) => {
      // Obtener inventario con bloqueo
      const inventory = await getOrCreateInventory(connection, variantId);

      const availableBefore = inventory.available_stock || 0;
      const reservedBefore = inventory.reserved_stock || 0;

      // Validar stock disponible
      if (availableBefore < quantity) {
        throw new Error(`Stock insuficiente para venta. Disponible: ${availableBefore}, Solicitado: ${quantity}`);
      }

      // Si había stock reservado, primero liberar esa cantidad
      let reservedAfter = reservedBefore;
      if (reservedBefore >= quantity) {
        reservedAfter = reservedBefore - quantity;
      } else {
        reservedAfter = 0;
      }

      const availableAfter = availableBefore - quantity;

      // Registrar movimiento
      await recordMovement(connection, {
        variantId,
        movementType: MOVEMENT_TYPES.SALE,
        quantity: -quantity,
        balanceBefore: availableBefore,
        balanceAfter: availableAfter,
        reservedBefore,
        reservedAfter,
        reason: 'Venta realizada',
        referenceType: 'order',
        referenceId: orderId
      });

      // Actualizar inventario
      await updateInventory(
        connection,
        variantId,
        availableAfter,
        reservedAfter,
        inventory.total_stock || 0
      );

      return {
        variant_id: variantId,
        sold_quantity: quantity,
        available_before: availableBefore,
        available_after: availableAfter
      };
    });
  } catch (error) {
    logError('Error recording sale', error, { variantId, quantity, orderId });
    throw error;
  }
}

/**
 * Registrar devolución (incremento del stock)
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad devuelta
 * @param {number} orderId - ID de la orden
 * @param {string} reason - Motivo de la devolución
 * @returns {Promise<Object>} Resultado de la devolución
 */
async function recordReturn(variantId, quantity, orderId, reason = null) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad devuelta debe ser mayor a 0');
    }

    return await transaction(async (connection) => {
      // Obtener inventario con bloqueo
      const inventory = await getOrCreateInventory(connection, variantId);

      const balanceBefore = inventory.available_stock || 0;
      const balanceAfter = balanceBefore + quantity;

      // Registrar movimiento
      await recordMovement(connection, {
        variantId,
        movementType: MOVEMENT_TYPES.RETURN,
        quantity,
        balanceBefore,
        balanceAfter,
        reservedBefore: inventory.reserved_stock || 0,
        reservedAfter: inventory.reserved_stock || 0,
        reason: reason || 'Devolución de producto',
        referenceType: 'order',
        referenceId: orderId
      });

      // Actualizar inventario (el total_stock no cambia en devoluciones)
      await updateInventory(
        connection,
        variantId,
        balanceAfter,
        inventory.reserved_stock || 0,
        inventory.total_stock || 0
      );

      return {
        variant_id: variantId,
        returned_quantity: quantity,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      };
    });
  } catch (error) {
    logError('Error recording return', error, { variantId, quantity, orderId });
    throw error;
  }
}

/**
 * Obtener historial de movimientos de una variante
 * @param {number} variantId - ID de la variante
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Object>} Historial de movimientos
 */
async function getMovementHistory(variantId, options = {}) {
  try {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    // Obtener total de movimientos
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM inventory_movements 
      WHERE variant_id = ?
    `, [variantId]);

    const total = countResult[0]?.total || 0;

    // Obtener movimientos
    const movements = await query(`
      SELECT 
        id,
        variant_id,
        movement_type,
        quantity,
        balance_before,
        balance_after,
        reserved_before,
        reserved_after,
        reason,
        reference_type,
        reference_id,
        user_id,
        notes,
        created_at
      FROM inventory_movements
      WHERE variant_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [variantId, limit, offset]);

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logError('Error getting movement history', error, { variantId });
    throw error;
  }
}

/**
 * Validar stock suficiente antes de operar
 * @param {number} variantId - ID de la variante
 * @param {number} quantity - Cantidad necesaria
 * @returns {Promise<{valid: boolean, available: number, message?: string}>}
 */
async function validateStock(variantId, quantity) {
  try {
    const available = await getAvailableStock(variantId);

    if (available < quantity) {
      return {
        valid: false,
        available,
        message: `Stock insuficiente. Disponible: ${available}, Solicitado: ${quantity}`
      };
    }

    return {
      valid: true,
      available
    };
  } catch (error) {
    logError('Error validating stock', error, { variantId, quantity });
    return {
      valid: false,
      available: 0,
      message: 'Error al validar stock'
    };
  }
}

module.exports = {
  MOVEMENT_TYPES,
  getAvailableStock,
  getReservedStock,
  getInventoryInfo,
  initializeStock,
  adjustStock,
  reserveStock,
  releaseStock,
  recordSale,
  recordReturn,
  getMovementHistory,
  validateStock
};

