// ============================================
// Script para configurar .env en backend
// Ejecutar: node scripts/setup-env.js
// ============================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example.txt');

// Generar JWT_SECRET seguro
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('🔧 Configurando archivo .env para backend...\n');

// Leer el ejemplo
let envContent = fs.readFileSync(envExamplePath, 'utf8');

// Reemplazar JWT_SECRET con uno generado
envContent = envContent.replace(
  /JWT_SECRET=.*/,
  `JWT_SECRET=${jwtSecret}`
);

// Comentar DATABASE_URL si estamos usando MySQL local
envContent = envContent.replace(
  /^DATABASE_URL=postgresql:/m,
  '# DATABASE_URL=postgresql:'
);

// Escribir .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Archivo .env creado en backend/.env');
console.log(`✅ JWT_SECRET generado: ${jwtSecret.substring(0, 20)}...`);
console.log('\n📝 IMPORTANTE:');
console.log('   - Revisa backend/.env y configura:');
console.log('     * DB_PASSWORD (si tu MySQL requiere contraseña)');
console.log('     * STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY');
console.log('     * RESEND_API_KEY (si vas a usar emails)');
console.log('\n');

