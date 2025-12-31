// ============================================
// Payment Service - Sistema Completo y Desacoplado
// ============================================
// Integración directa con order.service
// NO modifica órdenes ni inventario directamente

// Inicializar Stripe solo si hay API key (para desarrollo sin key)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Stripe:', error.message);
  }
}

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info, warn } = require('../logger');
const orderService = require('./order.service');
const auditService = require('./audit.service');
const { validatePaymentStatusTransition, validatePaymentAmount } = require('../middleware/businessValidation');

/**
 * Proveedores de pago soportados
 */
const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  MANUAL: 'manual'
};

/**
 * Estados de pago
 */
const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',  // Para proveedores que soportan autorización
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Mapeo de estados Stripe a estados locales
 */
function mapStripeStatusToPaymentStatus(stripeStatus) {
  const mapping = {
    'requires_payment_method': PAYMENT_STATUS.PENDING,
    'requires_confirmation': PAYMENT_STATUS.PENDING,
    'requires_action': PAYMENT_STATUS.PENDING,
    'processing': PAYMENT_STATUS.PENDING,
    'requires_capture': PAYMENT_STATUS.AUTHORIZED,
    'succeeded': PAYMENT_STATUS.PAID,
    'canceled': PAYMENT_STATUS.CANCELLED
  };
  return mapping[stripeStatus] || PAYMENT_STATUS.PENDING;
}

/**
 * Crear intento de pago
 * @param {number} orderId - ID de la orden
 * @param {string} provider - Proveedor ('stripe', 'paypal', 'manual')
 * @param {object} providerData - Datos específicos del proveedor
 * @returns {Promise<object>} Pago creado
 */
async function createPayment(orderId, provider = 'stripe', providerData = {}) {
  try {
    return await transaction(async (connection) => {
      // 1. Validar que la orden existe y está en estado 'pending'
      const orders = await queryWithConnection(connection, `
        SELECT id, user_id, total, status, payment_status
        FROM orders
        WHERE id = ? FOR UPDATE
      `, [orderId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const order = orders[0];

      if (order.status !== orderService.ORDER_STATUS.PENDING) {
        throw new Error(`Solo se pueden crear pagos para órdenes en estado 'pending'. Estado actual: ${order.status}`);
      }

      // 2. Validar monto (congelado de la orden)
      const amount = parseFloat(order.total);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Monto inválido');
      }

      // 3. Crear intento de pago según proveedor
      let paymentIntent = null;
      let externalReference = null;
      let providerPayload = null;

      if (provider === PAYMENT_PROVIDERS.STRIPE) {
        const result = await createStripePaymentIntent(amount, orderId, order.order_number);
        externalReference = result.paymentIntentId;
        providerPayload = { clientSecret: result.clientSecret, paymentIntentId: result.paymentIntentId };
      } else if (provider === PAYMENT_PROVIDERS.MANUAL) {
        // Pago manual (creado por admin)
        externalReference = `manual_${orderId}_${Date.now()}`;
        providerPayload = providerData;
      } else {
        throw new Error(`Proveedor no soportado: ${provider}`);
      }

      // 4. Crear registro en tabla payments
      const isPostgreSQL = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

      let paymentId;
      if (isPostgreSQL) {
        const result = await queryWithConnection(connection, `
          INSERT INTO payments (
            order_id, provider, external_reference, amount, currency,
            status, provider_payload
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          orderId,
          provider,
          externalReference,
          amount,
          'usd',
          PAYMENT_STATUS.PENDING,
          JSON.stringify(providerPayload)
        ]);
        paymentId = result[0]?.id || result.id;
      } else {
        const result = await queryWithConnection(connection, `
          INSERT INTO payments (
            order_id, provider, external_reference, amount, currency,
            status, provider_payload
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          provider,
          externalReference,
          amount,
          'usd',
          PAYMENT_STATUS.PENDING,
          JSON.stringify(providerPayload)
        ]);
        paymentId = result.insertId;
      }

      // También actualizar payment_intent_id en orders para compatibilidad (si es Stripe)
      if (provider === PAYMENT_PROVIDERS.STRIPE && externalReference) {
        await queryWithConnection(connection, `
          UPDATE orders
          SET payment_intent_id = ?
          WHERE id = ?
        `, [externalReference, orderId]);
      }

      info('Payment created', {
        paymentId,
        orderId,
        provider,
        amount,
        externalReference
      });

      // 5. Obtener pago completo
      const payment = await getPaymentById(paymentId);

      return payment;
    });
  } catch (error) {
    logError('Error creating payment', error, { orderId, provider });
    throw error;
  }
}

/**
 * Crear Payment Intent en Stripe
 */
async function createStripePaymentIntent(amount, orderId, orderNumber) {
  if (!stripe) {
    throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
  }

  try {
    // Verificar si ya existe un payment intent para esta orden
    const existingPayments = await query(`
      SELECT external_reference, status
      FROM payments
      WHERE order_id = ? AND provider = ? AND status IN (?, ?, ?)
      ORDER BY created_at DESC
      LIMIT 1
    `, [orderId, PAYMENT_PROVIDERS.STRIPE, PAYMENT_STATUS.PENDING, PAYMENT_STATUS.AUTHORIZED, PAYMENT_STATUS.PAID]);

    if (existingPayments.length > 0) {
      const existingPayment = existingPayments[0];
      
      // Si ya está pagado, no crear uno nuevo
      if (existingPayment.status === PAYMENT_STATUS.PAID) {
        throw new Error('Esta orden ya tiene un pago exitoso');
      }

      // Si existe uno pendiente, retornar el existente
      if (existingPayment.external_reference) {
        if (!stripe) {
          throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
        }
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(existingPayment.external_reference);
          return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret
          };
        } catch (error) {
          // Si no existe en Stripe, continuar y crear uno nuevo
          warn('Existing payment intent not found in Stripe', {
            externalReference: existingPayment.external_reference
          });
        }
      }
    }

    // Crear nuevo Payment Intent
    const idempotencyKey = `order_${orderId}_${Date.now()}`;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      metadata: {
        order_id: orderId.toString(),
        order_number: orderNumber
      },
      automatic_payment_methods: {
        enabled: true
      }
    }, {
      idempotencyKey: idempotencyKey
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    logError('Error creating Stripe payment intent', error, { orderId, amount });
    throw new Error(`Error al crear intención de pago: ${error.message}`);
  }
}

/**
 * Confirmar pago (idempotente)
 * @param {number} paymentId - ID del pago
 * @param {object} providerData - Datos adicionales del proveedor (opcional)
 * @returns {Promise<object>} Pago confirmado
 */
async function confirmPayment(paymentId, providerData = {}) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener pago con bloqueo
      const payments = await queryWithConnection(connection, `
        SELECT * FROM payments WHERE id = ? FOR UPDATE
      `, [paymentId]);

      if (payments.length === 0) {
        throw new Error('Pago no encontrado');
      }

      const payment = payments[0];

      // 2. Validar que el estado permita confirmación
      if (payment.status === PAYMENT_STATUS.PAID) {
        // Ya está confirmado, retornar (idempotencia)
        warn('Payment already confirmed (idempotency)', { paymentId });
        return await getPaymentById(paymentId);
      }

      if (payment.status !== PAYMENT_STATUS.PENDING && payment.status !== PAYMENT_STATUS.AUTHORIZED) {
        throw new Error(`No se puede confirmar un pago en estado: ${payment.status}`);
      }

      // 3. Validar con proveedor si es necesario
      if (payment.provider === PAYMENT_PROVIDERS.STRIPE && payment.external_reference) {
        if (!stripe) {
          throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
        }
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.external_reference);
          
          if (paymentIntent.status !== 'succeeded') {
            throw new Error(`El payment intent en Stripe no está succeeded. Estado: ${paymentIntent.status}`);
          }

          // Actualizar provider_payload con datos completos
          const updatedPayload = {
            ...(payment.provider_payload ? JSON.parse(payment.provider_payload) : {}),
            ...providerData,
            confirmedAt: new Date().toISOString(),
            stripeStatus: paymentIntent.status
          };

          await queryWithConnection(connection, `
            UPDATE payments
            SET provider_payload = ?
            WHERE id = ?
          `, [JSON.stringify(updatedPayload), paymentId]);
        } catch (error) {
          logError('Error validating payment with provider', error, { paymentId, provider: payment.provider });
          throw error;
        }
      }

      // 4. Actualizar estado del pago
      await queryWithConnection(connection, `
        UPDATE payments
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [PAYMENT_STATUS.PAID, paymentId]);

      // 5. IMPORTANTE: Confirmar orden usando order.service
      // Esto descuenta stock, vacía carrito, etc.
      await orderService.confirmPayment(payment.order_id, payment.external_reference);

      info('Payment confirmed', {
        paymentId,
        orderId: payment.order_id,
        provider: payment.provider,
        amount: payment.amount
      });

      // 6. Auditoría
      await auditService.logAudit(
        'PAYMENT_CONFIRMED',
        'payment',
        paymentId,
        { previous_status: payment.status },
        { new_status: PAYMENT_STATUS.PAID, order_id: payment.order_id },
        null
      );

      // 7. Obtener pago actualizado
      const updatedPayment = await getPaymentById(paymentId);

      return updatedPayment;
    });
  } catch (error) {
    logError('Error confirming payment', error, { paymentId });
    throw error;
  }
}

/**
 * Marcar pago como fallido
 * @param {number} paymentId - ID del pago
 * @param {string} reason - Motivo del fallo
 * @param {object} providerData - Datos adicionales del proveedor (opcional)
 * @returns {Promise<object>} Pago actualizado
 */
async function failPayment(paymentId, reason, providerData = {}) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener pago con bloqueo
      const payments = await queryWithConnection(connection, `
        SELECT * FROM payments WHERE id = ? FOR UPDATE
      `, [paymentId]);

      if (payments.length === 0) {
        throw new Error('Pago no encontrado');
      }

      const payment = payments[0];

      // 2. Validar que el estado permita marcar como fallido
      if (payment.status === PAYMENT_STATUS.PAID) {
        throw new Error('No se puede marcar como fallido un pago ya confirmado');
      }

      if (payment.status === PAYMENT_STATUS.FAILED) {
        // Ya está fallido, retornar (idempotencia)
        warn('Payment already failed (idempotency)', { paymentId });
        return await getPaymentById(paymentId);
      }

      // 3. Actualizar estado del pago
      const updatedPayload = {
        ...(payment.provider_payload ? JSON.parse(payment.provider_payload) : {}),
        ...providerData,
        failedAt: new Date().toISOString(),
        failureReason: reason
      };

      await queryWithConnection(connection, `
        UPDATE payments
        SET status = ?, failure_reason = ?, provider_payload = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [PAYMENT_STATUS.FAILED, reason, JSON.stringify(updatedPayload), paymentId]);

      // 4. IMPORTANTE: Marcar orden como fallida usando order.service
      // Esto libera reservas
      await orderService.markOrderAsFailed(payment.order_id, reason);

      info('Payment marked as failed', {
        paymentId,
        orderId: payment.order_id,
        reason
      });

      // 5. Auditoría
      await auditService.logAudit(
        'PAYMENT_FAILED',
        'payment',
        paymentId,
        { previous_status: payment.status },
        { new_status: PAYMENT_STATUS.FAILED, reason, order_id: payment.order_id },
        null
      );

      // 6. Obtener pago actualizado
      const updatedPayment = await getPaymentById(paymentId);

      return updatedPayment;
    });
  } catch (error) {
    logError('Error failing payment', error, { paymentId, reason });
    throw error;
  }
}

/**
 * Reembolsar pago
 * @param {number} paymentId - ID del pago
 * @param {number} userId - ID del usuario admin que realiza el reembolso
 * @param {string} reason - Motivo del reembolso
 * @param {object} providerData - Datos adicionales del proveedor (opcional)
 * @returns {Promise<object>} Pago reembolsado
 */
async function refundPayment(paymentId, userId, reason, providerData = {}) {
  try {
    return await transaction(async (connection) => {
      // 1. Obtener pago con bloqueo
      const payments = await queryWithConnection(connection, `
        SELECT * FROM payments WHERE id = ? FOR UPDATE
      `, [paymentId]);

      if (payments.length === 0) {
        throw new Error('Pago no encontrado');
      }

      const payment = payments[0];

      // 2. Validar que el estado permita reembolso
      if (payment.status !== PAYMENT_STATUS.PAID) {
        throw new Error(`Solo se pueden reembolsar pagos confirmados. Estado actual: ${payment.status}`);
      }

      if (payment.status === PAYMENT_STATUS.REFUNDED) {
        // Ya está reembolsado, retornar (idempotencia)
        warn('Payment already refunded (idempotency)', { paymentId });
        return await getPaymentById(paymentId);
      }

      // 3. Procesar reembolso con proveedor si es necesario
      if (payment.provider === PAYMENT_PROVIDERS.STRIPE && payment.external_reference) {
        if (!stripe) {
          throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
        }
        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.external_reference,
            reason: 'requested_by_customer'
          });

          // Actualizar provider_payload con datos del reembolso
          const updatedPayload = {
            ...(payment.provider_payload ? JSON.parse(payment.provider_payload) : {}),
            ...providerData,
            refundId: refund.id,
            refundedAt: new Date().toISOString(),
            refundReason: reason
          };

          await queryWithConnection(connection, `
            UPDATE payments
            SET provider_payload = ?
            WHERE id = ?
          `, [JSON.stringify(updatedPayload), paymentId]);
        } catch (error) {
          logError('Error processing refund with provider', error, { paymentId, provider: payment.provider });
          throw new Error(`Error al procesar reembolso: ${error.message}`);
        }
      }

      // 4. Actualizar estado del pago
      await queryWithConnection(connection, `
        UPDATE payments
        SET status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [PAYMENT_STATUS.REFUNDED, reason, paymentId]);

      // 5. IMPORTANTE: Reembolsar orden usando order.service
      // Esto registra devoluciones en inventario
      await orderService.refundOrder(payment.order_id, userId, reason);

      info('Payment refunded', {
        paymentId,
        orderId: payment.order_id,
        refundedBy: userId,
        reason
      });

      // 6. Auditoría
      await auditService.logAudit(
        'PAYMENT_REFUNDED',
        'payment',
        paymentId,
        { previous_status: payment.status },
        { new_status: PAYMENT_STATUS.REFUNDED, reason, order_id: payment.order_id },
        null
      );

      // 7. Obtener pago actualizado
      const updatedPayment = await getPaymentById(paymentId);

      return updatedPayment;
    });
  } catch (error) {
    logError('Error refunding payment', error, { paymentId, userId, reason });
    throw error;
  }
}

/**
 * Obtener pago por ID
 * @param {number} paymentId - ID del pago
 * @returns {Promise<object>} Pago
 */
async function getPaymentById(paymentId) {
  try {
    const payments = await query(`
      SELECT 
        id, order_id, provider, external_reference, amount, currency,
        status, payment_method, failure_reason, provider_payload,
        created_at, updated_at
      FROM payments
      WHERE id = ?
      LIMIT 1
    `, [paymentId]);

    if (payments.length === 0) {
      throw new Error('Pago no encontrado');
    }

    const payment = payments[0];

    return {
      ...payment,
      amount: parseFloat(payment.amount),
      provider_payload: payment.provider_payload ? JSON.parse(payment.provider_payload) : null
    };
  } catch (error) {
    logError('Error getting payment by ID', error, { paymentId });
    throw error;
  }
}

/**
 * Listar pagos por orden
 * @param {number} orderId - ID de la orden
 * @returns {Promise<array>} Lista de pagos
 */
async function getPaymentsByOrderId(orderId) {
  try {
    const payments = await query(`
      SELECT 
        id, order_id, provider, external_reference, amount, currency,
        status, payment_method, failure_reason, provider_payload,
        created_at, updated_at
      FROM payments
      WHERE order_id = ?
      ORDER BY created_at DESC
    `, [orderId]);

    return payments.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount),
      provider_payload: payment.provider_payload ? JSON.parse(payment.provider_payload) : null
    }));
  } catch (error) {
    logError('Error getting payments by order ID', error, { orderId });
    throw error;
  }
}

/**
 * Listar todos los pagos (admin)
 * @param {object} options - { page, limit, status, provider, orderId }
 * @returns {Promise<object>} { payments, pagination }
 */
async function listAllPayments(options = {}) {
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

    if (options.provider) {
      whereClause += ' AND provider = ?';
      params.push(options.provider);
    }

    if (options.orderId) {
      whereClause += ' AND order_id = ?';
      params.push(options.orderId);
    }

    // Obtener total
    const countResult = await query(`
      SELECT COUNT(*) as total FROM payments ${whereClause}
    `, params);

    const total = countResult[0]?.total || 0;

    // Obtener pagos
    const countParams = [...params];
    params.push(limit, offset);
    const payments = await query(`
      SELECT 
        p.id, p.order_id, p.provider, p.external_reference, p.amount, p.currency,
        p.status, p.payment_method, p.failure_reason, p.created_at, p.updated_at,
        o.order_number, o.user_id,
        u.email as user_email, u.first_name, u.last_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    return {
      payments: payments.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount)
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logError('Error listing all payments', error, { options });
    throw error;
  }
}

module.exports = {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS,
  createPayment,
  confirmPayment,
  failPayment,
  refundPayment,
  getPaymentById,
  getPaymentsByOrderId,
  listAllPayments,
  createStripePaymentIntent,
  mapStripeStatusToPaymentStatus
};
