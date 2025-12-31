// ============================================
// Script para configurar .env en frontend
// Ejecutar desde root: node scripts/setup-frontend-env.js
// ============================================

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Configurando archivo .env para frontend...\n');

const envContent = `# ============================================
# Rose Secret Frontend - Variables de Entorno
# ============================================
# Generado automáticamente por setup-frontend-env.js

# URL del backend API
# IMPORTANTE: Debe coincidir con el PORT configurado en backend/.env
VITE_API_URL=http://localhost:3000/api
`;

// Verificar si ya existe
if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env ya existe en el root del proyecto.');
  console.log('   Si quieres recrearlo, elimínalo primero.\n');
  process.exit(0);
}

// Escribir .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Archivo .env creado en .env (root)');
console.log('   VITE_API_URL=http://localhost:3000/api');
console.log('\n');

