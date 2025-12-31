// ============================================
// Email Config Service
// ============================================
// Gestiona la configuración global de emails (header, footer, banner, colores)

const { query } = require('../db');
const { logError } = require('../logger');

/**
 * Obtener configuración de email
 */
async function getEmailConfig() {
  try {
    const configs = await query('SELECT * FROM email_config LIMIT 1');
    
    if (configs.length === 0) {
      // Crear configuración por defecto
      return await createDefaultConfig();
    }
    
    const config = configs[0];
    return {
      id: config.id,
      headerLogoUrl: config.header_logo_url,
      headerBannerUrl: config.header_banner_url,
      headerBackgroundColor: config.header_background_color || '#ec4899',
      headerTextColor: config.header_text_color || '#ffffff',
      footerText: config.footer_text,
      footerLinks: config.footer_links ? JSON.parse(config.footer_links) : null,
      footerBackgroundColor: config.footer_background_color || '#f9fafb',
      footerTextColor: config.footer_text_color || '#6b7280',
      primaryColor: config.primary_color || '#ec4899',
      secondaryColor: config.secondary_color || '#f43f5e',
      companyName: config.company_name || 'Rose Secret',
      companyAddress: config.company_address,
      companyPhone: config.company_phone,
      companyEmail: config.company_email,
      socialMedia: config.social_media ? JSON.parse(config.social_media) : null,
      isActive: !!config.is_active
    };
  } catch (error) {
    logError('Error obteniendo configuración de email:', error);
    throw error;
  }
}

/**
 * Crear configuración por defecto
 */
async function createDefaultConfig() {
  try {
    await query(`
      INSERT INTO email_config (
        header_background_color, header_text_color,
        footer_text, footer_background_color, footer_text_color,
        primary_color, secondary_color, company_name, company_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      '#ec4899', '#ffffff',
      '© 2025 Rose Secret. Todos los derechos reservados.',
      '#f9fafb', '#6b7280',
      '#ec4899', '#f43f5e', 'Rose Secret', 'contacto@rosesecret.com'
    ]);
    
    return await getEmailConfig();
  } catch (error) {
    logError('Error creando configuración por defecto:', error);
    throw error;
  }
}

/**
 * Actualizar configuración de email
 */
async function updateEmailConfig(data) {
  try {
    const existing = await query('SELECT id FROM email_config LIMIT 1');
    
    const footerLinksJson = data.footerLinks ? JSON.stringify(data.footerLinks) : null;
    const socialMediaJson = data.socialMedia ? JSON.stringify(data.socialMedia) : null;
    
    if (existing.length === 0) {
      // Crear nueva
      await query(`
        INSERT INTO email_config (
          header_logo_url, header_banner_url,
          header_background_color, header_text_color,
          footer_text, footer_links,
          footer_background_color, footer_text_color,
          primary_color, secondary_color,
          company_name, company_address, company_phone, company_email,
          social_media, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.headerLogoUrl || null,
        data.headerBannerUrl || null,
        data.headerBackgroundColor || '#ec4899',
        data.headerTextColor || '#ffffff',
        data.footerText || null,
        footerLinksJson,
        data.footerBackgroundColor || '#f9fafb',
        data.footerTextColor || '#6b7280',
        data.primaryColor || '#ec4899',
        data.secondaryColor || '#f43f5e',
        data.companyName || 'Rose Secret',
        data.companyAddress || null,
        data.companyPhone || null,
        data.companyEmail || null,
        socialMediaJson,
        data.isActive !== false ? 1 : 0
      ]);
    } else {
      // Actualizar existente
      await query(`
        UPDATE email_config SET
          header_logo_url = ?,
          header_banner_url = ?,
          header_background_color = ?,
          header_text_color = ?,
          footer_text = ?,
          footer_links = ?,
          footer_background_color = ?,
          footer_text_color = ?,
          primary_color = ?,
          secondary_color = ?,
          company_name = ?,
          company_address = ?,
          company_phone = ?,
          company_email = ?,
          social_media = ?,
          is_active = ?
        WHERE id = ?
      `, [
        data.headerLogoUrl || null,
        data.headerBannerUrl || null,
        data.headerBackgroundColor || '#ec4899',
        data.headerTextColor || '#ffffff',
        data.footerText || null,
        footerLinksJson,
        data.footerBackgroundColor || '#f9fafb',
        data.footerTextColor || '#6b7280',
        data.primaryColor || '#ec4899',
        data.secondaryColor || '#f43f5e',
        data.companyName || 'Rose Secret',
        data.companyAddress || null,
        data.companyPhone || null,
        data.companyEmail || null,
        socialMediaJson,
        data.isActive !== false ? 1 : 0,
        existing[0].id
      ]);
    }
    
    return await getEmailConfig();
  } catch (error) {
    logError('Error actualizando configuración de email:', error);
    throw error;
  }
}

module.exports = {
  getEmailConfig,
  updateEmailConfig
};

