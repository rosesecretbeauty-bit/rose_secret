// ============================================
// Unit Tests - Inventory Service
// ============================================
// Tests unitarios para funciones críticas de inventario

const inventoryService = require('../../../services/inventory.service');
const { query, transaction } = require('../../../db');
const { BusinessError } = require('../../../utils/errors');

// Mock de DB
jest.mock('../../../db', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  queryWithConnection: jest.fn()
}));

describe('Inventory Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateStock', () => {
    it('should return valid when stock is sufficient', async () => {
      const mockInventory = { available_stock: 10 };
      query.mockResolvedValue([mockInventory]);

      const result = await inventoryService.validateStock(1, 5);

      expect(result.valid).toBe(true);
      expect(result.available).toBe(10);
    });

    it('should return invalid when stock is insufficient', async () => {
      const mockInventory = { available_stock: 3 };
      query.mockResolvedValue([mockInventory]);

      const result = await inventoryService.validateStock(1, 5);

      expect(result.valid).toBe(false);
      expect(result.available).toBe(3);
      expect(result.message).toContain('insuficiente');
    });

    it('should return invalid when variant does not exist', async () => {
      query.mockResolvedValue([]);

      const result = await inventoryService.validateStock(999, 1);

      expect(result.valid).toBe(false);
      expect(result.available).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      query.mockRejectedValue(new Error('Database connection failed'));

      const result = await inventoryService.validateStock(1, 1);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Error');
    });
  });

  describe('getAvailableStock', () => {
    it('should return available stock', async () => {
      const mockInventory = { available_stock: 15 };
      query.mockResolvedValue([mockInventory]);

      const stock = await inventoryService.getAvailableStock(1);

      expect(stock).toBe(15);
    });

    it('should return 0 when variant has no inventory', async () => {
      query.mockResolvedValue([]);

      const stock = await inventoryService.getAvailableStock(999);

      expect(stock).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle transaction failures', async () => {
      transaction.mockImplementation(async (callback) => {
        throw new Error('Transaction failed');
      });

      await expect(
        inventoryService.reserveStock(1, 5, 'cart', 1)
      ).rejects.toThrow('Transaction failed');
    });
  });
});

