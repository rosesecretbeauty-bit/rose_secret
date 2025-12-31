// ============================================
// Payment Methods Service - Métodos de Pago Guardados (Stripe)
// ============================================

// Inicializar Stripe solo si hay API key
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Stripe:', error.message);
  }
}

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info } = require('../logger');

/**
 * Obtener métodos de pago del usuario
 */
async function getUserPaymentMethods(userId) {
  try {
    const methods = await query(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    return methods.map(method => ({
      id: method.id,
      stripe_payment_method_id: method.stripe_payment_method_id,
      type: method.type,
      card_brand: method.card_brand,
      card_last4: method.card_last4,
      card_exp_month: method.card_exp_month,
      card_exp_year: method.card_exp_year,
      is_default: method.is_default === 1,
      created_at: method.created_at
    }));
  } catch (error) {
    logError('Error getting payment methods:', error);
    throw error;
  }
}

/**
 * Agregar método de pago desde Stripe PaymentMethod ID
 */
async function addPaymentMethod(userId, stripePaymentMethodId) {
  try {
    if (!stripe) {
      throw new Error('Stripe no está configurado');
    }

    // Obtener PaymentMethod de Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    if (paymentMethod.type !== 'card') {
      throw new Error('Solo se soportan métodos de pago tipo tarjeta');
    }

    // Verificar que pertenece al usuario (si hay customer_id)
    // Nota: En producción, deberías verificar que el PaymentMethod esté asociado al Customer del usuario

    // Extraer información de la tarjeta
    const card = paymentMethod.card;
    const billingDetails = paymentMethod.billing_details;

    // Verificar si ya existe
    const existing = await query(
      'SELECT id FROM payment_methods WHERE stripe_payment_method_id = ?',
      [stripePaymentMethodId]
    );

    if (existing.length > 0) {
      throw new Error('Este método de pago ya está guardado');
    }

    // Si es el primer método, marcarlo como default
    const userMethods = await getUserPaymentMethods(userId);
    const isDefault = userMethods.length === 0;

    // Si se marca como default, desmarcar otros
    if (isDefault) {
      await query(
        'UPDATE payment_methods SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    // Guardar en BD
    const result = await query(
      `INSERT INTO payment_methods 
       (user_id, stripe_payment_method_id, type, card_brand, card_last4, card_exp_month, card_exp_year, is_default, billing_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        stripePaymentMethodId,
        paymentMethod.type,
        card.brand,
        card.last4,
        card.exp_month,
        card.exp_year,
        isDefault ? 1 : 0,
        JSON.stringify(billingDetails)
      ]
    );

    info('Payment method added', { userId, paymentMethodId: result.insertId, stripePaymentMethodId });

    return {
      id: result.insertId,
      stripe_payment_method_id: stripePaymentMethodId,
      type: paymentMethod.type,
      card_brand: card.brand,
      card_last4: card.last4,
      card_exp_month: card.exp_month,
      card_exp_year: card.exp_year,
      is_default: isDefault
    };
  } catch (error) {
    logError('Error adding payment method:', error);
    throw error;
  }
}

/**
 * Eliminar método de pago
 */
async function removePaymentMethod(userId, paymentMethodId) {
  try {
    // Verificar que pertenece al usuario
    const methods = await query(
      'SELECT * FROM payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    if (methods.length === 0) {
      throw new Error('Método de pago no encontrado');
    }

    const method = methods[0];

    // Si es default y hay otros métodos, marcar el siguiente como default
    if (method.is_default === 1) {
      const otherMethods = await query(
        'SELECT id FROM payment_methods WHERE user_id = ? AND id != ? ORDER BY created_at ASC LIMIT 1',
        [userId, paymentMethodId]
      );

      if (otherMethods.length > 0) {
        await query(
          'UPDATE payment_methods SET is_default = 1 WHERE id = ?',
          [otherMethods[0].id]
        );
      }
    }

    // Eliminar de BD (no eliminamos de Stripe para mantener historial)
    await query(
      'DELETE FROM payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    return { success: true };
  } catch (error) {
    logError('Error removing payment method:', error);
    throw error;
  }
}

/**
 * Marcar método de pago como default
 */
async function setDefaultPaymentMethod(userId, paymentMethodId) {
  try {
    // Verificar que pertenece al usuario
    const methods = await query(
      'SELECT id FROM payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    if (methods.length === 0) {
      throw new Error('Método de pago no encontrado');
    }

    // Desmarcar todos los demás
    await query(
      'UPDATE payment_methods SET is_default = 0 WHERE user_id = ?',
      [userId]
    );

    // Marcar este como default
    await query(
      'UPDATE payment_methods SET is_default = 1 WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    return { success: true };
  } catch (error) {
    logError('Error setting default payment method:', error);
    throw error;
  }
}

module.exports = {
  getUserPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
};

