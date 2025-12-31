// ============================================
// Integration Tests - Cache Behavior
// ============================================

const cacheManager = require('../../cache');
const redis = require('../../cache/redis');

describe('Cache Integration Tests', () => {
  beforeEach(async () => {
    // Limpiar cache antes de cada test
    await cacheManager.flush();
  });

  describe('Cache Get/Set', () => {
    it('should store and retrieve value from cache', async () => {
      const key = 'test:key:1';
      const value = { data: 'test value' };

      await cacheManager.set(key, value, 60000);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const retrieved = await cacheManager.get('non:existent:key');
      expect(retrieved).toBeNull();
    });

    it('should expire cached value after TTL', async () => {
      const key = 'test:ttl:1';
      const value = 'test';

      await cacheManager.set(key, value, 1000); // 1 segundo

      // Verificar que está cacheado
      expect(await cacheManager.get(key)).toBe(value);

      // Esperar que expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Debería estar expirado
      expect(await cacheManager.get(key)).toBeNull();
    }, 3000);
  });

  describe('Cache Delete', () => {
    it('should delete cached value', async () => {
      const key = 'test:delete:1';
      const value = 'test';

      await cacheManager.set(key, value, 60000);
      expect(await cacheManager.get(key)).toBe(value);

      await cacheManager.del(key);
      expect(await cacheManager.get(key)).toBeNull();
    });

    it('should delete multiple keys by pattern', async () => {
      await cacheManager.set('products:1', 'value1', 60000);
      await cacheManager.set('products:2', 'value2', 60000);
      await cacheManager.set('categories:1', 'value3', 60000);

      await cacheManager.delPattern('products:*');

      expect(await cacheManager.get('products:1')).toBeNull();
      expect(await cacheManager.get('products:2')).toBeNull();
      expect(await cacheManager.get('categories:1')).toBe('value3');
    });
  });

  describe('Cache GetOrSet', () => {
    it('should return cached value if exists', async () => {
      const key = 'test:getorset:1';
      const cachedValue = 'cached';

      await cacheManager.set(key, cachedValue, 60000);

      const result = await cacheManager.getOrSet(
        key,
        async () => 'new value',
        60000
      );

      expect(result).toBe(cachedValue);
    });

    it('should execute function and cache result if not cached', async () => {
      const key = 'test:getorset:2';
      let callCount = 0;

      const fn = async () => {
        callCount++;
        return 'computed value';
      };

      // Primera llamada (no cacheado)
      const result1 = await cacheManager.getOrSet(key, fn, 60000);
      expect(result1).toBe('computed value');
      expect(callCount).toBe(1);

      // Segunda llamada (debe usar cache)
      const result2 = await cacheManager.getOrSet(key, fn, 60000);
      expect(result2).toBe('computed value');
      expect(callCount).toBe(1); // No debería llamar la función de nuevo
    });
  });

  describe('Cache Stats', () => {
    it('should track cache hits and misses', async () => {
      const statsBefore = await cacheManager.getStats();

      await cacheManager.set('test:stats:1', 'value', 60000);
      await cacheManager.get('test:stats:1'); // Hit
      await cacheManager.get('test:stats:1'); // Hit
      await cacheManager.get('non:existent'); // Miss

      const statsAfter = await cacheManager.getStats();

      // Verificar que hay hits y misses
      expect(statsAfter.hits).toBeGreaterThan(statsBefore.hits);
      expect(statsAfter.misses).toBeGreaterThan(statsBefore.misses);
    });
  });

  describe('Cache Health', () => {
    it('should report healthy cache status', () => {
      const healthy = cacheManager.isHealthy();
      expect(typeof healthy).toBe('boolean');
    });
  });
});

