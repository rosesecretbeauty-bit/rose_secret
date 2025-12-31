import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToastStore } from '../stores/toastStore';
import { useForm } from '../hooks/useForm';
export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    },
    validate: values => {
      const errors: any = {};
      if (!values.name) errors.name = 'El nombre es requerido';
      if (!values.email) errors.email = 'El email es requerido';else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Email inválido';
      if (!values.subject) errors.subject = 'El asunto es requerido';
      if (!values.message) errors.message = 'El mensaje es requerido';
      return errors;
    },
    onSubmit: async values => {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      addToast({
        type: 'success',
        message: '¡Mensaje enviado! Te responderemos pronto.'
      });
      // Reset form
      values.name = '';
      values.email = '';
      values.phone = '';
      values.subject = '';
      values.message = '';
    }
  });
  const contactInfo = [{
    icon: Mail,
    title: 'Email',
    value: 'hola@rosesecret.com',
    link: 'mailto:hola@rosesecret.com'
  }, {
    icon: Phone,
    title: 'Teléfono',
    value: '+34 900 000 000',
    link: 'tel:+34900000000'
  }, {
    icon: MapPin,
    title: 'Dirección',
    value: 'Calle Gran Vía 123, Madrid, España',
    link: 'https://maps.google.com'
  }, {
    icon: Clock,
    title: 'Horario',
    value: 'Lun - Vie: 9:00 - 18:00',
    link: null
  }];
  const socialLinks = [{
    icon: Instagram,
    href: 'https://instagram.com',
    label: 'Instagram'
  }, {
    icon: Facebook,
    href: 'https://facebook.com',
    label: 'Facebook'
  }, {
    icon: Twitter,
    href: 'https://twitter.com',
    label: 'Twitter'
  }];
  return <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Envíanos un
            mensaje y te responderemos lo antes posible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.2
        }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Envíanos un Mensaje
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Nombre Completo" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name ? errors.name : ''} placeholder="Tu nombre" required />
                  <Input label="Email" type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : ''} placeholder="tu@email.com" required />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Teléfono (Opcional)" type="tel" name="phone" value={values.phone} onChange={handleChange} placeholder="+34 600 000 000" />
                  <Input label="Asunto" name="subject" value={values.subject} onChange={handleChange} onBlur={handleBlur} error={touched.subject ? errors.subject : ''} placeholder="¿En qué podemos ayudarte?" required />
                </div>

                <Textarea label="Mensaje" name="message" value={values.message} onChange={handleChange} onBlur={handleBlur} error={touched.message ? errors.message : ''} placeholder="Cuéntanos más sobre tu consulta..." rows={6} required />

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} leftIcon={<Send className="h-5 w-5" />}>
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.3
        }} className="space-y-6">
            {/* Contact Cards */}
            {contactInfo.map((info, index) => <motion.div key={info.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4 + index * 0.1
          }} className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <info.icon className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    {info.link ? <a href={info.link} target={info.link.startsWith('http') ? '_blank' : undefined} rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-gray-600 hover:text-rose-600 transition-colors">
                        {info.value}
                      </a> : <p className="text-gray-600">{info.value}</p>}
                  </div>
                </div>
              </motion.div>)}

            {/* Social Media */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.8
          }} className="bg-gradient-to-br from-rose-50 to-lavender-50 rounded-xl p-6 border border-rose-100">
              <h3 className="font-semibold text-gray-900 mb-4">Síguenos</h3>
              <div className="flex gap-3">
                {socialLinks.map(social => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="p-3 bg-white hover:bg-rose-600 text-gray-600 hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md" aria-label={social.label}>
                    <social.icon className="h-5 w-5" />
                  </a>)}
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.9
          }} className="bg-gray-100 rounded-xl overflow-hidden h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Mapa de ubicación</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>;
}