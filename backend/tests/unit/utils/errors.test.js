// ============================================
// Unit Tests - Custom Error Classes
// ============================================

const {
  AppError,
  ValidationError,
  AuthError,
  PermissionError,
  BusinessError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
  RateLimitError,
  DatabaseError
} = require('../../../utils/errors');

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.type).toBe('INTERNAL_ERROR');
      expect(error.userMessage).toBe('Test error');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom', 400, 'CUSTOM_TYPE', 'User message');
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe('CUSTOM_TYPE');
      expect(error.userMessage).toBe('User message');
    });

    it('should have toJSON method', () => {
      const error = new AppError('Test');
      const json = error.toJSON();
      expect(json).toHaveProperty('name', 'AppError');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('type');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with errors array', () => {
      const errors = ['Field required', 'Invalid format'];
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });

    it('should include errors in toJSON', () => {
      const error = new ValidationError('Failed', ['Error 1']);
      const json = error.toJSON();
      expect(json.errors).toEqual(['Error 1']);
    });
  });

  describe('AuthError', () => {
    it('should create auth error with 401 status', () => {
      const error = new AuthError('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.type).toBe('AUTH_ERROR');
      expect(error.userMessage).toBe('Credenciales inválidas');
    });
  });

  describe('PermissionError', () => {
    it('should create permission error with 403 status', () => {
      const error = new PermissionError('Access denied', null, 'admin');
      expect(error.statusCode).toBe(403);
      expect(error.type).toBe('PERMISSION_ERROR');
      expect(error.permission).toBe('admin');
    });
  });

  describe('BusinessError', () => {
    it('should create business error with code', () => {
      const error = new BusinessError('Stock insufficient', null, 'INSUFFICIENT_STOCK');
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe('BUSINESS_LOGIC_ERROR');
      expect(error.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource', () => {
      const error = new NotFoundError('Product not found', 'product');
      expect(error.statusCode).toBe(404);
      expect(error.resource).toBe('product');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError('Resource exists', 'user');
      expect(error.statusCode).toBe(409);
      expect(error.resource).toBe('user');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with retryAfter', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });

    it('should include retryAfter in toJSON', () => {
      const error = new RateLimitError('Too many', 30);
      const json = error.toJSON();
      expect(json.retryAfter).toBe(30);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('DB error', 'ER_CONNECTION_FAILED');
      expect(error.statusCode).toBe(500);
      expect(error.dbCode).toBe('ER_CONNECTION_FAILED');
    });

    it('should map duplicate entry to 409', () => {
      const error = new DatabaseError('Duplicate', 'ER_DUP_ENTRY');
      expect(error.statusCode).toBe(409);
      expect(error.type).toBe('CONFLICT_ERROR');
    });

    it('should map foreign key error to 400', () => {
      const error = new DatabaseError('FK error', 'ER_NO_REFERENCED_ROW_2');
      expect(error.statusCode).toBe(400);
      expect(error.type).toBe('VALIDATION_ERROR');
    });
  });
});

