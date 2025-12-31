// ============================================
// ESLint Configuration
// ============================================
// FASE 5: Configuración básica de linting

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Errores comunes
    'no-console': 'warn',
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-undef': 'error',
    
    // Mejores prácticas
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Estilo (no bloqueantes)
    'semi': ['warn', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'comma-dangle': ['warn', 'never'],
    
    // Permitir algunas cosas comunes en Node.js
    'no-process-env': 'off',
    'no-process-exit': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '*.config.js',
    'docs/',
    'dist/'
  ]
};

