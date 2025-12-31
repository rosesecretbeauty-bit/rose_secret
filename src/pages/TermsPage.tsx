import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
export function TermsPage() {
  const sections = [{
    icon: FileText,
    title: '1. Aceptación de Términos',
    content: 'Al acceder y utilizar el sitio web de Rose Secret, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.'
  }, {
    icon: ShoppingCart,
    title: '2. Uso del Sitio Web',
    content: 'Debes ser mayor de 18 años para realizar compras en nuestro sitio. Te comprometes a proporcionar información precisa y actualizada. No debes usar nuestro sitio para fines ilegales o no autorizados.'
  }, {
    title: '3. Productos y Precios',
    content: 'Hacemos todo lo posible para mostrar los colores y detalles de los productos con precisión, pero no garantizamos que la visualización en tu dispositivo sea exacta. Los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de limitar las cantidades de compra.'
  }, {
    title: '4. Proceso de Compra',
    content: 'Al realizar un pedido, recibirás un correo electrónico de confirmación. Esta confirmación no constituye la aceptación de tu pedido. Nos reservamos el derecho de rechazar o cancelar cualquier pedido por cualquier motivo, incluyendo disponibilidad de productos, errores en precios o problemas con el pago.'
  }, {
    icon: RefreshCw,
    title: '5. Política de Devoluciones',
    content: 'Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto. Los artículos deben estar sin usar, en su empaque original y con todas las etiquetas. Los productos en oferta final no son reembolsables. El cliente es responsable de los costos de envío de devolución, excepto en casos de productos defectuosos.'
  }, {
    title: '6. Envíos',
    content: 'Los tiempos de envío son estimados y pueden variar. No somos responsables por retrasos causados por la empresa de mensajería o eventos fuera de nuestro control. El riesgo de pérdida o daño pasa al comprador una vez que el producto es entregado a la empresa de transporte.'
  }, {
    title: '7. Propiedad Intelectual',
    content: 'Todo el contenido del sitio web, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de Rose Secret o sus proveedores de contenido y está protegido por leyes de propiedad intelectual. No puedes reproducir, distribuir o modificar ningún contenido sin nuestro permiso expreso por escrito.'
  }, {
    icon: AlertCircle,
    title: '8. Limitación de Responsabilidad',
    content: 'Rose Secret no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar nuestros productos o servicios. Nuestra responsabilidad total no excederá el monto pagado por el producto en cuestión.'
  }, {
    title: '9. Privacidad',
    content: 'El uso de nuestro sitio web también está regido por nuestra Política de Privacidad. Al usar nuestros servicios, consientes la recopilación y uso de tu información según se describe en dicha política.'
  }, {
    title: '10. Modificaciones',
    content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Es tu responsabilidad revisar estos términos periódicamente.'
  }, {
    title: '11. Ley Aplicable',
    content: 'Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta en los tribunales de Madrid, España.'
  }, {
    title: '12. Contacto',
    content: 'Para preguntas sobre estos términos y condiciones, contáctanos en: legal@rosesecret.com o Rose Secret, Calle Gran Vía 123, 28013 Madrid, España.'
  }];
  return <div className="min-h-screen bg-white py-16">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
            <FileText className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Términos y Condiciones
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
            Bienvenido a Rose Secret. Estos términos y condiciones describen las
            reglas y regulaciones para el uso de nuestro sitio web y la compra
            de nuestros productos. Al acceder a este sitio web, asumimos que
            aceptas estos términos y condiciones en su totalidad.
          </p>
        </motion.div>

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

        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.8
      }} className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Al realizar una compra o usar nuestros servicios, confirmas que has
            leído, entendido y aceptado estos términos y condiciones.
          </p>
        </motion.div>
      </div>
    </div>;
}