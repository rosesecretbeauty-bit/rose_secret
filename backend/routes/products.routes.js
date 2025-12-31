// ============================================
// Rutas de Productos
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../security/rateLimiter');
const { adminLimiter } = require('../middleware/rateLimit'); // Mantener para compatibilidad
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const { productKeys, adminKeys } = require('../cache/cacheKeys');
const cacheMiddleware = require('../cache/cacheMiddleware');
const { getTTL } = require('../cache/cacheConfig');
const { info, error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const metricsService = require('../metrics/metrics.service');

// ============================================
// GET /api/products
// ============================================
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 */
// ✅ CACHEABLE: Ruta pública, solo lectura, datos no sensibles
// 🔒 RATE LIMITED: Público (200 req/min por IP)
// TTL: 60s (configurable via CACHE_TTL_PRODUCTS_LIST)
router.get('/', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('PRODUCTS_LIST'),
  keyBuilder: (req) => {
    const { category, search, page = 1, limit = 20 } = req.query;
    return productKeys.list({
      category,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      apiVersion: req.apiVersion || 1
    });
  },
  vary: [] // No varía por headers (datos públicos)
}), async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query optimizado con explicit SELECTs y JOIN para imágenes (evita N+1)
    // Incluir is_new e is_bestseller para permitir filtrado en frontend (FASE 1)
    // FASE 2: Optimizado con LEFT JOIN para obtener imagen principal en una sola query
    // Usamos subconsulta para obtener solo la imagen principal (compatible con MySQL 5.7+ y MariaDB)
    let sql = `
      SELECT DISTINCT
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.category_id, 
        p.brand, 
        p.stock, 
        p.is_active, 
        p.is_new, 
        p.is_bestseller,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.sort_order ASC 
          LIMIT 1
        ) as primary_image,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.sort_order ASC 
          LIMIT 1
        ) as image_url
      FROM products p
      WHERE p.is_active = TRUE
    `;
    
    let countSql = 'SELECT COUNT(DISTINCT p.id) as total FROM products p WHERE p.is_active = TRUE';
    const params = [];
    const countParams = [];

    // Filtro por categoría (ahora usa category_id)
    if (category) {
      sql += ' AND p.category_id = ?';
      countSql += ' AND p.category_id = ?';
      params.push(category);
      countParams.push(category);
    }

    // Búsqueda por nombre o descripción
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countSql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Ordenar y paginar (LIMIT obligatorio)
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await query(sql, params);
    const [countResult] = await query(countSql, countParams);
    const total = countResult.total;

    // Convertir tipos de datos (MySQL devuelve DECIMAL como string)
    for (const product of products) {
      // Convertir precio a número
      product.price = parseFloat(product.price) || 0;
      // image_url ya viene del JOIN, no necesitamos query adicional
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
    logError('Error obteniendo productos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos' 
    });
  }
});

// ============================================
// ADMIN: GET /api/admin/products/stats
// ============================================
// Obtener estadísticas de productos para el dashboard admin
// ❌ NO CACHEABLE: Ruta admin, datos sensibles, siempre frescos
// 🔒 RATE LIMITED: Admin (60 req/15min por usuario)
// NOTA: Esta ruta debe ir ANTES de cualquier ruta con :id para evitar conflictos
router.get('/stats', authenticate, requireAdmin, rateLimiters.admin, async (req, res) => {
  try {
    // Estadísticas generales
    const totalProducts = await query('SELECT COUNT(*) as total FROM products');
    const activeProducts = await query('SELECT COUNT(*) as total FROM products WHERE is_active = TRUE');
    const inactiveProducts = await query('SELECT COUNT(*) as total FROM products WHERE is_active = FALSE');
    
    // Estadísticas de stock
    const inStockProducts = await query('SELECT COUNT(*) as total FROM products WHERE stock > 0');
    const lowStockProducts = await query(`
      SELECT COUNT(*) as total 
      FROM products 
      WHERE stock > 0 AND stock <= low_stock_threshold
    `);
    const outOfStockProducts = await query('SELECT COUNT(*) as total FROM products WHERE stock = 0');
    
    // Estadísticas de featured
    const featuredProducts = await query('SELECT COUNT(*) as total FROM products WHERE is_featured = TRUE');
    
    // Estadísticas por categoría
    const productsByCategory = await query(`
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.is_active = TRUE
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Productos más vendidos (basado en order_items, si existe la tabla)
    const topSellingProducts = await query(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    
    // Valor total del inventario
    const inventoryValue = await query(`
      SELECT SUM(price * stock) as total_value
      FROM products
      WHERE is_active = TRUE
    `);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalProducts[0]?.total || 0,
          active: activeProducts[0]?.total || 0,
          inactive: inactiveProducts[0]?.total || 0,
          featured: featuredProducts[0]?.total || 0
        },
        stock: {
          in_stock: inStockProducts[0]?.total || 0,
          low_stock: lowStockProducts[0]?.total || 0,
          out_of_stock: outOfStockProducts[0]?.total || 0
        },
        inventory_value: parseFloat(inventoryValue[0]?.total_value || 0),
        by_category: productsByCategory.map((cat) => ({
          id: cat.id,
          name: cat.name,
          count: parseInt(cat.count || 0)
        })),
        top_selling: topSellingProducts.map((prod) => ({
          id: prod.id,
          name: prod.name,
          total_sold: parseInt(prod.total_sold || 0)
        }))
      }
    });
  } catch (error) {
    logError('Error obteniendo estadísticas de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// ============================================
// GET /api/products/:id
// ============================================
// ✅ CACHEABLE: Ruta pública, solo lectura, datos no sensibles
// 🔒 RATE LIMITED: Público (200 req/min por IP)
// TTL: 60s (configurable via CACHE_TTL_PRODUCT_DETAIL)
router.get('/:id', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('PRODUCT_DETAIL'),
  keyBuilder: (req) => {
    return productKeys.detail(req.params.id, req.apiVersion || 1);
  },
  vary: [] // No varía por headers (datos públicos)
}), async (req, res) => {
  try {
    const { id } = req.params;

    // Validar y parsear ID
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }

    // Query optimizado con explicit SELECTs y JOIN con categorías
    const products = await query(
      `SELECT 
        p.id, 
        p.name, 
        p.slug,
        p.description, 
        p.short_description,
        p.price, 
        p.compare_at_price,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug,
        p.brand, 
        p.sku,
        p.stock,
        p.low_stock_threshold,
        p.is_active, 
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = TRUE
      LIMIT 1`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    const product = products[0];

    // Convertir precios a números (MySQL devuelve DECIMAL como string)
    product.price = parseFloat(product.price) || 0;
    if (product.compare_at_price) {
      product.compare_at_price = parseFloat(product.compare_at_price) || 0;
    }

    // Obtener todas las imágenes del producto ordenadas por sort_order
    const images = await query(`
      SELECT 
        id,
        image_url,
        alt_text,
        sort_order,
        is_primary
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `, [id]);

    // Agregar imágenes al producto
    product.images = images.map(img => ({
      id: img.id,
      url: img.image_url,
      alt: img.alt_text || product.name,
      sort_order: img.sort_order,
      is_primary: img.is_primary
    }));

    // Mantener compatibilidad: image_url para la primera imagen
    product.image_url = images.length > 0 ? images[0].image_url : null;

    // Obtener todas las variantes activas del producto
    const variants = await query(`
      SELECT 
        id,
        name,
        sku,
        price,
        compare_at_price,
        stock,
        weight,
        attributes,
        is_active,
        created_at
      FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
      ORDER BY created_at ASC, name ASC
    `, [id]);
    
    // Marcar la primera variante como default si no hay ninguna marcada
    // (usando created_at como criterio de orden)
    if (variants.length > 0) {
      // La primera variante se considera default implícitamente
      variants.forEach((variant, index) => {
        variant.is_default = index === 0;
      });
    }

    // Parsear attributes JSON y convertir precios a números
    for (let variant of variants) {
      // Convertir precios a números
      variant.price = parseFloat(variant.price) || 0;
      if (variant.compare_at_price) {
        variant.compare_at_price = parseFloat(variant.compare_at_price) || 0;
      }
      
      if (variant.attributes) {
        try {
          variant.attributes = typeof variant.attributes === 'string' 
            ? JSON.parse(variant.attributes) 
            : variant.attributes;
        } catch (e) {
          variant.attributes = {};
        }
      } else {
        variant.attributes = {};
      }
    }

    // Agregar variantes al producto
    product.variants = variants;

    // Obtener información de stock usando el servicio centralizado
    const stockService = require('../services/stock.service');
    const stockInfo = await stockService.getStockInfo(productId, null);
    
    // Agregar información de stock al producto
    product.has_variants = stockInfo.has_variants;
    product.available_stock = stockInfo.available_stock;

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    logError('Error obteniendo producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener producto' 
    });
  }
});

// ============================================
// ADMIN: GET /api/admin/products
// ============================================
// ❌ NO CACHEABLE: Ruta admin, datos sensibles, requiere autenticación
// 🔒 RATE LIMITED: Admin (60 req/15min por usuario)
// Siempre devuelve datos frescos
router.get('/admin/products', authenticate, requireAdmin, rateLimiters.admin, [
  queryValidator('category_id').optional().isInt().withMessage('Categoría inválida'),
  queryValidator('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Estado inválido'),
  queryValidator('stock').optional().isIn(['in_stock', 'low_stock', 'out_of_stock', 'all']).withMessage('Stock inválido'),
  queryValidator('featured').optional().isIn(['true', 'false', 'all']).withMessage('Featured inválido'),
  queryValidator('search').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Búsqueda inválida')
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

    // Construir WHERE clause dinámicamente
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Filtro por categoría
    if (req.query.category_id) {
      whereClause += ' AND p.category_id = ?';
      queryParams.push(parseInt(req.query.category_id));
    }

    // Filtro por status
    if (req.query.status === 'active') {
      whereClause += ' AND p.is_active = TRUE';
    } else if (req.query.status === 'inactive') {
      whereClause += ' AND p.is_active = FALSE';
    }
    // 'all' o no especificado: no filtra

    // Filtro por stock
    if (req.query.stock === 'in_stock') {
      whereClause += ' AND p.stock > 0';
    } else if (req.query.stock === 'low_stock') {
      whereClause += ' AND p.stock > 0 AND p.stock <= p.low_stock_threshold';
    } else if (req.query.stock === 'out_of_stock') {
      whereClause += ' AND p.stock = 0';
    }
    // 'all' o no especificado: no filtra

    // Filtro por featured
    if (req.query.featured === 'true') {
      whereClause += ' AND p.is_featured = TRUE';
    } else if (req.query.featured === 'false') {
      whereClause += ' AND p.is_featured = FALSE';
    }
    // 'all' o no especificado: no filtra

    // Búsqueda por nombre, SKU o descripción
    if (req.query.search) {
      whereClause += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // NO cachear admin (datos sensibles, siempre frescos)
    // Query optimizado con explicit SELECTs y JOIN con categorías
    const products = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.slug,
        p.description, 
        p.short_description,
        p.price, 
        p.compare_at_price,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug,
        p.brand, 
        p.sku,
        p.stock,
        p.low_stock_threshold,
        p.is_active, 
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, queryParams);

    // Obtener imagen principal de cada producto
    for (let product of products) {
      const images = await query(
        'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
        [product.id]
      );
      
      if (images.length > 0) {
        product.image_url = images[0].image_url;
      } else {
        // Fallback: intentar obtener image_url del producto (si existe en schema antiguo)
        // Nota: En schema completo, image_url no existe en products, solo en product_images
        product.image_url = null;
      }
    }

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    logError('Error obteniendo productos (admin):', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos' 
    });
  }
});

// ============================================
// ADMIN: POST /api/admin/products
// ============================================
router.post('/admin/products', authenticate, requireAdmin, rateLimiters.admin, [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('category_id').isInt().withMessage('Categoría inválida'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido')
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

    const { name, description, short_description, price, compare_at_price, category_id, brand, sku, stock, low_stock_threshold, is_active, is_featured, is_new, is_bestseller } = req.body;

    // Verificar que la categoría existe
    const categoryCheck = await query('SELECT id FROM categories WHERE id = ? AND is_active = TRUE LIMIT 1', [category_id]);
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada o inactiva'
      });
    }

    // Generar slug único
    const baseSlug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let slugCounter = 1;
    while (true) {
      const existing = await query('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    const result = await query(
      `INSERT INTO products (
        name, slug, description, short_description, price, compare_at_price,
        category_id, brand, sku, stock, low_stock_threshold,
        is_active, is_featured, is_new, is_bestseller
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, slug, description || null, short_description || null,
        price, compare_at_price || null, category_id,
        brand || null, sku || null, stock || 0, low_stock_threshold || 5,
        is_active !== undefined ? is_active : true,
        is_featured || false, is_new || false, is_bestseller || false
      ]
    );

    const productId = result.insertId;

    // Si se proporciona image_url, crear registro en product_images
    if (req.body.image_url) {
      await query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, TRUE, 1)',
        [productId, req.body.image_url]
      );
    }

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_CREATED',
      'product',
      productId,
      null,
      { name, price, category_id, stock },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_CREATED');

    // Invalidar cache de productos
    cacheManager.delPattern(productKeys.pattern.all);
    cacheManager.delPattern(adminKeys.pattern.products);

    // Obtener producto completo con categoría
    const products = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.slug,
        p.description, 
        p.short_description,
        p.price, 
        p.compare_at_price,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug,
        p.brand, 
        p.sku,
        p.stock,
        p.low_stock_threshold,
        p.is_active, 
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const product = products[0];

    // Obtener imagen principal
    const images = await query(
      'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
      [productId]
    );
    product.image_url = images.length > 0 ? images[0].image_url : null;

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        product: products[0]
      }
    });
  } catch (error) {
    logError('Error creando producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear producto' 
    });
  }
});

// ============================================
// ADMIN: PUT /api/admin/products/:id
// ============================================
router.put('/admin/products/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID inválido'),
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, price, compare_at_price, category_id, brand, sku, stock, low_stock_threshold, is_active, is_featured, is_new, is_bestseller, image_url } = req.body;

    // Verificar que el producto existe y obtener valores actuales
    const existing = await query(`
      SELECT 
        p.id, p.name, p.description, p.short_description, p.price, p.compare_at_price,
        p.category_id, p.brand, p.sku, p.stock, p.low_stock_threshold,
        p.is_active, p.is_featured, p.is_new, p.is_bestseller
      FROM products p
      WHERE p.id = ?
      LIMIT 1
    `, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    const oldProduct = existing[0];

    // Si se proporciona category_id, verificar que existe
    if (category_id !== undefined) {
      const categoryCheck = await query('SELECT id FROM categories WHERE id = ? AND is_active = TRUE LIMIT 1', [category_id]);
      if (categoryCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada o inactiva'
        });
      }
    }

    // Construir query dinámica
    const updates = [];
    const params = [];
    const newValues = {};

    if (name !== undefined) { 
      updates.push('name = ?'); 
      params.push(name); 
      newValues.name = name;
      
      // Si cambia el nombre, actualizar slug
      const baseSlug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      let slug = baseSlug;
      let slugCounter = 1;
      while (true) {
        const existingSlug = await query('SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1', [slug, id]);
        if (existingSlug.length === 0) break;
        slug = `${baseSlug}-${slugCounter}`;
        slugCounter++;
      }
      updates.push('slug = ?');
      params.push(slug);
    }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); newValues.description = description; }
    if (short_description !== undefined) { updates.push('short_description = ?'); params.push(short_description); newValues.short_description = short_description; }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); newValues.price = price; }
    if (compare_at_price !== undefined) { updates.push('compare_at_price = ?'); params.push(compare_at_price); newValues.compare_at_price = compare_at_price; }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); newValues.category_id = category_id; }
    if (brand !== undefined) { updates.push('brand = ?'); params.push(brand); newValues.brand = brand; }
    if (sku !== undefined) { updates.push('sku = ?'); params.push(sku); newValues.sku = sku; }
    if (stock !== undefined) { updates.push('stock = ?'); params.push(stock); newValues.stock = stock; }
    if (low_stock_threshold !== undefined) { updates.push('low_stock_threshold = ?'); params.push(low_stock_threshold); newValues.low_stock_threshold = low_stock_threshold; }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); newValues.is_active = is_active; }
    if (is_featured !== undefined) { updates.push('is_featured = ?'); params.push(is_featured); newValues.is_featured = is_featured; }
    if (is_new !== undefined) { updates.push('is_new = ?'); params.push(is_new); newValues.is_new = is_new; }
    if (is_bestseller !== undefined) { updates.push('is_bestseller = ?'); params.push(is_bestseller); newValues.is_bestseller = is_bestseller; }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No hay campos para actualizar' 
      });
    }

    params.push(id);

    await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_UPDATED',
      'product',
      id,
      oldProduct,
      newValues,
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_UPDATED');

    // Si se proporciona image_url, actualizar imagen principal
    if (image_url !== undefined) {
      // Eliminar imagen principal actual
      await query('DELETE FROM product_images WHERE product_id = ? AND is_primary = TRUE', [id]);
      // Crear nueva imagen principal
      await query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, TRUE, 1)',
        [id, image_url]
      );
    }

    // Invalidar cache de productos
    cacheManager.delPattern(productKeys.pattern.all);
    cacheManager.del(productKeys.detail(id));
    cacheManager.delPattern(adminKeys.pattern.products);

    // Obtener producto completo con categoría
    const products = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.slug,
        p.description, 
        p.short_description,
        p.price, 
        p.compare_at_price,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug,
        p.brand, 
        p.sku,
        p.stock,
        p.low_stock_threshold,
        p.is_active, 
        p.is_featured,
        p.is_new,
        p.is_bestseller,
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    const product = products[0];

    // Obtener imagen principal
    const images = await query(
      'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1',
      [id]
    );
    product.image_url = images.length > 0 ? images[0].image_url : null;

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: {
        product: product
      }
    });
  } catch (error) {
    logError('Error actualizando producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar producto' 
    });
  }
});

// ============================================
// ADMIN: DELETE /api/admin/products/:id
// ============================================
router.delete('/admin/products/:id', authenticate, requireAdmin, rateLimiters.admin, [
  param('id').isInt().withMessage('ID inválido')
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

    // Verificar que el producto existe y obtener valores actuales
    const existing = await query('SELECT id, name, description, price, category_id, brand, stock, is_active FROM products WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    const oldProduct = existing[0];

    // Soft delete (marcar como inactivo)
    await query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);

    // Registrar auditoría
    await auditService.logAudit(
      'PRODUCT_DELETED',
      'product',
      id,
      oldProduct,
      { is_active: false },
      req
    );

    // Registrar métrica admin
    metricsService.recordAdminAction('PRODUCT_DELETED');

    // Invalidar cache
    cacheManager.delPattern(productKeys.pattern.all);
    cacheManager.del(productKeys.detail(id));
    cacheManager.delPattern(adminKeys.pattern.products);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    logError('Error eliminando producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar producto' 
    });
  }
});

module.exports = router;

