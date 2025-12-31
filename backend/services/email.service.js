// ============================================
// Email Service - Resend y Gmail (Nodemailer) Integration
// ============================================

const path = require('path');
const fs = require('fs').promises;
const emailTemplateService = require('./emailTemplate.service');
const emailConfigService = require('./emailConfig.service');

// Determinar proveedor de email
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail'; // 'resend' o 'gmail'

let resend = null;
let nodemailer = null;
let transporter = null;

// Configurar Resend si está seleccionado
if (EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend configurado correctamente');
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Resend:', error.message);
  }
}

// Configurar Nodemailer (Gmail) si está seleccionado
if (EMAIL_PROVIDER === 'gmail') {
  try {
    nodemailer = require('nodemailer');
    
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword) {
      console.warn('⚠️ GMAIL_USER o GMAIL_APP_PASSWORD no están configurados en .env');
      console.warn('   Configura estas variables en tu archivo .env:');
      console.warn('   GMAIL_USER=tu_email@gmail.com');
      console.warn('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
    } else {
      // Limpiar y validar credenciales
      const cleanUser = gmailUser.trim();
      // Remover espacios de la contraseña de aplicación (Gmail las genera con espacios)
      const appPassword = gmailPassword.replace(/\s/g, '').trim();
      
      // Validar formato de email
      if (!cleanUser.includes('@') || !cleanUser.includes('.')) {
        console.error('❌ GMAIL_USER no parece ser un email válido:', cleanUser);
      }
      
      // Validar que la contraseña tenga 16 caracteres (sin espacios)
      if (appPassword.length !== 16) {
        console.warn('⚠️ La contraseña de aplicación debería tener 16 caracteres (sin espacios)');
        console.warn('   Longitud actual:', appPassword.length);
        console.warn('   Asegúrate de copiar la contraseña completa de: https://myaccount.google.com/apppasswords');
      }
      
      // No mostrar la contraseña completa por seguridad, solo los primeros y últimos caracteres
      const maskedPassword = appPassword.length > 4 
        ? appPassword.substring(0, 2) + '***' + appPassword.substring(appPassword.length - 2)
        : '****';
      
      console.log('📧 Configurando Gmail con:');
      console.log('   Usuario:', cleanUser);
      console.log('   Contraseña:', maskedPassword, `(${appPassword.length} caracteres)`);
      
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanUser,
          pass: appPassword
        },
        // Opciones adicionales para mejor compatibilidad
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Verificar conexión (en background para no bloquear el inicio)
      transporter.verify((error, success) => {
        if (error) {
          console.error('\n❌ Error verificando conexión Gmail:');
          console.error('   Mensaje:', error.message);
          
          if (error.code === 'EAUTH') {
            console.error('\n🔐 ERROR DE AUTENTICACIÓN - Pasos para solucionarlo:');
            console.error('\n1. Verifica que GMAIL_USER sea tu email COMPLETO de Gmail:');
            console.error('   Ejemplo: rose.secret.beauty@gmail.com');
            console.error('   Actual:', cleanUser);
            console.error('\n2. Verifica que estés usando una CONTRASEÑA DE APLICACIÓN, NO tu contraseña normal:');
            console.error('   - Ve a: https://myaccount.google.com/apppasswords');
            console.error('   - Asegúrate de tener la verificación en dos pasos ACTIVADA');
            console.error('   - Genera una nueva contraseña de aplicación para "Correo"');
            console.error('   - Copia los 16 caracteres (pueden tener espacios, se removerán automáticamente)');
            console.error('\n3. Verifica tu archivo .env:');
            console.error('   GMAIL_USER=' + cleanUser);
            console.error('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
            console.error('\n4. Si ya seguiste estos pasos y aún no funciona:');
            console.error('   - Genera una NUEVA contraseña de aplicación');
            console.error('   - Asegúrate de copiar TODOS los 16 caracteres');
            console.error('   - Reinicia el servidor después de actualizar .env\n');
          } else {
            console.error('   Código de error:', error.code);
            console.error('   Revisa la configuración de red y firewall\n');
          }
        } else {
          console.log('✅ Gmail configurado y verificado correctamente');
          console.log('   Listo para enviar emails desde:', cleanUser);
        }
      });
    }
  } catch (error) {
    console.error('❌ No se pudo inicializar Nodemailer:', error.message);
    console.error('   Asegúrate de tener nodemailer instalado: npm install nodemailer');
  }
}

// Configuración
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER || 'onboarding@resend.dev';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Rose Secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Generar header de email desde configuración
 */
async function generateEmailHeader() {
  try {
    const config = await emailConfigService.getEmailConfig();
    
    let header = '<table width="100%" cellpadding="0" cellspacing="0" style="background-color: ' + config.headerBackgroundColor + '; padding: 40px; text-align: center;">';
    header += '<tr><td>';
    
    // Banner si existe
    if (config.headerBannerUrl) {
      header += `<img src="${config.headerBannerUrl}" alt="${config.companyName}" style="max-width: 100%; height: auto; margin-bottom: 20px;" />`;
    }
    
    // Logo si existe (sin banner)
    if (!config.headerBannerUrl && config.headerLogoUrl) {
      header += `<img src="${config.headerLogoUrl}" alt="${config.companyName}" style="max-width: 200px; height: auto; margin-bottom: 20px;" />`;
    }
    
    // Título si no hay logo ni banner
    if (!config.headerBannerUrl && !config.headerLogoUrl) {
      header += `<h1 style="color: ${config.headerTextColor}; font-size: 28px; margin: 0; font-weight: bold;">${config.companyName}</h1>`;
    }
    
    header += '</td></tr></table>';
    return header;
  } catch (error) {
    console.error('Error generando header de email:', error);
    // Fallback simple
    return '<table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px; text-align: center;"><tr><td><h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: bold;">Rose Secret</h1></td></tr></table>';
  }
}

/**
 * Generar footer de email desde configuración
 */
async function generateEmailFooter() {
  try {
    const config = await emailConfigService.getEmailConfig();
    
    let footer = '<tr><td style="background-color: ' + config.footerBackgroundColor + '; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">';
    
    // Texto del footer
    if (config.footerText) {
      footer += `<p style="color: ${config.footerTextColor}; font-size: 14px; margin: 0 0 10px 0;">${config.footerText}</p>`;
    }
    
    // Información de contacto
    if (config.companyEmail || config.companyPhone || config.companyAddress) {
      footer += '<p style="color: ' + config.footerTextColor + '; font-size: 12px; margin: 10px 0 0 0;">';
      if (config.companyEmail) {
        footer += `Email: <a href="mailto:${config.companyEmail}" style="color: ${config.primaryColor};">${config.companyEmail}</a>`;
      }
      if (config.companyPhone) {
        footer += (config.companyEmail ? ' | ' : '') + `Tel: ${config.companyPhone}`;
      }
      footer += '</p>';
    }
    
    // Redes sociales
    if (config.socialMedia) {
      footer += '<p style="color: ' + config.footerTextColor + '; font-size: 12px; margin: 10px 0 0 0;">';
      const social = config.socialMedia;
      const links = [];
      if (social.instagram) links.push(`<a href="${social.instagram}" style="color: ${config.primaryColor};">Instagram</a>`);
      if (social.facebook) links.push(`<a href="${social.facebook}" style="color: ${config.primaryColor};">Facebook</a>`);
      if (social.twitter) links.push(`<a href="${social.twitter}" style="color: ${config.primaryColor};">Twitter</a>`);
      if (links.length > 0) {
        footer += links.join(' | ');
      }
      footer += '</p>';
    }
    
    footer += '<p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">Este es un email automático, por favor no respondas a este mensaje.</p>';
    footer += '</td></tr>';
    
    return footer;
  } catch (error) {
    console.error('Error generando footer de email:', error);
    // Fallback simple
    return '<tr><td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;"><p style="color: #6b7280; font-size: 14px; margin: 0;">© 2025 Rose Secret. Todos los derechos reservados.</p></td></tr>';
  }
}

/**
 * Cargar plantilla HTML desde BD o archivo (fallback)
 */
async function loadTemplate(templateName, data = {}) {
  try {
    // Intentar cargar desde BD primero
    const template = await emailTemplateService.getTemplateByName(templateName);
    
    if (template && template.isActive) {
      // Obtener configuración de email para variables globales
      const emailConfig = await emailConfigService.getEmailConfig();
      
      // Generar header y footer
      const header = await generateEmailHeader();
      const footer = await generateEmailFooter();
      
      // Preparar datos con configuración global
      const templateData = {
        ...data,
        company_name: emailConfig.companyName,
        primary_color: emailConfig.primaryColor,
        secondary_color: emailConfig.secondaryColor,
        email_header: header,
        email_footer: footer,
        year: new Date().getFullYear(),
        frontendUrl: FRONTEND_URL
      };
      
      // Reemplazar variables en el asunto
      let subject = template.subject;
      Object.keys(templateData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, templateData[key] || '');
      });
      
      // Reemplazar variables en el cuerpo HTML
      let html = template.bodyHtml;
      Object.keys(templateData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, templateData[key] || '');
      });
      
      return { html, subject };
    }
    
    // Fallback: cargar desde archivo estático
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    let html = await fs.readFile(templatePath, 'utf-8');
    
    // Reemplazar variables en la plantilla
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });
    
    return { html, subject: data.subject || `Email de ${templateName}` };
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`No se pudo cargar la plantilla ${templateName}`);
  }
}

/**
 * Enviar email genérico
 */
async function sendEmail({ to, subject, template, data = {} }) {
  // Modo desarrollo sin configuración
  if (EMAIL_PROVIDER === 'resend' && (!process.env.RESEND_API_KEY || !resend)) {
    console.log('📧 [EMAIL SIMULADO - Resend no configurado]', {
      to,
      subject,
      template,
      data
    });
    return { success: true, message: 'Email simulado (RESEND_API_KEY no configurada)' };
  }

  if (EMAIL_PROVIDER === 'gmail' && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !transporter)) {
    console.log('📧 [EMAIL SIMULADO - Gmail no configurado]', {
      to,
      subject,
      template,
      data
    });
    return { success: true, message: 'Email simulado (Gmail no configurado)' };
  }

  try {
    // Cargar plantilla (desde BD o archivo)
    const templateResult = await loadTemplate(template, data);
    const html = templateResult.html;
    const finalSubject = subject || templateResult.subject;

    let result;

    // Enviar con Resend
    if (EMAIL_PROVIDER === 'resend' && resend) {
      result = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject: finalSubject,
        html
      });
      
      console.log(`✅ Email enviado con Resend a ${to}: ${subject}`);
      return { success: true, id: result.id, provider: 'resend' };
    }

    // Enviar con Gmail (Nodemailer)
    if (EMAIL_PROVIDER === 'gmail' && transporter) {
      try {
        result = await transporter.sendMail({
          from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
          to: to,
          subject: finalSubject,
          html: html
        });
        
        console.log(`✅ Email enviado con Gmail a ${to}: ${subject}`);
        return { success: true, messageId: result.messageId, provider: 'gmail' };
      } catch (sendError) {
        // Si hay un error de autenticación, dar instrucciones más detalladas
        if (sendError.code === 'EAUTH') {
          console.error('\n❌ Error de autenticación al enviar email:');
          console.error('   El problema es con las credenciales de Gmail en tu archivo .env');
          console.error('\n🔧 SOLUCIÓN:');
          console.error('1. Abre: https://myaccount.google.com/apppasswords');
          console.error('2. Asegúrate de tener la verificación en dos pasos ACTIVADA');
          console.error('3. Genera una nueva "Contraseña de aplicación" para "Correo"');
          console.error('4. Copia los 16 caracteres (ejemplo: abcd efgh ijkl mnop)');
          console.error('5. En tu archivo .env, actualiza:');
          console.error('   GMAIL_USER=rose.secret.beauty@gmail.com');
          console.error('   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop');
          console.error('6. Reinicia el servidor (Ctrl+C y luego npm run dev)\n');
        }
        throw sendError; // Re-lanzar para que se capture en el catch general
      }
    }

    // Fallback
    return { success: false, error: 'Ningún proveedor de email está configurado correctamente' };
  } catch (error) {
    console.error(`❌ Error enviando email a ${to}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Email: Verificación de correo electrónico
 */
async function sendEmailVerificationEmail(userEmail, verificationToken, userName = null) {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: userEmail,
    template: 'email-verification',
    data: {
      userName: userName || 'Usuario',
      verificationLink,
      expiresIn: '24 horas',
      supportEmail: FROM_EMAIL
    }
  });
}

/**
 * Email: Código de recuperación de contraseña
 */
async function sendPasswordRecoveryEmail(userEmail, recoveryCode, userName = null) {
  return sendEmail({
    to: userEmail,
    template: 'password-recovery',
    data: {
      userName: userName || 'Usuario',
      recoveryCode,
      expiresIn: '15 minutos',
      supportEmail: FROM_EMAIL,
      recoveryLink: `${FRONTEND_URL}/reset-password`
    }
  });
}

/**
 * Email: Pedido creado
 */
async function sendOrderCreatedEmail(userEmail, orderData) {
  return sendEmail({
    to: userEmail,
    subject: `Pedido #${orderData.order_number} recibido - Rose Secret`,
    template: 'order-created',
    data: {
      customerName: orderData.shipping_name,
      orderNumber: orderData.order_number,
      orderDate: new Date(orderData.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      orderTotal: parseFloat(orderData.total).toFixed(2),
      orderId: orderData.id,
      orderLink: `${FRONTEND_URL}/account/orders/${orderData.id}`
    }
  });
}

/**
 * Email: Pago exitoso
 */
async function sendPaymentSuccessEmail(userEmail, orderData) {
  return sendEmail({
    to: userEmail,
    subject: `Pago confirmado - Pedido #${orderData.order_number}`,
    template: 'payment-success',
    data: {
      customerName: orderData.shipping_name,
      orderNumber: orderData.order_number,
      orderTotal: parseFloat(orderData.total).toFixed(2),
      orderId: orderData.id,
      orderLink: `${FRONTEND_URL}/account/orders/${orderData.id}`
    }
  });
}

/**
 * Email: Pago fallido
 */
async function sendPaymentFailedEmail(userEmail, orderData) {
  return sendEmail({
    to: userEmail,
    subject: `Problema con el pago - Pedido #${orderData.order_number}`,
    template: 'payment-failed',
    data: {
      customerName: orderData.shipping_name,
      orderNumber: orderData.order_number,
      orderTotal: parseFloat(orderData.total).toFixed(2),
      orderId: orderData.id,
      orderLink: `${FRONTEND_URL}/account/orders/${orderData.id}`,
      checkoutLink: `${FRONTEND_URL}/checkout`
    }
  });
}

/**
 * Email: Pedido enviado
 */
async function sendOrderShippedEmail(userEmail, orderData) {
  return sendEmail({
    to: userEmail,
    subject: `Tu pedido #${orderData.order_number} va en camino`,
    template: 'order-shipped',
    data: {
      customerName: orderData.shipping_name,
      orderNumber: orderData.order_number,
      orderId: orderData.id,
      orderLink: `${FRONTEND_URL}/account/orders/${orderData.id}`
    }
  });
}

/**
 * Email: Pedido entregado
 */
async function sendOrderDeliveredEmail(userEmail, orderData) {
  return sendEmail({
    to: userEmail,
    subject: `Pedido #${orderData.order_number} entregado`,
    template: 'order-delivered',
    data: {
      customerName: orderData.shipping_name,
      orderNumber: orderData.order_number,
      orderId: orderData.id,
      orderLink: `${FRONTEND_URL}/account/orders/${orderData.id}`
    }
  });
}

/**
 * Email: Recuperación de contraseña
 */
async function sendPasswordResetEmail(userEmail, resetToken, userName = null) {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: userEmail,
    template: 'password-reset',
    data: {
      userName: userName || 'Usuario',
      resetLink,
      expiresIn: '1 hora',
      supportEmail: FROM_EMAIL
    }
  });
}

module.exports = {
  sendEmail,
  sendEmailVerificationEmail,
  sendPasswordRecoveryEmail,
  sendOrderCreatedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetEmail
};
