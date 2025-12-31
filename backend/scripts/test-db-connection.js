// ============================================
// Script para probar conexión a base de datos
// ============================================
// Ejecutar: node scripts/test-db-connection.js

require('dotenv').config();
const { testConnection, query } = require('../db');

async function test() {
  console.log('🔍 Probando conexión a base de datos...\n');
  
  // Mostrar configuración
  console.log('📋 Configuración:');
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || 'root'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'rose_secret'}`);
  console.log(`   DB_PORT: ${process.env.DB_PORT || 3306}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Definido' : 'No definido'}\n`);
  
  // Probar conexión
  const result = await testConnection();
  
  if (result.connected) {
    console.log('✅ Conexión exitosa!');
    console.log(`   Tipo: ${result.type}`);
    console.log(`   Tiempo de respuesta: ${result.responseTime}ms\n`);
    
    // Probar query simple
    try {
      console.log('🔍 Probando query simple...');
      const users = await query('SELECT COUNT(*) as total FROM users');
      console.log(`✅ Query exitosa. Total de usuarios: ${users[0]?.total || 0}\n`);
      
      // Probar query de login
      console.log('🔍 Probando query de login...');
      const adminUsers = await query(
        'SELECT id, email, name, role FROM users WHERE email = ?',
        ['admin@rosesecret.com']
      );
      
      if (adminUsers.length > 0) {
        console.log('✅ Usuario admin encontrado:');
        console.log(`   ID: ${adminUsers[0].id}`);
        console.log(`   Email: ${adminUsers[0].email}`);
        console.log(`   Name: ${adminUsers[0].name}`);
        console.log(`   Role: ${adminUsers[0].role}\n`);
      } else {
        console.log('⚠️  Usuario admin no encontrado\n');
      }
      
    } catch (error) {
      console.error('❌ Error en query:', error.message);
      process.exit(1);
    }
    
  } else {
    console.error('❌ Error de conexión:', result.error);
    process.exit(1);
  }
  
  // Verificar JWT_SECRET
  console.log('🔍 Verificando JWT_SECRET...');
  if (process.env.JWT_SECRET) {
    console.log(`✅ JWT_SECRET está definido (${process.env.JWT_SECRET.length} caracteres)\n`);
  } else {
    console.error('❌ JWT_SECRET no está definido\n');
    process.exit(1);
  }
  
  console.log('✅ Todas las pruebas pasaron!\n');
  process.exit(0);
}

test().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

