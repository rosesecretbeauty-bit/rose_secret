import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Recycle, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function SustainabilityPage() {
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b73?w=1600&q=80" alt="Nature" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative container-custom text-center text-white z-10">
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Belleza Consciente
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-xl md:text-2xl max-w-2xl mx-auto font-light">
            Nuestro compromiso con el planeta es tan fuerte como nuestra pasión
            por la belleza. Lujo sostenible para un futuro mejor.
          </motion.p>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="container-custom -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{
          icon: Leaf,
          value: '10k+',
          label: 'Árboles Plantados',
          color: 'text-green-500'
        }, {
          icon: Recycle,
          value: '85%',
          label: 'Envases Reciclados',
          color: 'text-blue-500'
        }, {
          icon: Droplets,
          value: '500k',
          label: 'Litros de Agua Ahorrados',
          color: 'text-cyan-500'
        }, {
          icon: Heart,
          value: '100%',
          label: 'Cruelty Free',
          color: 'text-rose-500'
        }].map((stat, idx) => <motion.div key={idx} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: idx * 0.1
        }} className="bg-white p-8 rounded-2xl shadow-premium text-center">
              <stat.icon className={`w-10 h-10 mx-auto mb-4 ${stat.color}`} />
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-500 font-medium uppercase tracking-wider text-sm">
                {stat.label}
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Mission */}
      <div className="container-custom py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-rose-600 font-bold tracking-widest uppercase text-sm mb-4 block">
              Nuestra Misión
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lujo sin Compromisos
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Creemos que no deberías tener que elegir entre productos efectivos
              de alta calidad y el cuidado del medio ambiente. En Rose Secret,
              cada decisión que tomamos, desde la formulación hasta el
              empaquetado, se filtra a través de nuestra lente de
              sostenibilidad.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Trabajamos directamente con agricultores locales para obtener
              ingredientes de manera ética, asegurando salarios justos y
              prácticas agrícolas regenerativas.
            </p>
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              Leer Informe de Transparencia
            </Button>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800&q=80" alt="Sustainable ingredients" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-premium max-w-xs hidden md:block">
              <p className="font-serif text-xl font-bold text-gray-900 mb-2">
                "El futuro del lujo es verde."
              </p>
              <p className="text-gray-500 text-sm">
                - Isabella Rose, Fundadora
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-rose-50 py-24">
        <div className="container-custom">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Nuestro Viaje Verde
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-rose-200 hidden md:block" />
            <div className="space-y-12">
              {[{
              year: '2020',
              title: 'El Comienzo',
              desc: 'Fundación con compromiso 100% Cruelty Free.'
            }, {
              year: '2021',
              title: 'Packaging Responsable',
              desc: 'Transición a vidrio reciclado y cartón FSC.'
            }, {
              year: '2022',
              title: 'Carbono Neutral',
              desc: 'Logramos compensar el 100% de nuestra huella de carbono.'
            }, {
              year: '2023',
              title: 'Refill Revolution',
              desc: 'Lanzamiento de sistema de recargas para reducir residuos.'
            }].map((item, idx) => <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 text-center md:text-left">
                    <div className={`bg-white p-6 rounded-xl shadow-sm inline-block ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} w-full`}>
                      <span className="text-rose-600 font-bold text-xl mb-2 block">
                        {item.year}
                      </span>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-sm relative z-10 flex-shrink-0" />
                  <div className="flex-1" />
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
}