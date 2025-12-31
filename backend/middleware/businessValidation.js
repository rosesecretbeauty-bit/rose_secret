// ============================================
// Business Validation Middleware
// ============================================
// Validaciones de negocio: precios, estados, stock, etc.

const { query } = require('../db');
const { error: logError, warn } = require('../logger');

/**
 * Validar que los precios no hayan cambiado entre carrito y orden
 * Compara price_snapshot del carrito con el precio actual del producto
 */
async function validatePriceConsistency(cartItems) {
  try {
    for (const item of cartItems) {
      if (!item.price_snapshot) {
        warn('Cart item missing price_snapshot', { itemId: item.id });
        continue;
      }

      const snapshotPrice = parseFloat(item.price_snapshot);
      
      // Obtener precio actual del producto/variante
      let currentPrice = null;
      if (item.variant_id) {
        const variants = await query(
          'SELECT price FROM product_variants WHERE id = ? AND is_active = TRUE',
          [item.variant_id]
        );
        if (variants.length > 0) {
          currentPrice = parseFloat(variants[0].price);
        }
      } else {
        const products = await query(
          'SELECT price FROM products WHERE id = ? AND is_active = TRUE',
          [item.product_id]
        );
        if (products.length > 0) {
          currentPrice = parseFloat(products[0].price);
        }
      }

      if (currentPrice === null) {
        throw new Error(`Producto o variante no encontrado: ${item.product_id || item.variant_id}`);
      }

      // Permitir pequeña diferencia por redondeo (0.01)
      const priceDifference = Math.abs(snapshotPrice - currentPrice);
      if (priceDifference > 0.01) {
        warn('Price mismatch detected', {
          itemId: item.id,
          snapshotPrice,
          currentPrice,
          difference: priceDifference
        });
        throw new Error(
          `El precio del producto "${item.name || 'producto'}" ha cambiado. ` +
          `Precio original: $${snapshotPrice.toFixed(2)}, Precio actual: $${currentPrice.toFixed(2)}. ` +
          `Por favor, actualiza tu carrito.`
        );
      }
    }

    return true;
  } catch (error) {
    logError('Error validating price consistency', error);
    throw error;
  }
}

/**
 * Validar transiciones de estado de orden
 */
const VALID_ORDER_STATUS_TRANSITIONS = {
  'pending': ['paid', 'cancelled', 'failed'],
  'paid': ['refunded', 'cancelled'],
  'cancelled': [], // No se puede cambiar desde cancelled
  'failed': ['pending'], // Se puede reintentar
  'refunded': [] // No se puede cambiar desde refunded
};

function validateOrderStatusTransition(currentStatus, newStatus) {
  const allowedTransitions = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Transición de estado inválida: no se puede cambiar de "${currentStatus}" a "${newStatus}". ` +
      `Transiciones permitidas desde "${currentStatus}": ${allowedTransitions.join(', ') || 'ninguna'}`
    );
  }

  return true;
}

/**
 * Validar transiciones de estado de pago
 */
const VALID_PAYMENT_STATUS_TRANSITIONS = {
  'pending': ['paid', 'failed', 'cancelled'],
  'authorized': ['paid', 'failed', 'cancelled'],
  'paid': ['refunded'],
  'failed': ['pending'], // Se puede reintentar
  'cancelled': [],
  'refunded': []
};

function validatePaymentStatusTransition(currentStatus, newStatus) {
  const allowedTransitions = VALID_PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Transición de estado de pago inválida: no se puede cambiar de "${currentStatus}" a "${newStatus}". ` +
      `Transiciones permitidas desde "${currentStatus}": ${allowedTransitions.join(', ') || 'ninguna'}`
    );
  }

  return true;
}

/**
 * Validar que el monto del pago coincida con el total de la orden
 */
function validatePaymentAmount(orderTotal, paymentAmount, tolerance = 0.01) {
  const difference = Math.abs(parseFloat(orderTotal) - parseFloat(paymentAmount));
  
  if (difference > tolerance) {
    throw new Error(
      `El monto del pago ($${parseFloat(paymentAmount).toFixed(2)}) no coincide con el total de la orden ` +
      `($${parseFloat(orderTotal).toFixed(2)}). Diferencia: $${difference.toFixed(2)}`
    );
  }

  return true;
}

/**
 * Validar que una orden pertenece al usuario
 */
async function validateOrderOwnership(orderId, userId) {
  const orders = await query(
    'SELECT id, user_id FROM orders WHERE id = ?',
    [orderId]
  );

  if (orders.length === 0) {
    throw new Error('Orden no encontrada');
  }

  if (orders[0].user_id !== userId) {
    warn('User attempted to access order of another user', {
      orderId,
      userId,
      orderUserId: orders[0].user_id
    });
    throw new Error('No tienes permiso para acceder a esta orden');
  }

  return true;
}

/**
 * Validar que un producto está activo
 */
async function validateProductActive(productId) {
  const products = await query(
    'SELECT id, is_active FROM products WHERE id = ?',
    [productId]
  );

  if (products.length === 0) {
    throw new Error('Producto no encontrado');
  }

  if (!products[0].is_active) {
    throw new Error('El producto no está disponible');
  }

  return true;
}

/**
 * Validar que una variante está activa
 */
async function validateVariantActive(variantId) {
  const variants = await query(
    'SELECT id, is_active FROM product_variants WHERE id = ?',
    [variantId]
  );

  if (variants.length === 0) {
    throw new Error('Variante no encontrada');
  }

  if (!variants[0].is_active) {
    throw new Error('La variante no está disponible');
  }

  return true;
}

module.exports = {
  validatePriceConsistency,
  validateOrderStatusTransition,
  validatePaymentStatusTransition,
  validatePaymentAmount,
  validateOrderOwnership,
  validateProductActive,
  validateVariantActive,
  VALID_ORDER_STATUS_TRANSITIONS,
  VALID_PAYMENT_STATUS_TRANSITIONS
};

