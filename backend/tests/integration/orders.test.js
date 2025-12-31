// ============================================
// Tests de Integración - Órdenes
// ============================================
// Tests end-to-end de creación de órdenes

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../../db');
const bcrypt = require('bcryptjs');
const cartService = require('../../services/cart.service');
const orderService = require('../../services/order.service');
const inventoryService = require('../../services/inventory.service');

// Mock de rate limiters
jest.mock('../../security/rateLimiter', () => ({
  rateLimiters: {
    checkout: (req, res, next) => next(),
    api: (req, res, next) => next(),
    private: (req, res, next) => next(),
    public: (req, res, next) => next()
  }
}));

// Mock de middleware de autenticación
const { testAuthenticate } = require('../helpers/testAuth');

// Mock de requireAdmin si se necesita
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
app.use('/api/orders', require('../../routes/orders.routes'));

describe('Orders Integration Tests', () => {
  let testUser;
  let testToken;
  let testProduct;
  let testVariant;
  let testCategory;
  let testInventory;
  const testEmail = `order_test_${Date.now()}@example.com`;
  const testProductName = `Test Product ${Date.now()}`;

  beforeAll(async () => {
    // Crear usuario de prueba
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [testEmail, passwordHash, 'Test User', 'customer']
    );
    testUser = { id: userResult.insertId, email: testEmail };

    // Generar token
    testToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    // Crear categoría de prueba
    const categoryResult = await query(
      'INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)',
      [`Test Category ${Date.now()}`, `test-category-${Date.now()}`, 'Test category', 1]
    );
    testCategory = { id: categoryResult.insertId };

    // Crear producto de prueba
    const productResult = await query(
      'INSERT INTO products (name, slug, description, price, category_id, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [testProductName, `test-product-${Date.now()}`, 'Test product description', 99.99, testCategory.id, 1, 100]
    );
    testProduct = { id: productResult.insertId, price: 99.99 };

    // Crear variante de prueba
    const variantResult = await query(
      'INSERT INTO product_variants (product_id, name, sku, price, stock, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [testProduct.id, 'Test Variant', `SKU-${Date.now()}`, 99.99, 50, 1]
    );
    testVariant = { id: variantResult.insertId, price: 99.99 };

    // Inicializar inventario para la variante
    await inventoryService.initializeStock(testVariant.id, 50, testUser.id, 'Stock inicial para tests');
    testInventory = await inventoryService.getInventoryInfo(testVariant.id);
  });

  afterAll(async () => {
    // Cleanup completo (solo si las variables están definidas)
    if (testUser && testUser.id) {
      await query('DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [testUser.id]).catch(() => {});
      await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [testUser.id]).catch(() => {});
      await query('DELETE FROM orders WHERE user_id = ?', [testUser.id]).catch(() => {});
      await query('DELETE FROM cart_items WHERE user_id = ?', [testUser.id]).catch(() => {});
      await query('DELETE FROM users WHERE id = ?', [testUser.id]).catch(() => {});
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

  beforeEach(async () => {
    // Limpiar carrito antes de cada test
    await cartService.clearCart(testUser.id);
  });

  describe('POST /api/orders', () => {
    it('should reject order creation without authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should reject order creation with empty cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          shipping_name: 'Test User',
          shipping_street: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('carrito está vacío');
    });

    it('should create order successfully with valid cart and address', async () => {
      // 1. Agregar item al carrito
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 2,
        price_snapshot: testVariant.price
      });

      // 2. Crear orden
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          shipping_name: 'Test User',
          shipping_street: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México',
          shipping_phone: '1234567890',
          subtotal: 199.98,
          shipping_cost: 10.00,
          tax: 32.00,
          discount: 0,
          total: 241.98
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.order_number).toBeDefined();
      expect(response.body.data.order.items).toHaveLength(1);
      expect(response.body.data.order.items[0].quantity).toBe(2);
      expect(response.body.data.order.items[0].product_price).toBe(testVariant.price);
    });

    it('should reject order creation if stock is insufficient', async () => {
      // Agregar cantidad mayor al stock disponible
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 100, // Más que el stock disponible (50)
        price_snapshot: testVariant.price
      });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          shipping_name: 'Test User',
          shipping_street: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México'
        });

      // Debe fallar por validación de stock (aunque el item ya está en carrito, se re-valida)
      // Nota: En el flujo actual, el carrito valida stock al agregar, pero puede cambiar
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject order creation with invalid address', async () => {
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          shipping_name: '', // Inválido
          shipping_street: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate price consistency (prevent price manipulation)', async () => {
      // Agregar item con precio correcto
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      // Cambiar precio del producto/variante en BD
      await query(
        'UPDATE product_variants SET price = ? WHERE id = ?',
        [199.99, testVariant.id] // Precio diferente
      );

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          shipping_name: 'Test User',
          shipping_street: '123 Test St',
          shipping_city: 'Test City',
          shipping_state: 'Test State',
          shipping_zip: '12345',
          shipping_country: 'México'
        });

      // Debe fallar por inconsistencia de precios
      expect(response.status).toBeGreaterThanOrEqual(400);

      // Restaurar precio original
      await query(
        'UPDATE product_variants SET price = ? WHERE id = ?',
        [testVariant.price, testVariant.id]
      );
    });

    it('should create order with address_id instead of manual address', async () => {
      // Crear dirección para el usuario
      const addressResult = await query(
        `INSERT INTO addresses (user_id, type, first_name, last_name, street, city, state, zip_code, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [testUser.id, 'both', 'Test', 'User', '123 Test St', 'Test City', 'Test State', '12345', 'México', 1]
      );
      const addressId = addressResult.insertId;

      // Agregar item al carrito
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      // Crear orden con address_id
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          address_id: addressId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.shipping_name).toContain('Test');

      // Cleanup
      await query('DELETE FROM addresses WHERE id = ?', [addressId]);
    });
  });

  describe('GET /api/orders', () => {
    it('should list user orders', async () => {
      // Crear una orden primero
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      await orderService.createOrderFromCart(
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

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeDefined();
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order details', async () => {
      // Crear una orden
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price
      });

      const order = await orderService.createOrderFromCart(
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

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.id).toBe(order.id);
      expect(response.body.data.order.items).toBeDefined();
    });

    it('should reject access to order from another user', async () => {
      // Crear otro usuario
      const passwordHash2 = await bcrypt.hash('testpass123', 10);
      const user2Result = await query(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [`test2_${Date.now()}@example.com`, passwordHash2, 'Test User 2', 'customer']
      );
      const user2Id = user2Result.insertId;

      // Crear orden para user2
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

      // Intentar acceder con testUser
      const response = await request(app)
        .get(`/api/orders/${order2.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404); // Orden no encontrada para este usuario

      // Cleanup
      await query('DELETE FROM order_status_history WHERE order_id = ?', [order2.id]);
      await query('DELETE FROM order_items WHERE order_id = ?', [order2.id]);
      await query('DELETE FROM orders WHERE id = ?', [order2.id]);
      await query('DELETE FROM cart_items WHERE user_id = ?', [user2Id]);
      await query('DELETE FROM users WHERE id = ?', [user2Id]);
    });
  });
});
