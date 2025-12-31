// ============================================
// SMS Service - Twilio Integration
// ============================================
// Servicio para envío de SMS en tiempo real

const { error: logError, info } = require('../logger');

// Determinar proveedor de SMS
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'twilio'; // 'twilio', 'aws-sns', 'mock'

let twilioClient = null;
let twilioVerifyServiceSid = null;

// Configurar Twilio si está seleccionado
if (SMS_PROVIDER === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Verificar si se usa Twilio Verify (recomendado) o SMS directo
    twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (twilioVerifyServiceSid) {
      info('✅ Twilio Verify configurado correctamente', {
        accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
        verifyServiceSid: twilioVerifyServiceSid?.substring(0, 10) + '...'
      });
    } else {
      info('✅ Twilio configurado correctamente (SMS directo)', {
        accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      });
    }
  } catch (error) {
    logError('⚠️ No se pudo inicializar Twilio:', error);
    console.warn('⚠️ Asegúrate de tener twilio instalado: npm install twilio');
    console.warn('⚠️ Error detallado:', error.message);
  }
} else {
  if (SMS_PROVIDER === 'twilio') {
    console.warn('⚠️ Twilio seleccionado pero faltan credenciales:', {
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasVerifyServiceSid: !!process.env.TWILIO_VERIFY_SERVICE_SID,
      hasPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER
    });
  }
}

// Configuración
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_FROM_NUMBER;

/**
 * Obtener Service SID de Twilio Verify de manera robusta
 * Limpia espacios y valida formato
 */
function getTwilioVerifyServiceSid() {
  const sid = (process.env.TWILIO_VERIFY_SERVICE_SID || twilioVerifyServiceSid || '').trim();
  if (!sid) {
    return null;
  }
  // Validar formato básico (debe empezar con VA)
  if (!sid.startsWith('VA')) {
    logError('TWILIO_VERIFY_SERVICE_SID tiene formato inválido. Debe empezar con "VA"', {
      received: sid.substring(0, 10) + '...'
    });
    return null;
  }
  return sid;
}

/**
 * Enviar SMS usando Twilio
 */
async function sendSMSViaTwilio(phone, message) {
  if (!twilioClient) {
    throw new Error('Twilio no está configurado. Verifica TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env');
  }

  if (!FROM_PHONE) {
    throw new Error('TWILIO_PHONE_NUMBER no está configurado en .env');
  }

  // Normalizar números para comparar
  const normalizeForCompare = (num) => num.replace(/\D/g, '');
  const fromNormalized = normalizeForCompare(FROM_PHONE);
  const toNormalized = normalizeForCompare(phone);

  // Twilio no permite enviar desde y hacia el mismo número
  if (fromNormalized === toNormalized) {
    const error = new Error(`No se puede enviar SMS al mismo número de Twilio (${FROM_PHONE}). Usa un número diferente para verificación.`);
    error.code = 'SAME_NUMBER';
    throw error;
  }

  try {
    const messageResult = await twilioClient.messages.create({
      body: message,
      from: FROM_PHONE,
      to: phone
    });

    info('SMS enviado exitosamente', {
      to: phone,
      messageSid: messageResult.sid,
      status: messageResult.status
    });

    return {
      success: true,
      messageSid: messageResult.sid,
      status: messageResult.status
    };
  } catch (error) {
    logError('Error enviando SMS vía Twilio:', error);
    
    // Si es el error de mismo número, lanzar error más claro
    if (error.code === 21266 || error.message?.includes('cannot be the same')) {
      const sameNumberError = new Error(`No se puede enviar SMS al mismo número de Twilio. El número ${phone} es el mismo que el configurado en TWILIO_PHONE_NUMBER. Usa un número diferente para verificación.`);
      sameNumberError.code = 'SAME_NUMBER';
      throw sameNumberError;
    }
    
    // Si el número de Twilio no es válido o no está asociado a la cuenta
    if (error.code === 21659 || error.message?.includes('is not a Twilio phone number')) {
      const invalidNumberError = new Error(`El número ${FROM_PHONE} no es un número de Twilio válido o no está asociado a tu cuenta. Verifica en https://console.twilio.com/us1/develop/phone-numbers/manage/incoming que el número esté activo.`);
      invalidNumberError.code = 'INVALID_TWILIO_NUMBER';
      throw invalidNumberError;
    }
    
    throw new Error(`Error al enviar SMS: ${error.message}`);
  }
}

/**
 * Enviar SMS usando AWS SNS
 */
async function sendSMSViaAWS(phone, message) {
  // TODO: Implementar integración con AWS SNS
  // const AWS = require('aws-sdk');
  // const sns = new AWS.SNS({
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   region: process.env.AWS_REGION
  // });
  // 
  // const params = {
  //   Message: message,
  //   PhoneNumber: phone
  // };
  // 
  // return await sns.publish(params).promise();
  
  throw new Error('AWS SNS no está implementado aún');
}

/**
 * Enviar SMS (mock para desarrollo)
 */
async function sendSMSViaMock(phone, message) {
  // En desarrollo, solo loguear
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    console.log('📱 [MOCK SMS - Modo Desarrollo]');
    console.log(`   Para: ${phone}`);
    console.log(`   Mensaje: ${message}`);
    console.log(`   ⚠️  Para envío real, configura Twilio en .env`);
  }
  
  return {
    success: true,
    messageSid: `mock_${Date.now()}`,
    status: 'sent'
  };
}

/**
 * Enviar código OTP usando Twilio Verify (recomendado)
 * Twilio Verify genera y envía el código automáticamente
 */
async function sendOTPViaTwilioVerify(phone) {
  // Leer Service SID en tiempo de ejecución de manera robusta
  const serviceSid = getTwilioVerifyServiceSid();
  
  if (!twilioClient) {
    throw new Error('Twilio no está configurado. Verifica TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env');
  }
  
  if (!serviceSid) {
    const envSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    throw new Error(`Twilio Verify Service SID no está configurado. Verifica TWILIO_VERIFY_SERVICE_SID en .env. Valor actual: ${envSid ? `"${envSid.substring(0, 10)}..."` : 'no definido'}`);
  }

  try {
    // Personalizar mensaje de SMS
    // Nota: Twilio Verify permite personalizar el mensaje de dos formas:
    // 1. Desde la consola web (recomendado): https://console.twilio.com/us1/develop/verify/services
    // 2. Usando customMessage en cada verificación (se usa si está configurado)
    const customMessage = process.env.TWILIO_VERIFY_MESSAGE || null;
    
    const verificationParams = {
      to: phone,
      channel: 'sms'
    };
    
    // Si hay un mensaje personalizado configurado, agregarlo
    // El mensaje debe incluir {code} donde se insertará el código
    if (customMessage) {
      verificationParams.customMessage = customMessage;
      info('Usando mensaje personalizado de Twilio Verify', { message: customMessage });
    }

    info('Enviando código vía Twilio Verify', {
      to: phone,
      serviceSid: serviceSid?.substring(0, 10) + '...'
    });

    const verification = await twilioClient.verify.v2
      .services(serviceSid)
      .verifications
      .create(verificationParams);

    info('Código de verificación enviado vía Twilio Verify', {
      to: phone,
      sid: verification.sid,
      status: verification.status
    });

    return {
      success: true,
      verificationSid: verification.sid,
      status: verification.status
    };
  } catch (error) {
    logError('Error enviando código vía Twilio Verify:', {
      error: error.message,
      code: error.code,
      status: error.status,
      serviceSid: serviceSid?.substring(0, 10) + '...',
      phone: phone
    });
    
    // Proporcionar mensajes de error más específicos
    if (error.code === 20404 || error.message?.includes('not found')) {
      throw new Error(`El servicio de verificación de Twilio no se encontró. Verifica que TWILIO_VERIFY_SERVICE_SID (${serviceSid?.substring(0, 10)}...) sea correcto en https://console.twilio.com/us1/develop/verify/services`);
    }
    
    if (error.code === 20403 || error.message?.includes('Forbidden')) {
      throw new Error('No tienes permisos para acceder a este servicio de verificación. Verifica tus credenciales de Twilio.');
    }
    
    throw new Error(`Error al enviar código de verificación: ${error.message}`);
  }
}

/**
 * Verificar código OTP usando Twilio Verify
 */
async function verifyOTPViaTwilioVerify(phone, code) {
  // Leer Service SID en tiempo de ejecución de manera robusta
  const serviceSid = getTwilioVerifyServiceSid();
  
  if (!twilioClient) {
    throw new Error('Twilio no está configurado. Verifica TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env');
  }
  
  if (!serviceSid) {
    const envSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    throw new Error(`Twilio Verify Service SID no está configurado. Verifica TWILIO_VERIFY_SERVICE_SID en .env. Valor actual: ${envSid ? `"${envSid.substring(0, 10)}..."` : 'no definido'}`);
  }

  try {
    info('Verificando código con Twilio Verify', {
      to: phone,
      serviceSid: serviceSid,
      serviceSidLength: serviceSid?.length,
      codeLength: code?.length,
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...'
    });

    // Validar que el Service SID tenga el formato correcto antes de usarlo
    if (serviceSid.length !== 34 || !serviceSid.startsWith('VA')) {
      throw new Error(`Service SID inválido: debe tener 34 caracteres y empezar con "VA". Recibido: "${serviceSid}" (${serviceSid.length} caracteres)`);
    }

    const verificationCheck = await twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks
      .create({
        to: phone,
        code: code
      });

    info('Código verificado vía Twilio Verify', {
      to: phone,
      sid: verificationCheck.sid,
      status: verificationCheck.status,
      valid: verificationCheck.valid
    });

    return {
      success: verificationCheck.status === 'approved' && verificationCheck.valid,
      status: verificationCheck.status,
      valid: verificationCheck.valid,
      sid: verificationCheck.sid
    };
  } catch (error) {
    logError('Error verificando código vía Twilio Verify:', {
      error: error.message,
      code: error.code,
      status: error.status,
      serviceSid: serviceSid,
      serviceSidLength: serviceSid?.length,
      phone: phone,
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
      rawError: error
    });
    
    // Proporcionar mensajes de error más específicos
    if (error.code === 20404 || error.message?.includes('not found')) {
      throw new Error(`El servicio de verificación de Twilio no se encontró. Verifica que TWILIO_VERIFY_SERVICE_SID (${serviceSid?.substring(0, 10)}...) sea correcto en https://console.twilio.com/us1/develop/verify/services`);
    }
    
    if (error.code === 20403 || error.message?.includes('Forbidden')) {
      throw new Error('No tienes permisos para acceder a este servicio de verificación. Verifica tus credenciales de Twilio.');
    }
    
    throw new Error(`Error al verificar código: ${error.message}`);
  }
}

/**
 * Enviar código OTP por SMS
 * Si TWILIO_VERIFY_SERVICE_SID está configurado, usa Twilio Verify (recomendado)
 * Si no, usa SMS directo o mock
 */
async function sendOTPCode(phone, code, purpose = 'verification') {
  const messages = {
    verification: `Tu código de verificación Rose Secret es: ${code}. Válido por 10 minutos.`,
    password_reset: `Tu código para recuperar tu contraseña Rose Secret es: ${code}. Válido por 15 minutos.`,
    phone_verification: `Tu código de verificación de teléfono Rose Secret es: ${code}. Válido por 10 minutos.`
  };

  const message = messages[purpose] || messages.verification;

  try {
    // Si Twilio Verify está configurado, usarlo primero (recomendado - no necesita código manual)
    if (SMS_PROVIDER === 'twilio' && twilioClient && twilioVerifyServiceSid) {
      info('Enviando código vía Twilio Verify', { to: phone });
      // Twilio Verify genera y envía el código automáticamente, no necesitamos pasar el código
      return await sendOTPViaTwilioVerify(phone);
    }
    
    // Si Twilio SMS directo está configurado
    if (SMS_PROVIDER === 'twilio' && twilioClient && FROM_PHONE) {
      info('Enviando SMS vía Twilio (directo)', { to: phone });
      return await sendSMSViaTwilio(phone, message);
    }
    
    // Si AWS SNS está configurado
    if (SMS_PROVIDER === 'aws-sns') {
      return await sendSMSViaAWS(phone, message);
    }
    
    // Modo mock (desarrollo o cuando no hay proveedor configurado)
    if (SMS_PROVIDER === 'twilio' && (!twilioClient || (!FROM_PHONE && !twilioVerifyServiceSid))) {
      console.warn('⚠️ Twilio configurado pero cliente no inicializado. Usando modo MOCK.');
      console.warn('   twilioClient:', !!twilioClient, 'FROM_PHONE:', FROM_PHONE, 'VerifyServiceSid:', !!twilioVerifyServiceSid);
    }
    return await sendSMSViaMock(phone, message);
  } catch (error) {
    logError('Error en sendOTPCode:', error);
    throw error;
  }
}

/**
 * Normalizar número telefónico mexicano
 * Acepta: +52XXXXXXXXXX, 52XXXXXXXXXX, XXXXXXXXXX
 * Retorna: +52XXXXXXXXXX (formato E.164)
 */
function normalizeMexicanPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  
  // Remover todos los caracteres no numéricos excepto +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si empieza con +52, mantenerlo
  if (cleaned.startsWith('+52')) {
    cleaned = cleaned.substring(3); // Remover +52
    // Validar que tenga 10 dígitos
    if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
      return `+52${cleaned}`;
    }
    return null;
  }
  
  // Si empieza con 52 (sin +), removerlo
  if (cleaned.startsWith('52') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  
  // Si tiene exactamente 10 dígitos, agregar +52
  if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
    return `+52${cleaned}`;
  }
  
  return null;
}

/**
 * Validar formato de teléfono mexicano
 * Acepta números en cualquier formato, los normaliza internamente
 */
function validatePhoneNumber(phone) {
  const normalized = normalizeMexicanPhone(phone);
  return normalized !== null;
}

/**
 * Formatear teléfono para envío SMS (formato E.164)
 * Normaliza automáticamente números mexicanos
 */
function formatPhoneForSMS(phone, countryCode = '+52') {
  // Normalizar el número
  const normalized = normalizeMexicanPhone(phone);
  
  if (!normalized) {
    throw new Error('Formato de teléfono inválido. Debe ser un número mexicano de 10 dígitos.');
  }
  
  return normalized;
}

/**
 * Formatear teléfono para visualización (solo visual, no para envío)
 * Ejemplo: +527774486398 -> 777 448 6398
 */
function formatPhoneForDisplay(phone) {
  const normalized = normalizeMexicanPhone(phone);
  if (!normalized) {
    return phone; // Retornar original si no se puede normalizar
  }
  
  // Remover +52 y formatear
  const digits = normalized.substring(3); // Remover +52
  if (digits.length === 10) {
    // Formato: XXX XXX XXXX
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  }
  
  return digits;
}

module.exports = {
  sendOTPCode,
  sendOTPViaTwilioVerify,
  verifyOTPViaTwilioVerify,
  sendSMSViaTwilio,
  sendSMSViaAWS,
  sendSMSViaMock,
  validatePhoneNumber,
  formatPhoneForSMS,
  normalizeMexicanPhone,
  formatPhoneForDisplay
};

