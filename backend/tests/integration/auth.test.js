// ============================================
// Tests de Integración - Autenticación
// ============================================
// Tests end-to-end de los endpoints de autenticación

const request = require('supertest');
const express = require('express');
const { query } = require('../../db');
const bcrypt = require('bcryptjs');

// Mock de rate limiters para tests (no bloquear)
jest.mock('../../security/rateLimiter', () => ({
  rateLimiters: {
    register: (req, res, next) => next(),
    login: (req, res, next) => next(),
    private: (req, res, next) => next()
  }
}));

jest.mock('../../middleware/bruteForce', () => ({
  bruteForceProtection: (req, res, next) => next()
}));

// Crear app Express para tests
const app = express();
app.use(express.json());
app.use('/api/auth', require('../../routes/auth.routes'));

describe('Auth Integration Tests', () => {
  let testUser;
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test User';

  beforeAll(async () => {
    // Cleanup: eliminar usuario de prueba si existe
    await query('DELETE FROM users WHERE email = ?', [testEmail]);
  });

  afterAll(async () => {
    // Cleanup: eliminar usuario de prueba
    await query('DELETE FROM users WHERE email = ?', [testEmail]);
    await query('DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [testEmail]);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.name).toBe(testName);
      expect(response.body.data.user).not.toHaveProperty('password_hash');
      
      // Guardar usuario para otros tests
      testUser = response.body.data.user;
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
          name: testName
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test2_${Date.now()}@example.com`,
          password: '123',
          name: testName
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should reject non-existent email (generic message)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      // No debe revelar si el email existe
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: testPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot password request (even if email does not exist)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      // Siempre debe retornar éxito (no revelar si email existe)
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should create password reset token for valid email', async () => {
      // Verificar que se creó el token
      const tokens = await query(
        'SELECT * FROM password_reset_tokens WHERE user_id = ? AND used = 0',
        [testUser.id]
      );

      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0]).toHaveProperty('token');
      expect(tokens[0]).toHaveProperty('expires_at');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeAll(async () => {
      // Obtener token válido (solo si testUser existe)
      if (testUser && testUser.id) {
        try {
          const tokens = await query(
            'SELECT token FROM password_reset_tokens WHERE user_id = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [testUser.id]
          );
          
          if (tokens.length > 0) {
            resetToken = tokens[0].token;
          }
        } catch (error) {
          // Ignorar si no existe la tabla o el usuario
        }
      }
    });

    it('should reset password with valid token', async () => {
      if (!resetToken) {
        // Si no hay token, crear uno para el test
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        
        const result = await query(
          'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [testUser.id, 'test_token_123', expiresAt]
        );
        
        resetToken = 'test_token_123';
      }

      const newPassword = 'newpassword123';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar que la contraseña cambió
      const users = await query('SELECT password_hash FROM users WHERE id = ?', [testUser.id]);
      const isValid = await bcrypt.compare(newPassword, users[0].password_hash);
      expect(isValid).toBe(true);

      // Verificar que el token está marcado como usado
      const usedTokens = await query(
        'SELECT used FROM password_reset_tokens WHERE token = ?',
        [resetToken]
      );
      expect(usedTokens[0].used).toBe(1);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid_token_12345',
          password: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some_token',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
