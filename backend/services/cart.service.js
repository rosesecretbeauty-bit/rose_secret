// ============================================
// Cart Service - Sistema Completo de Carrito con Reservas de Stock
// ============================================
// Este servicio integra directamente con inventory.service para reservar/liberar stock
// El carrito NO descuenta stock, solo reserva. El stock se descuenta en Órdenes.

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info, warn } = require('../logger');
const inventoryService = require('./inventory.service');
const crypto = require('crypto');

// Tiempo de expiración de carrito en minutos (default: 30 minutos)
const CART_EXPIRATION_MINUTES = process.env.CART_EXPIRATION_MINUTES || 30;

/**
 * Calcular fecha de expiración
 */
function getExpirationDate() {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + CART_EXPIRATION_MINUTES);
  return expirationDate;
}

/**
 * Obtener o crear carrito para usuario o guest
 * @param {number|null} userId - ID del usuario (null para guest)
 * @param {string|null} sessionId - ID de sesión para guests
 * @returns {Promise<number|string>} Identificador del carrito (userId o sessionId)
 */
async function getOrCreateCart(userId = null, sessionId = null) {
  try {
    // Para usuarios autenticados, usar userId directamente
    if (userId) {
      return userId;
    }

    // Para guests, generar sessionId si no se proporciona
    if (!sessionId) {
      // Generar un sessionId único
      sessionId = `guest_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
      warn('SessionId generado automáticamente para guest user', { sessionId });
    }

    return sessionId;
  } catch (error) {
    logError('Error obteniendo/creando carrito:', error);
    throw error;
  }
}

/**
 * Agregar item al carrito con reserva de stock
 * @param {number|string} cartId - ID del carrito (userId o sessionId)
 * @param {object} payload - { product_id, variant_id?, quantity, price_snapshot }
 * @returns {Promise<object>} Item agregado
 */
async function addItem(cartId, payload) {
  try {
    const { product_id, variant_id, quantity, price_snapshot } = payload;

    // Validar cantidad máxima por item (prevenir abuso)
    const MAX_QUANTITY_PER_ITEM = parseInt(process.env.MAX_CART_ITEM_QUANTITY || '10', 10);
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error(`La cantidad máxima por producto es ${MAX_QUANTITY_PER_ITEM}. Si necesitas más, contacta a nuestro equipo.`);
    }

    // Validar que se proporcione variant_id si el producto tiene variantes
    if (!variant_id) {
      // Verificar si el producto tiene variantes activas
      const variantsCheck = await query(`
        SELECT COUNT(*) as count 
        FROM product_variants 
        WHERE product_id = ? AND is_active = TRUE AND deleted_at IS NULL
      `, [product_id]);

      if (variantsCheck[0].count > 0) {
        throw new Error('Este producto requiere seleccionar una variante');
      }
    }

    // Validar stock disponible ANTES de reservar
    if (variant_id) {
      const stockValidation = await inventoryService.validateStock(variant_id, quantity);
      if (!stockValidation.valid) {
        throw new Error(stockValidation.message || 'Stock insuficiente');
      }
    }

    // Determinar si es usuario autenticado o guest
    const isUserId = typeof cartId === 'number';
    const userId = isUserId ? cartId : null;
    const sessionId = isUserId ? null : cartId;

    // Si es guest, retornar datos para manejar en frontend (no se reserva stock)
    if (!isUserId) {
      warn('Guest cart item - stock not reserved', { product_id, variant_id, quantity });
      return {
        id: `guest_${Date.now()}`,
        product_id,
        variant_id: variant_id || null,
        quantity,
        price_snapshot,
        is_guest: true
      };
    }

    // Para usuarios autenticados, proceder con reserva de stock
    return await transaction(async (connection) => {
      // Verificar si el item ya existe en el carrito
      const existingItems = await queryWithConnection(connection, `
        SELECT id, quantity, price_snapshot 
        FROM cart_items 
        WHERE user_id = ? AND product_id = ? 
          AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
        LIMIT 1
        FOR UPDATE
      `, [userId, product_id, variant_id || null, variant_id || null]);

      let cartItemId;
      let finalQuantity;
      let finalPriceSnapshot;

      if (existingItems.length > 0) {
        // Item existe, actualizar cantidad
        const existingItem = existingItems[0];
        cartItemId = existingItem.id;
        const oldQuantity = existingItem.quantity;
        finalQuantity = oldQuantity + quantity;
        
        // Validar cantidad máxima por item después de actualizar
        const MAX_QUANTITY_PER_ITEM = parseInt(process.env.MAX_CART_ITEM_QUANTITY || '10', 10);
        if (finalQuantity > MAX_QUANTITY_PER_ITEM) {
          throw new Error(`La cantidad máxima por producto es ${MAX_QUANTITY_PER_ITEM}. Actualmente tienes ${oldQuantity}, no puedes agregar más.`);
        }
        
        finalPriceSnapshot = existingItem.price_snapshot; // Mantener precio original

        // Liberar reserva anterior
        if (variant_id && oldQuantity > 0) {
          await inventoryService.releaseStock(variant_id, oldQuantity, 'cart', cartItemId);
        }

        // Validar stock con nueva cantidad
        if (variant_id) {
          const stockValidation = await inventoryService.validateStock(variant_id, finalQuantity);
          if (!stockValidation.valid) {
            throw new Error(stockValidation.message || 'Stock insuficiente');
          }

          // Reservar nueva cantidad
          await inventoryService.reserveStock(variant_id, finalQuantity, 'cart', cartItemId);
        }

        // Actualizar item
        const expirationDate = getExpirationDate();
        await queryWithConnection(connection, `
          UPDATE cart_items 
          SET quantity = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [finalQuantity, expirationDate, cartItemId]);

        info('Cart item quantity updated with stock reservation', {
          cartItemId,
          variant_id,
          oldQuantity,
          finalQuantity
        });
      } else {
        // Item no existe, crear nuevo
        finalQuantity = quantity;
        finalPriceSnapshot = price_snapshot;

        // Crear item primero (sin reserva aún)
        const expirationDate = getExpirationDate();
        const result = await queryWithConnection(connection, `
          INSERT INTO cart_items (
            user_id, session_id, product_id, variant_id, 
            quantity, price_snapshot, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, null, product_id, variant_id || null, quantity, price_snapshot, expirationDate]);

        cartItemId = result.insertId || (Array.isArray(result) && result[0]?.id) || result.id;

        // Reservar stock DESPUÉS de crear el item (para tener cartItemId como referencia)
        if (variant_id) {
          await inventoryService.reserveStock(variant_id, quantity, 'cart', cartItemId);
        }

        info('Cart item created with stock reservation', {
          cartItemId,
          variant_id,
          quantity
        });
      }

      return {
        id: cartItemId,
        quantity: finalQuantity,
        price_snapshot: finalPriceSnapshot
      };
    });
  } catch (error) {
    logError('Error agregando item al carrito:', error);
    throw error;
  }
}

/**
 * Actualizar cantidad de un item del carrito con ajuste de reserva
 * @param {number} cartItemId - ID del item del carrito
 * @param {number} quantity - Nueva cantidad
 * @param {number|null} userId - ID del usuario (para validar propiedad)
 * @returns {Promise<object>} Item actualizado
 */
async function updateItem(cartItemId, quantity, userId = null) {
  try {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Validar cantidad máxima por item
    const MAX_QUANTITY_PER_ITEM = parseInt(process.env.MAX_CART_ITEM_QUANTITY || '10', 10);
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error(`La cantidad máxima por producto es ${MAX_QUANTITY_PER_ITEM}. Si necesitas más, contacta a nuestro equipo.`);
    }

    return await transaction(async (connection) => {
      // Obtener item actual con bloqueo
      let itemQuery = `
        SELECT * FROM cart_items 
        WHERE id = ?
        FOR UPDATE
      `;
      const params = [cartItemId];

      if (userId) {
        itemQuery = itemQuery.replace('WHERE', 'WHERE user_id = ? AND');
        params.unshift(userId);
      }

      const items = await queryWithConnection(connection, itemQuery, params);

      if (items.length === 0) {
        throw new Error('Item del carrito no encontrado');
      }

      const item = items[0];
      const oldQuantity = item.quantity;

      // Si la cantidad no cambió, solo actualizar expires_at
      if (oldQuantity === quantity) {
        const expirationDate = getExpirationDate();
        await queryWithConnection(connection, `
          UPDATE cart_items 
          SET expires_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [expirationDate, cartItemId]);

        return {
          id: cartItemId,
          quantity,
          price_snapshot: item.price_snapshot
        };
      }

      // Si hay variant_id, ajustar reserva de stock
      if (item.variant_id) {
        const quantityDiff = quantity - oldQuantity;

        if (quantityDiff > 0) {
          // Aumentar cantidad - validar y reservar stock adicional
          const stockValidation = await inventoryService.validateStock(item.variant_id, quantity);
          if (!stockValidation.valid) {
            throw new Error(stockValidation.message || 'Stock insuficiente');
          }
          await inventoryService.reserveStock(item.variant_id, quantityDiff, 'cart', cartItemId);
        } else {
          // Disminuir cantidad - liberar stock
          await inventoryService.releaseStock(item.variant_id, Math.abs(quantityDiff), 'cart', cartItemId);
        }
      }

      // Actualizar item
      const expirationDate = getExpirationDate();
      await queryWithConnection(connection, `
        UPDATE cart_items 
        SET quantity = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [quantity, expirationDate, cartItemId]);

      info('Cart item updated with stock adjustment', {
        cartItemId,
        variant_id: item.variant_id,
        oldQuantity,
        newQuantity: quantity
      });

      return {
        id: cartItemId,
        quantity,
        price_snapshot: item.price_snapshot
      };
    });
  } catch (error) {
    logError('Error actualizando item del carrito:', error);
    throw error;
  }
}

/**
 * Eliminar item del carrito y liberar reserva de stock
 * @param {number} cartItemId - ID del item del carrito
 * @param {number|null} userId - ID del usuario (para validar propiedad)
 * @returns {Promise<void>}
 */
async function removeItem(cartItemId, userId = null) {
  try {
    return await transaction(async (connection) => {
      // Obtener item antes de eliminar (para liberar stock)
      let itemQuery = 'SELECT * FROM cart_items WHERE id = ?';
      const params = [cartItemId];

      if (userId) {
        itemQuery += ' AND user_id = ?';
        params.push(userId);
      }

      const items = await queryWithConnection(connection, itemQuery, params);

      if (items.length === 0) {
        throw new Error('Item del carrito no encontrado');
      }

      const item = items[0];

      // Liberar stock reservado ANTES de eliminar
      if (item.variant_id && item.quantity > 0) {
        await inventoryService.releaseStock(
          item.variant_id,
          item.quantity,
          'cart',
          cartItemId
        );
      }

      // Eliminar item
      await queryWithConnection(connection, `
        DELETE FROM cart_items WHERE id = ?
      `, [cartItemId]);

      info('Cart item removed and stock released', {
        cartItemId,
        variant_id: item.variant_id,
        quantity: item.quantity
      });
    });
  } catch (error) {
    logError('Error eliminando item del carrito:', error);
    throw error;
  }
}

/**
 * Vaciar carrito y liberar todas las reservas
 * @param {number|string} cartId - ID del carrito (userId o sessionId)
 * @returns {Promise<void>}
 */
async function clearCart(cartId) {
  try {
    const isUserId = typeof cartId === 'number';
    const userId = isUserId ? cartId : null;
    const sessionId = isUserId ? null : cartId;

    return await transaction(async (connection) => {
      // Obtener todos los items del carrito con bloqueo
      let itemsQuery = 'SELECT * FROM cart_items WHERE';
      const params = [];

      if (userId) {
        itemsQuery += ' user_id = ?';
        params.push(userId);
      } else {
        itemsQuery += ' session_id = ?';
        params.push(sessionId);
      }

      const items = await queryWithConnection(connection, itemsQuery, params);

      // Liberar stock de todos los items
      for (const item of items) {
        if (item.variant_id && item.quantity > 0) {
          try {
            await inventoryService.releaseStock(
              item.variant_id,
              item.quantity,
              'cart',
              item.id
            );
          } catch (error) {
            warn('Error releasing stock when clearing cart', {
              cartItemId: item.id,
              variant_id: item.variant_id,
              error: error.message
            });
          }
        }
      }

      // Eliminar todos los items
      let deleteQuery = 'DELETE FROM cart_items WHERE';
      const deleteParams = [];

      if (userId) {
        deleteQuery += ' user_id = ?';
        deleteParams.push(userId);
      } else {
        deleteQuery += ' session_id = ?';
        deleteParams.push(sessionId);
      }

      await queryWithConnection(connection, deleteQuery, deleteParams);

      info('Cart cleared and all stock reservations released', {
        userId,
        sessionId,
        itemsCount: items.length
      });
    });
  } catch (error) {
    logError('Error vaciando carrito:', error);
    throw error;
  }
}

/**
 * Expirar carritos y liberar reservas (para uso con cron)
 * @param {number} maxAgeMinutes - Edad máxima en minutos (default: CART_EXPIRATION_MINUTES)
 * @returns {Promise<{expired: number, released: number}>}
 */
async function expireCarts(maxAgeMinutes = null) {
  try {
    const expirationMinutes = maxAgeMinutes || CART_EXPIRATION_MINUTES;
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - expirationMinutes);

    return await transaction(async (connection) => {
      // Obtener items expirados
      const expiredItems = await queryWithConnection(connection, `
        SELECT * FROM cart_items 
        WHERE expires_at IS NOT NULL AND expires_at < ?
        FOR UPDATE
      `, [expirationDate]);

      let releasedCount = 0;

      // Liberar stock de items expirados
      for (const item of expiredItems) {
        if (item.variant_id && item.quantity > 0) {
          try {
            await inventoryService.releaseStock(
              item.variant_id,
              item.quantity,
              'cart',
              item.id
            );
            releasedCount += item.quantity;
          } catch (error) {
            warn('Error releasing stock for expired cart item', {
              cartItemId: item.id,
              variant_id: item.variant_id,
              error: error.message
            });
          }
        }
      }

      // Eliminar items expirados
      const deleteResult = await queryWithConnection(connection, `
        DELETE FROM cart_items 
        WHERE expires_at IS NOT NULL AND expires_at < ?
      `, [expirationDate]);

      const expiredCount = deleteResult.affectedRows || expiredItems.length;

      info('Expired carts processed', {
        expiredCount,
        releasedStockCount: releasedCount
      });

      return {
        expired: expiredCount,
        released: releasedCount
      };
    });
  } catch (error) {
    logError('Error expirando carritos:', error);
    throw error;
  }
}

/**
 * Obtener carrito completo
 * @param {number|string} cartId - ID del carrito (userId o sessionId)
 * @returns {Promise<object>} { items, subtotal, itemCount, expires_at }
 */
async function getCart(cartId) {
  try {
    const isUserId = typeof cartId === 'number';
    const userId = isUserId ? cartId : null;
    const sessionId = isUserId ? null : cartId;

    // Para guests, retornar carrito vacío (se maneja en frontend)
    if (!isUserId) {
      return {
        items: [],
        subtotal: 0,
        itemCount: 0,
        expires_at: null
      };
    }

    // Obtener items del carrito con información completa
    const cartItems = await query(`
      SELECT 
        ci.id,
        ci.quantity,
        ci.variant_id,
        ci.price_snapshot,
        ci.expires_at,
        ci.created_at,
        ci.updated_at,
        p.id as product_id,
        p.name,
        p.description,
        p.price as product_price,
        p.category_id,
        p.brand,
        p.is_active,
        pv.id as variant_id_check,
        pv.name as variant_name,
        pv.price as variant_price,
        pv.is_active as variant_is_active
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id AND pv.deleted_at IS NULL
      WHERE ci.user_id = ? AND p.is_active = TRUE
        AND (ci.expires_at IS NULL OR ci.expires_at > NOW())
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Obtener imágenes de cada producto
    for (let item of cartItems) {
      const images = await query(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC LIMIT 1',
        [item.product_id]
      );
      item.image_url = images.length > 0 ? images[0].image_url : null;
    }

    // Procesar items
    const processedItems = cartItems.map(item => {
      // Usar price_snapshot (precio congelado)
      const finalPrice = parseFloat(item.price_snapshot || 0);

      return {
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: finalPrice,
        price_snapshot: item.price_snapshot,
        subtotal: finalPrice * item.quantity,
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        variant_name: item.variant_name || null,
        expires_at: item.expires_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    });

    // Validar cantidad total de items en carrito (prevenir abuso)
    const MAX_TOTAL_ITEMS = parseInt(process.env.MAX_CART_TOTAL_ITEMS || '50', 10);
    const itemCount = processedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    if (itemCount > MAX_TOTAL_ITEMS) {
      warn('Cart exceeds maximum items limit', {
        userId,
        itemCount,
        maxItems: MAX_TOTAL_ITEMS
      });
      // No bloquear, solo advertir (el admin puede ajustar el límite)
    }

    // Calcular subtotal usando price_snapshot
    const subtotal = processedItems.reduce((sum, item) => {
      return sum + item.subtotal;
    }, 0);

    // Obtener la fecha de expiración más cercana
    const minExpiration = processedItems
      .filter(item => item.expires_at)
      .map(item => new Date(item.expires_at))
      .sort((a, b) => a - b)[0];

    return {
      items: processedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount,
      expires_at: minExpiration || null
    };
  } catch (error) {
    logError('Error obteniendo carrito:', error);
    throw error;
  }
}

module.exports = {
  getOrCreateCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  expireCarts,
  getCart
};
