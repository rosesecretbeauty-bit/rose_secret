// ============================================
// Script para crear archivo .env
// ============================================
// Ejecutar: node scripts/create-env.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');
const examplePath = path.join(__dirname, '..', 'env.example.txt');

// Generar JWT_SECRET seguro
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('🔧 Creando archivo .env...\n');

// Leer ejemplo
let envContent = '';
if (fs.existsSync(examplePath)) {
  envContent = fs.readFileSync(examplePath, 'utf8');
} else {
  // Si no existe el ejemplo, crear contenido básico
  envContent = `# ============================================
# Rose Secret Backend - Variables de Entorno
# ============================================

PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rose_secret
DB_PORT=3306

JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

LOG_FORMAT=json
DEBUG=false

RATE_LIMIT_ENABLED=true
CACHE_ENABLED=true
`;
}

// Reemplazar JWT_SECRET si existe en el ejemplo
envContent = envContent.replace(
  /JWT_SECRET=.*/,
  `JWT_SECRET=${jwtSecret}`
);

// Si no existe JWT_SECRET, agregarlo
if (!envContent.includes('JWT_SECRET=')) {
  envContent += `\nJWT_SECRET=${jwtSecret}\n`;
}

// Comentar o eliminar DATABASE_URL si está definido (para usar MySQL por defecto)
// Solo mantenerlo si empieza con 'postgres' (PostgreSQL real)
envContent = envContent.replace(
  /^DATABASE_URL=.*$/gm,
  (match) => {
    // Si es un comentario o está vacío, mantenerlo
    if (match.trim().startsWith('#') || match.trim() === 'DATABASE_URL=') {
      return '# DATABASE_URL=  # Comentado - Usando MySQL con variables individuales';
    }
    // Si tiene un valor de PostgreSQL real, mantenerlo
    if (match.includes('postgresql://') || match.includes('postgres://')) {
      return match;
    }
    // Si tiene cualquier otro valor, comentarlo
    return '# DATABASE_URL=  # Comentado - Usando MySQL con variables individuales';
  }
);

// Escribir archivo .env
try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env ya existe.');
    console.log('   ¿Deseas sobrescribirlo? (S/N)');
    // En modo no interactivo, no sobrescribir
    console.log('   Saltando... (usa --force para sobrescribir)');
    process.exit(0);
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Archivo .env creado exitosamente!');
  console.log(`\n🔑 JWT_SECRET generado: ${jwtSecret}`);
  console.log('\n📝 Nota: Revisa y completa las demás variables según tu configuración.\n');
} catch (error) {
  console.error('❌ Error al crear .env:', error.message);
  process.exit(1);
}

