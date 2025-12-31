// ============================================
// Reconciliation Service
// ============================================
// Revisa pagos pendientes y corrige estados inconsistentes

// Inicializar Stripe solo si hay API key (para desarrollo sin key)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Stripe:', error.message);
  }
}

const { query } = require('../db');
const { critical, warn, info, error: logError } = require('../logger');
const paymentService = require('./payment.service');

/**
 * Reconciliar pagos pendientes
 * Consulta Stripe para verificar estado real de payment intents
 */
async function reconcilePendingPayments() {
  if (!stripe) {
    warn('Stripe no está configurado. Saltando reconciliación de pagos.');
    return { reconciled: 0, errors: 0 };
  }

  try {
    info('Starting payment reconciliation job');

    // Obtener órdenes con payment_intent_id pero en estado pendiente
    const pendingOrders = await query(`
      SELECT id, order_number, payment_intent_id, status, total, user_id, created_at
      FROM orders
      WHERE payment_intent_id IS NOT NULL
        AND status IN ('pending', 'pending_payment')
        AND created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY created_at DESC
      LIMIT 50
    `);

    if (pendingOrders.length === 0) {
      info('No pending payments to reconcile');
      return { reconciled: 0, errors: 0 };
    }

    info(`Found ${pendingOrders.length} pending payments to reconcile`);

    let reconciled = 0;
    let errors = 0;
    const discrepancies = [];

    for (const order of pendingOrders) {
      try {
        // Consultar Stripe para obtener estado real
        const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);

        // Verificar consistencia
        const stripeStatus = paymentIntent.status;
        const expectedStatus = paymentService.mapStripeStatusToOrderStatus(stripeStatus);

        // Validar monto
        const stripeAmount = paymentIntent.amount / 100;
        const orderAmount = parseFloat(order.total);
        const amountMismatch = Math.abs(stripeAmount - orderAmount) > 0.01;

        // Si hay discrepancia, registrar y corregir
        if (order.status !== expectedStatus || amountMismatch) {
          discrepancies.push({
            orderId: order.id,
            orderNumber: order.order_number,
            currentStatus: order.status,
            expectedStatus: expectedStatus,
            stripeStatus: stripeStatus,
            amountMismatch: amountMismatch,
            orderAmount: orderAmount,
            stripeAmount: stripeAmount
          });

          critical('Payment state discrepancy found', {
            orderId: order.id,
            orderNumber: order.order_number,
            currentStatus: order.status,
            expectedStatus: expectedStatus,
            stripeStatus: stripeStatus,
            amountMismatch: amountMismatch
          });

          // Corregir estado si es necesario
          if (order.status !== expectedStatus) {
            await query(`
              UPDATE orders
              SET status = ?,
                  updated_at = NOW()
              WHERE id = ?
            `, [expectedStatus, order.id]);

            reconciled++;

            // Si el pago fue exitoso, actualizar stock y limpiar carrito
            if (expectedStatus === 'processing' && stripeStatus === 'succeeded') {
              // Actualizar stock
              const orderItems = await query(`
                SELECT product_id, quantity 
                FROM order_items 
                WHERE order_id = ?
              `, [order.id]);

              for (const item of orderItems) {
                await query(`
                  UPDATE products 
                  SET stock = stock - ? 
                  WHERE id = ? AND stock >= ?
                `, [item.quantity, item.product_id, item.quantity]);
              }

              // Limpiar carrito
              await query(`
                DELETE FROM cart_items 
                WHERE user_id = ?
              `, [order.user_id]);
            }
          }
        }
      } catch (error) {
        errors++;
        if (error.type && error.type.startsWith('Stripe')) {
          // Payment intent no existe en Stripe
          if (error.code === 'resource_missing') {
            warn('Payment intent not found in Stripe', {
              orderId: order.id,
              paymentIntentId: order.payment_intent_id
            });
            // Opcional: marcar orden como payment_failed
            await query(`
              UPDATE orders
              SET status = 'payment_failed',
                  updated_at = NOW()
              WHERE id = ?
            `, [order.id]);
          } else {
            logError('Stripe error in reconciliation:', error, {
              orderId: order.id,
              paymentIntentId: order.payment_intent_id,
              stripeErrorCode: error.code
            });
          }
        } else {
          logError('Error reconciling payment:', error, {
            orderId: order.id,
            paymentIntentId: order.payment_intent_id
          });
        }
      }
    }

    info('Payment reconciliation completed', {
      total: pendingOrders.length,
      reconciled,
      errors,
      discrepancies: discrepancies.length
    });

    // Log crítico si hay discrepancias
    if (discrepancies.length > 0) {
      critical('Payment reconciliation found discrepancies', {
        count: discrepancies.length,
        discrepancies: discrepancies
      });
    }

    return {
      reconciled,
      errors,
      total: pendingOrders.length,
      discrepancies: discrepancies.length
    };
  } catch (error) {
    logError('Error in payment reconciliation job:', error);
    throw error;
  }
}

/**
 * Reconciliar un pedido específico
 */
async function reconcileOrder(orderId) {
  if (!stripe) {
    throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
  }

  try {
    const orders = await query(`
      SELECT id, order_number, payment_intent_id, status, total, user_id
      FROM orders
      WHERE id = ?
    `, [orderId]);

    if (orders.length === 0) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[0];

    if (!order.payment_intent_id) {
      return { reconciled: false, message: 'Order has no payment intent' };
    }

    // Consultar Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
    const expectedStatus = paymentService.mapStripeStatusToOrderStatus(paymentIntent.status);

    if (order.status !== expectedStatus) {
      await query(`
        UPDATE orders
        SET status = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [expectedStatus, order.id]);

      return {
        reconciled: true,
        oldStatus: order.status,
        newStatus: expectedStatus,
        stripeStatus: paymentIntent.status
      };
    }

    return {
      reconciled: false,
      message: 'Order status is already correct',
      status: order.status
    };
  } catch (error) {
    logError('Error reconciling order:', error, { orderId });
    throw error;
  }
}

module.exports = {
  reconcilePendingPayments,
  reconcileOrder
};

