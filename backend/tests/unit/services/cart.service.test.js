// ============================================
// Unit Tests - Cart Service
// ============================================

const cartService = require('../../../services/cart.service');
const { query, transaction } = require('../../../db');
const inventoryService = require('../../../services/inventory.service');

// Mock de DB
jest.mock('../../../db', () => ({
  query: jest.fn(),
  transaction: jest.fn()
}));

// Mock de inventory service
jest.mock('../../../services/inventory.service', () => ({
  reserveStock: jest.fn(),
  releaseStock: jest.fn(),
  validateStock: jest.fn()
}));

describe('Cart Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should reject quantity exceeding maximum', async () => {
      const MAX_QUANTITY = 10;
      process.env.MAX_CART_ITEM_QUANTITY = MAX_QUANTITY.toString();

      await expect(
        cartService.addItem(1, {
          product_id: 1,
          variant_id: 1,
          quantity: MAX_QUANTITY + 1,
          price_snapshot: 100
        })
      ).rejects.toThrow('cantidad máxima');
    });

    it('should validate variant_id for products with variants', async () => {
      query.mockResolvedValueOnce([{ count: 1 }]); // Producto tiene variantes

      await expect(
        cartService.addItem(1, {
          product_id: 1,
          quantity: 1,
          price_snapshot: 100
          // Sin variant_id
        })
      ).rejects.toThrow('requiere seleccionar una variante');
    });
  });

  describe('validateStock', () => {
    it('should use inventory service for stock validation', async () => {
      inventoryService.validateStock.mockResolvedValue({
        valid: true,
        available: 10
      });

      const result = await inventoryService.validateStock(1, 5);
      expect(result.valid).toBe(true);
    });
  });
});

