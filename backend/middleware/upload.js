// ============================================
// Multer Middleware - Manejo de archivos
// ============================================

const multer = require('multer');
const { error: logError } = require('../logger');

// Configurar multer para usar memoria (buffer) en lugar de disco
// Esto es necesario porque Cloudinary requiere un stream/buffer
const storage = multer.memoryStorage();

// Filtro para validar que sea una imagen
const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo (se validará por tipo después)
    files: 1 // Solo un archivo a la vez
  }
});

// Middleware para manejo de errores de multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede subir un archivo a la vez'
      });
    }
    logError('Error de Multer:', error);
    return res.status(400).json({
      success: false,
      message: `Error al procesar archivo: ${error.message}`
    });
  }
  
  if (error) {
    logError('Error en upload middleware:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar archivo'
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError
};

