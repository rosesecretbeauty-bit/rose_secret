// Jest Configuration
// FASE 5: Configuración mejorada para CI/CD
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!index.js',
    '!**/tests/**',
    '!**/docs/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // FASE 5: Coverage thresholds (pueden ajustarse según necesidades)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  // Timeout para tests de integración
  testTimeout: 30000
};
