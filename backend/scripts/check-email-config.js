// ============================================
// Script de verificación de configuración de email
// ============================================
// Ejecuta: node scripts/check-email-config.js

require('dotenv').config();

console.log('\n🔍 Verificando configuración de email...\n');

// Verificar proveedor
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';
console.log('📧 Proveedor configurado:', EMAIL_PROVIDER);

if (EMAIL_PROVIDER === 'gmail') {
  console.log('\n📋 Verificando configuración de Gmail:\n');
  
  // Verificar variables
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser) {
    console.error('❌ GMAIL_USER no está configurado en .env');
  } else {
    console.log('✅ GMAIL_USER:', gmailUser);
    
    // Validar formato
    if (!gmailUser.includes('@') || !gmailUser.includes('.')) {
      console.error('   ⚠️  No parece ser un email válido');
    } else if (!gmailUser.endsWith('@gmail.com') && !gmailUser.endsWith('@googlemail.com')) {
      console.warn('   ⚠️  No es un email de Gmail (@gmail.com o @googlemail.com)');
    }
  }
  
  if (!gmailPassword) {
    console.error('❌ GMAIL_APP_PASSWORD no está configurado en .env');
  } else {
    const cleanPassword = gmailPassword.replace(/\s/g, '');
    console.log('✅ GMAIL_APP_PASSWORD:', cleanPassword.length > 0 ? '***' + cleanPassword.substring(cleanPassword.length - 2) : 'NO CONFIGURADO');
    console.log('   Longitud (sin espacios):', cleanPassword.length, 'caracteres');
    
    if (cleanPassword.length !== 16) {
      console.error('   ❌ La contraseña de aplicación debe tener exactamente 16 caracteres');
      console.error('   ⚠️  Asegúrate de copiar la contraseña completa desde:');
      console.error('      https://myaccount.google.com/apppasswords');
    } else {
      console.log('   ✅ Longitud correcta (16 caracteres)');
    }
  }
  
  // Intentar conectar
  if (gmailUser && gmailPassword) {
    console.log('\n🔌 Intentando conectar con Gmail...\n');
    
    try {
      const nodemailer = require('nodemailer');
      const cleanPassword = gmailPassword.replace(/\s/g, '');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser.trim(),
          pass: cleanPassword
        }
      });
      
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Error de conexión:', error.message);
          console.error('   Código:', error.code);
          
          if (error.code === 'EAUTH') {
            console.error('\n🔐 PROBLEMA DE AUTENTICACIÓN DETECTADO\n');
            console.error('📝 Pasos para solucionarlo:');
            console.error('\n1. Ve a: https://myaccount.google.com/security');
            console.error('   - Asegúrate de tener la "Verificación en dos pasos" ACTIVADA');
            console.error('\n2. Ve a: https://myaccount.google.com/apppasswords');
            console.error('   - Selecciona "Correo" como aplicación');
            console.error('   - Selecciona "Otro (nombre personalizado)" como dispositivo');
            console.error('   - Escribe "Rose Secret" como nombre');
            console.error('   - Copia la contraseña de 16 caracteres que se genera');
            console.error('\n3. Actualiza tu archivo .env:');
            console.error('   GMAIL_USER=' + gmailUser);
            console.error('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
            console.error('   (Pega la contraseña completa, puede tener espacios)');
            console.error('\n4. Reinicia el servidor después de actualizar .env');
            console.error('   Ctrl+C y luego: npm run dev\n');
          }
        } else {
          console.log('✅ Conexión exitosa con Gmail!');
          console.log('   Email configurado correctamente\n');
        }
      });
    } catch (error) {
      console.error('❌ Error al inicializar Nodemailer:', error.message);
      console.error('   Asegúrate de tener nodemailer instalado: npm install nodemailer\n');
    }
  } else {
    console.error('\n❌ Configuración incompleta. Revisa tu archivo .env\n');
  }
} else if (EMAIL_PROVIDER === 'resend') {
  console.log('\n📋 Verificando configuración de Resend:\n');
  
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('❌ RESEND_API_KEY no está configurado en .env');
    console.error('   Obtén tu API key en: https://resend.com/api-keys\n');
  } else {
    console.log('✅ RESEND_API_KEY:', resendKey.substring(0, 10) + '...');
    console.log('   Configuración completa\n');
  }
} else {
  console.error('❌ Proveedor desconocido:', EMAIL_PROVIDER);
  console.error('   Debe ser "gmail" o "resend"\n');
}

console.log('📝 Verifica también:');
console.log('   EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS || 'NO CONFIGURADO');
console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'NO CONFIGURADO');
console.log('');

