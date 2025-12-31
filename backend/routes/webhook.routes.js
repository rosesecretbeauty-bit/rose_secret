// ============================================
// Webhook Routes - Stripe Events (Resiliente e Idempotente)
// ============================================

const express = require('express');
const router = express.Router();
const { query, transaction, queryWithConnection } = require('../db');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');
// Webhooks NO tienen rate limiting estricto (verificados por signature de Stripe)
// Mantener rate limiter antiguo para compatibilidad, pero es más permisivo
const { webhookLimiter } = require('../middleware/rateLimit');
const { verifyWebhookOrigin } = require('../middleware/secureEndpoint');
const { critical, error: logError, warn } = require('../logger');

// IMPORTANTE: Los webhooks de Stripe NO deben usar express.json()
// porque necesitamos el body raw para verificar la signature
router.use('/stripe', express.raw({ type: 'application/json' }));

// ============================================
// POST /api/webhooks/stripe
// ============================================
// Maneja eventos de webhook de Stripe con idempotencia
router.post('/stripe', webhookLimiter, verifyWebhookOrigin, express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    critical('Webhook request without stripe-signature', {
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({
      success: false,
      message: 'Falta stripe-signature header'
    });
  }

  let event;
  try {
    // Verificar signature del webhook
    event = paymentService.verifyWebhookSignature(req.body, signature);
  } catch (error) {
    logError('Webhook signature verification failed:', error);
    return res.status(400).json({
      success: false,
      message: 'Webhook signature inválida'
    });
  }

  // Verificar si el evento ya fue procesado (idempotencia)
  try {
    const existingEvents = await query(
      'SELECT id, processed, processed_at FROM stripe_events WHERE event_id = ?',
      [event.id]
    );

    if (existingEvents.length > 0 && existingEvents[0].processed) {
      // Evento ya procesado, retornar éxito sin reprocesar
      warn('Duplicate webhook event received (already processed)', {
        eventId: event.id,
        eventType: event.type,
        processedAt: existingEvents[0].processed_at
      });
      return res.json({ received: true, message: 'Event already processed' });
    }

    // Registrar evento en BD (dentro de transacción)
    await transaction(async (connection) => {
      // Insertar o actualizar evento
      if (existingEvents.length > 0) {
        // Evento existe pero no procesado, actualizar
        await queryWithConnection(connection, `
          UPDATE stripe_events 
          SET event_type = ?, 
              event_data = ?,
              retry_count = retry_count + 1,
              updated_at = NOW()
          WHERE event_id = ?
        `, [
          event.type,
          JSON.stringify(event),
          event.id
        ]);
      } else {
        // Nuevo evento, insertar
        await queryWithConnection(connection, `
          INSERT INTO stripe_events (event_id, event_type, payment_intent_id, event_data, retry_count)
          VALUES (?, ?, ?, ?, 1)
        `, [
          event.id,
          event.type,
          event.data?.object?.id || null,
          JSON.stringify(event)
        ]);
      }

      // Procesar evento según tipo (dentro de transacción)
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(connection, event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(connection, event.data.object);
          break;

        case 'payment_intent.canceled':
          await handlePaymentCanceled(connection, event.data.object);
          break;

        case 'payment_intent.requires_action':
          await handlePaymentRequiresAction(connection, event.data.object);
          break;

        default:
          warn('Unhandled webhook event type', {
            eventId: event.id,
            eventType: event.type
          });
      }

      // Marcar evento como procesado
      await queryWithConnection(connection, `
        UPDATE stripe_events 
        SET processed = TRUE, 
            processed_at = NOW(),
            payment_intent_id = ?,
            order_id = ?
        WHERE event_id = ?
      `, [
        event.data?.object?.id || null,
        event.data?.object?.metadata?.order_id || null,
        event.id
      ]);
    });

    // Responder a Stripe que recibimos el webhook
    res.json({ received: true });
  } catch (error) {
    logError('Error processing webhook:', error, {
      eventId: event.id,
      eventType: event.type,
      paymentIntentId: event.data?.object?.id
    });

    // Registrar error en BD (sin transacción para no bloquear)
    try {
      await query(`
        UPDATE stripe_events 
        SET error_message = ?, 
            retry_count = retry_count + 1
        WHERE event_id = ?
      `, [error.message, event.id]);
    } catch (updateError) {
      logError('Error updating webhook event error:', updateError);
    }

    // Retornar 200 para que Stripe no reintente inmediatamente
    // (pero registrar el error para procesamiento manual)
    res.status(200).json({
      received: true,
      error: 'Error processing event, will retry'
    });
  }
});

/**
 * Maneja pago exitoso (con transacción)
 */
async function handlePaymentSuccess(connection, paymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  
  if (!orderId) {
    critical('Payment Intent succeeded without order_id in metadata', {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata
    });
    throw new Error('Payment Intent sin order_id en metadata');
  }

  // Verificar que el payment intent no haya sido procesado ya
  const alreadyProcessed = await paymentService.isPaymentIntentProcessed(paymentIntent.id);
  if (alreadyProcessed) {
    warn('Payment intent already processed, skipping', {
      paymentIntentId: paymentIntent.id,
      orderId
    });
    return;
  }

  // Validar monto y datos (seguridad financiera)
  const orders = await queryWithConnection(connection, `
    SELECT id, total, status, user_id, payment_intent_id
    FROM orders 
    WHERE id = ?
  `, [orderId]);

  if (orders.length === 0) {
    critical('Order not found for payment success', {
      orderId,
      paymentIntentId: paymentIntent.id
    });
    throw new Error(`Order ${orderId} no encontrado`);
  }

  const order = orders[0];

  // Validar monto (NUNCA confiar en datos del frontend)
  const stripeAmount = paymentIntent.amount / 100; // Stripe usa centavos
  const orderAmount = parseFloat(order.total);

  if (Math.abs(stripeAmount - orderAmount) > 0.01) { // Tolerancia de 1 centavo
    critical('Amount mismatch in payment success', {
      orderId,
      paymentIntentId: paymentIntent.id,
      orderAmount,
      stripeAmount,
      difference: Math.abs(stripeAmount - orderAmount)
    });
    throw new Error(`Monto no coincide: Order=${orderAmount}, Stripe=${stripeAmount}`);
  }

  // Actualizar pedido a processing (pago exitoso) - TRANSACCIÓN
  // El webhook es la fuente de verdad para confirmar pagos
  await queryWithConnection(connection, `
    UPDATE orders
    SET status = 'processing',
        payment_status = 'paid',
        payment_intent_id = ?,
        payment_provider = 'stripe',
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = ? AND status IN ('pending', 'pending_payment')
  `, [paymentIntent.id, orderId]);

  // Actualizar o crear registro en tabla payments
  const paymentMethod = paymentIntent.payment_method_types?.[0] || 'card';
  await queryWithConnection(connection, `
    INSERT INTO payments (
      order_id, payment_intent_id, amount, currency, status, payment_method, metadata
    ) VALUES (?, ?, ?, ?, 'paid', ?, ?)
    ON DUPLICATE KEY UPDATE
      status = 'paid',
      payment_method = VALUES(payment_method),
      metadata = VALUES(metadata),
      updated_at = NOW()
  `, [
    orderId,
    paymentIntent.id,
    stripeAmount,
    paymentIntent.currency || 'usd',
    paymentMethod,
    JSON.stringify({
      payment_method_types: paymentIntent.payment_method_types,
      charges: paymentIntent.charges?.data?.[0]?.id || null
    })
  ]);

  // Reducir stock de productos/variantes (solo si el pago es exitoso)
  // El webhook es la fuente de verdad - aquí se reduce stock definitivamente
  const orderItems = await queryWithConnection(connection, `
    SELECT product_id, variant_id, quantity 
    FROM order_items 
    WHERE order_id = ?
  `, [orderId]);

  for (const item of orderItems) {
    if (item.variant_id) {
      // Reducir stock de variante
      await queryWithConnection(connection, `
        UPDATE product_variants 
        SET stock = stock - ? 
        WHERE id = ? AND stock >= ?
      `, [item.quantity, item.variant_id, item.quantity]);
    } else {
      // Reducir stock de producto (solo si no tiene variantes activas)
      // Verificar si el producto tiene variantes
      const hasVariants = await queryWithConnection(connection, `
        SELECT COUNT(*) as count 
        FROM product_variants 
        WHERE product_id = ? AND is_active = TRUE
      `, [item.product_id]);
      
      // Solo reducir stock del producto si no tiene variantes
      if (hasVariants[0].count === 0) {
        await queryWithConnection(connection, `
          UPDATE products 
          SET stock = stock - ? 
          WHERE id = ? AND stock >= ?
        `, [item.quantity, item.product_id, item.quantity]);
      }
    }
  }

  // Limpiar carrito del usuario
  await queryWithConnection(connection, `
    DELETE FROM cart_items 
    WHERE user_id = ?
  `, [order.user_id]);

  // Obtener email del usuario para notificación (fuera de transacción)
  const users = await queryWithConnection(connection, `
    SELECT email 
    FROM users 
    WHERE id = ?
  `, [order.user_id]);

  // Enviar email (no bloquea, fuera de transacción)
  if (users.length > 0 && users[0].email) {
    // Auditoría: Pago exitoso
    const auditService = require('../services/audit.service');
    auditService.logAudit(
      'PAYMENT_SUCCESS',
      'payment',
      orderId,
      { status: 'pending', payment_status: 'pending' },
      { status: 'processing', payment_status: 'paid', payment_intent_id: paymentIntent.id },
      null, // req no disponible en webhook
      {
        order_id: orderId,
        order_number: order.order_number,
        payment_intent_id: paymentIntent.id,
        amount: stripeAmount,
        currency: paymentIntent.currency,
      }
    ).catch(err => {
      logError('Error logging payment audit:', err);
    });

    // Enviar notificaciones (no bloquea)
    const notificationService = require('../services/notification.service');
    notificationService.sendNotification({
      userId: order.user_id,
      type: 'payment',
      channels: ['in_app', 'email'],
      title: `Pago confirmado - Pedido #${order.order_number}`,
      message: `Tu pago de $${order.total.toFixed(2)} ha sido confirmado exitosamente.`,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        paymentIntentId: paymentIntent.id,
        link: `/account/orders/${order.id}`,
      },
    }).catch(err => {
      logError('Error sending payment success notification:', err);
    });

    // Email tradicional (mantener compatibilidad)
    emailService.sendPaymentSuccessEmail(users[0].email, {
      ...order,
      payment_intent_id: paymentIntent.id
    }).catch(err => {
      logError('Error sending payment success email:', err);
    });
  }

  // Log de pago exitoso (fuera de transacción)
  paymentLog('PAYMENT_WEBHOOK_SUCCEEDED', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: stripeAmount,
    currency: paymentIntent.currency,
    userId: order.user_id
  });

  // Registrar métrica
  metricsService.recordPayment('succeeded', stripeAmount);

  critical('Payment succeeded and order updated', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: stripeAmount,
    userId: order.user_id
  });
}

/**
 * Maneja pago fallido (con transacción)
 */
async function handlePaymentFailed(connection, paymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  
  if (!orderId) {
    critical('Payment Intent failed without order_id in metadata', {
      paymentIntentId: paymentIntent.id
    });
    throw new Error('Payment Intent sin order_id en metadata');
  }

  // Obtener información de la orden
  const orders = await queryWithConnection(connection, `
    SELECT id, total, user_id, status, order_number
    FROM orders
    WHERE id = ?
  `, [orderId]);

  if (orders.length === 0) {
    critical('Order not found for payment failed', {
      orderId,
      paymentIntentId: paymentIntent.id
    });
    throw new Error(`Order ${orderId} no encontrado`);
  }

  const order = orders[0];
  const stripeAmount = paymentIntent.amount / 100;
  const failureReason = paymentIntent.last_payment_error?.message || 'Pago rechazado';

  // Auditoría: Pago fallido
  const auditService = require('../services/audit.service');
  auditService.logAudit(
    'PAYMENT_FAILED',
    'payment',
    orderId,
    { status: order.status, payment_status: 'pending' },
    { status: 'payment_failed', payment_status: 'failed' },
    null, // req no disponible en webhook
    {
      order_id: orderId,
      order_number: order.order_number,
      payment_intent_id: paymentIntent.id,
      amount: stripeAmount,
      failure_reason: failureReason,
    }
  ).catch(err => {
    logError('Error logging payment failed audit:', err);
  });

  // Enviar notificación in-app (no email para fallos)
  if (order.user_id) {
    notificationService.sendNotification({
      userId: order.user_id,
      type: 'payment',
      channels: ['in_app'],
      title: 'Pago fallido',
      message: `No se pudo procesar tu pago para el pedido #${order.order_number}. Por favor, intenta nuevamente.`,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        paymentIntentId: paymentIntent.id,
        link: `/account/orders/${order.id}`,
      },
    }).catch(err => {
      logError('Error sending payment failed notification:', err);
    });
  }

  // Actualizar pedido a payment_failed
  await queryWithConnection(connection, `
    UPDATE orders
    SET status = 'payment_failed',
        payment_status = 'failed',
        payment_intent_id = ?,
        updated_at = NOW()
    WHERE id = ?
  `, [paymentIntent.id, orderId]);

  // Actualizar o crear registro en tabla payments
  await queryWithConnection(connection, `
    INSERT INTO payments (
      order_id, payment_intent_id, amount, currency, status, failure_reason, metadata
    ) VALUES (?, ?, ?, ?, 'failed', ?, ?)
    ON DUPLICATE KEY UPDATE
      status = 'failed',
      failure_reason = VALUES(failure_reason),
      metadata = VALUES(metadata),
      updated_at = NOW()
  `, [
    orderId,
    paymentIntent.id,
    stripeAmount,
    paymentIntent.currency || 'usd',
    failureReason,
    JSON.stringify({
      error_code: paymentIntent.last_payment_error?.code,
      error_type: paymentIntent.last_payment_error?.type,
      decline_code: paymentIntent.last_payment_error?.decline_code
    })
  ]);

  // Obtener email del usuario para notificación
  const orderWithEmail = await queryWithConnection(connection, `
    SELECT o.*, u.email
    FROM orders o
    INNER JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `, [orderId]);

  if (orderWithEmail.length > 0 && orderWithEmail[0].email) {
    emailService.sendPaymentFailedEmail(orderWithEmail[0].email, orderWithEmail[0]).catch(err => {
      logError('Error sending payment failed email:', err);
    });
  }

  // Log de pago fallido
  paymentLog('PAYMENT_WEBHOOK_FAILED', {
    orderId,
    paymentIntentId: paymentIntent.id,
    failureCode: paymentIntent.last_payment_error?.code,
    failureMessage: paymentIntent.last_payment_error?.message
  });

    // Registrar métrica
    metricsService.recordPayment('failed');

    warn('Payment failed', {
      orderId,
      paymentIntentId: paymentIntent.id,
      failureCode: paymentIntent.last_payment_error?.code,
      failureMessage: paymentIntent.last_payment_error?.message
    });
}

/**
 * Maneja pago cancelado (con transacción)
 */
async function handlePaymentCanceled(connection, paymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  
  if (!orderId) {
    warn('Payment Intent canceled without order_id in metadata', {
      paymentIntentId: paymentIntent.id
    });
    return;
  }

  // Obtener información de la orden
  const orders = await queryWithConnection(connection, `
    SELECT id, total
    FROM orders
    WHERE id = ?
  `, [orderId]);

  if (orders.length === 0) {
    warn('Order not found for payment canceled', {
      orderId,
      paymentIntentId: paymentIntent.id
    });
    return;
  }

  const order = orders[0];
  const stripeAmount = paymentIntent.amount / 100;

  // Actualizar pedido a cancelled
  await queryWithConnection(connection, `
    UPDATE orders
    SET status = 'cancelled',
        payment_status = 'pending',
        payment_intent_id = ?,
        updated_at = NOW()
    WHERE id = ? AND status IN ('pending', 'pending_payment')
  `, [paymentIntent.id, orderId]);

  // Actualizar o crear registro en tabla payments
  await queryWithConnection(connection, `
    INSERT INTO payments (
      order_id, payment_intent_id, amount, currency, status, metadata
    ) VALUES (?, ?, ?, ?, 'failed', ?)
    ON DUPLICATE KEY UPDATE
      status = 'failed',
      metadata = VALUES(metadata),
      updated_at = NOW()
  `, [
    orderId,
    paymentIntent.id,
    stripeAmount,
    paymentIntent.currency || 'usd',
    JSON.stringify({
      canceled: true,
      canceled_at: new Date().toISOString()
    })
  ]);

  warn('Payment canceled', {
    orderId,
    paymentIntentId: paymentIntent.id
  });
}

/**
 * Maneja pago que requiere acción adicional (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(connection, paymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  
  if (!orderId) {
    return;
  }

  // Obtener información de la orden
  const orders = await queryWithConnection(connection, `
    SELECT id, total
    FROM orders
    WHERE id = ?
  `, [orderId]);

  if (orders.length === 0) {
    return;
  }

  const order = orders[0];
  const stripeAmount = paymentIntent.amount / 100;

  // Mantener estado pending_payment
  await queryWithConnection(connection, `
    UPDATE orders
    SET status = 'pending_payment',
        payment_intent_id = ?,
        updated_at = NOW()
    WHERE id = ?
  `, [paymentIntent.id, orderId]);

  // Actualizar o crear registro en tabla payments
  await queryWithConnection(connection, `
    INSERT INTO payments (
      order_id, payment_intent_id, amount, currency, status, metadata
    ) VALUES (?, ?, ?, ?, 'requires_action', ?)
    ON DUPLICATE KEY UPDATE
      status = 'requires_action',
      metadata = VALUES(metadata),
      updated_at = NOW()
  `, [
    orderId,
    paymentIntent.id,
    stripeAmount,
    paymentIntent.currency || 'usd',
    JSON.stringify({
      requires_action: true,
      next_action: paymentIntent.next_action?.type || null
    })
  ]);

  warn('Payment requires action', {
    orderId,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status
  });
}

module.exports = router;
