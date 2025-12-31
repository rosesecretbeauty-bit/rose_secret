// ============================================
// Integration Tests - Rate Limiting
// ============================================

const request = require('supertest');
const express = require('express');

// Mock rate limiters para permitir control manual
const rateLimiterModule = require('../../security/rateLimiter');
const originalCreateRateLimiter = rateLimiterModule.createRateLimiter;

describe('Rate Limiting Integration Tests', () => {
  let app;
  let testLimiter;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Crear rate limiter de prueba (muy bajo para tests)
    testLimiter = originalCreateRateLimiter({
      windowMs: 5000, // 5 segundos
      maxRequests: 3, // Solo 3 requests
      blockDurationMs: 5000, // 5 segundos de bloqueo
      keyType: 'ip'
    });

    // Ruta de prueba con rate limiting
    app.get('/api/test/rate-limit', testLimiter, (req, res) => {
      res.json({ success: true, message: 'OK' });
    });
  });

  describe('Rate Limit Behavior', () => {
    it('should allow requests within limit', async () => {
      // Hacer 3 requests (dentro del límite)
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/api/test/rate-limit');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should block requests exceeding limit', async () => {
      // Limpiar contadores anteriores
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Hacer 3 requests permitidas
      for (let i = 0; i < 3; i++) {
        await request(app).get('/api/test/rate-limit');
      }

      // 4to request debería ser bloqueado
      const response = await request(app)
        .get('/api/test/rate-limit');

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.errorId).toBeDefined();
      expect(response.headers['retry-after']).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      await new Promise(resolve => setTimeout(resolve, 6000));

      const response = await request(app)
        .get('/api/test/rate-limit');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('Rate Limit by IP', () => {
    it('should track rate limit per IP separately', async () => {
      await new Promise(resolve => setTimeout(resolve, 6000));

      // IP 1 hace 3 requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/api/test/rate-limit')
          .set('X-Forwarded-For', '192.168.1.1');
      }

      // IP 2 debería poder hacer requests
      const response = await request(app)
        .get('/api/test/rate-limit')
        .set('X-Forwarded-For', '192.168.1.2');

      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limit Reset', () => {
    it('should reset after window expires', async () => {
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Llenar límite
      for (let i = 0; i < 3; i++) {
        await request(app).get('/api/test/rate-limit');
      }

      // Esperar que expire la ventana
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Ahora debería permitir requests nuevamente
      const response = await request(app)
        .get('/api/test/rate-limit');

      expect(response.status).toBe(200);
    }, 15000); // Timeout extendido
  });
});

