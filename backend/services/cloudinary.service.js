// ============================================
// Cloudinary Service - Gestión Centralizada de Imágenes
// ============================================

const cloudinary = require('cloudinary').v2;
const { error: logError, info } = require('../logger');
const streamifier = require('streamifier');

// Configurar Cloudinary desde variable de entorno
// Cloudinary acepta CLOUDINARY_URL directamente con formato:
// cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  try {
    cloudinary.config();
    // Cloudinary automáticamente lee CLOUDINARY_URL de process.env
    info('Cloudinary configurado correctamente');
  } catch (error) {
    logError('Error configurando Cloudinary:', error);
  }
} else {
  console.warn('⚠️ CLOUDINARY_URL no está configurada. Las subidas de imágenes no funcionarán.');
}

// Tipos de imágenes soportados
const IMAGE_TYPES = {
  USER_AVATAR: 'user_avatar',
  PRODUCT_COVER: 'product_cover',
  PRODUCT_GALLERY: 'product_gallery',
  BLOG_COVER: 'blog_cover',
  BLOG_CONTENT: 'blog_content',
  BANNER_HOME: 'banner_home',
  BANNER_PROMOTION: 'banner_promotion'
};

// Configuraciones por tipo de imagen
const IMAGE_CONFIGS = {
  [IMAGE_TYPES.USER_AVATAR]: {
    folder: 'rose-secret/users',
    subfolder: 'avatar',
    transformations: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.PRODUCT_COVER]: {
    folder: 'rose-secret/products',
    subfolder: 'cover',
    transformations: {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.PRODUCT_GALLERY]: {
    folder: 'rose-secret/products',
    subfolder: 'gallery',
    transformations: {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.BLOG_COVER]: {
    folder: 'rose-secret/blogs',
    subfolder: 'cover',
    transformations: {
      width: 1600,
      height: 900,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.BLOG_CONTENT]: {
    folder: 'rose-secret/blogs',
    subfolder: 'content',
    transformations: {
      width: 1200,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.BANNER_HOME]: {
    folder: 'rose-secret/banners/home',
    subfolder: null,
    transformations: {
      width: 1920,
      height: 1080,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  },
  [IMAGE_TYPES.BANNER_PROMOTION]: {
    folder: 'rose-secret/banners/promotions',
    subfolder: null,
    transformations: {
      width: 1920,
      height: 1080,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
  }
};

/**
 * Generar ruta de carpeta completa en Cloudinary
 */
function generateFolderPath(imageType, entityId) {
  const config = IMAGE_CONFIGS[imageType];
  if (!config) {
    throw new Error(`Tipo de imagen no válido: ${imageType}`);
  }

  let path = config.folder;
  
  // Solo agregar entityId si existe y el tipo de imagen lo requiere
  // Banners no usan entityId
  if (entityId && !imageType.includes('BANNER')) {
    path = `${config.folder}/${entityId}`;
  }
  
  // Agregar subfolder si existe
  if (config.subfolder) {
    path = `${path}/${config.subfolder}`;
  }
  
  return path;
}

/**
 * Validar archivo antes de subir
 */
function validateFile(file, imageType) {
  const config = IMAGE_CONFIGS[imageType];
  if (!config) {
    throw new Error(`Tipo de imagen no válido: ${imageType}`);
  }

  // Validar tamaño
  if (file.size > config.maxSize) {
    throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${config.maxSize / 1024 / 1024}MB`);
  }

  // Validar formato
  const extension = file.originalname.split('.').pop().toLowerCase();
  if (!config.allowedFormats.includes(extension)) {
    throw new Error(`Formato no permitido. Formatos permitidos: ${config.allowedFormats.join(', ')}`);
  }

  // Validar que sea una imagen (MIME type)
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }
}

/**
 * Subir imagen a Cloudinary desde buffer
 */
async function uploadImage(file, imageType, entityId = null, publicId = null) {
  try {
    // Validar archivo
    validateFile(file, imageType);

    const config = IMAGE_CONFIGS[imageType];
    const folderPath = generateFolderPath(imageType, entityId);

    // Opciones de upload
    const uploadOptions = {
      folder: folderPath,
      ...config.transformations,
      resource_type: 'image',
      overwrite: false
    };

      // Si se proporciona publicId, usarlo (para reemplazar imagen existente)
      if (publicId) {
        uploadOptions.public_id = publicId;
        uploadOptions.overwrite = true;
      }
      // Si no se proporciona publicId, Cloudinary generará uno automáticamente

    // Subir imagen desde buffer
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logError('Error subiendo imagen a Cloudinary:', error);
            reject(new Error(`Error al subir imagen: ${error.message}`));
          } else {
            info('Imagen subida exitosamente', {
              publicId: result.public_id,
              url: result.secure_url,
              imageType,
              entityId
            });
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );

      // Escribir buffer al stream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  } catch (error) {
    logError('Error en uploadImage:', error);
    throw error;
  }
}

/**
 * Eliminar imagen de Cloudinary
 */
async function deleteImage(publicId) {
  try {
    if (!publicId) {
      return { success: true, message: 'No hay imagen para eliminar' };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok' || result.result === 'not found') {
      info('Imagen eliminada de Cloudinary', { publicId });
      return { success: true, message: 'Imagen eliminada exitosamente' };
    } else {
      logError('Error eliminando imagen de Cloudinary:', result);
      throw new Error('Error al eliminar imagen');
    }
  } catch (error) {
    logError('Error en deleteImage:', error);
    throw error;
  }
}

/**
 * Eliminar imagen anterior y subir nueva (reemplazo)
 */
async function replaceImage(file, imageType, entityId, oldPublicId) {
  try {
    // Eliminar imagen anterior si existe
    if (oldPublicId) {
      await deleteImage(oldPublicId).catch(error => {
        // Log pero no fallar si no se puede eliminar
        logError('No se pudo eliminar imagen anterior (puede que no exista):', error);
      });
    }

    // Subir nueva imagen usando el mismo publicId base si existe
    const folderPath = generateFolderPath(imageType, entityId);
    const basePublicId = oldPublicId ? oldPublicId.split('/').slice(0, -1).join('/') : null;
    
    return await uploadImage(file, imageType, entityId, basePublicId ? `${basePublicId}/${Date.now()}` : null);
  } catch (error) {
    logError('Error en replaceImage:', error);
    throw error;
  }
}

/**
 * Extraer public_id de una URL de Cloudinary
 * @param {string} url - URL de Cloudinary
 * @returns {string|null} - public_id o null si no se puede extraer
 * 
 * Ejemplo:
 * https://res.cloudinary.com/cloud_name/image/upload/v1234567890/rose-secret/users/123/avatar/image.jpg
 * -> rose-secret/users/123/avatar/image
 */
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Las URLs de Cloudinary tienen el formato:
    // https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    
    // Buscar el patrón /upload/ en la URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
      // Si no tiene /upload/, puede ser una URL antigua o diferente formato
      // Intentar extraer desde el final
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      // Remover extensión
      return filename.split('.')[0];
    }

    // Extraer la parte después de /upload/
    const afterUpload = url.substring(uploadIndex + 8); // 8 = length of '/upload/'
    
    // Remover transformaciones (formato v1234567890, w_500, h_500, etc.)
    // Las transformaciones vienen antes del primer / que no sea parte de la transformación
    // Ejemplo: v1234567890/w_500,h_500/rose-secret/users/123/avatar/image.jpg
    const parts = afterUpload.split('/');
    
    // Filtrar partes que son transformaciones (empiezan con v, w_, h_, c_, etc.)
    const publicIdParts = parts.filter(part => {
      // Si empieza con 'v' seguido de números, es versión
      if (/^v\d+$/.test(part)) return false;
      // Si contiene formato de transformación (w_, h_, c_, etc.)
      if (/^[a-z]_/.test(part)) return false;
      // Si es un número seguido de formato (500x500)
      if (/^\d+x\d+$/.test(part)) return false;
      return true;
    });

    if (publicIdParts.length === 0) {
      return null;
    }

    // Unir las partes y remover la extensión del archivo
    let publicId = publicIdParts.join('/');
    
    // Remover extensión de archivo (última parte después del punto)
    const lastDotIndex = publicId.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicId = publicId.substring(0, lastDotIndex);
    }

    return publicId || null;
  } catch (error) {
    logError('Error extrayendo public_id de URL:', error);
    return null;
  }
}

module.exports = {
  IMAGE_TYPES,
  IMAGE_CONFIGS,
  uploadImage,
  deleteImage,
  replaceImage,
  validateFile,
  generateFolderPath,
  extractPublicIdFromUrl
};

