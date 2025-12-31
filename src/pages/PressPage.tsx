import React from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
const pressReleases = [{
  date: '10 Oct 2023',
  title: 'Rose Secret lanza nueva colección de fragancias sostenibles',
  excerpt: 'Una línea revolucionaria que combina lujo y responsabilidad ambiental con ingredientes 100% trazables.',
  category: 'Lanzamiento'
}, {
  date: '15 Sep 2023',
  title: 'Alianza estratégica con Fundación Naturaleza',
  excerpt: 'Compromiso de plantar 10,000 árboles por cada venta de nuestra colección "Bosque Místico".',
  category: 'Sostenibilidad'
}, {
  date: '01 Ago 2023',
  title: 'Rose Secret nombrada "Mejor Marca Revelación" en los Beauty Awards',
  excerpt: 'Reconocimiento internacional a la innovación y excelencia en el sector de la belleza de lujo.',
  category: 'Premios'
}];
const mediaCoverage = [{
  logo: 'VOGUE',
  quote: 'La marca que está redefiniendo el lujo moderno con un enfoque consciente.',
  author: 'Editora de Belleza'
}, {
  logo: 'ELLE',
  quote: 'Sus fragancias no son solo aromas, son experiencias emocionales completas.',
  author: 'Directora de Estilo'
}, {
  logo: 'BAZAAR',
  quote: 'El nuevo estándar de oro en personalización de belleza.',
  author: 'Beauty Report'
}];
export function PressPage() {
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-24">
        <div className="container-custom text-center">
          <motion.span initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="text-rose-400 font-bold tracking-widest uppercase text-sm mb-4 block">
            Sala de Prensa
          </motion.span>
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="font-serif text-5xl md:text-6xl font-bold mb-8">
            Noticias & Medios
          </motion.h1>
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="champagne" leftIcon={<Download className="w-4 h-4" />}>
              Descargar Press Kit
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10" leftIcon={<Mail className="w-4 h-4" />}>
              Contacto de Prensa
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Featured In */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container-custom py-12">
          <p className="text-center text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
            Visto En
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale">
            {['VOGUE', 'ELLE', "HARPER'S BAZAAR", 'COSMOPOLITAN', 'VANITY FAIR'].map(brand => <span key={brand} className="font-serif text-2xl md:text-3xl font-bold text-gray-800">
                {brand}
              </span>)}
          </div>
        </div>
      </div>

      <div className="container-custom py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Press Releases */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">
              Notas de Prensa Recientes
            </h2>
            <div className="space-y-8">
              {pressReleases.map((item, idx) => <motion.div key={idx} initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: idx * 0.1
            }} className="group border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-500">{item.date}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                    <a href="#">{item.title}</a>
                  </h3>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <a href="#" className="inline-flex items-center text-sm font-bold text-rose-600 hover:text-rose-700">
                    Leer nota completa <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </motion.div>)}
            </div>
          </div>

          {/* Media Coverage */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">
              Lo que dicen de nosotros
            </h2>
            <div className="space-y-6">
              {mediaCoverage.map((item, idx) => <motion.div key={idx} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: idx * 0.1
            }} className="bg-rose-50 p-8 rounded-2xl relative">
                  <span className="text-4xl text-rose-300 absolute top-4 left-4 font-serif">
                    "
                  </span>
                  <p className="text-gray-800 font-medium italic mb-6 relative z-10">
                    {item.quote}
                  </p>
                  <div className="flex items-center justify-between border-t border-rose-100 pt-4">
                    <span className="font-serif font-bold text-gray-900">
                      {item.logo}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {item.author}
                    </span>
                  </div>
                </motion.div>)}
            </div>

            {/* Contact Box */}
            <div className="mt-12 bg-gray-900 text-white p-8 rounded-2xl text-center">
              <h3 className="font-serif text-xl font-bold mb-4">
                ¿Eres periodista?
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                Para solicitudes de entrevistas, imágenes de alta resolución o
                muestras de productos.
              </p>
              <a href="mailto:press@rosesecret.com" className="text-rose-400 font-bold hover:text-rose-300 underline">
                press@rosesecret.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>;
}