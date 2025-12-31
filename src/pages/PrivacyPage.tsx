import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
export function PrivacyPage() {
  const sections = [{
    icon: FileText,
    title: '1. Información que Recopilamos',
    content: `Recopilamos información que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, dirección de envío, información de pago y preferencias de compra. También recopilamos información automáticamente sobre tu uso de nuestro sitio web, incluyendo tu dirección IP, tipo de navegador, páginas visitadas y tiempo de navegación.`
  }, {
    icon: Lock,
    title: '2. Cómo Usamos tu Información',
    content: `Utilizamos tu información para procesar tus pedidos, mejorar nuestros servicios, personalizar tu experiencia de compra, enviarte comunicaciones de marketing (si has dado tu consentimiento), prevenir fraudes y cumplir con nuestras obligaciones legales. Nunca vendemos tu información personal a terceros.`
  }, {
    icon: Shield,
    title: '3. Protección de Datos',
    content: `Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos encriptación SSL para todas las transacciones y almacenamos datos sensibles de forma segura.`
  }, {
    icon: Eye,
    title: '4. Cookies y Tecnologías Similares',
    content: `Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web, analizar el tráfico y personalizar el contenido. Puedes controlar el uso de cookies a través de la configuración de tu navegador. Algunas funciones del sitio pueden no estar disponibles si deshabilitas las cookies.`
  }, {
    title: '5. Compartir Información',
    content: `Compartimos tu información solo con proveedores de servicios de confianza que nos ayudan a operar nuestro negocio (procesadores de pago, servicios de envío, plataformas de marketing). Estos proveedores están obligados contractualmente a proteger tu información y solo pueden usarla para los fines específicos que les autorizamos.`
  }, {
    title: '6. Tus Derechos',
    content: `Tienes derecho a acceder, rectificar, eliminar o limitar el procesamiento de tu información personal. También puedes oponerte al procesamiento de tus datos y solicitar la portabilidad de los mismos. Para ejercer estos derechos, contáctanos a través de privacy@rosesecret.com.`
  }, {
    title: '7. Retención de Datos',
    content: `Conservamos tu información personal durante el tiempo necesario para cumplir con los fines descritos en esta política, a menos que la ley requiera o permita un período de retención más largo. Los datos de transacciones se conservan según lo requerido por las leyes fiscales y contables.`
  }, {
    title: '8. Menores de Edad',
    content: `Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos de inmediato.`
  }, {
    title: '9. Cambios a esta Política',
    content: `Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de "última actualización". Te recomendamos revisar esta página regularmente.`
  }, {
    title: '10. Contacto',
    content: `Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información personal, contáctanos en: privacy@rosesecret.com o Rose Secret, Calle Gran Vía 123, 28013 Madrid, España.`
  }];
  return <div className="min-h-screen bg-white py-16">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-600">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-rose-50 rounded-xl p-8 mb-12 border border-rose-100">
          <p className="text-gray-700 leading-relaxed">
            En Rose Secret, nos comprometemos a proteger tu privacidad y tus
            datos personales. Esta política describe cómo recopilamos, usamos,
            compartimos y protegemos tu información cuando utilizas nuestro
            sitio web y servicios.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2 + index * 0.05
        }} className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-start gap-4 mb-4">
                {section.icon && <div className="flex-shrink-0 p-2 bg-rose-100 rounded-lg">
                    <section.icon className="h-6 w-6 text-rose-600" />
                  </div>}
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed ml-14">
                {section.content}
              </p>
            </motion.div>)}
        </div>

        {/* Footer Note */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.8
      }} className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Al utilizar nuestros servicios, aceptas los términos de esta
            política de privacidad. Si no estás de acuerdo con estos términos,
            por favor no uses nuestros servicios.
          </p>
        </motion.div>
      </div>
    </div>;
}