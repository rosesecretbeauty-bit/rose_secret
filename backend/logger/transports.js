// ============================================
// Log Transports
// ============================================

const fs = require('fs');
const path = require('path');
const { format } = require('./formatters');

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../logs');
const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING !== 'false';

// Crear directorio de logs si no existe
if (ENABLE_FILE_LOGGING && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Escribir a archivo (opcional)
 */
function writeToFile(level, message, metadata) {
  if (!ENABLE_FILE_LOGGING) return;
  
  try {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${date}.log`);
    const logLine = format(level, message, metadata) + '\n';
    
    fs.appendFileSync(logFile, logLine, { encoding: 'utf8' });
  } catch (error) {
    // Fallback a console si falla escritura a archivo
    console.error('Error writing to log file:', error.message);
  }
}

/**
 * Transport a consola
 */
function consoleTransport(level, message, metadata) {
  const formatted = format(level, message, metadata);
  
  switch (level.toUpperCase()) {
    case 'ERROR':
    case 'CRITICAL':
      console.error(formatted);
      break;
    case 'WARN':
      console.warn(formatted);
      break;
    case 'DEBUG':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Transport principal (consola + archivo opcional)
 */
function transport(level, message, metadata) {
  // Siempre a consola
  consoleTransport(level, message, metadata);
  
  // Opcionalmente a archivo
  if (ENABLE_FILE_LOGGING && ['ERROR', 'CRITICAL', 'AUDIT', 'PAYMENT'].includes(level.toUpperCase())) {
    writeToFile(level, message, metadata);
  }
}

module.exports = {
  transport,
  consoleTransport,
  writeToFile
};

