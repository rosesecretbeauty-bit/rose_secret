// ============================================
// Category Service - Lógica de negocio de Categorías
// ============================================

const { query } = require('../db');
const { error: logError, info } = require('../logger');

/**
 * Construir árbol jerárquico de categorías desde lista plana
 * @param {Array} categories - Lista plana de categorías con parent_id
 * @returns {Array} Árbol jerárquico con children anidados
 */
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // Crear mapa de todas las categorías
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  // Construir jerarquía
  categories.forEach(cat => {
    const categoryNode = categoryMap.get(cat.id);
    if (cat.parent_id === null || cat.parent_id === undefined) {
      rootCategories.push(categoryNode);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(categoryNode);
      } else {
        // Si el padre no existe (inactivo o eliminado), tratarlo como raíz
        rootCategories.push(categoryNode);
      }
    }
  });

  // Ordenar por sort_order y luego por nombre
  const sortByOrder = (a, b) => {
    if (a.sort_order !== b.sort_order) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    }
    return (a.name || '').localeCompare(b.name || '');
  };

  const sortRecursive = (cats) => {
    cats.sort(sortByOrder);
    cats.forEach(cat => {
      if (cat.children && cat.children.length > 0) {
        sortRecursive(cat.children);
      }
    });
  };

  sortRecursive(rootCategories);

  return rootCategories;
}

/**
 * Obtener todos los IDs de subcategorías recursivamente
 * @param {number} parentId - ID de categoría padre
 * @param {boolean} includeInactive - Incluir categorías inactivas
 * @returns {Promise<Array<number>>} Array de IDs (incluye el parentId)
 */
async function getAllSubcategoryIds(parentId, includeInactive = false) {
  try {
    const whereClause = includeInactive 
      ? 'WHERE parent_id = ?' 
      : 'WHERE parent_id = ? AND is_active = TRUE';
    
    const subcategories = await query(`
      SELECT id FROM categories ${whereClause}
    `, [parentId]);

    let ids = [parentId];
    
    for (const sub of subcategories) {
      const subIds = await getAllSubcategoryIds(sub.id, includeInactive);
      ids = ids.concat(subIds);
    }

    return ids;
  } catch (error) {
    logError('Error getting subcategory IDs', error, { parentId });
    return [parentId]; // Fallback: retornar solo el ID padre
  }
}

/**
 * Obtener ruta completa de breadcrumbs para una categoría
 * @param {number} categoryId - ID de categoría
 * @returns {Promise<Array>} Array de categorías desde raíz hasta la categoría actual
 */
async function getCategoryBreadcrumbs(categoryId) {
  try {
    const breadcrumbs = [];
    let currentId = categoryId;

    while (currentId) {
      const categories = await query(`
        SELECT id, name, slug, parent_id
        FROM categories
        WHERE id = ? AND is_active = TRUE
        LIMIT 1
      `, [currentId]);

      if (categories.length === 0) {
        break;
      }

      const category = categories[0];
      breadcrumbs.unshift({
        id: category.id,
        name: category.name,
        slug: category.slug
      });

      currentId = category.parent_id;
    }

    return breadcrumbs;
  } catch (error) {
    logError('Error getting category breadcrumbs', error, { categoryId });
    return [];
  }
}

/**
 * Verificar si existe un ciclo en la jerarquía
 * @param {number} categoryId - ID de categoría a verificar
 * @param {number} targetParentId - ID de categoría que se quiere establecer como padre
 * @returns {Promise<boolean>} true si hay ciclo, false si no
 */
async function hasCircularReference(categoryId, targetParentId) {
  try {
    // Si se quiere establecer como su propio padre, es un ciclo
    if (categoryId === targetParentId) {
      return true;
    }

    // Si no hay padre, no hay ciclo
    if (!targetParentId) {
      return false;
    }

    // Verificar si el targetParentId es descendiente de categoryId
    const descendants = await getAllSubcategoryIds(categoryId, true);
    
    return descendants.includes(targetParentId);
  } catch (error) {
    logError('Error checking circular reference', error, { categoryId, targetParentId });
    return true; // En caso de error, asumir que hay ciclo (más seguro)
  }
}

/**
 * Validar que una categoría puede ser padre
 * @param {number} parentId - ID de categoría padre propuesta
 * @param {number} excludeId - ID de categoría a excluir (si se está actualizando)
 * @returns {Promise<Object>} { valid: boolean, error?: string }
 */
async function validateParentCategory(parentId, excludeId = null) {
  try {
    if (!parentId) {
      return { valid: true }; // null es válido (categoría raíz)
    }

    const whereClause = excludeId 
      ? 'WHERE id = ? AND id != ? AND is_active = TRUE'
      : 'WHERE id = ? AND is_active = TRUE';
    
    const params = excludeId ? [parentId, excludeId] : [parentId];

    const parents = await query(`
      SELECT id, name FROM categories ${whereClause} LIMIT 1
    `, params);

    if (parents.length === 0) {
      return {
        valid: false,
        error: 'La categoría padre no existe o está inactiva'
      };
    }

    return { valid: true };
  } catch (error) {
    logError('Error validating parent category', error, { parentId });
    return {
      valid: false,
      error: 'Error al validar categoría padre'
    };
  }
}

/**
 * Generar slug único a partir de un nombre
 * @param {string} name - Nombre de la categoría
 * @param {number} excludeId - ID a excluir (si se está actualizando)
 * @returns {Promise<string>} Slug único
 */
async function generateUniqueSlug(name, excludeId = null) {
  try {
    // Normalizar nombre a slug
    let baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar no-alfanuméricos con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const whereClause = excludeId
        ? 'WHERE slug = ? AND id != ?'
        : 'WHERE slug = ?';
      
      const params = excludeId ? [slug, excludeId] : [slug];

      const existing = await query(`
        SELECT id FROM categories ${whereClause} LIMIT 1
      `, params);

      if (existing.length === 0) {
        break; // Slug único encontrado
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  } catch (error) {
    logError('Error generating unique slug', error, { name });
    throw error;
  }
}

/**
 * Obtener contador de productos en una categoría (incluye subcategorías)
 * @param {number} categoryId - ID de categoría
 * @param {boolean} includeSubcategories - Incluir productos de subcategorías
 * @returns {Promise<number>} Cantidad de productos
 */
async function getProductCount(categoryId, includeSubcategories = false) {
  try {
    let categoryIds = [categoryId];

    if (includeSubcategories) {
      categoryIds = await getAllSubcategoryIds(categoryId);
    }

    const result = await query(`
      SELECT COUNT(DISTINCT id) as count
      FROM products
      WHERE category_id IN (${categoryIds.map(() => '?').join(',')})
        AND is_active = TRUE
    `, categoryIds);

    return parseInt(result[0]?.count || 0);
  } catch (error) {
    logError('Error getting product count', error, { categoryId });
    return 0;
  }
}

module.exports = {
  buildCategoryTree,
  getAllSubcategoryIds,
  getCategoryBreadcrumbs,
  hasCircularReference,
  validateParentCategory,
  generateUniqueSlug,
  getProductCount
};

