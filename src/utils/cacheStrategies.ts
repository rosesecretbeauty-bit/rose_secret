// Advanced Cache Strategies for Rose Secret Platform

export interface CacheConfig {
  name: string;
  maxAge: number; // in milliseconds
  maxItems?: number;
}
export const CACHE_CONFIGS = {
  images: {
    name: 'rose-secret-images',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // 7 days
    maxItems: 100
  },
  api: {
    name: 'rose-secret-api',
    maxAge: 5 * 60 * 1000,
    // 5 minutes
    maxItems: 50
  },
  static: {
    name: 'rose-secret-static',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // 30 days
    maxItems: 200
  },
  products: {
    name: 'rose-secret-products',
    maxAge: 60 * 60 * 1000,
    // 1 hour
    maxItems: 100
  }
};
class CacheManager {
  private static instance: CacheManager;
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Cache with expiration
  async set(key: string, data: any, config: CacheConfig): Promise<void> {
    try {
      const cache = await caches.open(config.name);
      const response = new Response(JSON.stringify({
        data,
        timestamp: Date.now(),
        maxAge: config.maxAge
      }));
      await cache.put(key, response);

      // Cleanup old entries if maxItems exceeded
      if (config.maxItems) {
        await this.cleanupCache(config.name, config.maxItems);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Get from cache with expiration check
  async get<T>(key: string, config: CacheConfig): Promise<T | null> {
    try {
      const cache = await caches.open(config.name);
      const response = await cache.match(key);
      if (!response) return null;
      const cached = await response.json();
      const age = Date.now() - cached.timestamp;

      // Check if expired
      if (age > cached.maxAge) {
        await cache.delete(key);
        return null;
      }
      return cached.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Clear specific cache
  async clear(cacheName: string): Promise<void> {
    try {
      await caches.delete(cacheName);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Clear all caches
  async clearAll(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  // Cleanup old entries
  private async cleanupCache(cacheName: string, maxItems: number): Promise<void> {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      if (keys.length > maxItems) {
        const itemsToDelete = keys.length - maxItems;
        for (let i = 0; i < itemsToDelete; i++) {
          await cache.delete(keys[i]);
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  // Prefetch resources
  async prefetch(urls: string[], config: CacheConfig): Promise<void> {
    try {
      const cache = await caches.open(config.name);
      await Promise.all(urls.map(url => fetch(url).then(response => cache.put(url, response)).catch(err => console.warn(`Failed to prefetch ${url}:`, err))));
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  }
}
export const cacheManager = CacheManager.getInstance();

// Helper functions for common operations
export const cacheImage = (url: string, data: Blob) => cacheManager.set(url, data, CACHE_CONFIGS.images);
export const getCachedImage = (url: string) => cacheManager.get<Blob>(url, CACHE_CONFIGS.images);
export const cacheApiResponse = (url: string, data: any) => cacheManager.set(url, data, CACHE_CONFIGS.api);
export const getCachedApiResponse = <T,>(url: string) => cacheManager.get<T>(url, CACHE_CONFIGS.api);
export const cacheProduct = (id: string, data: any) => cacheManager.set(`product-${id}`, data, CACHE_CONFIGS.products);
export const getCachedProduct = (id: string) => cacheManager.get(`product-${id}`, CACHE_CONFIGS.products);

// Prefetch critical resources
export const prefetchCriticalResources = async () => {
  const criticalUrls = ['/api/products/featured', '/api/categories', '/api/brands'];
  await cacheManager.prefetch(criticalUrls, CACHE_CONFIGS.api);
};