import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Mail } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
interface FAQ {
  question: string;
  answer: string;
}
interface FAQCategory {
  title: string;
  icon: string;
  faqs: FAQ[];
}
export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const categories: FAQCategory[] = [{
    title: 'Envíos',
    icon: '📦',
    faqs: [{
      question: '¿Cuánto tarda el envío?',
      answer: 'Los envíos estándar tardan entre 3-5 días laborables. Los envíos express llegan en 24-48 horas.'
    }, {
      question: '¿Cuál es el costo del envío?',
      answer: 'El envío estándar cuesta €4.99. El envío es GRATIS en compras superiores a €50.'
    }, {
      question: '¿Envían internacionalmente?',
      answer: 'Sí, enviamos a toda Europa. Los tiempos y costos varían según el destino.'
    }, {
      question: '¿Puedo rastrear mi pedido?',
      answer: 'Sí, recibirás un número de seguimiento por email una vez que tu pedido sea enviado.'
    }, {
      question: '¿Qué hago si mi pedido no llega?',
      answer: 'Contáctanos inmediatamente. Investigaremos con la empresa de mensajería y te daremos una solución.'
    }]
  }, {
    title: 'Devoluciones',
    icon: '↩️',
    faqs: [{
      question: '¿Cuál es la política de devoluciones?',
      answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar sin usar y en su empaque original.'
    }, {
      question: '¿Cómo inicio una devolución?',
      answer: 'Ve a "Mis Pedidos" en tu cuenta, selecciona el pedido y haz clic en "Solicitar Devolución".'
    }, {
      question: '¿Cuándo recibiré mi reembolso?',
      answer: 'Los reembolsos se procesan en 5-7 días laborables después de recibir tu devolución.'
    }, {
      question: '¿Quién paga el envío de devolución?',
      answer: 'Nosotros cubrimos el costo del envío de devolución si el producto tiene un defecto. En otros casos, el cliente cubre el envío.'
    }]
  }, {
    title: 'Pagos',
    icon: '💳',
    faqs: [{
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), PayPal y transferencia bancaria.'
    }, {
      question: '¿Es seguro pagar en su sitio?',
      answer: 'Sí, utilizamos encriptación SSL y procesadores de pago certificados. Tu información está 100% segura.'
    }, {
      question: '¿Puedo pagar a plazos?',
      answer: 'Sí, ofrecemos pago en 3 cuotas sin intereses a través de nuestro partner financiero.'
    }]
  }, {
    title: 'Productos',
    icon: '✨',
    faqs: [{
      question: '¿Los productos son originales?',
      answer: 'Sí, todos nuestros productos son 100% originales y vienen directamente de los fabricantes autorizados.'
    }, {
      question: '¿Tienen garantía?',
      answer: 'Todos los productos tienen garantía del fabricante. La duración varía según el producto.'
    }, {
      question: '¿Cómo sé qué talla elegir?',
      answer: 'Cada producto tiene una guía de tallas detallada. También puedes contactarnos para asesoramiento personalizado.'
    }, {
      question: '¿Puedo ver el producto antes de comprarlo?',
      answer: 'Tenemos fotos detalladas y descripciones completas. También puedes leer reseñas de otros clientes.'
    }, {
      question: '¿Hacen restock de productos agotados?',
      answer: 'Sí, puedes suscribirte a notificaciones de disponibilidad en la página del producto.'
    }]
  }, {
    title: 'Cuenta',
    icon: '👤',
    faqs: [{
      question: '¿Cómo creo una cuenta?',
      answer: 'Haz clic en "Crear Cuenta" en el menú superior y completa el formulario de registro.'
    }, {
      question: '¿Olvidé mi contraseña, qué hago?',
      answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones.'
    }, {
      question: '¿Puedo cambiar mi dirección de envío?',
      answer: 'Sí, puedes actualizar tu dirección en "Mi Cuenta" > "Direcciones" antes de realizar un pedido.'
    }, {
      question: '¿Cómo elimino mi cuenta?',
      answer: 'Contáctanos a través del formulario de contacto y procesaremos tu solicitud de eliminación de cuenta.'
    }]
  }];
  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(category => category.faqs.length > 0);
  const toggleFAQ = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };
  return <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-16">
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
            <HelpCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra respuestas rápidas a las preguntas más comunes
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-12">
          <Input leftIcon={<Search className="h-5 w-5" />} placeholder="Buscar en preguntas frecuentes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-lg" />
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => <motion.div key={category.title} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2 + categoryIndex * 0.1
        }}>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                {category.title}
              </h2>

              <div className="space-y-3">
                {category.faqs.map((faq, faqIndex) => {
              const key = `${categoryIndex}-${faqIndex}`;
              const isOpen = openIndex === key;
              return <motion.div key={faqIndex} initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.3 + faqIndex * 0.05
              }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-rose-200 transition-colors">
                      <button onClick={() => toggleFAQ(categoryIndex, faqIndex)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && <motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: 'auto',
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    duration: 0.3
                  }} className="overflow-hidden">
                            <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                              {faq.answer}
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </motion.div>;
            })}
              </div>
            </motion.div>)}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No encontramos resultados para "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Limpiar búsqueda
            </Button>
          </motion.div>}

        {/* Contact CTA */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="mt-16 bg-gradient-to-br from-rose-50 to-lavender-50 rounded-2xl p-8 text-center border border-rose-100">
          <Mail className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            ¿Aún tienes preguntas?
          </h3>
          <p className="text-gray-600 mb-6">
            Nuestro equipo está aquí para ayudarte
          </p>
          <Link to="/contact">
            <Button size="lg">Contáctanos</Button>
          </Link>
        </motion.div>
      </div>
    </div>;
}