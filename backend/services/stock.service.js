// ============================================
// Servicio de Gestión de Stock
// ============================================
// Servicio centralizado para manejar stock de productos y variantes
// Backend es la fuente de verdad para stock

const { query } = require('../db');
const { error: logError } = require('../logger');

/**
 * Obtener stock disponible de un producto o variante
 * @param {number} productId - ID del producto
 * @param {number|null} variantId - ID de la variante (opcional)
 * @returns {Promise<number>} Stock disponible
 */
async function getAvailableStock(productId, variantId = null) {
  try {
    // Si hay variantId, usar stock de la variante
    if (variantId) {
      const variantStock = await query(`
        SELECT stock
        FROM product_variants
        WHERE id = ? AND product_id = ? AND is_active = TRUE
        LIMIT 1
      `, [variantId, productId]);

      if (variantStock.length === 0) {
        return 0; // Variante no existe o está inactiva
      }

      return variantStock[0].stock || 0;
    }

    // Si no hay variantId, verificar si el producto tiene variantes
    const variants = await query(`
      SELECT COUNT(*) as count
      FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
    `, [productId]);

    const hasVariants = variants[0].count > 0;

    if (hasVariants) {
      // Si tiene variantes, retornar 0 (el stock se maneja por variante)
      // O podríamos retornar la suma de todas las variantes, pero es mejor ser explícito
      return 0;
    }

    // Si no tiene variantes, usar stock del producto
    const productStock = await query(`
      SELECT stock
      FROM products
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `, [productId]);

    if (productStock.length === 0) {
      return 0; // Producto no existe o está inactivo
    }

    return productStock[0].stock || 0;
  } catch (error) {
    logError('Error obteniendo stock disponible:', error);
    return 0; // En caso de error, retornar 0 para evitar sobreventa
  }
}

/**
 * Validar si hay stock suficiente para una cantidad específica
 * @param {number} productId - ID del producto
 * @param {number|null} variantId - ID de la variante (opcional)
 * @param {number} quantity - Cantidad solicitada
 * @returns {Promise<{ok: boolean, available_stock: number, message?: string}>}
 */
async function validateStock(productId, variantId = null, quantity = 1) {
  try {
    if (quantity <= 0) {
      return {
        ok: false,
        available_stock: 0,
        message: 'La cantidad debe ser mayor a 0'
      };
    }

    const availableStock = await getAvailableStock(productId, variantId);

    if (availableStock < quantity) {
      return {
        ok: false,
        available_stock: availableStock,
        message: `Stock insuficiente. Disponible: ${availableStock}, Solicitado: ${quantity}`
      };
    }

    return {
      ok: true,
      available_stock: availableStock
    };
  } catch (error) {
    logError('Error validando stock:', error);
    return {
      ok: false,
      available_stock: 0,
      message: 'Error al validar stock'
    };
  }
}

/**
 * Verificar si un producto tiene variantes activas
 * @param {number} productId - ID del producto
 * @returns {Promise<boolean>}
 */
async function hasVariants(productId) {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
    `, [productId]);

    return result[0].count > 0;
  } catch (error) {
    logError('Error verificando variantes:', error);
    return false;
  }
}

/**
 * Obtener stock disponible de la variante default de un producto
 * @param {number} productId - ID del producto
 * @returns {Promise<number>}
 */
async function getDefaultVariantStock(productId) {
  try {
    const defaultVariant = await query(`
      SELECT stock
      FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
      ORDER BY created_at ASC
      LIMIT 1
    `, [productId]);

    if (defaultVariant.length > 0) {
      return defaultVariant[0].stock || 0;
    }

    return 0;
  } catch (error) {
    logError('Error obteniendo stock de variante default:', error);
    return 0;
  }
}

/**
 * Obtener información completa de stock para un producto
 * @param {number} productId - ID del producto
 * @param {number|null} variantId - ID de la variante (opcional)
 * @returns {Promise<{has_variants: boolean, available_stock: number, variant_id?: number}>}
 */
async function getStockInfo(productId, variantId = null) {
  try {
    const hasVariantsFlag = await hasVariants(productId);
    let availableStock = 0;
    let defaultVariantId = null;

    if (hasVariantsFlag) {
      // Si se especifica variantId, usar ese
      if (variantId) {
        availableStock = await getAvailableStock(productId, variantId);
        defaultVariantId = variantId;
      } else {
        // Si no se especifica, usar la variante default
        const defaultVariant = await query(`
          SELECT id, stock
          FROM product_variants
          WHERE product_id = ? AND is_active = TRUE
          ORDER BY created_at ASC
          LIMIT 1
        `, [productId]);

        if (defaultVariant.length > 0) {
          availableStock = defaultVariant[0].stock || 0;
          defaultVariantId = defaultVariant[0].id;
        }
      }
    } else {
      // Producto simple, usar stock del producto
      availableStock = await getAvailableStock(productId);
    }

    return {
      has_variants: hasVariantsFlag,
      available_stock: availableStock,
      variant_id: defaultVariantId
    };
  } catch (error) {
    logError('Error obteniendo información de stock:', error);
    return {
      has_variants: false,
      available_stock: 0
    };
  }
}

module.exports = {
  getAvailableStock,
  validateStock,
  hasVariants,
  getDefaultVariantStock,
  getStockInfo
};

