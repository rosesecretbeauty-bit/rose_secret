// Test Setup
// Configuración global para tests

// Establecer variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_testing_only';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// Usar la base de datos existente si no hay una de test configurada
// Nota: En producción, deberías tener una BD de test separada
if (!process.env.DB_NAME) {
  // Intentar cargar .env si existe
  try {
    require('dotenv').config({ path: './.env' });
  } catch (e) {
    // Ignorar si no existe
  }
  // Si aún no hay DB_NAME, usar el nombre por defecto
  process.env.DB_NAME = process.env.DB_NAME || 'rose_secret';
}

// Timeout para tests (30 segundos)
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep these for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
