// ============================================
// Rutas de Categorías
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { body, validationResult, param, query: queryValidator } = require('express-validator');
const { rateLimiters } = require('../../security/rateLimiter');
const cacheManager = require('../../cache'); // Auto-selecciona Redis si está disponible
const cacheMiddleware = require('../../cache/cacheMiddleware');
const { getTTL } = require('../../cache/cacheConfig');
const { info, error: logError } = require('../../logger');
const auditService = require('../../services/audit.service');
const metricsService = require('../../metrics/metrics.service');

// ============================================
// Helper: Construir árbol jerárquico de categorías
// ============================================
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // Primero, crear mapa de todas las categorías
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  // Luego, construir el árbol
  categories.forEach(cat => {
    const categoryNode = categoryMap.get(cat.id);
    if (cat.parent_id === null || cat.parent_id === undefined) {
      rootCategories.push(categoryNode);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(categoryNode);
      } else {
        // Si el padre no existe, tratarlo como raíz
        rootCategories.push(categoryNode);
      }
    }
  });

  // Ordenar por sort_order
  const sortByOrder = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);
  rootCategories.sort(sortByOrder);
  rootCategories.forEach(cat => {
    if (cat.children) {
      cat.children.sort(sortByOrder);
    }
  });

  return rootCategories;
}

// ============================================
// GET /api/admin/categories
// ============================================
// Obtener todas las categorías (admin, incluye inactivas)
// NOTA: Esta ruta debe ir ANTES de cualquier ruta con parámetros dinámicos
router.get('/admin/categories', authenticate, requireAdmin, async (req, res) => {
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
      const productCount = await query(`
        SELECT COUNT(*) as count
        FROM products
        WHERE category_id = ?
      `, [cat.id]);
      cat.product_count = productCount[0]?.count || 0;
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
// GET /api/v1/categories
// ============================================
// Obtener todas las categorías activas con jerarquía
// ✅ CACHEABLE: Ruta pública, solo lectura
router.get('/categories', rateLimiters.public, cacheMiddleware({
  ttl: getTTL('CATEGORIES_LIST') || 300, // 5 minutos por defecto
  keyBuilder: (req) => `categories:list:active`,
  vary: []
}), async (req, res) => {
  try {
    // Obtener todas las categorías activas ordenadas
    const categories = await query(`
      SELECT 
        id, name, slug, description, parent_id, 
        image_url, is_active, sort_order,
        meta_title, meta_description,
        created_at, updated_at
      FROM categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC
    `);

    // Construir árbol jerárquico
    const tree = buildCategoryTree(categories);

    // También devolver versión plana para compatibilidad
    const flat = categories.map(cat => ({
      ...cat,
      children: categories.filter(c => c.parent_id === cat.id)
    }));

    res.json({
      success: true,
      data: {
        categories: tree,
        flat: flat
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
// GET /api/v1/categories/:id
// ============================================
// Obtener una categoría específica por ID
router.get('/categories/:id', rateLimiters.public, [
  param('id').isInt().withMessage('ID debe ser un número entero')
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

    // Obtener categoría
    const categories = await query(`
      SELECT 
        id, name, slug, description, parent_id,
        image_url, is_active, sort_order,
        meta_title, meta_description,
        created_at, updated_at
      FROM categories
      WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const category = categories[0];

    // Obtener categoría padre si existe
    if (category.parent_id) {
      const parents = await query(`
        SELECT id, name, slug, description, parent_id,
               image_url, is_active, sort_order
        FROM categories
        WHERE id = ? AND is_active = TRUE
      `, [category.parent_id]);

      if (parents.length > 0) {
        category.parent = parents[0];
      }
    }

    // Contar productos en esta categoría
    const productCount = await query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE category_id = ? AND is_active = TRUE
    `, [id]);

    category.product_count = productCount[0]?.count || 0;

    res.json({
      success: true,
      data: {
        category
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
// GET /api/v1/categories/slug/:slug
// ============================================
// Obtener categoría por slug
router.get('/categories/slug/:slug', rateLimiters.public, [
  param('slug').notEmpty().withMessage('Slug requerido')
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

    const { slug } = req.params;

    // Obtener categoría
    const categories = await query(`
      SELECT 
        id, name, slug, description, parent_id,
        image_url, is_active, sort_order,
        meta_title, meta_description,
        created_at, updated_at
      FROM categories
      WHERE slug = ? AND is_active = TRUE
    `, [slug]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const category = categories[0];

    // Obtener categoría padre si existe
    if (category.parent_id) {
      const parents = await query(`
        SELECT id, name, slug, description, parent_id,
               image_url, is_active, sort_order
        FROM categories
        WHERE id = ? AND is_active = TRUE
      `, [category.parent_id]);

      if (parents.length > 0) {
        category.parent = parents[0];
      }
    }

    // Contar productos en esta categoría
    const productCount = await query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE category_id = ? AND is_active = TRUE
    `, [category.id]);

    category.product_count = productCount[0]?.count || 0;

    res.json({
      success: true,
      data: {
        category
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
// GET /api/v1/categories/:slug/products
// ============================================
// Obtener productos de una categoría (incluye subcategorías)
router.get('/categories/:slug/products', rateLimiters.public, [
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
    return `categories:${slug}:products:${page}:${limit}:${price_min || ''}:${price_max || ''}:${featured || ''}:${stock || ''}`;
  },
  vary: []
}), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log para debugging
      logError('Validation errors in /categories/:slug/products', {
        slug: req.params.slug,
        errors: errors.array(),
        query: req.query
      });
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

    // Primero, obtener la categoría y sus subcategorías
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
      const subcategories = await query(`
        SELECT id FROM categories WHERE parent_id = ? AND is_active = TRUE
      `, [parentId]);

      let ids = [parentId];
      for (const sub of subcategories) {
        const subIds = await getAllSubcategoryIds(sub.id);
        ids = ids.concat(subIds);
      }
      return ids;
    };

    const categoryIds = await getAllSubcategoryIds(categoryId);

    // Construir query de productos
    let sql = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.short_description,
        p.price, p.compare_at_price, p.brand, p.sku,
        p.stock, p.is_active, p.is_featured, p.is_new, p.is_bestseller,
        p.image_url, p.category_id,
        c.slug as category_slug, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE AND p.category_id IN (?)
    `;

    const params = [categoryIds];
    const countParams = [categoryIds];

    // Filtros
    if (price_min) {
      sql += ' AND p.price >= ?';
      params.push(parseFloat(price_min));
      countParams.push(parseFloat(price_min));
    }

    if (price_max) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(price_max));
      countParams.push(parseFloat(price_max));
    }

    if (featured === 'true') {
      sql += ' AND p.is_featured = TRUE';
    }

    if (stock === 'in_stock') {
      sql += ' AND p.stock > 0';
    } else if (stock === 'out_of_stock') {
      sql += ' AND p.stock = 0';
    }

    // Contar total
    let countSql = sql.replace(
      'SELECT p.id, p.name, p.slug, p.description, p.short_description, p.price, p.compare_at_price, p.brand, p.sku, p.stock, p.is_active, p.is_featured, p.is_new, p.is_bestseller, p.image_url, p.category_id, c.slug as category_slug, c.name as category_name',
      'SELECT COUNT(*) as total'
    ).replace('FROM products p', 'FROM products p').split('ORDER BY')[0];

    const [countResult] = await query(countSql, countParams);
    const total = countResult.total || 0;

    // Ordenar y paginar
    sql += ' ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await query(sql, params);

    res.json({
      success: true,
      data: {
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
// POST /api/admin/categories
// ============================================
// Crear nueva categoría (requiere admin)
router.post('/admin/categories', authenticate, requireAdmin, [
  body('name').notEmpty().trim().withMessage('Nombre requerido'),
  body('slug').notEmpty().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug inválido (solo minúsculas, números y guiones)'),
  body('description').optional().trim(),
  body('parent_id').optional().isInt().withMessage('parent_id debe ser un número entero'),
  body('image_url').optional().isURL().withMessage('URL de imagen inválida'),
  body('is_active').optional().isBoolean().withMessage('is_active debe ser true o false'),
  body('sort_order').optional().isInt().withMessage('sort_order debe ser un número entero'),
  body('meta_title').optional().trim(),
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
      slug,
      description,
      parent_id,
      image_url,
      is_active = true,
      sort_order = 0,
      meta_title,
      meta_description
    } = req.body;

    // Verificar que el slug sea único
    const existing = await query(`
      SELECT id FROM categories WHERE slug = ?
    `, [slug]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe. Debe ser único.'
      });
    }

    // Verificar que parent_id existe si se proporciona
    if (parent_id) {
      const parent = await query(`
        SELECT id FROM categories WHERE id = ? AND is_active = TRUE
      `, [parent_id]);

      if (parent.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La categoría padre no existe o está inactiva'
        });
      }
    }

    // Insertar categoría
    const result = await query(`
      INSERT INTO categories (
        name, slug, description, parent_id,
        image_url, is_active, sort_order,
        meta_title, meta_description
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

    const categoryId = result.insertId || result[0]?.id;

    // Obtener categoría creada
    const [newCategory] = await query(`
      SELECT * FROM categories WHERE id = ?
    `, [categoryId]);

    // Registrar auditoría
    await auditService.logAudit(
      'CREATE',
      'category',
      categoryId,
      null,
      { name, slug, parent_id },
      req
    );

    // Invalidar caché
    await cacheManager.invalidatePattern('categories:*');

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        category: newCategory
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
// PUT /api/admin/categories/:id
// ============================================
// Actualizar categoría (requiere admin)
router.put('/admin/categories/:id', authenticate, requireAdmin, [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  body('name').optional().notEmpty().trim().withMessage('Nombre no puede estar vacío'),
  body('slug').optional().notEmpty().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug inválido'),
  body('description').optional().trim(),
  body('parent_id').optional().isInt().withMessage('parent_id debe ser un número entero'),
  body('image_url').optional().isURL().withMessage('URL de imagen inválida'),
  body('is_active').optional().isBoolean().withMessage('is_active debe ser true o false'),
  body('sort_order').optional().isInt().withMessage('sort_order debe ser un número entero'),
  body('meta_title').optional().trim(),
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
    const [existing] = await query(`
      SELECT * FROM categories WHERE id = ?
    `, [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que el slug sea único (si se está actualizando)
    if (updates.slug && updates.slug !== existing.slug) {
      const slugCheck = await query(`
        SELECT id FROM categories WHERE slug = ? AND id != ?
      `, [updates.slug, id]);

      if (slugCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El slug ya existe. Debe ser único.'
        });
      }
    }

    // Verificar que parent_id existe y no es circular
    if (updates.parent_id !== undefined) {
      if (updates.parent_id === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Una categoría no puede ser su propia padre'
        });
      }

      if (updates.parent_id) {
        const parent = await query(`
          SELECT id FROM categories WHERE id = ? AND is_active = TRUE
        `, [updates.parent_id]);

        if (parent.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'La categoría padre no existe o está inactiva'
          });
        }

        // Verificar que no se cree un ciclo (el padre no puede ser hijo de esta categoría)
        const checkCycle = async (categoryId, targetParentId) => {
          const children = await query(`
            SELECT id FROM categories WHERE parent_id = ?
          `, [categoryId]);

          for (const child of children) {
            if (child.id === targetParentId) {
              return true; // Ciclo detectado
            }
            const hasCycle = await checkCycle(child.id, targetParentId);
            if (hasCycle) return true;
          }
          return false;
        };

        const hasCycle = await checkCycle(id, updates.parent_id);
        if (hasCycle) {
          return res.status(400).json({
            success: false,
            message: 'No se puede crear una relación circular'
          });
        }
      }
    }

    // Construir query de actualización
    const updateFields = [];
    const updateValues = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }
    if (updates.slug !== undefined) {
      updateFields.push('slug = ?');
      updateValues.push(updates.slug);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description || null);
    }
    if (updates.parent_id !== undefined) {
      updateFields.push('parent_id = ?');
      updateValues.push(updates.parent_id || null);
    }
    if (updates.image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(updates.image_url || null);
    }
    if (updates.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(updates.is_active);
    }
    if (updates.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(updates.sort_order);
    }
    if (updates.meta_title !== undefined) {
      updateFields.push('meta_title = ?');
      updateValues.push(updates.meta_title || null);
    }
    if (updates.meta_description !== undefined) {
      updateFields.push('meta_description = ?');
      updateValues.push(updates.meta_description || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(id);

    await query(`
      UPDATE categories
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Obtener categoría actualizada
    const [updated] = await query(`
      SELECT * FROM categories WHERE id = ?
    `, [id]);

    // Registrar auditoría
    await auditService.logAudit(
      'UPDATE',
      'category',
      id,
      existing,
      updated,
      req
    );

    // Invalidar caché
    await cacheManager.invalidatePattern('categories:*');

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: {
        category: updated
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
// DELETE /api/admin/categories/:id
// ============================================
// Eliminar categoría (requiere admin)
router.delete('/admin/categories/:id', authenticate, requireAdmin, [
  param('id').isInt().withMessage('ID debe ser un número entero')
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
    const [category] = await query(`
      SELECT * FROM categories WHERE id = ?
    `, [id]);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que no tenga productos asociados
    const products = await query(`
      SELECT COUNT(*) as count FROM products WHERE category_id = ?
    `, [id]);

    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría porque tiene ${products[0].count} producto(s) asociado(s). Primero mueve o elimina los productos.`
      });
    }

    // Verificar que no tenga subcategorías
    const subcategories = await query(`
      SELECT COUNT(*) as count FROM categories WHERE parent_id = ?
    `, [id]);

    if (subcategories[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría porque tiene ${subcategories[0].count} subcategoría(s). Primero elimina o mueve las subcategorías.`
      });
    }

    // Eliminar categoría
    await query(`
      DELETE FROM categories WHERE id = ?
    `, [id]);

    // Registrar auditoría
    await auditService.logAudit(
      'DELETE',
      'category',
      id,
      category,
      null,
      req
    );

    // Invalidar caché
    await cacheManager.invalidatePattern('categories:*');

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
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

