// ============================================
// Integration Tests - Error Handling
// ============================================
// Tests para verificar que todas las clases de error funcionan correctamente

const request = require('supertest');
const express = require('express');
const { errorHandler } = require('../../middleware/errorHandler');
const {
  ValidationError,
  AuthError,
  PermissionError,
  BusinessError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError
} = require('../../utils/errors');

// Crear app Express para tests
const app = express();
app.use(express.json());

// Rutas de prueba que lanzan diferentes tipos de error
app.get('/test/validation-error', (req, res, next) => {
  next(new ValidationError('Validation failed', ['Field required']));
});

app.get('/test/auth-error', (req, res, next) => {
  next(new AuthError('Token invalid'));
});

app.get('/test/permission-error', (req, res, next) => {
  next(new PermissionError('Access denied', null, 'admin'));
});

app.get('/test/business-error', (req, res, next) => {
  next(new BusinessError('Stock insufficient', null, 'INSUFFICIENT_STOCK'));
});

app.get('/test/not-found-error', (req, res, next) => {
  next(new NotFoundError('Product not found', 'product'));
});

app.get('/test/conflict-error', (req, res, next) => {
  next(new ConflictError('Email already exists', 'user'));
});

app.get('/test/rate-limit-error', (req, res, next) => {
  next(new RateLimitError('Too many requests', 60));
});

app.get('/test/database-error', (req, res, next) => {
  next(new DatabaseError('DB connection failed', 'ER_CONNECTION_FAILED'));
});

app.get('/test/generic-error', (req, res, next) => {
  next(new Error('Generic error'));
});

// Error handler debe ser el último middleware
app.use(errorHandler);

describe('Error Handling Integration Tests', () => {
  describe('ValidationError', () => {
    it('should return 400 with errors array', async () => {
      const response = await request(app)
        .get('/test/validation-error');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(['Field required']);
      expect(response.body.errorId).toBeDefined();
    });
  });

  describe('AuthError', () => {
    it('should return 401 with auth error message', async () => {
      const response = await request(app)
        .get('/test/auth-error');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
      expect(response.body.errorId).toBeDefined();
    });
  });

  describe('PermissionError', () => {
    it('should return 403 with permission error', async () => {
      const response = await request(app)
        .get('/test/permission-error');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permisos');
    });
  });

  describe('BusinessError', () => {
    it('should return 400 with business error', async () => {
      const response = await request(app)
        .get('/test/business-error');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('should return 404 with not found message', async () => {
      const response = await request(app)
        .get('/test/not-found-error');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recurso no encontrado');
    });
  });

  describe('ConflictError', () => {
    it('should return 409 with conflict message', async () => {
      const response = await request(app)
        .get('/test/conflict-error');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('RateLimitError', () => {
    it('should return 429 with retryAfter', async () => {
      const response = await request(app)
        .get('/test/rate-limit-error');

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.errorId).toBeDefined();
    });
  });

  describe('DatabaseError', () => {
    it('should return 500 for generic DB errors', async () => {
      const response = await request(app)
        .get('/test/database-error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Generic Error', () => {
    it('should handle generic errors as 500', async () => {
      const response = await request(app)
        .get('/test/generic-error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.errorId).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should include errorId in all error responses', async () => {
      const response = await request(app)
        .get('/test/validation-error');

      expect(response.body).toHaveProperty('errorId');
      expect(typeof response.body.errorId).toBe('string');
    });

    it('should not expose stack traces in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/test/generic-error');

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.debug).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

