// ============================================
// Script para corregir DATABASE_URL en .env
// ============================================
// Ejecutar: node scripts/fix-env-database.js

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Verificando archivo .env...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ El archivo .env no existe.');
  console.error('   Ejecuta: node scripts/create-env.js\n');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
let modified = false;

// Verificar si DATABASE_URL está definido y no es PostgreSQL válido
const databaseUrlMatch = envContent.match(/^DATABASE_URL=(.*)$/m);
if (databaseUrlMatch) {
  const dbUrl = databaseUrlMatch[1].trim();
  
  // Si está vacío, es un placeholder, o no es PostgreSQL válido, comentarlo
  if (!dbUrl || 
      dbUrl === 'postgresql://user:password@host:port/database' ||
      (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    console.log('⚠️  DATABASE_URL está definido pero no es válido para PostgreSQL');
    console.log(`   Valor actual: ${dbUrl.substring(0, 50)}...`);
    console.log('   Comentando DATABASE_URL para usar MySQL...\n');
    
    envContent = envContent.replace(
      /^DATABASE_URL=.*$/m,
      '# DATABASE_URL=  # Comentado - Usando MySQL con variables individuales'
    );
    modified = true;
  } else {
    // Verificar que la URL sea válida intentando parsearla
    try {
      const url = new URL(dbUrl);
      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        throw new Error('Protocolo inválido');
      }
      console.log('✅ DATABASE_URL está configurado para PostgreSQL');
      console.log(`   Host: ${url.hostname || 'N/A'}`);
    } catch (error) {
      console.log('⚠️  DATABASE_URL tiene formato inválido');
      console.log(`   Error: ${error.message}`);
      console.log('   Comentando DATABASE_URL para usar MySQL...\n');
      
      envContent = envContent.replace(
        /^DATABASE_URL=.*$/m,
        '# DATABASE_URL=  # Comentado - Usando MySQL con variables individuales'
      );
      modified = true;
    }
  }
} else {
  console.log('✅ DATABASE_URL no está definido (usando MySQL)');
}

// Verificar que las variables de MySQL estén definidas
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!envContent.includes(`${varName}=`)) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  Faltan variables de MySQL: ${missingVars.join(', ')}`);
  console.log('   Agregando valores por defecto...\n');
  
  if (!envContent.includes('DB_HOST=')) {
    envContent += '\nDB_HOST=localhost\n';
  }
  if (!envContent.includes('DB_USER=')) {
    envContent += 'DB_USER=root\n';
  }
  if (!envContent.includes('DB_PASSWORD=')) {
    envContent += 'DB_PASSWORD=\n';
  }
  if (!envContent.includes('DB_NAME=')) {
    envContent += 'DB_NAME=rose_secret\n';
  }
  if (!envContent.includes('DB_PORT=')) {
    envContent += 'DB_PORT=3306\n';
  }
  modified = true;
} else {
  console.log('✅ Variables de MySQL están definidas');
}

if (modified) {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n✅ Archivo .env actualizado correctamente!');
  console.log('   Reinicia el servidor para aplicar los cambios.\n');
} else {
  console.log('\n✅ El archivo .env está correctamente configurado.\n');
}

