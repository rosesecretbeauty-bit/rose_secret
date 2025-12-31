// ============================================
// Script para actualizar password hash del admin
// ============================================
// Ejecutar: node scripts/fix-admin-password.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../db');

async function fixAdminPassword() {
  try {
    console.log('🔐 Actualizando password hash del admin...');
    
    // Generar nuevo hash para "admin123"
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('✅ Hash generado:', newHash);
    
    // Actualizar en base de datos
    const result = await query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newHash, 'admin@rosesecret.com']
    );
    
    if (result.affectedRows === 0) {
      console.error('❌ No se encontró el usuario admin');
      process.exit(1);
    }
    
    console.log('✅ Password del admin actualizado correctamente');
    
    // Verificar
    const users = await query(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['admin@rosesecret.com']
    );
    
    if (users.length > 0) {
      console.log('✅ Usuario admin verificado:');
      console.log('   ID:', users[0].id);
      console.log('   Email:', users[0].email);
      console.log('   Name:', users[0].name);
      console.log('   Role:', users[0].role);
    }
    
    // Verificar que el hash funciona
    const testResult = await bcrypt.compare('admin123', newHash);
    console.log('✅ Verificación de password:', testResult ? '✓ Correcto' : '✗ Incorrecto');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminPassword();

