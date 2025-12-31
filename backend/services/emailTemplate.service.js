// ============================================
// Email Template Service
// ============================================
// Gestiona las plantillas de correo electrónico

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener todas las plantillas
 */
async function getAllTemplates() {
  try {
    const templates = await query(`
      SELECT * FROM email_templates 
      ORDER BY category, display_name
    `);
    
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      displayName: template.display_name,
      subject: template.subject,
      bodyHtml: template.body_html,
      bodyText: template.body_text,
      variables: template.variables ? JSON.parse(template.variables) : null,
      isActive: !!template.is_active,
      category: template.category,
      description: template.description,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }));
  } catch (error) {
    logError('Error obteniendo plantillas:', error);
    throw error;
  }
}

/**
 * Obtener una plantilla por nombre
 */
async function getTemplateByName(name) {
  try {
    const templates = await query(
      'SELECT * FROM email_templates WHERE name = ? AND is_active = 1',
      [name]
    );
    
    if (templates.length === 0) {
      return null;
    }
    
    const template = templates[0];
    return {
      id: template.id,
      name: template.name,
      displayName: template.display_name,
      subject: template.subject,
      bodyHtml: template.body_html,
      bodyText: template.body_text,
      variables: template.variables ? JSON.parse(template.variables) : null,
      isActive: !!template.is_active,
      category: template.category,
      description: template.description
    };
  } catch (error) {
    logError('Error obteniendo plantilla:', error);
    throw error;
  }
}

/**
 * Obtener una plantilla por ID
 */
async function getTemplateById(id) {
  try {
    const templates = await query(
      'SELECT * FROM email_templates WHERE id = ?',
      [id]
    );
    
    if (templates.length === 0) {
      return null;
    }
    
    const template = templates[0];
    return {
      id: template.id,
      name: template.name,
      displayName: template.display_name,
      subject: template.subject,
      bodyHtml: template.body_html,
      bodyText: template.body_text,
      variables: template.variables ? JSON.parse(template.variables) : null,
      isActive: !!template.is_active,
      category: template.category,
      description: template.description,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    };
  } catch (error) {
    logError('Error obteniendo plantilla por ID:', error);
    throw error;
  }
}

/**
 * Crear o actualizar plantilla
 */
async function saveTemplate(templateData) {
  try {
    const existing = await query(
      'SELECT id FROM email_templates WHERE name = ?',
      [templateData.name]
    );
    
    if (existing.length > 0 && !templateData.id) {
      throw new Error('Ya existe una plantilla con ese nombre');
    }
    
    const variablesJson = templateData.variables 
      ? JSON.stringify(templateData.variables) 
      : null;
    
    if (templateData.id || (existing.length > 0 && existing[0].id === templateData.id)) {
      // Actualizar
      await query(`
        UPDATE email_templates SET
          display_name = ?,
          subject = ?,
          body_html = ?,
          body_text = ?,
          variables = ?,
          is_active = ?,
          category = ?,
          description = ?
        WHERE id = ?
      `, [
        templateData.displayName,
        templateData.subject,
        templateData.bodyHtml,
        templateData.bodyText || null,
        variablesJson,
        templateData.isActive ? 1 : 0,
        templateData.category || 'general',
        templateData.description || null,
        templateData.id || existing[0].id
      ]);
      
      return await getTemplateById(templateData.id || existing[0].id);
    } else {
      // Crear nueva
      const result = await query(`
        INSERT INTO email_templates (
          name, display_name, subject, body_html, body_text,
          variables, is_active, category, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        templateData.name,
        templateData.displayName,
        templateData.subject,
        templateData.bodyHtml,
        templateData.bodyText || null,
        variablesJson,
        templateData.isActive !== false ? 1 : 0,
        templateData.category || 'general',
        templateData.description || null
      ]);
      
      return await getTemplateById(result.insertId);
    }
  } catch (error) {
    logError('Error guardando plantilla:', error);
    throw error;
  }
}

/**
 * Eliminar plantilla
 */
async function deleteTemplate(id) {
  try {
    await query('DELETE FROM email_templates WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    logError('Error eliminando plantilla:', error);
    throw error;
  }
}

/**
 * Activar/desactivar plantilla
 */
async function toggleTemplate(id, isActive) {
  try {
    await query(
      'UPDATE email_templates SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
    return await getTemplateById(id);
  } catch (error) {
    logError('Error cambiando estado de plantilla:', error);
    throw error;
  }
}

module.exports = {
  getAllTemplates,
  getTemplateByName,
  getTemplateById,
  saveTemplate,
  deleteTemplate,
  toggleTemplate
};

