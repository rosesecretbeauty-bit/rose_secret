// ============================================
// Conexión a Base de Datos (MySQL o PostgreSQL)
// ============================================

require('dotenv').config();

// Detectar tipo de base de datos desde DATABASE_URL o variables individuales
const DATABASE_URL = process.env.DATABASE_URL;
// Solo usar PostgreSQL si DATABASE_URL está definido, no está vacío, y empieza con 'postgres'
// También verificar que no sea solo un placeholder o valor por defecto
const isPostgreSQL = DATABASE_URL && 
                     typeof DATABASE_URL === 'string' &&
                     DATABASE_URL.trim() !== '' && 
                     !DATABASE_URL.includes('user:password') && // No es un placeholder
                     !DATABASE_URL.includes('postgresql://user') && // No es un placeholder
                     !DATABASE_URL.includes('@host:port') && // No es un placeholder
                     DATABASE_URL.startsWith('postgres') &&
                     DATABASE_URL.includes('://') && // Debe ser una URL válida
                     DATABASE_URL.length > 20; // Debe tener longitud razonable (no solo "postgresql://")

let pool;
let dbType = 'mysql';

if (isPostgreSQL) {
  // PostgreSQL usando pg
  const { Pool } = require('pg');
  dbType = 'postgresql';
  
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  console.log('📊 Usando PostgreSQL');
} else {
  // MySQL usando mysql2
  const mysql = require('mysql2/promise');
  dbType = 'mysql';
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rose_secret',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  pool = mysql.createPool(dbConfig);
  console.log('📊 Usando MySQL');
}

// Probar conexión (retorna objeto con detalles para health check)
async function testConnection() {
  const startTime = Date.now();
  try {
    if (isPostgreSQL) {
      await pool.query('SELECT NOW()');
    } else {
      const connection = await pool.getConnection();
      connection.release();
    }
    const responseTime = Date.now() - startTime;
    console.log('✅ Conexión a base de datos exitosa');
    return {
      connected: true,
      responseTime,
      type: dbType
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error conectando a la base de datos:', error.message);
    return {
      connected: false,
      responseTime,
      type: dbType,
      error: error.message
    };
  }
}

// Ejecutar query (compatible con MySQL y PostgreSQL)
async function query(sql, params = []) {
  const startTime = Date.now();
  
  try {
    let results;
    let insertId = null;
    
    const sqlUpper = sql.toUpperCase().trim();
    const isInsert = sqlUpper.startsWith('INSERT');
    
    if (isPostgreSQL) {
      // PostgreSQL usa $1, $2, etc. en lugar de ?
      // Convertir ? a $1, $2, etc.
      let paramIndex = 1;
      let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      
      // Para INSERTs en PostgreSQL, agregar RETURNING id si no está presente
      if (isInsert && !convertedSql.toUpperCase().includes('RETURNING')) {
        // Detectar la tabla (asumiendo formato: INSERT INTO table_name)
        const tableMatch = convertedSql.match(/INSERT\s+INTO\s+(\w+)/i);
        if (tableMatch) {
          convertedSql += ' RETURNING id';
        }
      }
      
      const result = await pool.query(convertedSql, params);
      
      // Para INSERTs, extraer id del resultado
      if (isInsert && result.rows.length > 0 && result.rows[0].id) {
        insertId = result.rows[0].id;
        // Crear objeto similar a MySQL con insertId
        results = { insertId: result.rows[0].id };
      } else {
        results = result.rows; // PostgreSQL devuelve rows para SELECT
      }
    } else {
      const [mysqlResults] = await pool.execute(sql, params);
      results = mysqlResults;
      
      // Para INSERTs en MySQL, insertId ya está en el resultado
      if (isInsert && mysqlResults && mysqlResults.insertId) {
        insertId = mysqlResults.insertId;
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Log queries lentas (warning en producción, info en desarrollo)
    if (duration > 500) {
      const { warn } = require('./logger');
      warn('Slow query detected', {
        duration: `${duration}ms`,
        sql: sql.substring(0, 200),
        paramsCount: params.length
      });
    }
    
    // Verificar que queries de lectura tengan LIMIT (solo en desarrollo)
    if (sqlUpper.startsWith('SELECT') && 
        !sqlUpper.includes('LIMIT') && 
        !sqlUpper.includes('COUNT(*)') &&
        !sqlUpper.includes('EXISTS') && 
        !sqlUpper.includes('MAX(') &&
        !sqlUpper.includes('MIN(') &&
        !sqlUpper.includes('SUM(') &&
        !sqlUpper.includes('AVG(') &&
        process.env.NODE_ENV !== 'production') {
      const { warn } = require('./logger');
      warn('Query without LIMIT detected', {
        sql: sql.substring(0, 200)
      });
    }
    
    return results;
  } catch (error) {
    const { error: logError } = require('./logger');
    logError('Database query error', error, { 
      sql: sql.substring(0, 200),
      paramsCount: params.length
    });
    throw error;
  }
}

// Obtener una conexión del pool
async function getConnection() {
  if (isPostgreSQL) {
    return await pool.connect();
  } else {
    return await pool.getConnection();
  }
}

/**
 * Ejecutar transacción
 * @param {Function} callback - Función async que recibe la conexión y ejecuta queries
 * @returns {Promise<any>} Resultado de la función callback
 */
async function transaction(callback) {
  const connection = await getConnection();
  
  try {
    if (isPostgreSQL) {
      await connection.query('BEGIN');
    } else {
      await connection.beginTransaction();
    }

    const result = await callback(connection);

    if (isPostgreSQL) {
      await connection.query('COMMIT');
    } else {
      await connection.commit();
    }

    return result;
  } catch (error) {
    if (isPostgreSQL) {
      await connection.query('ROLLBACK');
    } else {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Ejecutar query en una conexión específica (para transacciones)
 */
async function queryWithConnection(connection, sql, params = []) {
  const sqlUpper = sql.toUpperCase().trim();
  const isInsert = sqlUpper.startsWith('INSERT');

  if (isPostgreSQL) {
    let paramIndex = 1;
    let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    // Si es INSERT y no tiene RETURNING, agregarlo
    if (isInsert && !convertedSql.toUpperCase().includes('RETURNING')) {
      const tableMatch = convertedSql.match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        convertedSql += ' RETURNING id';
      }
    }

    const result = await connection.query(convertedSql, params);
    
    // Para INSERTs con RETURNING, devolver objeto con insertId
    if (isInsert && result.rows.length > 0 && result.rows[0].id) {
      return { insertId: result.rows[0].id, ...result.rows[0] };
    }
    
    return result.rows;
  } else {
    const [results] = await connection.execute(sql, params);
    return results;
  }
}

/**
 * Cerrar pool de conexiones (graceful shutdown)
 */
async function closePool() {
  if (pool) {
    try {
      if (dbType === 'postgresql') {
        await pool.end();
      } else {
        await pool.end();
      }
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  dbType,
  transaction,
  queryWithConnection,
  closePool
};
