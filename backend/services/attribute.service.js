// ============================================
// Attribute Service - Lógica de negocio de Atributos
// ============================================

const { query } = require('../db');
const { error: logError, info } = require('../logger');

/**
 * Obtener todos los atributos activos
 */
async function getAllAttributes() {
  try {
    const attributes = await query(`
      SELECT 
        id, name, slug, display_name, type, sort_order, is_active
      FROM attributes
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC
    `);

    // Para cada atributo, obtener sus valores
    for (let attr of attributes) {
      const values = await query(`
        SELECT 
          id, value, display_value, color_code, image_url, sort_order
        FROM attribute_values
        WHERE attribute_id = ? AND is_active = TRUE
        ORDER BY sort_order ASC, value ASC
      `, [attr.id]);
      
      attr.values = values;
    }

    return attributes;
  } catch (error) {
    logError('Error getting all attributes', error);
    throw error;
  }
}

/**
 * Obtener atributo por ID con valores
 */
async function getAttributeById(attributeId) {
  try {
    const attributes = await query(`
      SELECT 
        id, name, slug, display_name, type, sort_order, is_active,
        created_at, updated_at
      FROM attributes
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `, [attributeId]);

    if (attributes.length === 0) {
      return null;
    }

    const attribute = attributes[0];

    // Obtener valores
    const values = await query(`
      SELECT 
        id, value, display_value, color_code, image_url, sort_order, is_active
      FROM attribute_values
      WHERE attribute_id = ?
      ORDER BY sort_order ASC, value ASC
    `, [attributeId]);

    attribute.values = values;

    return attribute;
  } catch (error) {
    logError('Error getting attribute by ID', error, { attributeId });
    throw error;
  }
}

/**
 * Obtener atributos de un producto con sus valores
 */
async function getProductAttributes(productId) {
  try {
    const productAttrs = await query(`
      SELECT 
        pa.id,
        pa.product_id,
        pa.attribute_id,
        pa.is_required,
        pa.sort_order,
        a.name,
        a.slug,
        a.display_name,
        a.type
      FROM product_attributes pa
      INNER JOIN attributes a ON pa.attribute_id = a.id
      WHERE pa.product_id = ? AND a.is_active = TRUE
      ORDER BY pa.sort_order ASC, a.name ASC
    `, [productId]);

    // Para cada atributo del producto, obtener sus valores
    for (let pa of productAttrs) {
      const values = await query(`
        SELECT 
          av.id,
          av.value,
          av.display_value,
          av.color_code,
          av.image_url,
          av.sort_order
        FROM attribute_values av
        WHERE av.attribute_id = ? AND av.is_active = TRUE
        ORDER BY av.sort_order ASC, av.value ASC
      `, [pa.attribute_id]);

      pa.values = values;
    }

    return productAttrs;
  } catch (error) {
    logError('Error getting product attributes', error, { productId });
    throw error;
  }
}

/**
 * Asignar atributos a un producto
 * @param {number} productId - ID del producto
 * @param {Array<number>} attributeIds - Array de IDs de atributos a asignar
 */
async function assignAttributesToProduct(productId, attributeIds) {
  try {
    // Eliminar atributos existentes del producto
    await query('DELETE FROM product_attributes WHERE product_id = ?', [productId]);

    // Insertar nuevos atributos
    if (attributeIds && attributeIds.length > 0) {
      // Validar que todos los atributos existan y estén activos
      const placeholders = attributeIds.map(() => '?').join(',');
      const existingAttrs = await query(`
        SELECT id FROM attributes 
        WHERE id IN (${placeholders}) AND is_active = TRUE
      `, attributeIds);

      if (existingAttrs.length !== attributeIds.length) {
        throw new Error('Uno o más atributos no existen o están inactivos');
      }

      // Insertar con sort_order incremental
      for (let i = 0; i < attributeIds.length; i++) {
        await query(`
          INSERT INTO product_attributes (product_id, attribute_id, sort_order)
          VALUES (?, ?, ?)
        `, [productId, attributeIds[i], i + 1]);
      }
    }

    info('Attributes assigned to product', { productId, attributeIds });
    return true;
  } catch (error) {
    logError('Error assigning attributes to product', error, { productId, attributeIds });
    throw error;
  }
}

/**
 * Validar que los valores de atributos pertenezcan a los atributos correctos
 * @param {Array<Object>} attributeValues - Array de {attribute_id, attribute_value_id}
 */
async function validateAttributeValues(attributeValues) {
  try {
    if (!attributeValues || attributeValues.length === 0) {
      return { valid: true };
    }

    for (const av of attributeValues) {
      const values = await query(`
        SELECT id 
        FROM attribute_values 
        WHERE id = ? AND attribute_id = ? AND is_active = TRUE
        LIMIT 1
      `, [av.attribute_value_id, av.attribute_id]);

      if (values.length === 0) {
        return {
          valid: false,
          error: `El valor de atributo ${av.attribute_value_id} no pertenece al atributo ${av.attribute_id} o está inactivo`
        };
      }
    }

    return { valid: true };
  } catch (error) {
    logError('Error validating attribute values', error, { attributeValues });
    return {
      valid: false,
      error: 'Error al validar valores de atributos'
    };
  }
}

/**
 * Obtener valores de atributos de una variante
 */
async function getVariantAttributeValues(variantId) {
  try {
    const values = await query(`
      SELECT 
        vav.id,
        vav.variant_id,
        vav.attribute_id,
        vav.attribute_value_id,
        a.name as attribute_name,
        a.slug as attribute_slug,
        a.display_name as attribute_display_name,
        a.type as attribute_type,
        av.value as attribute_value,
        av.display_value as attribute_display_value,
        av.color_code,
        av.image_url
      FROM variant_attribute_values vav
      INNER JOIN attributes a ON vav.attribute_id = a.id
      INNER JOIN attribute_values av ON vav.attribute_value_id = av.id
      WHERE vav.variant_id = ?
      ORDER BY a.sort_order ASC
    `, [variantId]);

    return values;
  } catch (error) {
    logError('Error getting variant attribute values', error, { variantId });
    throw error;
  }
}

/**
 * Crear o actualizar valores de atributos de una variante
 * @param {number} variantId - ID de la variante
 * @param {Array<Object>} attributeValues - Array de {attribute_id, attribute_value_id}
 */
async function setVariantAttributeValues(variantId, attributeValues) {
  try {
    // Eliminar valores existentes
    await query('DELETE FROM variant_attribute_values WHERE variant_id = ?', [variantId]);

    // Insertar nuevos valores
    if (attributeValues && attributeValues.length > 0) {
      for (const av of attributeValues) {
        await query(`
          INSERT INTO variant_attribute_values (variant_id, attribute_id, attribute_value_id)
          VALUES (?, ?, ?)
        `, [variantId, av.attribute_id, av.attribute_value_id]);
      }
    }

    return true;
  } catch (error) {
    logError('Error setting variant attribute values', error, { variantId, attributeValues });
    throw error;
  }
}

module.exports = {
  getAllAttributes,
  getAttributeById,
  getProductAttributes,
  assignAttributesToProduct,
  validateAttributeValues,
  getVariantAttributeValues,
  setVariantAttributeValues
};

