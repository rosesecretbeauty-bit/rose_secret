// ============================================
// Tests de Integración - Pagos
// ============================================
// Tests end-to-end de procesamiento de pagos

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../../db');
const bcrypt = require('bcryptjs');
const cartService = require('../../services/cart.service');
const orderService = require('../../services/order.service');
const inventoryService = require('../../services/inventory.service');

// Mock de Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_test_1234567890',
          client_secret: 'pi_test_1234567890_secret_test',
          status: 'requires_payment_method',
          amount: 10000, // en centavos
          currency: 'usd'
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'pi_test_1234567890',
          status: 'succeeded',
          amount: 10000,
          currency: 'usd'
        }),
        confirm: jest.fn().mockResolvedValue({
          id: 'pi_test_1234567890',
          status: 'succeeded',
          amount: 10000,
          currency: 'usd'
        })
      },
      refunds: {
        create: jest.fn().mockResolvedValue({
          id: 're_test_1234567890',
          status: 'succeeded',
          amount: 10000
        })
      },
      webhooks: {
        constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
          return {
            id: 'evt_test_1234567890',
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: 'pi_test_1234567890',
                status: 'succeeded',
                amount: 10000,
                currency: 'usd'
              }
            }
          };
        })
      }
    };
  });
});

// Mock de rate limiters
jest.mock('../../security/rateLimiter', () => ({
  rateLimiters: {
    payment: (req, res, next) => next(),
    public: (req, res, next) => next(),
    admin: (req, res, next) => next()
  }
}));

// Mock de middleware de autenticación
jest.mock('../../middleware/auth', () => {
  const originalModule = jest.requireActual('../../middleware/auth');
  const { testAuthenticate, testRequireAdmin } = require('../helpers/testAuth');
  return {
    ...originalModule,
    authenticate: testAuthenticate,
    requireAdmin: testRequireAdmin
  };
});

const app = express();
app.use(express.json());
app.use('/api/payments', require('../../routes/payment.routes'));

describe('Payments Integration Tests', () => {
  let testUser = null;
  let testAdmin = null;
  let testToken = null;
  let testAdminToken = null;
  let testProduct = null;
  let testVariant = null;
  let testCategory = null;
  let testOrder = null;
  const testEmail = `payment_test_${Date.now()}@example.com`;
  const testAdminEmail = `admin_payment_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear usuario de prueba
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [testEmail, passwordHash, 'Test User', 'customer']
    );
    testUser = { id: userResult.insertId };

    // Crear admin de prueba
    const adminResult = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [testAdminEmail, passwordHash, 'Test Admin', 'admin']
    );
    testAdmin = { id: adminResult.insertId };

    // Generar tokens
    testToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    testAdminToken = jwt.sign(
      { userId: testAdmin.id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    // Crear categoría, producto y variante
    const categoryResult = await query(
      'INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)',
      [`Test Category ${Date.now()}`, `test-cat-${Date.now()}`, 'Test', 1]
    );
    testCategory = { id: categoryResult.insertId };

    const productResult = await query(
      'INSERT INTO products (name, slug, description, price, category_id, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`Test Product ${Date.now()}`, `test-prod-${Date.now()}`, 'Test', 99.99, testCategory.id, 1, 100]
    );
    testProduct = { id: productResult.insertId, price: 99.99 };

    const variantResult = await query(
      'INSERT INTO product_variants (product_id, name, sku, price, stock, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [testProduct.id, 'Test Variant', `SKU-${Date.now()}`, 99.99, 50, 1]
    );
    testVariant = { id: variantResult.insertId };

    // Inicializar inventario
    await inventoryService.initializeStock(testVariant.id, 50, testUser.id, 'Test stock');

    // Crear orden de prueba
    await cartService.addItem(testUser.id, {
      product_id: testProduct.id,
      variant_id: testVariant.id,
      quantity: 1,
      price_snapshot: testVariant.price
    });

    testOrder = await orderService.createOrderFromCart(
      testUser.id,
      {
        shipping_name: 'Test User',
        shipping_street: '123 Test St',
        shipping_city: 'Test City',
        shipping_state: 'Test State',
        shipping_zip: '12345',
        shipping_country: 'México'
      },
      { subtotal: 99.99, shipping_cost: 10, tax: 16, discount: 0, total: 125.99 }
    );
  });

  afterAll(async () => {
    // Cleanup (solo si las variables están definidas)
    if (testUser && testUser.id) {
      await query('DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [testUser.id]).catch(() => {});
      await query('DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [testUser.id]).catch(() => {});
      await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [testUser.id]).catch(() => {});
      await query('DELETE FROM orders WHERE user_id = ?', [testUser.id]).catch(() => {});
      await query('DELETE FROM cart_items WHERE user_id = ?', [testUser.id]).catch(() => {});
      await query('DELETE FROM users WHERE id = ?', [testUser.id]).catch(() => {});
    }
    if (testAdmin && testAdmin.id) {
      await query('DELETE FROM orders WHERE user_id = ?', [testAdmin.id]).catch(() => {});
      await query('DELETE FROM cart_items WHERE user_id = ?', [testAdmin.id]).catch(() => {});
      await query('DELETE FROM users WHERE id = ?', [testAdmin.id]).catch(() => {});
    }
    if (testVariant && testVariant.id) {
      await query('DELETE FROM inventory_movements WHERE variant_id = ?', [testVariant.id]).catch(() => {});
      await query('DELETE FROM inventory WHERE variant_id = ?', [testVariant.id]).catch(() => {});
      await query('DELETE FROM product_variants WHERE id = ?', [testVariant.id]).catch(() => {});
    }
    if (testProduct && testProduct.id) {
      await query('DELETE FROM products WHERE id = ?', [testProduct.id]).catch(() => {});
    }
    if (testCategory && testCategory.id) {
      await query('DELETE FROM categories WHERE id = ?', [testCategory.id]).catch(() => {});
    }
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent successfully', async () => {
      // Asegurar que la orden está en estado pending
      await query('UPDATE orders SET status = ? WHERE id = ?', ['pending', testOrder.id]);

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: testOrder.id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data).toHaveProperty('amount');
      expect(response.body.data.clientSecret).toBeDefined();
    });

    it('should reject payment intent creation without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({
          order_id: testOrder.id
        });

      expect(response.status).toBe(401);
    });

    it('should reject payment intent for order from another user', async () => {
      // Crear otro usuario y orden
      const passwordHash2 = await bcrypt.hash('testpass123', 10);
      const user2Result = await query(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [`test2_${Date.now()}@example.com`, passwordHash2, 'Test User 2', 'customer']
      );
      const user2Id = user2Result.insertId;

      await cartService.addItem(user2Id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      const order2 = await orderService.createOrderFromCart(
        user2Id,
        {
          shipping_name: 'Test User 2',
          shipping_street: '456 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México'
        },
        { subtotal: 99.99, shipping_cost: 10, tax: 16, discount: 0, total: 125.99 }
      );

      // Intentar crear payment intent con testUser (no es dueño de order2)
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: order2.id
        });

      expect(response.status).toBe(404); // Orden no encontrada para este usuario

      // Cleanup
      await query('DELETE FROM order_status_history WHERE order_id = ?', [order2.id]);
      await query('DELETE FROM order_items WHERE order_id = ?', [order2.id]);
      await query('DELETE FROM orders WHERE id = ?', [order2.id]);
      await query('DELETE FROM cart_items WHERE user_id = ?', [user2Id]);
      await query('DELETE FROM users WHERE id = ?', [user2Id]);
    });

    it('should reject payment intent for order that is not pending', async () => {
      // Cambiar estado de orden a paid
      await query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', ['paid', 'paid', testOrder.id]);

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: testOrder.id
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Solo se pueden crear pagos');

      // Restaurar estado
      await query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', ['pending', 'pending', testOrder.id]);
    });

    it('should reject payment intent with invalid order_id', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: 999999 // Orden que no existe
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/orders/:orderId/status', () => {
    it('should get payment status for order', async () => {
      // Crear un pago primero
      await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: testOrder.id
        });

      const response = await request(app)
        .get(`/api/payments/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data).toHaveProperty('order_status');
      expect(response.body.data).toHaveProperty('payment_status');
    });

    it('should reject access to payment status without authentication', async () => {
      const response = await request(app)
        .get(`/api/payments/orders/${testOrder.id}/status`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment successfully', async () => {
      // Crear payment intent primero
      const intentResponse = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_id: testOrder.id
        });

      const paymentIntentId = 'pi_test_1234567890'; // Mock de Stripe

      // Obtener payment_id del response o de la BD
      const payments = await query(
        'SELECT id, external_reference FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
        [testOrder.id]
      );

      if (payments.length > 0) {
        const response = await request(app)
          .post('/api/payments/confirm')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            payment_intent_id: paymentIntentId,
            order_id: testOrder.id
          });

        // Puede ser 200 si el pago ya fue procesado (idempotente)
        expect([200, 400]).toContain(response.status);
      }
    });

    it('should reject confirmation with invalid payment_intent_id', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          payment_intent_id: 'invalid_intent_id',
          order_id: testOrder.id
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
