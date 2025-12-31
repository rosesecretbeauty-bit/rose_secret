import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, TrendingUp, Users, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
export function PartnershipsPage() {
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" alt="Collaboration" className="w-full h-full object-cover" />
        </div>
        <div className="relative container-custom text-center z-10">
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Colabora con Rose Secret
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-xl md:text-2xl max-w-2xl mx-auto font-light text-gray-200">
            Unamos fuerzas para crear experiencias de belleza extraordinarias.
          </motion.p>
        </div>
      </div>

      {/* Benefits */}
      <div className="container-custom py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué asociarse con nosotros?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una plataforma premium y una audiencia comprometida
            apasionada por la belleza de lujo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
          icon: Globe,
          title: 'Alcance Global',
          desc: 'Acceso a nuestra comunidad internacional de amantes de la belleza.'
        }, {
          icon: TrendingUp,
          title: 'Crecimiento Mutuo',
          desc: 'Estrategias de co-marketing diseñadas para maximizar el ROI.'
        }, {
          icon: Users,
          title: 'Audiencia Premium',
          desc: 'Conecta con consumidores que valoran la calidad y la sostenibilidad.'
        }].map((item, idx) => <motion.div key={idx} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: idx * 0.1
        }} className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-premium transition-shadow">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-rose-600">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>)}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-rose-50 py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-premium-lg">
            <div className="text-center mb-10">
              <Handshake className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                Conviértete en Partner
              </h2>
              <p className="text-gray-600">
                Cuéntanos sobre tu marca y cómo te gustaría colaborar.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <Input placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Corporativo
                  </label>
                  <Input type="email" placeholder="email@empresa.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa / Marca
                </label>
                <Input placeholder="Nombre de tu empresa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Colaboración
                </label>
                <Select>
                  <option>Selecciona una opción</option>
                  <option>Influencer / Creador de Contenido</option>
                  <option>Marca / Producto</option>
                  <option>Retailer / Distribuidor</option>
                  <option>Prensa / Medios</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <Textarea rows={4} placeholder="Describe tu propuesta..." />
              </div>
              <Button size="lg" fullWidth>
                Enviar Propuesta
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>;
}