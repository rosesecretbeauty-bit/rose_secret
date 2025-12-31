// ============================================
// Rutas de Categorías - Sistema Completo con Jerarquía
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const { info, error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const categoryService = require('../services/category.service');

// ============================================
// GET /api/categories
// ============================================
// Obtener todas las categorías activas con jerarquía completa
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('CATEGORIES') || 300,
  keyBuilder: () => 'categories:all:tree',
  vary: []
}), async (req, res) => {
  try {
    // Obtener todas las categorías activas con contador de productos
    const categories = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        c.image_url,
        c.is_active,
        c.sort_order,
        c.meta_title,
        c.meta_description,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id, c.name, c.slug, c.description, c.parent_id, 
               c.image_url, c.is_active, c.sort_order, c.meta_title, 
               c.meta_description, c.created_at, c.updated_at
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    // Construir árbol jerárquico usando el servicio
    const tree = categoryService.buildCategoryTree(categories);

    // También devolver versión plana para compatibilidad
    const flat = categories.map(cat => ({
      ...cat,
      product_count: parseInt(cat.product_count) || 0
    }));

    res.json({
      success: true,
      data: {
        categories: tree,
        flat
      }
    });
  } catch (error) {
    logError('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías'
    });
  }
});

// ============================================
// GET /api/categories/slug/:slug
// ============================================
// Obtener categoría por slug (alternativa a ID)
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/slug/:slug', rateLimiters.public, [
  param('slug').trim().notEmpty().withMessage('Slug requerido')
], cacheMiddleware({
  ttl: getTTL('CATEGORIES') || 300,
  keyBuilder: (req) => `category:slug:${req.params.slug}`,
  vary: []
}), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { slug } = req.params;

    const categories = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        image_url,
        is_active,
        sort_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      FROM categories
      WHERE slug = ? AND is_active = TRUE
      LIMIT 1
    `, [slug]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const category = categories[0];

    // Obtener breadcrumbs (ruta completa)
    const breadcrumbs = await categoryService.getCategoryBreadcrumbs(category.id);

    // Obtener categoría padre si existe
    let parent = null;
    if (category.parent_id) {
      const parents = await query(`
        SELECT id, name, slug, image_url
        FROM categories
        WHERE id = ? AND is_active = TRUE
        LIMIT 1
      `, [category.parent_id]);
      if (parents.length > 0) {
        parent = parents[0];
      }
    }

    // Obtener subcategorías con contador de productos
    const children = await query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description, 
        c.image_url,
        c.sort_order,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.parent_id = ? AND c.is_active = TRUE
      GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.sort_order
      ORDER BY c.sort_order ASC, c.name ASC
    `, [category.id]);

    // Obtener contador de productos (incluyendo subcategorías)
    const productCount = await categoryService.getProductCount(category.id, true);

    res.json({
      success: true,
      data: {
        category: {
          ...category,
          parent,
          children: children.map(child => ({
            ...child,
            product_count: parseInt(child.product_count) || 0
          })),
          breadcrumbs,
          product_count: productCount
        }
      }
    });
  } catch (error) {
    logError('Error obteniendo categoría por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría'
    });
  }
});

// ============================================
// GET /api/categories/:slug/products
// ============================================
// Obtener productos de una categoría por slug (incluye subcategorías)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id/products para evitar conflictos
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/:slug/products', rateLimiters.public, [
  param('slug').trim().notEmpty().withMessage('Slug requerido'),
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe ser entre 1 y 100'),
  queryValidator('price_min').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
  queryValidator('price_max').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido'),
  queryValidator('featured').optional().isBoolean().withMessage('Featured debe ser true o false'),
  queryValidator('stock').optional().isIn(['in_stock', 'out_of_stock']).withMessage('Stock inválido')
], cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST') || 60,
  keyBuilder: (req) => {
    const { page = 1, limit = 20, price_min, price_max, featured, stock } = req.query;
    const slug = req.params.slug;
    return `category:slug:${slug}:products:${page}:${limit}:${price_min || ''}:${price_max || ''}:${featured || ''}:${stock || ''}`;
  },
  vary: []
}), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { slug } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      price_min, 
      price_max, 
      featured,
      stock 
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Primero, obtener la categoría y sus subcategorías por slug
    const categories = await query(`
      SELECT id FROM categories WHERE slug = ? AND is_active = TRUE
    `, [slug]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const categoryId = categories[0].id;

    // Obtener todas las subcategorías (recursivo)
    const getAllSubcategoryIds = async (parentId) => {
      const subcategories = await query(
        'SELECT id FROM categories WHERE parent_id = ? AND is_active = TRUE',
        [parentId]
      );
      let ids = [parentId];
      for (const sub of subcategories) {
        const subIds = await getAllSubcategoryIds(sub.id);
        ids = ids.concat(subIds);
      }
      return ids;
    };

    const categoryIds = await getAllSubcategoryIds(categoryId);

    // Construir query base
    let sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.compare_at_price,
        p.brand,
        p.sku,
        p.stock,
        p.is_active,
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
        AND p.category_id IN (${categoryIds.map(() => '?').join(',')})
    `;
    const params = [...categoryIds];

    // Filtros opcionales
    if (price_min) {
      sql += ' AND p.price >= ?';
      params.push(parseFloat(price_min));
    }
    if (price_max) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(price_max));
    }
    if (featured === 'true' || featured === true) {
      sql += ' AND p.is_featured = TRUE';
    }
    if (stock === 'in_stock') {
      sql += ' AND p.stock > 0';
    } else if (stock === 'out_of_stock') {
      sql += ' AND p.stock = 0';
    }

    // Contar total
    const countSql = sql.replace(/SELECT DISTINCT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT p.id) as total FROM');
    const [countResult] = await query(countSql, params);
    const total = parseInt(countResult.total);

    // Ordenar y paginar
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await query(sql, params);

    // Obtener imágenes para cada producto
    for (const product of products) {
      product.price = parseFloat(product.price) || 0;
      if (product.compare_at_price) {
        product.compare_at_price = parseFloat(product.compare_at_price) || 0;
      }

      const images = await query(`
        SELECT image_url, is_primary, sort_order
        FROM product_images
        WHERE product_id = ?
        ORDER BY is_primary DESC, sort_order ASC
        LIMIT 1
      `, [product.id]);

      if (images.length > 0) {
        product.image_url = images[0].image_url;
        product.primary_image = images[0].image_url;
      }
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logError('Error obteniendo productos de categoría por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos'
    });
  }
});

// ============================================
// GET /api/categories/:id/products
// ============================================
// IMPORTANTE: Esta ruta debe ir DESPUÉS de /:slug/products para evitar conflictos
// Obtener productos de una categoría por ID (incluye subcategorías)
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/:id/products', rateLimiters.public, [
  param('id').isInt().withMessage('ID debe ser un número'),
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  queryValidator('price_min').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
  queryValidator('price_max').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido'),
  queryValidator('featured').optional().isIn(['true', 'false']).withMessage('featured inválido'),
  queryValidator('stock').optional().isIn(['in_stock', 'out_of_stock']).withMessage('stock inválido')
], cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST') || 60,
  keyBuilder: (req) => {
    const { page = 1, limit = 20, price_min, price_max, featured, stock } = req.query;
    return `category:${req.params.id}:products:${page}:${limit}:${price_min || ''}:${price_max || ''}:${featured || ''}:${stock || ''}`;
  },
  vary: []
}), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20,
      price_min,
      price_max,
      featured,
      stock
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Verificar que la categoría existe
    const categoryCheck = await query(
      'SELECT id, name, slug FROM categories WHERE id = ? AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (categoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Obtener todas las subcategorías (recursivo)
    const categoryIds = await categoryService.getAllSubcategoryIds(parseInt(id));

    // Construir WHERE clause con filtros
    let whereClause = 'WHERE p.category_id IN (' + categoryIds.map(() => '?').join(',') + ') AND p.is_active = TRUE';
    const queryParams = [...categoryIds];

    if (price_min) {
      whereClause += ' AND p.price >= ?';
      queryParams.push(parseFloat(price_min));
    }

    if (price_max) {
      whereClause += ' AND p.price <= ?';
      queryParams.push(parseFloat(price_max));
    }

    if (featured === 'true') {
      whereClause += ' AND p.is_featured = TRUE';
    }

    if (stock === 'in_stock') {
      whereClause += ' AND p.stock > 0';
    } else if (stock === 'out_of_stock') {
      whereClause += ' AND p.stock = 0';
    }

    // Obtener productos
    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.compare_at_price,
        p.brand,
        p.sku,
        p.stock,
        p.is_active,
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Obtener total con los mismos filtros
    let countWhereClause = 'WHERE category_id IN (' + categoryIds.map(() => '?').join(',') + ') AND is_active = TRUE';
    const countParams = [...categoryIds];

    if (price_min) {
      countWhereClause += ' AND price >= ?';
      countParams.push(parseFloat(price_min));
    }
    if (price_max) {
      countWhereClause += ' AND price <= ?';
      countParams.push(parseFloat(price_max));
    }
    if (featured === 'true') {
      countWhereClause += ' AND is_featured = TRUE';
    }
    if (stock === 'in_stock') {
      countWhereClause += ' AND stock > 0';
    } else if (stock === 'out_of_stock') {
      countWhereClause += ' AND stock = 0';
    }

    const totalResult = await query(
      `SELECT COUNT(*) as total FROM products ${countWhereClause}`,
      countParams
    );
    const total = totalResult[0].total;

    // Obtener imagen principal de cada producto
    for (let product of products) {
      const images = await query(
        'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
        [product.id]
      );
      product.image_url = images.length > 0 ? images[0].image_url : null;
    }

    res.json({
      success: true,
      data: {
        category: {
          id: categoryCheck[0].id,
          name: categoryCheck[0].name,
          slug: categoryCheck[0].slug
        },
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logError('Error obteniendo productos de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos'
    });
  }
});

// ============================================
// ADMIN: GET /api/admin/categories
// ============================================
// Obtener todas las categorías (admin, incluye inactivas)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
// NOTA: Esta ruta se monta en /api/admin, por lo que la ruta aquí es /categories
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos de matching
router.get('/categories', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        id, name, slug, description, parent_id,
        image_url, is_active, sort_order,
        meta_title, meta_description,
        created_at, updated_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `);

    // Contar productos por categoría
    for (const cat of categories) {
      const productCount = await query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = TRUE',
        [cat.id]
      );
      cat.product_count = parseInt(productCount[0]?.count) || 0;
    }

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    logError('Error obteniendo categorías (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías'
    });
  }
});

// ============================================
// GET /api/categories/:id
// ============================================
// Obtener categoría por ID
// ✅ CACHEABLE: Ruta pública, solo lectura
// 🔒 RATE LIMITED: Público (200 req/min por IP)
router.get('/:id', rateLimiters.public, [
  param('id').isInt().withMessage('ID debe ser un número')
], cacheMiddleware({
  ttl: getTTL('CATEGORIES') || 300,
  keyBuilder: (req) => `category:${req.params.id}`,
  vary: []
}), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const categories = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        image_url,
        is_active,
        sort_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      FROM categories
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const category = categories[0];

    // Obtener breadcrumbs
    const breadcrumbs = await categoryService.getCategoryBreadcrumbs(category.id);

    // Obtener categoría padre si existe
    let parent = null;
    if (category.parent_id) {
      const parents = await query(`
        SELECT id, name, slug, image_url
        FROM categories
        WHERE id = ? AND is_active = TRUE
        LIMIT 1
      `, [category.parent_id]);
      if (parents.length > 0) {
        parent = parents[0];
      }
    }

    // Obtener subcategorías con contador de productos
    const children = await query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description, 
        c.image_url,
        c.sort_order,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.parent_id = ? AND c.is_active = TRUE
      GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.sort_order
      ORDER BY c.sort_order ASC, c.name ASC
    `, [category.id]);

    // Obtener contador de productos (incluyendo subcategorías)
    const productCount = await categoryService.getProductCount(category.id, true);

    res.json({
      success: true,
      data: {
        category: {
          ...category,
          parent,
          children: children.map(child => ({
            ...child,
            product_count: parseInt(child.product_count) || 0
          })),
          breadcrumbs,
          product_count: productCount
        }
      }
    });
  } catch (error) {
    logError('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría'
    });
  }
});

// ============================================
// ADMIN: POST /api/admin/categories
// ============================================
// Crear nueva categoría (requiere admin)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
router.post('/categories', authenticate, requireAdmin, rateLimiters.admin, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Nombre requerido (máx 255 caracteres)'),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug inválido (solo minúsculas, números y guiones)'),
  body('description').optional().trim(),
  body('parent_id').optional().isInt().withMessage('parent_id debe ser un número'),
  body('image_url').optional().isURL().withMessage('image_url debe ser una URL válida'),
  body('is_active').optional().isBoolean().withMessage('is_active debe ser booleano'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order debe ser un número positivo'),
  body('meta_title').optional().trim().isLength({ max: 255 }).withMessage('meta_title muy largo'),
  body('meta_description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      name,
      slug: providedSlug,
      description,
      parent_id,
      image_url,
      is_active = true,
      sort_order = 0,
      meta_title,
      meta_description
    } = req.body;

    // Generar slug si no se proporciona
    const slug = providedSlug || await categoryService.generateUniqueSlug(name);

    // Verificar que el slug sea único
    const existing = await query(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Validar categoría padre
    if (parent_id) {
      const parentValidation = await categoryService.validateParentCategory(parent_id);
      if (!parentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: parentValidation.error
        });
      }
    }

    // Crear categoría
    const result = await query(`
      INSERT INTO categories (
        name, slug, description, parent_id, image_url, 
        is_active, sort_order, meta_title, meta_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      slug,
      description || null,
      parent_id || null,
      image_url || null,
      is_active,
      sort_order,
      meta_title || null,
      meta_description || null
    ]);

    // Invalidar cache
    cacheManager.delPattern('^categories:');
    cacheManager.delPattern('^category:');

    // Obtener categoría creada
    const newCategory = await query(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    // Audit log
    await auditService.logAudit('CREATE', 'category', result.insertId, null, newCategory[0], req);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        category: newCategory[0]
      }
    });
  } catch (error) {
    logError('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría'
    });
  }
});

// ============================================
// ADMIN: PUT /api/admin/categories/:id
// ============================================
// Actualizar categoría (requiere admin)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
router.put('/categories/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID debe ser un número'),
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
  body('description').optional().trim(),
  body('parent_id').optional().isInt(),
  body('image_url').optional().isURL(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 }),
  body('meta_title').optional().trim().isLength({ max: 255 }),
  body('meta_description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Verificar que la categoría existe
    const existing = await query(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que el slug sea único si se actualiza
    if (updates.slug && updates.slug !== existing[0].slug) {
      const slugExists = await query(
        'SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1',
        [updates.slug, id]
      );
      if (slugExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El slug ya existe'
        });
      }
    }

    // Validar parent_id si se actualiza
    if (updates.parent_id !== undefined) {
      // Verificar que no sea su propio padre
      if (parseInt(updates.parent_id) === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Una categoría no puede ser padre de sí misma'
        });
      }

      // Validar categoría padre
      if (updates.parent_id) {
        const parentValidation = await categoryService.validateParentCategory(updates.parent_id, id);
        if (!parentValidation.valid) {
          return res.status(400).json({
            success: false,
            message: parentValidation.error
          });
        }

        // Verificar ciclo circular
        const hasCycle = await categoryService.hasCircularReference(parseInt(id), parseInt(updates.parent_id));
        if (hasCycle) {
          return res.status(400).json({
            success: false,
            message: 'No se puede crear una relación circular en la jerarquía'
          });
        }
      }
    }

    // Construir query de actualización
    const allowedFields = [
      'name', 'slug', 'description', 'parent_id', 'image_url',
      'is_active', 'sort_order', 'meta_title', 'meta_description'
    ];
    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field] === null || updates[field] === '' ? null : updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await query(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Invalidar cache
    cacheManager.delPattern('^categories:');
    cacheManager.delPattern('^category:');

    // Obtener categoría actualizada
    const updated = await query(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    // Audit log
    await auditService.logAudit('UPDATE', 'category', id, existing[0], updated[0], req);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: {
        category: updated[0]
      }
    });
  } catch (error) {
    logError('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría'
    });
  }
});

// ============================================
// ADMIN: PUT /api/admin/categories/:id/reorder
// ============================================
// Reordenar categoría (cambiar sort_order)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
router.put('/categories/:id/reorder', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID debe ser un número'),
  body('sort_order').isInt({ min: 0 }).withMessage('sort_order debe ser un número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { sort_order } = req.body;

    // Verificar que la categoría existe
    const existing = await query(
      'SELECT id, sort_order FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Actualizar sort_order
    await query(
      'UPDATE categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sort_order, id]
    );

    // Invalidar cache
    cacheManager.delPattern('^categories:');

    // Audit log
    await auditService.logAudit('REORDER', 'category', id, { sort_order: existing[0].sort_order }, { sort_order }, req);

    res.json({
      success: true,
      message: 'Categoría reordenada exitosamente'
    });
  } catch (error) {
    logError('Error reordenando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar categoría'
    });
  }
});

// ============================================
// ADMIN: PUT /api/admin/categories/:id/toggle-active
// ============================================
// Activar/desactivar categoría (soft delete/toggle)
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
router.put('/categories/:id/toggle-active', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID debe ser un número'),
  body('is_active').isBoolean().withMessage('is_active debe ser booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { is_active } = req.body;

    // Verificar que la categoría existe
    const existing = await query(
      'SELECT id, is_active FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si se desactiva, verificar que no tenga subcategorías activas
    if (!is_active) {
      const activeChildren = await query(
        'SELECT COUNT(*) as count FROM categories WHERE parent_id = ? AND is_active = TRUE',
        [id]
      );
      
      if (parseInt(activeChildren[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar una categoría que tiene subcategorías activas. Desactiva primero las subcategorías.'
        });
      }
    }

    // Actualizar is_active
    await query(
      'UPDATE categories SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, id]
    );

    // Invalidar cache
    cacheManager.delPattern('^categories:');
    cacheManager.delPattern('^category:');

    // Audit log
    await auditService.logAudit('TOGGLE_ACTIVE', 'category', id, { is_active: existing[0].is_active }, { is_active }, req);

    res.json({
      success: true,
      message: `Categoría ${is_active ? 'activada' : 'desactivada'} exitosamente`
    });
  } catch (error) {
    logError('Error cambiando estado de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de categoría'
    });
  }
});

// ============================================
// ADMIN: DELETE /api/admin/categories/:id
// ============================================
// Soft delete de categoría (establece is_active = FALSE)
// Si tiene productos o subcategorías, no permite eliminar
// ❌ NO CACHEABLE: Ruta privada, requiere autenticación admin
// 🔒 RATE LIMITED: Admin (50 req/min por usuario)
router.delete('/categories/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID debe ser un número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Verificar que la categoría existe
    const existing = await query(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que no tenga subcategorías
    const children = await query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );

    if (parseInt(children[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una categoría que tiene subcategorías. Primero elimina o mueve las subcategorías.'
      });
    }

    // Verificar que no tenga productos
    const products = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );

    if (parseInt(products[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar una categoría que tiene ${products[0].count} producto(s) asociado(s). Primero mueve los productos a otra categoría.`
      });
    }

    // Soft delete: establecer is_active = FALSE
    await query(
      'UPDATE categories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    // Invalidar cache
    cacheManager.delPattern('^categories:');
    cacheManager.delPattern('^category:');

    // Audit log
    await auditService.logAudit('DELETE', 'category', id, existing[0], { is_active: false }, req);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente (soft delete)'
    });
  } catch (error) {
    logError('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría'
    });
  }
});

module.exports = router;
