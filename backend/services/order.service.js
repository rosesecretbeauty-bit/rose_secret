// ============================================
// Order Service - Sistema Completo de Órdenes
// ============================================
// Este servicio integra directamente con cart.service e inventory.service
// Las órdenes son inmutables (solo cambia estado)

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info, warn } = require('../logger');
const cartService = require('./cart.service');
const inventoryService = require('./inventory.service');
const { validatePriceConsistency, validateOrderStatusTransition } = require('../middleware/businessValidation');

/**
 * Estados de orden permitidos
 */
const ORDER_STATUS = {
  PENDING: 'pending',        // Orden creada, pendiente de pago
  PAID: 'paid',              // Pago confirmado, stock descontado
  CANCELLED: 'cancelled',    // Orden cancelada, reservas liberadas
  FAILED: 'failed',          // Pago fallido, reservas liberadas
  REFUNDED: 'refunded'       // Reembolsada, stock devuelto
};

/**
 * Generar número de orden único
 */
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RS-${timestamp}-${random}`;
}

/**
 * Registrar cambio de estado en historial
 * @param {Object} connection - Conexión de transacción
 * @param {number} orderId - ID de la orden
 * @param {string} oldStatus - Estado anterior
 * @param {string} newStatus - Estado nuevo
 * @param {string} paymentStatus - Estado de pago (opcional)
 * @param {number} changedBy - ID del usuario que cambió (opcional)
 * @param {string} notes - Notas (opcional)
 */
async function recordStatusChange(connection, orderId, oldStatus, newStatus, paymentStatus = null, changedBy = null, notes = null) {
  try {
    // Si oldStatus es null (orden nueva), usar 'none' como estado inicial
    const previousStatus = oldStatus || 'none';
    
    await queryWithConnection(connection, `
      INSERT INTO order_status_history (
        order_id, status, new_status, payment_status, changed_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [orderId, previousStatus, newStatus, paymentStatus, changedBy, notes]);

    // Actualizar previous_status en orders
    await queryWithConnection(connection, `
      UPDATE orders 
      SET previous_status = ? 
      WHERE id = ?
    `, [oldStatus, orderId]);
  } catch (error) {
    logError('Error recording status change', error, { orderId, oldStatus, newStatus });
    throw error;
  }
}

/**
 * Crear orden desde carrito
 * @param {number} userId - ID del usuario
 * @param {object} addressPayload - Datos de dirección
 * @param {object} totals - { subtotal, shipping_cost, tax, total }
 * @returns {Promise<object>} Orden creada
 */
async function createOrderFromCart(userId, addressPayload, totals) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener carrito
      const cart = await cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // 2. Validar stock de todos los items (usando inventario)
      for (const item of cart.items) {
        if (item.variant_id) {
          const stockValidation = await inventoryService.validateStock(item.variant_id, item.quantity);
          if (!stockValidation.valid) {
            throw new Error(`Stock insuficiente para ${item.name || 'producto'}: ${stockValidation.message}`);
          }
        }
      }

      // 2.5. Validar consistencia de precios (precios no deben haber cambiado)
      await validatePriceConsistency(cart.items);

      // 3. Generar número de orden
      const orderNumber = generateOrderNumber();

      // 4. Crear orden con estado 'pending'
      const orderResult = await queryWithConnection(connection, `
        INSERT INTO orders (
          order_number, user_id, status, payment_status,
          subtotal, shipping_cost, tax, discount, total,
          shipping_name, shipping_street, shipping_city,
          shipping_state, shipping_zip, shipping_country, shipping_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderNumber,
        userId,
        ORDER_STATUS.PENDING,
        'pending',
        totals.subtotal,
        totals.shipping_cost || 0,
        totals.tax || 0,
        totals.discount || 0,
        totals.total,
        addressPayload.shipping_name,
        addressPayload.shipping_street,
        addressPayload.shipping_city,
        addressPayload.shipping_state,
        addressPayload.shipping_zip,
        addressPayload.shipping_country,
        addressPayload.shipping_phone || null
      ]);

      const orderId = orderResult.insertId || (Array.isArray(orderResult) && orderResult[0]?.id) || orderResult.id;

      // 5. Registrar estado inicial en historial
      await recordStatusChange(
        connection,
        orderId,
        null,
        ORDER_STATUS.PENDING,
        'pending',
        userId,
        'Orden creada desde carrito'
      );

      // 6. Crear order_items con precios congelados del carrito
      for (const item of cart.items) {
        // Usar price_snapshot del carrito (precio congelado)
        const priceSnapshot = parseFloat(item.price_snapshot || item.price || 0);
        const subtotal = priceSnapshot * item.quantity;

        // Obtener SKU del producto o variante
        let productSku = null;
        if (item.variant_id) {
          const variants = await queryWithConnection(connection, `
            SELECT sku FROM product_variants WHERE id = ? LIMIT 1
          `, [item.variant_id]);
          productSku = variants.length > 0 ? variants[0].sku : null;
        } else {
          const products = await queryWithConnection(connection, `
            SELECT sku FROM products WHERE id = ? LIMIT 1
          `, [item.product_id]);
          productSku = products.length > 0 ? products[0].sku : null;
        }

        await queryWithConnection(connection, `
          INSERT INTO order_items (
            order_id, product_id, variant_id,
            product_name, product_sku, variant_name,
            product_price, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          item.product_id,
          item.variant_id || null,
          item.name || 'Producto',
          productSku,
          item.variant_name || null,
          priceSnapshot,
          item.quantity,
          subtotal
        ]);
      }

      // 7. IMPORTANTE: NO liberar reservas ni descontar stock todavía
      // Las reservas del carrito se mantienen hasta que se confirme el pago
      // El stock se descuenta solo cuando el estado cambia a 'paid'
      
      // NOTA: NO vaciamos el carrito aquí porque eso liberaría las reservas
      // El carrito se vaciará cuando se confirme el pago (en confirmPayment)
      // O si la orden se cancela/falla, las reservas se liberan automáticamente

      info('Order created from cart', {
        orderId,
        orderNumber,
        userId,
        itemsCount: cart.items.length
      });

      // 9. Obtener orden completa
      const order = await getOrderById(orderId, userId);

      return order;
    });
  } catch (error) {
    logError('Error creating order from cart', error, { userId });
    throw error;
  }
}

/**
 * Confirmar pago de una orden (cambiar a 'paid')
 * Convierte reservas en ventas y descuenta stock permanentemente
 * @param {number} orderId - ID de la orden
 * @param {number} paymentIntentId - ID del payment intent (opcional)
 * @returns {Promise<object>} Orden actualizada
 */
async function confirmPayment(orderId, paymentIntentId = null) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener orden actual
      const orders = await queryWithConnection(connection, `
        SELECT * FROM orders WHERE id = ? FOR UPDATE
      `, [orderId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];

      // 2. Validar que el estado permita confirmar pago
      if (order.status !== ORDER_STATUS.PENDING) {
        throw new Error(`No se puede confirmar pago de una orden en estado: ${order.status}`);
      }

      // 3. Obtener items de la orden
      const items = await queryWithConnection(connection, `
        SELECT * FROM order_items WHERE order_id = ?
      `, [orderId]);

      // 4. Para cada item, convertir reserva en venta
      for (const item of items) {
        if (item.variant_id) {
          // Liberar reserva del carrito (las reservas están asociadas al carrito)
          // Nota: Esto libera la reserva que se hizo cuando se agregó al carrito
          try {
            await inventoryService.releaseStock(item.variant_id, item.quantity, 'cart', null);
          } catch (error) {
            // Si no hay reserva, continuar (puede que ya se haya liberado)
            warn('No reservation to release for order item', {
              orderId,
              variantId: item.variant_id,
              quantity: item.quantity
            });
          }

          // Registrar venta (descuento permanente del stock)
          await inventoryService.recordSale(item.variant_id, item.quantity, orderId);
        }
      }

      // 5. Vaciar carrito después de confirmar pago
      try {
        await cartService.clearCart(order.user_id);
      } catch (error) {
        // Si el carrito ya está vacío o hay error, continuar
        warn('Error clearing cart after payment confirmation', {
          orderId,
          userId: order.user_id,
          error: error.message
        });
      }

      // 5. Actualizar estado de la orden
      await queryWithConnection(connection, `
        UPDATE orders 
        SET status = ?, payment_status = ?, payment_intent_id = ?
        WHERE id = ?
      `, [ORDER_STATUS.PAID, 'paid', paymentIntentId, orderId]);

      // 6. Registrar cambio de estado
      await recordStatusChange(
        connection,
        orderId,
        ORDER_STATUS.PENDING,
        ORDER_STATUS.PAID,
        'paid',
        null, // Sistema
        paymentIntentId ? `Pago confirmado: ${paymentIntentId}` : 'Pago confirmado'
      );

      info('Order payment confirmed', {
        orderId,
        paymentIntentId,
        itemsCount: items.length
      });

      // 7. Otorgar puntos de loyalty (NO BLOQUEA si falla)
      try {
        const loyaltyService = require('./loyalty.service');
        const userPoints = await loyaltyService.getOrCreateLoyaltyPoints(order.user_id);
        
        // Obtener tier actual para calcular multiplicador
        const tiers = await queryWithConnection(connection,
          'SELECT points_multiplier FROM loyalty_tiers WHERE id = ?',
          [userPoints.tier_id]
        );
        
        const multiplier = tiers.length > 0 ? parseFloat(tiers[0].points_multiplier) : 1.0;
        
        // Calcular puntos: 1 punto por cada dólar gastado, multiplicado por el tier
        const pointsToAward = Math.floor(parseFloat(order.total) * multiplier);
        
        if (pointsToAward > 0) {
          await loyaltyService.addPoints(
            order.user_id,
            pointsToAward,
            'order_payment',
            orderId,
            orderId,
            `Puntos por compra - Orden #${order.order_number}`
          );
          
          info('Loyalty points awarded', {
            userId: order.user_id,
            orderId,
            points: pointsToAward,
            multiplier
          });
        }
      } catch (loyaltyError) {
        // No fallar la confirmación de pago si falla el sistema de loyalty
        warn('Error awarding loyalty points (non-blocking)', {
          orderId,
          userId: order.user_id,
          error: loyaltyError.message
        });
      }

      // 8. Verificar y otorgar badges automáticamente (NO BLOQUEA)
      try {
        const badgesService = require('./badges.service');
        await badgesService.checkAndAwardBadges(order.user_id);
      } catch (badgesError) {
        warn('Error checking badges (non-blocking)', {
          orderId,
          userId: order.user_id,
          error: badgesError.message
        });
      }

      // 9. Obtener orden actualizada
      const updatedOrder = await getOrderById(orderId);

      return updatedOrder;
    });
  } catch (error) {
    logError('Error confirming payment', error, { orderId, paymentIntentId });
    throw error;
  }
}

/**
 * Cancelar una orden
 * Libera reservas si aún existen, o registra devolución si ya se pagó
 * @param {number} orderId - ID de la orden
 * @param {number} userId - ID del usuario que cancela (opcional, para validar propiedad)
 * @param {string} reason - Motivo de cancelación (opcional)
 * @returns {Promise<object>} Orden cancelada
 */
async function cancelOrder(orderId, userId = null, reason = null) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener orden actual
      let orderQuery = 'SELECT * FROM orders WHERE id = ? FOR UPDATE';
      const params = [orderId];

      if (userId) {
        orderQuery = orderQuery.replace('WHERE', 'WHERE user_id = ? AND');
        params.unshift(userId);
      }

      const orders = await queryWithConnection(connection, orderQuery, params);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];

      // 2. Validar que el estado permita cancelación
      if (order.status === ORDER_STATUS.CANCELLED) {
        throw new Error('La orden ya está cancelada');
      }

      if (order.status === ORDER_STATUS.REFUNDED) {
        throw new Error('No se puede cancelar una orden reembolsada');
      }

      // 3. Obtener items de la orden
      const items = await queryWithConnection(connection, `
        SELECT * FROM order_items WHERE order_id = ?
      `, [orderId]);

      // 4. Manejar inventario según el estado actual
      if (order.status === ORDER_STATUS.PAID) {
        // Si ya se pagó, registrar devoluciones (incrementa stock)
        for (const item of items) {
          if (item.variant_id) {
            await inventoryService.recordReturn(
              item.variant_id,
              item.quantity,
              orderId,
              reason || 'Orden cancelada'
            );
          }
        }
      } else {
        // Si está pendiente, liberar reservas del carrito
        // Las reservas están asociadas al carrito, no a la orden
        for (const item of items) {
          if (item.variant_id) {
            try {
              // Intentar liberar reserva del carrito
              await inventoryService.releaseStock(item.variant_id, item.quantity, 'cart', null);
            } catch (error) {
              // Si no hay reserva, continuar (puede que ya se haya liberado)
              warn('No reservation to release when cancelling order', {
                orderId,
                variantId: item.variant_id
              });
            }
          }
        }
      }

      // 5. Actualizar estado de la orden
      await queryWithConnection(connection, `
        UPDATE orders 
        SET status = ?, payment_status = ?
        WHERE id = ?
      `, [ORDER_STATUS.CANCELLED, 'failed', orderId]);

      // 7. Registrar cambio de estado
      await recordStatusChange(
        connection,
        orderId,
        order.status,
        ORDER_STATUS.CANCELLED,
        'failed',
        userId,
        reason || 'Orden cancelada'
      );

      info('Order cancelled', {
        orderId,
        previousStatus: order.status,
        reason
      });

      // 8. Obtener orden actualizada
      const updatedOrder = await getOrderById(orderId, userId);

      return updatedOrder;
    });
  } catch (error) {
    logError('Error cancelling order', error, { orderId, userId });
    throw error;
  }
}

/**
 * Marcar orden como fallida (pago fallido)
 * Libera reservas
 * @param {number} orderId - ID de la orden
 * @param {string} reason - Motivo del fallo (opcional)
 * @returns {Promise<object>} Orden actualizada
 */
async function markOrderAsFailed(orderId, reason = null) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener orden actual
      const orders = await queryWithConnection(connection, `
        SELECT * FROM orders WHERE id = ? FOR UPDATE
      `, [orderId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];

      // 2. Validar que el estado permita marcar como fallida
      if (order.status !== ORDER_STATUS.PENDING) {
        throw new Error(`No se puede marcar como fallida una orden en estado: ${order.status}`);
      }

      // 3. Obtener items de la orden
      const items = await queryWithConnection(connection, `
        SELECT * FROM order_items WHERE order_id = ?
      `, [orderId]);

      // 4. Liberar reservas del carrito (las reservas están asociadas al carrito)
      for (const item of items) {
        if (item.variant_id) {
          try {
            await inventoryService.releaseStock(item.variant_id, item.quantity, 'cart', null);
          } catch (error) {
            warn('No reservation to release when marking order as failed', {
              orderId,
              variantId: item.variant_id
            });
          }
        }
      }

      // 5. Actualizar estado de la orden
      await queryWithConnection(connection, `
        UPDATE orders 
        SET status = ?, payment_status = ?
        WHERE id = ?
      `, [ORDER_STATUS.FAILED, 'failed', orderId]);

      // 7. Registrar cambio de estado
      await recordStatusChange(
        connection,
        orderId,
        ORDER_STATUS.PENDING,
        ORDER_STATUS.FAILED,
        'failed',
        null,
        reason || 'Pago fallido'
      );

      info('Order marked as failed', {
        orderId,
        reason
      });

      // 7. Obtener orden actualizada
      const updatedOrder = await getOrderById(orderId);

      return updatedOrder;
    });
  } catch (error) {
    logError('Error marking order as failed', error, { orderId });
    throw error;
  }
}

/**
 * Reembolsar una orden
 * Registra devoluciones en inventario
 * @param {number} orderId - ID de la orden
 * @param {number} userId - ID del usuario admin que realiza el reembolso
 * @param {string} reason - Motivo del reembolso
 * @returns {Promise<object>} Orden reembolsada
 */
async function refundOrder(orderId, userId, reason) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener orden actual
      const orders = await queryWithConnection(connection, `
        SELECT * FROM orders WHERE id = ? FOR UPDATE
      `, [orderId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];

      // 2. Validar que el estado permita reembolso
      if (order.status !== ORDER_STATUS.PAID) {
        throw new Error(`Solo se pueden reembolsar órdenes pagadas. Estado actual: ${order.status}`);
      }

      // 3. Obtener items de la orden
      const items = await queryWithConnection(connection, `
        SELECT * FROM order_items WHERE order_id = ?
      `, [orderId]);

      // 4. Registrar devoluciones en inventario (incrementa stock)
      for (const item of items) {
        if (item.variant_id) {
          await inventoryService.recordReturn(
            item.variant_id,
            item.quantity,
            orderId,
            reason || 'Reembolso de orden'
          );
        }
      }

      // 5. Actualizar estado de la orden
      await queryWithConnection(connection, `
        UPDATE orders 
        SET status = ?, payment_status = ?
        WHERE id = ?
      `, [ORDER_STATUS.REFUNDED, 'refunded', orderId]);

      // 6. Registrar cambio de estado
      await recordStatusChange(
        connection,
        orderId,
        ORDER_STATUS.PAID,
        ORDER_STATUS.REFUNDED,
        'refunded',
        userId,
        reason || 'Orden reembolsada'
      );

      info('Order refunded', {
        orderId,
        refundedBy: userId,
        reason
      });

      // 7. Obtener orden actualizada
      const updatedOrder = await getOrderById(orderId);

      return updatedOrder;
    });
  } catch (error) {
    logError('Error refunding order', error, { orderId, userId });
    throw error;
  }
}

/**
 * Cambiar estado de una orden (admin)
 * @param {number} orderId - ID de la orden
 * @param {string} newStatus - Nuevo estado
 * @param {number} userId - ID del usuario admin
 * @param {string} notes - Notas (opcional)
 * @returns {Promise<object>} Orden actualizada
 */
async function changeOrderStatus(orderId, newStatus, userId, notes = null) {
  try {
    // Validar estado
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }

    // Obtener orden actual para validar transición
    const currentOrder = await getOrderById(orderId);
    if (!currentOrder) {
      throw new Error('Orden no encontrada');
    }

    // Validar transición de estado
    validateOrderStatusTransition(currentOrder.status, newStatus);

    return await transaction(async (connection) => {
      // 1. Obtener orden actual
      const orders = await queryWithConnection(connection, `
        SELECT * FROM orders WHERE id = ? FOR UPDATE
      `, [orderId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];
      const oldStatus = order.status;

      // 2. Validar transición de estado
      if (oldStatus === newStatus) {
        return await getOrderById(orderId);
      }

      // 3. Manejar transiciones especiales
      if (newStatus === ORDER_STATUS.PAID && oldStatus === ORDER_STATUS.PENDING) {
        // Confirmar pago
        return await confirmPayment(orderId);
      } else if (newStatus === ORDER_STATUS.CANCELLED) {
        // Cancelar orden
        return await cancelOrder(orderId, userId, notes);
      } else if (newStatus === ORDER_STATUS.FAILED && oldStatus === ORDER_STATUS.PENDING) {
        // Marcar como fallida
        return await markOrderAsFailed(orderId, notes);
      } else if (newStatus === ORDER_STATUS.REFUNDED && oldStatus === ORDER_STATUS.PAID) {
        // Reembolsar
        return await refundOrder(orderId, userId, notes);
      }

      // 4. Para otros cambios de estado, solo actualizar
      await queryWithConnection(connection, `
        UPDATE orders 
        SET status = ?
        WHERE id = ?
      `, [newStatus, orderId]);

      // 5. Registrar cambio de estado
      await recordStatusChange(
        connection,
        orderId,
        oldStatus,
        newStatus,
        order.payment_status,
        userId,
        notes
      );

      info('Order status changed', {
        orderId,
        oldStatus,
        newStatus,
        changedBy: userId
      });

      // 6. Obtener orden actualizada
      const updatedOrder = await getOrderById(orderId);

      return updatedOrder;
    });
  } catch (error) {
    logError('Error changing order status', error, { orderId, newStatus, userId });
    throw error;
  }
}

/**
 * Obtener orden por ID
 * @param {number} orderId - ID de la orden
 * @param {number|null} userId - ID del usuario (para validar propiedad)
 * @returns {Promise<object>} Orden con items e historial
 */
async function getOrderById(orderId, userId = null) {
  try {
    let orderQuery = `
      SELECT 
        id, order_number, user_id, status, payment_status, previous_status,
        payment_intent_id, payment_method,
        subtotal, shipping_cost, tax, discount, total,
        shipping_name, shipping_street, shipping_city,
        shipping_state, shipping_zip, shipping_country, shipping_phone,
        notes, tracking_number, shipped_at, delivered_at,
        created_at, updated_at
      FROM orders
      WHERE id = ?
    `;
    const params = [orderId];

    if (userId) {
      orderQuery += ' AND user_id = ?';
      params.push(userId);
    }

    const orders = await query(orderQuery, params);

    if (orders.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const order = orders[0];

    // Obtener items de la orden
    const items = await query(`
      SELECT 
        id, product_id, variant_id,
        product_name, product_sku, variant_name,
        product_price, quantity, subtotal
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `, [orderId]);

    // Obtener historial de estados
    const statusHistory = await query(`
      SELECT 
        id, status, new_status, payment_status,
        changed_by, notes, created_at
      FROM order_status_history
      WHERE order_id = ?
      ORDER BY created_at ASC
    `, [orderId]);

    return {
      ...order,
      subtotal: parseFloat(order.subtotal),
      shipping_cost: parseFloat(order.shipping_cost),
      tax: parseFloat(order.tax),
      discount: parseFloat(order.discount || 0),
      total: parseFloat(order.total),
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        variant_name: item.variant_name,
        price: parseFloat(item.product_price),
        price_snapshot: parseFloat(item.product_price),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal)
      })),
      status_history: statusHistory.map(entry => ({
        id: entry.id,
        old_status: entry.status,
        new_status: entry.new_status,
        payment_status: entry.payment_status,
        changed_by: entry.changed_by,
        notes: entry.notes,
        created_at: entry.created_at
      }))
    };
  } catch (error) {
    logError('Error getting order by ID', error, { orderId });
    throw error;
  }
}

/**
 * Listar órdenes de un usuario
 * @param {number} userId - ID del usuario
 * @param {object} options - { page, limit, status }
 * @returns {Promise<object>} { orders, pagination }
 */
async function listUserOrders(userId, options = {}) {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (options.status) {
      whereClause += ' AND status = ?';
      params.push(options.status);
    }

    // Obtener total
    const countResult = await query(`
      SELECT COUNT(*) as total FROM orders ${whereClause}
    `, params);

    const total = countResult[0]?.total || 0;

    // Obtener órdenes
    params.push(limit, offset);
    const orders = await query(`
      SELECT 
        id, order_number, status, payment_status,
        subtotal, shipping_cost, tax, total,
        created_at
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    return {
      orders: orders.map(order => ({
        ...order,
        subtotal: parseFloat(order.subtotal),
        shipping_cost: parseFloat(order.shipping_cost),
        tax: parseFloat(order.tax),
        total: parseFloat(order.total)
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logError('Error listing user orders', error, { userId });
    throw error;
  }
}

/**
 * Listar todas las órdenes (admin)
 * @param {object} options - { page, limit, status, userId }
 * @returns {Promise<object>} { orders, pagination }
 */
async function listAllOrders(options = {}) {
  try {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (options.status) {
      whereClause += ' AND status = ?';
      params.push(options.status);
    }

    if (options.userId) {
      whereClause += ' AND user_id = ?';
      params.push(options.userId);
    }

    // Obtener total
    const countResult = await query(`
      SELECT COUNT(*) as total FROM orders ${whereClause}
    `, params);

    const total = countResult[0]?.total || 0;

    // Obtener órdenes
    const countParams = [...params];
    params.push(limit, offset);
    const orders = await query(`
      SELECT 
        o.id, o.order_number, o.user_id, o.status, o.payment_status,
        o.subtotal, o.shipping_cost, o.tax, o.total,
        o.created_at, o.updated_at,
        u.email as user_email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    return {
      orders: orders.map(order => ({
        ...order,
        subtotal: parseFloat(order.subtotal),
        shipping_cost: parseFloat(order.shipping_cost),
        tax: parseFloat(order.tax),
        total: parseFloat(order.total)
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logError('Error listing all orders', error, { options });
    throw error;
  }
}

module.exports = {
  ORDER_STATUS,
  generateOrderNumber,
  createOrderFromCart,
  confirmPayment,
  cancelOrder,
  markOrderAsFailed,
  refundOrder,
  changeOrderStatus,
  getOrderById,
  listUserOrders,
  listAllOrders
};
