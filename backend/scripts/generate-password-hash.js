// ============================================
// Script para generar hash de password
// ============================================
// Uso: node scripts/generate-password-hash.js [password]
// Ejemplo: node scripts/generate-password-hash.js admin123

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('===========================================');
    console.log('Password Hash Generator');
    console.log('===========================================');
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('===========================================');
    console.log('Copia el hash y úsalo en el SQL o en el código');
    console.log('===========================================');
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

