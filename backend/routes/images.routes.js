// ============================================
// Rutas Centralizadas de Imágenes con Cloudinary
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { param, body, validationResult } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { error: logError } = require('../logger');
const cloudinaryService = require('../services/cloudinary.service');
const { upload, handleUploadError } = require('../middleware/upload');
const auditService = require('../services/audit.service');

// ============================================
// PRODUCTOS - Subir imagen principal (cover)
// POST /api/images/products/:productId/cover
// ============================================
router.post('/products/:productId/cover',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    param('productId').isInt().withMessage('ID de producto inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const { productId } = req.params;

      // Verificar que el producto existe
      const products = await query('SELECT id FROM products WHERE id = ?', [productId]);
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Obtener imagen principal actual (si existe)
      const currentImages = await query(`
        SELECT id, image_url 
        FROM product_images 
        WHERE product_id = ? AND is_primary = 1
        LIMIT 1
      `, [productId]);

      let oldImageUrl = null;
      let oldPublicId = null;
      let oldImageId = null;

      if (currentImages.length > 0) {
        oldImageUrl = currentImages[0].image_url;
        oldImageId = currentImages[0].id;
        oldPublicId = cloudinaryService.extractPublicIdFromUrl(oldImageUrl);
      }

      // Subir nueva imagen a Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        cloudinaryService.IMAGE_TYPES.PRODUCT_COVER,
        productId
      );

      // Eliminar imagen anterior de Cloudinary
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId).catch(error => {
          logError('No se pudo eliminar imagen anterior:', error);
        });
      }

      // Actualizar o crear imagen principal en BD
      if (oldImageId) {
        // Actualizar imagen existente
        await query(
          'UPDATE product_images SET image_url = ? WHERE id = ?',
          [uploadResult.url, oldImageId]
        );
      } else {
        // Crear nueva imagen principal
        await query(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at)
          VALUES (?, ?, 1, 0, NOW())
        `, [productId, uploadResult.url]);
      }

      // Registrar auditoría
      await auditService.logAudit(
        'PRODUCT_IMAGE_UPDATED',
        'product',
        productId,
        { image_url: oldImageUrl },
        { image_url: uploadResult.url, type: 'cover' },
        req
      );

      res.json({
        success: true,
        message: 'Imagen principal del producto actualizada exitosamente',
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height
        }
      });
    } catch (error) {
      logError('Error subiendo imagen principal de producto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir imagen'
      });
    }
  }
);

// ============================================
// PRODUCTOS - Subir imagen a galería
// POST /api/images/products/:productId/gallery
// ============================================
router.post('/products/:productId/gallery',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    param('productId').isInt().withMessage('ID de producto inválido'),
    body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text muy largo')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const { productId } = req.params;
      const { alt_text } = req.body;

      // Verificar que el producto existe
      const products = await query('SELECT id FROM products WHERE id = ?', [productId]);
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Obtener el siguiente sort_order
      const maxSort = await query(`
        SELECT MAX(sort_order) as max_sort
        FROM product_images
        WHERE product_id = ?
      `, [productId]);
      const nextSortOrder = (maxSort[0]?.max_sort ?? -1) + 1;

      // Subir imagen a Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        cloudinaryService.IMAGE_TYPES.PRODUCT_GALLERY,
        productId
      );

      // Insertar en base de datos
      const insertResult = await query(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
        VALUES (?, ?, ?, ?, 0, NOW())
      `, [productId, uploadResult.url, alt_text || null, nextSortOrder]);

      // Registrar auditoría
      await auditService.logAudit(
        'PRODUCT_IMAGE_ADDED',
        'product',
        productId,
        null,
        { image_url: uploadResult.url, type: 'gallery', image_id: insertResult.insertId },
        req
      );

      res.json({
        success: true,
        message: 'Imagen agregada a la galería exitosamente',
        data: {
          id: insertResult.insertId,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          alt_text: alt_text || null,
          sort_order: nextSortOrder
        }
      });
    } catch (error) {
      logError('Error subiendo imagen a galería:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir imagen'
      });
    }
  }
);

// ============================================
// PRODUCTOS - Eliminar imagen de galería
// DELETE /api/images/products/:productId/gallery/:imageId
// ============================================
router.delete('/products/:productId/gallery/:imageId',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  [
    param('productId').isInt().withMessage('ID de producto inválido'),
    param('imageId').isInt().withMessage('ID de imagen inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { productId, imageId } = req.params;

      // Verificar que la imagen existe y pertenece al producto
      const images = await query(`
        SELECT id, image_url, is_primary
        FROM product_images
        WHERE id = ? AND product_id = ?
      `, [imageId, productId]);

      if (images.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const image = images[0];

      // No permitir eliminar la imagen principal (debe actualizarse primero)
      if (image.is_primary) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la imagen principal. Actualízala primero.'
        });
      }

      // Extraer publicId y eliminar de Cloudinary
      const publicId = cloudinaryService.extractPublicIdFromUrl(image.image_url);
      if (publicId) {
        await cloudinaryService.deleteImage(publicId).catch(error => {
          logError('No se pudo eliminar imagen de Cloudinary:', error);
        });
      }

      // Eliminar de base de datos
      await query('DELETE FROM product_images WHERE id = ?', [imageId]);

      // Registrar auditoría
      await auditService.logAudit(
        'PRODUCT_IMAGE_DELETED',
        'product',
        productId,
        { image_url: image.image_url, image_id: imageId },
        null,
        req
      );

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      logError('Error eliminando imagen:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar imagen'
      });
    }
  }
);

// ============================================
// BLOGS - Subir imagen de portada
// POST /api/images/blogs/:blogId/cover
// ============================================
router.post('/blogs/:blogId/cover',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    param('blogId').isInt().withMessage('ID de blog inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const { blogId } = req.params;

      // Verificar que el blog existe
      const blogs = await query('SELECT id, cover_image_url FROM blogs WHERE id = ?', [blogId]);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog no encontrado'
        });
      }

      const oldCoverUrl = blogs[0].cover_image_url;
      let oldPublicId = null;

      if (oldCoverUrl) {
        oldPublicId = cloudinaryService.extractPublicIdFromUrl(oldCoverUrl);
      }

      // Subir nueva imagen a Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        cloudinaryService.IMAGE_TYPES.BLOG_COVER,
        blogId
      );

      // Eliminar imagen anterior de Cloudinary
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId).catch(error => {
          logError('No se pudo eliminar imagen anterior:', error);
        });
      }

      // Actualizar cover_image_url en BD
      await query(
        'UPDATE blogs SET cover_image_url = ?, updated_at = NOW() WHERE id = ?',
        [uploadResult.url, blogId]
      );

      // Registrar auditoría
      await auditService.logAudit(
        'BLOG_COVER_UPDATED',
        'blog',
        blogId,
        { cover_image_url: oldCoverUrl },
        { cover_image_url: uploadResult.url },
        req
      );

      res.json({
        success: true,
        message: 'Imagen de portada actualizada exitosamente',
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height
        }
      });
    } catch (error) {
      logError('Error subiendo imagen de portada de blog:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir imagen'
      });
    }
  }
);

// ============================================
// BLOGS - Subir imagen de contenido
// POST /api/images/blogs/:blogId/content
// ============================================
router.post('/blogs/:blogId/content',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    param('blogId').isInt().withMessage('ID de blog inválido'),
    body('alt_text').optional().trim().isLength({ max: 255 }).withMessage('Alt text muy largo')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const { blogId } = req.params;
      const { alt_text } = req.body;

      // Verificar que el blog existe
      const blogs = await query('SELECT id FROM blogs WHERE id = ?', [blogId]);
      if (blogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog no encontrado'
        });
      }

      // Obtener el siguiente sort_order
      const maxSort = await query(`
        SELECT MAX(sort_order) as max_sort
        FROM blog_images
        WHERE blog_id = ? AND type = 'content'
      `, [blogId]);
      const nextSortOrder = (maxSort[0]?.max_sort ?? -1) + 1;

      // Subir imagen a Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        cloudinaryService.IMAGE_TYPES.BLOG_CONTENT,
        blogId
      );

      // Insertar en base de datos
      const insertResult = await query(`
        INSERT INTO blog_images (blog_id, image_url, alt_text, type, sort_order)
        VALUES (?, ?, ?, 'content', ?)
      `, [blogId, uploadResult.url, alt_text || null, nextSortOrder]);

      // Registrar auditoría
      await auditService.logAudit(
        'BLOG_IMAGE_ADDED',
        'blog',
        blogId,
        null,
        { image_url: uploadResult.url, type: 'content', image_id: insertResult.insertId },
        req
      );

      res.json({
        success: true,
        message: 'Imagen agregada exitosamente',
        data: {
          id: insertResult.insertId,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          alt_text: alt_text || null,
          sort_order: nextSortOrder
        }
      });
    } catch (error) {
      logError('Error subiendo imagen de contenido:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir imagen'
      });
    }
  }
);

// ============================================
// BLOGS - Eliminar imagen de contenido
// DELETE /api/images/blogs/:blogId/content/:imageId
// ============================================
router.delete('/blogs/:blogId/content/:imageId',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  [
    param('blogId').isInt().withMessage('ID de blog inválido'),
    param('imageId').isInt().withMessage('ID de imagen inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { blogId, imageId } = req.params;

      // Verificar que la imagen existe y pertenece al blog
      const images = await query(`
        SELECT id, image_url
        FROM blog_images
        WHERE id = ? AND blog_id = ?
      `, [imageId, blogId]);

      if (images.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const image = images[0];

      // Extraer publicId y eliminar de Cloudinary
      const publicId = cloudinaryService.extractPublicIdFromUrl(image.image_url);
      if (publicId) {
        await cloudinaryService.deleteImage(publicId).catch(error => {
          logError('No se pudo eliminar imagen de Cloudinary:', error);
        });
      }

      // Eliminar de base de datos
      await query('DELETE FROM blog_images WHERE id = ?', [imageId]);

      // Registrar auditoría
      await auditService.logAudit(
        'BLOG_IMAGE_DELETED',
        'blog',
        blogId,
        { image_url: image.image_url, image_id: imageId },
        null,
        req
      );

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      logError('Error eliminando imagen:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar imagen'
      });
    }
  }
);

// ============================================
// BANNERS - Subir banner (home o promotion)
// POST /api/images/banners
// ============================================
router.post('/banners',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    body('type').isIn(['home', 'promotion', 'sidebar', 'popup']).withMessage('Tipo de banner inválido'),
    body('title').optional().trim().isLength({ max: 255 }).withMessage('Título muy largo'),
    body('link_url').optional().trim().isURL().withMessage('URL de enlace inválida'),
    body('status').optional().isIn(['active', 'inactive', 'scheduled']).withMessage('Estado inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const { type, title, link_url, link_text, status } = req.body;
      const userId = req.user.id;

      // Determinar el tipo de imagen según el tipo de banner
      const imageType = type === 'home' 
        ? cloudinaryService.IMAGE_TYPES.BANNER_HOME 
        : cloudinaryService.IMAGE_TYPES.BANNER_PROMOTION;

      // Obtener el siguiente display_order
      const maxOrder = await query(`
        SELECT MAX(display_order) as max_order
        FROM banners
        WHERE type = ?
      `, [type]);
      const nextOrder = (maxOrder[0]?.max_order ?? -1) + 1;

      // Subir imagen a Cloudinary (sin entityId para banners)
      const uploadResult = await cloudinaryService.uploadImage(
        req.file,
        imageType,
        null
      );

      // Insertar en base de datos
      const insertResult = await query(`
        INSERT INTO banners (type, title, image_url, link_url, link_text, status, display_order, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [type, title || null, uploadResult.url, link_url || null, link_text || null, status || 'inactive', nextOrder, userId]);

      // Registrar auditoría
      await auditService.logAudit(
        'BANNER_CREATED',
        'banner',
        insertResult.insertId,
        null,
        { type, image_url: uploadResult.url, status: status || 'inactive' },
        req
      );

      res.json({
        success: true,
        message: 'Banner creado exitosamente',
        data: {
          id: insertResult.insertId,
          type,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          title: title || null,
          status: status || 'inactive',
          display_order: nextOrder
        }
      });
    } catch (error) {
      logError('Error creando banner:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear banner'
      });
    }
  }
);

// ============================================
// BANNERS - Actualizar imagen de banner
// PUT /api/images/banners/:bannerId
// ============================================
router.put('/banners/:bannerId',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  handleUploadError,
  [
    param('bannerId').isInt().withMessage('ID de banner inválido'),
    body('title').optional().trim().isLength({ max: 255 }),
    body('link_url').optional().trim().isURL(),
    body('link_text').optional().trim().isLength({ max: 255 }),
    body('status').optional().isIn(['active', 'inactive', 'scheduled'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { bannerId } = req.params;
      const { title, link_url, link_text, status } = req.body;

      // Verificar que el banner existe
      const banners = await query('SELECT id, type, image_url FROM banners WHERE id = ?', [bannerId]);
      if (banners.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Banner no encontrado'
        });
      }

      const banner = banners[0];
      const oldImageUrl = banner.image_url;
      let oldPublicId = null;

      if (oldImageUrl) {
        oldPublicId = cloudinaryService.extractPublicIdFromUrl(oldImageUrl);
      }

      // Si se proporciona nueva imagen, subirla
      let newImageUrl = oldImageUrl;
      if (req.file) {
        const imageType = banner.type === 'home' 
          ? cloudinaryService.IMAGE_TYPES.BANNER_HOME 
          : cloudinaryService.IMAGE_TYPES.BANNER_PROMOTION;

        const uploadResult = await cloudinaryService.uploadImage(
          req.file,
          imageType,
          null
        );

        newImageUrl = uploadResult.url;

        // Eliminar imagen anterior
        if (oldPublicId) {
          await cloudinaryService.deleteImage(oldPublicId).catch(error => {
            logError('No se pudo eliminar imagen anterior:', error);
          });
        }
      }

      // Construir query de actualización
      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (link_url !== undefined) {
        updates.push('link_url = ?');
        params.push(link_url);
      }
      if (link_text !== undefined) {
        updates.push('link_text = ?');
        params.push(link_text);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }
      if (req.file) {
        updates.push('image_url = ?');
        params.push(newImageUrl);
      }

      updates.push('updated_at = NOW()');
      params.push(bannerId);

      await query(
        `UPDATE banners SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Registrar auditoría
      await auditService.logAudit(
        'BANNER_UPDATED',
        'banner',
        bannerId,
        { image_url: oldImageUrl },
        { image_url: newImageUrl },
        req
      );

      // Obtener banner actualizado
      const updatedBanners = await query('SELECT * FROM banners WHERE id = ?', [bannerId]);

      res.json({
        success: true,
        message: 'Banner actualizado exitosamente',
        data: updatedBanners[0] || { id: bannerId, image_url: newImageUrl }
      });
    } catch (error) {
      logError('Error actualizando banner:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar banner'
      });
    }
  }
);

// ============================================
// BANNERS - Eliminar banner
// DELETE /api/images/banners/:bannerId
// ============================================
router.delete('/banners/:bannerId',
  authenticate,
  requireAdmin,
  rateLimiters.admin,
  [
    param('bannerId').isInt().withMessage('ID de banner inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { bannerId } = req.params;

      // Verificar que el banner existe
      const banners = await query('SELECT id, image_url FROM banners WHERE id = ?', [bannerId]);
      if (banners.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Banner no encontrado'
        });
      }

      const banner = banners[0];

      // Extraer publicId y eliminar de Cloudinary
      const publicId = cloudinaryService.extractPublicIdFromUrl(banner.image_url);
      if (publicId) {
        await cloudinaryService.deleteImage(publicId).catch(error => {
          logError('No se pudo eliminar imagen de Cloudinary:', error);
        });
      }

      // Eliminar de base de datos
      await query('DELETE FROM banners WHERE id = ?', [bannerId]);

      // Registrar auditoría
      await auditService.logAudit(
        'BANNER_DELETED',
        'banner',
        bannerId,
        { image_url: banner.image_url },
        null,
        req
      );

      res.json({
        success: true,
        message: 'Banner eliminado exitosamente'
      });
    } catch (error) {
      logError('Error eliminando banner:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar banner'
      });
    }
  }
);

module.exports = router;

