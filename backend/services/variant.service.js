// ============================================
// Variant Service - Lógica de negocio de Variantes
// ============================================

const { query, transaction, queryWithConnection } = require('../db');
const { error: logError, info } = require('../logger');
const attributeService = require('./attribute.service');

/**
 * Obtener todas las variantes de un producto con sus atributos
 */
async function getProductVariants(productId, includeInactive = false) {
  try {
    const whereClause = includeInactive 
      ? 'WHERE product_id = ? AND deleted_at IS NULL'
      : 'WHERE product_id = ? AND is_active = TRUE AND deleted_at IS NULL';

    const variants = await query(`
      SELECT 
        id,
        product_id,
        name,
        sku,
        price,
        compare_at_price,
        stock,
        weight,
        image_url,
        is_active,
        is_default,
        created_at,
        updated_at
      FROM product_variants
      ${whereClause}
      ORDER BY is_default DESC, created_at ASC
    `, [productId]);

    // Para cada variante, obtener sus valores de atributos
    for (let variant of variants) {
      const attributeValues = await attributeService.getVariantAttributeValues(variant.id);
      variant.attributes = attributeValues.map(av => ({
        attribute_id: av.attribute_id,
        attribute_name: av.attribute_name,
        attribute_slug: av.attribute_slug,
        attribute_type: av.attribute_type,
        value_id: av.attribute_value_id,
        value: av.attribute_value,
        display_value: av.attribute_display_value || av.attribute_value,
        color_code: av.color_code,
        image_url: av.image_url
      }));
    }

    return variants;
  } catch (error) {
    logError('Error getting product variants', error, { productId });
    throw error;
  }
}

/**
 * Obtener una variante por ID con sus atributos
 */
async function getVariantById(variantId) {
  try {
    const variants = await query(`
      SELECT 
        id,
        product_id,
        name,
        sku,
        price,
        compare_at_price,
        stock,
        weight,
        image_url,
        is_active,
        is_default,
        created_at,
        updated_at
      FROM product_variants
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [variantId]);

    if (variants.length === 0) {
      return null;
    }

    const variant = variants[0];

    // Obtener valores de atributos
    const attributeValues = await attributeService.getVariantAttributeValues(variant.id);
    variant.attributes = attributeValues.map(av => ({
      attribute_id: av.attribute_id,
      attribute_name: av.attribute_name,
      attribute_slug: av.attribute_slug,
      attribute_type: av.attribute_type,
      value_id: av.attribute_value_id,
      value: av.attribute_value,
      display_value: av.attribute_display_value || av.attribute_value,
      color_code: av.color_code,
      image_url: av.image_url
    }));

    return variant;
  } catch (error) {
    logError('Error getting variant by ID', error, { variantId });
    throw error;
  }
}

/**
 * Verificar si una combinación de atributos ya existe para un producto
 * @param {number} productId - ID del producto
 * @param {Array<Object>} attributeValues - Array de {attribute_id, attribute_value_id}
 * @param {number} excludeVariantId - ID de variante a excluir (si se está actualizando)
 * @returns {Promise<boolean>} true si existe duplicado, false si no
 */
async function hasDuplicateCombination(productId, attributeValues, excludeVariantId = null) {
  try {
    if (!attributeValues || attributeValues.length === 0) {
      return false; // Sin atributos, no hay duplicado
    }

    // Validar que no se repitan atributos
    const providedAttributeIds = attributeValues.map(av => av.attribute_id);
    if (new Set(providedAttributeIds).size !== providedAttributeIds.length) {
      throw new Error('No se pueden repetir atributos en una variante');
    }

    // Obtener todas las variantes del producto (excepto la excluida)
    const excludeClause = excludeVariantId ? 'AND pv.id != ?' : '';
    const excludeParams = excludeVariantId ? [excludeVariantId] : [];
    
    const variants = await query(`
      SELECT DISTINCT pv.id
      FROM product_variants pv
      WHERE pv.product_id = ?
        AND pv.deleted_at IS NULL
        ${excludeClause}
    `, [productId, ...excludeParams]);

    if (variants.length === 0) {
      return false;
    }

    const variantIds = variants.map(v => v.id);
    const placeholders = variantIds.map(() => '?').join(',');

    // Para cada variante, obtener sus valores de atributos
    const variantAttributes = await query(`
      SELECT 
        vav.variant_id,
        vav.attribute_id,
        vav.attribute_value_id
      FROM variant_attribute_values vav
      WHERE vav.variant_id IN (${placeholders})
    `, variantIds);

    // Agrupar por variant_id
    const variantAttrsMap = new Map();
    for (const va of variantAttributes) {
      if (!variantAttrsMap.has(va.variant_id)) {
        variantAttrsMap.set(va.variant_id, []);
      }
      variantAttrsMap.get(va.variant_id).push({
        attribute_id: va.attribute_id,
        attribute_value_id: va.attribute_value_id
      });
    }

    // Crear set de la combinación actual para comparar
    const currentCombination = new Set(
      attributeValues.map(av => `${av.attribute_id}:${av.attribute_value_id}`)
    );

    // Comparar con cada variante existente
    for (const [variantId, attrs] of variantAttrsMap.entries()) {
      if (attrs.length !== attributeValues.length) {
        continue; // Diferente cantidad de atributos
      }

      const existingCombination = new Set(
        attrs.map(av => `${av.attribute_id}:${av.attribute_value_id}`)
      );

      // Comparar sets (deben tener exactamente los mismos elementos)
      if (currentCombination.size === existingCombination.size &&
          [...currentCombination].every(val => existingCombination.has(val))) {
        return true; // Combinación duplicada encontrada
      }
    }

    return false;
  } catch (error) {
    logError('Error checking duplicate combination', error, { productId, attributeValues });
    throw error;
  }
}

/**
 * Generar nombre de variante a partir de valores de atributos
 * @param {number} productId - ID del producto
 * @param {Array<Object>} attributeValues - Array de {attribute_id, attribute_value_id}
 */
async function generateVariantName(productId, attributeValues) {
  try {
    if (!attributeValues || attributeValues.length === 0) {
      // Obtener nombre del producto
      const products = await query('SELECT name FROM products WHERE id = ? LIMIT 1', [productId]);
      return products.length > 0 ? products[0].name : 'Variante';
    }

    // Obtener valores de atributos
    const valueIds = attributeValues.map(av => av.attribute_value_id);
    const placeholders = valueIds.map(() => '?').join(',');
    
    const values = await query(`
      SELECT 
        av.display_value, 
        av.value,
        a.display_name,
        a.sort_order
      FROM attribute_values av
      INNER JOIN attributes a ON av.attribute_id = a.id
      WHERE av.id IN (${placeholders})
      ORDER BY a.sort_order ASC, av.sort_order ASC
    `, valueIds);

    if (values.length === 0) {
      return 'Variante';
    }

    // Construir nombre: "Producto - Valor1, Valor2"
    const product = await query('SELECT name FROM products WHERE id = ? LIMIT 1', [productId]);
    const productName = product.length > 0 ? product[0].name : '';
    
    const valueNames = values.map(v => v.display_value || v.value);
    const variantName = valueNames.join(', ');

    return productName ? `${productName} - ${variantName}` : variantName;
  } catch (error) {
    logError('Error generating variant name', error, { productId, attributeValues });
    return 'Variante';
  }
}

/**
 * Marcar una variante como por defecto (desmarca las demás)
 * @param {number} variantId - ID de la variante a marcar como default
 */
async function setDefaultVariant(variantId) {
  try {
    // Obtener product_id de la variante
    const variants = await query('SELECT product_id FROM product_variants WHERE id = ? LIMIT 1', [variantId]);
    if (variants.length === 0) {
      throw new Error('Variante no encontrada');
    }

    const productId = variants[0].product_id;

    // Desmarcar todas las variantes del producto como default
    await query(`
      UPDATE product_variants 
      SET is_default = FALSE 
      WHERE product_id = ? AND id != ?
    `, [productId, variantId]);

    // Marcar esta variante como default
    await query(`
      UPDATE product_variants 
      SET is_default = TRUE 
      WHERE id = ?
    `, [variantId]);

    info('Default variant set', { variantId, productId });
    return true;
  } catch (error) {
    logError('Error setting default variant', error, { variantId });
    throw error;
  }
}

/**
 * Verificar si una variante puede ser eliminada
 * @param {number} variantId - ID de la variante
 * @returns {Promise<Object>} { canDelete: boolean, reason?: string }
 */
async function canDeleteVariant(variantId) {
  try {
    // Verificar que existe
    const variants = await query(`
      SELECT id, product_id, stock 
      FROM product_variants 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, [variantId]);

    if (variants.length === 0) {
      return {
        canDelete: false,
        reason: 'Variante no encontrada'
      };
    }

    const variant = variants[0];

    // Verificar si hay items en carrito
    const cartItems = await query(`
      SELECT COUNT(*) as count 
      FROM cart_items 
      WHERE variant_id = ?
    `, [variantId]);

    if (parseInt(cartItems[0].count) > 0) {
      return {
        canDelete: false,
        reason: 'Hay items en carrito con esta variante'
      };
    }

    // Verificar si hay items en pedidos
    const orderItems = await query(`
      SELECT COUNT(*) as count 
      FROM order_items 
      WHERE variant_id = ?
    `, [variantId]);

    if (parseInt(orderItems[0].count) > 0) {
      return {
        canDelete: false,
        reason: 'Hay items en pedidos con esta variante'
      };
    }

    // Verificar si es la única variante activa del producto
    const otherVariants = await query(`
      SELECT COUNT(*) as count 
      FROM product_variants 
      WHERE product_id = ? AND id != ? AND is_active = TRUE AND deleted_at IS NULL
    `, [variant.product_id, variantId]);

    if (parseInt(otherVariants[0].count) === 0) {
      return {
        canDelete: false,
        reason: 'No se puede eliminar la última variante activa del producto'
      };
    }

    return {
      canDelete: true
    };
  } catch (error) {
    logError('Error checking if variant can be deleted', error, { variantId });
    return {
      canDelete: false,
      reason: 'Error al verificar si se puede eliminar'
    };
  }
}

/**
 * Crear una variante con sus valores de atributos (transacción)
 */
async function createVariant(productId, variantData, attributeValues) {
  try {
    return await transaction(async (connection) => {
      // Validar valores de atributos si se proporcionan
      if (attributeValues && attributeValues.length > 0) {
        const validation = await attributeService.validateAttributeValues(attributeValues);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Verificar combinación duplicada
        const isDuplicate = await hasDuplicateCombination(productId, attributeValues);
        if (isDuplicate) {
          throw new Error('Esta combinación de atributos ya existe para este producto');
        }
      }

      // Generar nombre si no se proporciona
      const name = variantData.name || await generateVariantName(productId, attributeValues);

      // Insertar variante
      const result = await queryWithConnection(connection, `
        INSERT INTO product_variants (
          product_id, name, sku, price, compare_at_price,
          stock, weight, image_url, is_active, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productId,
        name,
        variantData.sku || null,
        variantData.price,
        variantData.compare_at_price || null,
        variantData.stock !== undefined ? variantData.stock : 0,
        variantData.weight || null,
        variantData.image_url || null,
        variantData.is_active !== undefined ? variantData.is_active : true,
        variantData.is_default || false
      ]);

      const variantId = result.insertId || (Array.isArray(result) && result[0]?.id) || result.id;

      // Si se marca como default, actualizar las demás
      if (variantData.is_default) {
        await queryWithConnection(connection, `
          UPDATE product_variants 
          SET is_default = FALSE 
          WHERE product_id = ? AND id != ?
        `, [productId, variantId]);
      }

      // Asignar valores de atributos
      if (attributeValues && attributeValues.length > 0) {
        for (const av of attributeValues) {
          await queryWithConnection(connection, `
            INSERT INTO variant_attribute_values (variant_id, attribute_id, attribute_value_id)
            VALUES (?, ?, ?)
          `, [variantId, av.attribute_id, av.attribute_value_id]);
        }
      }

      return variantId;
    });
  } catch (error) {
    logError('Error creating variant', error, { productId, variantData });
    throw error;
  }
}

module.exports = {
  getProductVariants,
  getVariantById,
  hasDuplicateCombination,
  generateVariantName,
  setDefaultVariant,
  canDeleteVariant,
  createVariant
};

