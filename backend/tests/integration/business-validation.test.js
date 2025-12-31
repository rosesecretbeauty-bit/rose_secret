// ============================================
// Tests de Integración - Validaciones de Negocio
// ============================================
// Tests para validar que las reglas de negocio se cumplen correctamente

const { query } = require('../../db');
const bcrypt = require('bcryptjs');
const cartService = require('../../services/cart.service');
const inventoryService = require('../../services/inventory.service');
const orderService = require('../../services/order.service');

describe('Business Validation Integration Tests', () => {
  let testUser = null;
  let testProduct = null;
  let testVariant = null;
  let testCategory = null;
  const testEmail = `validation_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear usuario
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [testEmail, passwordHash, 'Test User', 'customer']
    );
    testUser = { id: userResult.insertId };

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
      [testProduct.id, 'Test Variant', `SKU-${Date.now()}`, 99.99, 10, 1] // Stock limitado: 10
    );
    testVariant = { id: variantResult.insertId, price: 99.99 };

    // Inicializar inventario
    await inventoryService.initializeStock(testVariant.id, 10, testUser.id, 'Test stock');
  });

  afterAll(async () => {
    // Cleanup (solo si las variables están definidas)
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

  describe('Stock Validation', () => {
    it('should prevent adding item to cart when stock is insufficient', async () => {
      // Intentar agregar cantidad mayor al stock disponible
      await expect(
        cartService.addItem(testUser.id, {
          product_id: testProduct.id,
          variant_id: testVariant.id,
          quantity: 15, // Más que el stock disponible (10)
          price_snapshot: testVariant.price
        })
      ).rejects.toThrow('Stock insuficiente');
    });

    it('should prevent creating order when stock is insufficient', async () => {
      // Agregar cantidad válida inicialmente
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 5,
        price_snapshot: testVariant.price
      });

      // Reducir stock disponible (simular que otro usuario compró)
      await inventoryService.recordSale(testVariant.id, 8, null); // Reducir stock a 2

      // Intentar crear orden (tiene 5 en carrito, pero solo hay 2 disponibles ahora)
      await expect(
        orderService.createOrderFromCart(
          testUser.id,
          {
            shipping_name: 'Test User',
            shipping_street: '123 Test St',
            shipping_city: 'Test City',
            shipping_state: 'Test State',
            shipping_zip: '12345',
            shipping_country: 'México'
          },
          { subtotal: 499.95, shipping_cost: 10, tax: 80, discount: 0, total: 589.95 }
        )
      ).rejects.toThrow('Stock insuficiente');
    });

    it('should reserve stock when adding item to cart', async () => {
      const initialStock = await inventoryService.getInventoryInfo(testVariant.id);
      const initialAvailable = initialStock.available_stock;

      // Agregar item al carrito
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 3,
        price_snapshot: testVariant.price
      });

      // Verificar que el stock disponible se redujo
      const afterStock = await inventoryService.getInventoryInfo(testVariant.id);
      expect(afterStock.available_stock).toBe(initialAvailable - 3);
      expect(afterStock.reserved_stock).toBe(3);
    });

    it('should release stock when removing item from cart', async () => {
      // Agregar item
      const item = await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 3,
        price_snapshot: testVariant.price
      });

      const stockBefore = await inventoryService.getInventoryInfo(testVariant.id);
      const reservedBefore = stockBefore.reserved_stock;

      // Remover item
      await cartService.removeItem(item.id, testUser.id);

      // Verificar que el stock se liberó
      const stockAfter = await inventoryService.getInventoryInfo(testVariant.id);
      expect(stockAfter.reserved_stock).toBe(reservedBefore - 3);
      expect(stockAfter.available_stock).toBeGreaterThan(stockBefore.available_stock);
    });
  });

  describe('Price Validation', () => {
    it('should prevent price manipulation when creating order', async () => {
      // Agregar item con precio correcto
      await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 1,
        price_snapshot: testVariant.price // 99.99
      });

      // Cambiar precio del producto/variante en BD (simular cambio de precio)
      await query(
        'UPDATE product_variants SET price = ? WHERE id = ?',
        [199.99, testVariant.id] // Precio diferente
      );

      // Intentar crear orden debe fallar por inconsistencia de precios
      await expect(
        orderService.createOrderFromCart(
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
        )
      ).rejects.toThrow('precio ha cambiado');

      // Restaurar precio original
      await query(
        'UPDATE product_variants SET price = ? WHERE id = ?',
        [testVariant.price, testVariant.id]
      );
    });
  });

  describe('Quantity Limits Validation', () => {
    it('should enforce maximum quantity per item', async () => {
      const MAX_QUANTITY = parseInt(process.env.MAX_CART_ITEM_QUANTITY || '10', 10);

      // Intentar agregar cantidad mayor al máximo
      await expect(
        cartService.addItem(testUser.id, {
          product_id: testProduct.id,
          variant_id: testVariant.id,
          quantity: MAX_QUANTITY + 1,
          price_snapshot: testVariant.price
        })
      ).rejects.toThrow('cantidad máxima');
    });

    it('should enforce maximum quantity when updating cart item', async () => {
      const MAX_QUANTITY = parseInt(process.env.MAX_CART_ITEM_QUANTITY || '10', 10);

      // Agregar item con cantidad válida
      const item = await cartService.addItem(testUser.id, {
        product_id: testProduct.id,
        variant_id: testVariant.id,
        quantity: 5,
        price_snapshot: testVariant.price
      });

      // Intentar actualizar a cantidad mayor al máximo
      await expect(
        cartService.updateItem(item.id, MAX_QUANTITY + 1, testUser.id)
      ).rejects.toThrow('cantidad máxima');
    });
  });

  describe('Order Status Validation', () => {
    it('should prevent creating payment for order that is not pending', async () => {
      // Crear orden
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

      // Cambiar orden a paid
      await query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', ['paid', 'paid', order.id]);

      // Intentar crear pago debe fallar
      const paymentService = require('../../services/payment.service');
      await expect(
        paymentService.createPayment(order.id, 'stripe', {})
      ).rejects.toThrow('Solo se pueden crear pagos para órdenes en estado');
    });
  });
});
