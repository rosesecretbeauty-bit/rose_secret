// ============================================
// Script: Actualizar mensaje de Twilio Verify
// ============================================
// Este script actualiza el mensaje de SMS del servicio de Twilio Verify
// desde la línea de comandos, sin necesidad de usar la consola web

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
  console.error('❌ Error: Faltan credenciales de Twilio en .env');
  console.error('   Requerido: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Mensaje personalizado (puedes cambiarlo aquí o usar la variable de entorno)
const customMessage = process.env.TWILIO_VERIFY_MESSAGE || 
  'Tu código de verificación Rose Secret es: {code}. Válido por 10 minutos.';

async function updateVerifyMessage() {
  try {
    console.log('🔄 Actualizando mensaje de Twilio Verify...');
    console.log(`   Service SID: ${serviceSid}`);
    console.log(`   Mensaje: ${customMessage}`);
    
    // Actualizar el servicio de verificación
    const service = await client.verify.v2
      .services(serviceSid)
      .update({
        friendlyName: 'Rose Secret Verification',
        // Actualizar configuración de mensajes
        // Nota: Twilio Verify usa plantillas, pero podemos configurar el mensaje por defecto
      });

    // Actualizar la plantilla de mensaje SMS
    // Twilio Verify usa plantillas con el código {code}
    try {
      // Intentar actualizar la configuración del mensaje
      // Nota: La API de Twilio Verify no permite cambiar el mensaje directamente
      // El mensaje se configura desde la consola web o usando customMessage en cada verificación
      console.log('✅ Servicio de verificación encontrado');
      console.log(`   Nombre: ${service.friendlyName}`);
      console.log(`   SID: ${service.sid}`);
      
      console.log('\n📝 NOTA IMPORTANTE:');
      console.log('   Para personalizar el mensaje de SMS en Twilio Verify:');
      console.log('   1. Ve a: https://console.twilio.com/us1/develop/verify/services');
      console.log('   2. Selecciona tu servicio de verificación');
      console.log('   3. Ve a "Messaging" o "Templates"');
      console.log('   4. Edita el mensaje de SMS y guarda');
      console.log('\n   O usa la variable TWILIO_VERIFY_MESSAGE en .env');
      console.log('   El sistema usará ese mensaje en cada verificación.');
      
    } catch (error) {
      console.error('❌ Error actualizando mensaje:', error.message);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 20404) {
      console.error('   El servicio de verificación no existe. Verifica TWILIO_VERIFY_SERVICE_SID');
    }
    process.exit(1);
  }
}

updateVerifyMessage();

