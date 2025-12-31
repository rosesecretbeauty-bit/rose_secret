import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Award, Users, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
export function AboutPage() {
  const {
    scrollY
  } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const values = [{
    icon: Heart,
    title: 'Pasión por la Belleza',
    description: 'Creemos que cada persona merece sentirse hermosa y confiada. Nuestra pasión es ayudarte a descubrir tu mejor versión.'
  }, {
    icon: Award,
    title: 'Calidad Premium',
    description: 'Solo trabajamos con las mejores marcas y productos. Cada artículo es cuidadosamente seleccionado por nuestro equipo de expertos.'
  }, {
    icon: Users,
    title: 'Comunidad',
    description: 'Más que una tienda, somos una comunidad de personas que comparten el amor por el cuidado personal y la belleza.'
  }, {
    icon: Sparkles,
    title: 'Innovación',
    description: 'Siempre buscamos las últimas tendencias y productos innovadores para ofrecerte lo mejor del mercado.'
  }];
  const team = [{
    name: 'María García',
    role: 'Fundadora & CEO',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Experta en belleza con 15 años de experiencia'
  }, {
    name: 'Ana Martínez',
    role: 'Directora de Producto',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Especialista en cosméticos y cuidado de la piel'
  }, {
    name: 'Laura Rodríguez',
    role: 'Directora de Marketing',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    bio: 'Creativa apasionada por las marcas de lujo'
  }];
  const milestones = [{
    year: '2020',
    event: 'Fundación de Rose Secret'
  }, {
    year: '2021',
    event: 'Alcanzamos 10,000 clientas felices'
  }, {
    year: '2022',
    event: 'Expansión a toda Europa'
  }, {
    year: '2023',
    event: 'Lanzamiento de línea propia'
  }, {
    year: '2024',
    event: 'Más de 100,000 productos vendidos'
  }];
  return <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-stone-900 py-32 overflow-hidden">
        <motion.div style={{
        y: y1
      }} className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2000" alt="Background" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 to-stone-900/90" />

        <div className="container-custom relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center max-w-3xl mx-auto">
            <span className="text-rose-300 uppercase tracking-widest text-sm font-bold mb-4 block">
              Nuestra Esencia
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              La Belleza es un{' '}
              <span className="text-rose-300 italic">Arte</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed font-light">
              Rose Secret nació de una pasión: hacer que cada mujer se sienta
              extraordinaria. Desde 2020, hemos estado curando los mejores
              productos de belleza y moda para ti.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.8
          }}>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
                Nuestra Misión
              </h2>
              <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
                <p>
                  En Rose Secret, creemos que el cuidado personal es un acto de
                  amor propio. Nuestra misión es proporcionar productos de la
                  más alta calidad que te ayuden a sentirte segura, hermosa y
                  empoderada cada día.
                </p>
                <p>
                  Trabajamos directamente con las mejores marcas del mundo para
                  traerte productos auténticos, innovadores y efectivos. Cada
                  producto en nuestra tienda ha sido probado y aprobado por
                  nuestro equipo de expertos.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.8
          }} className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop" alt="Rose Secret Store" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-stone-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

        <div className="container-custom relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Los principios que guían cada decisión que tomamos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => <motion.div key={value.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} whileHover={{
            y: -10
          }} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-premium transition-all duration-300 text-center border border-stone-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full mb-6 text-rose-600">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {value.description}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Conoce a las personas apasionadas detrás de Rose Secret
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {team.map((member, index) => <motion.div key={member.name} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow mx-auto">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-rose-600 font-medium mb-3 uppercase tracking-wide text-sm">
                  {member.role}
                </p>
                <p className="text-gray-600 font-light">{member.bio}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-stone-50 to-white">
        <div className="container-custom max-w-4xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Nuestro Camino
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Los hitos que nos han traído hasta aquí
            </p>
          </motion.div>

          <div className="relative border-l-2 border-rose-200 ml-6 md:ml-12 space-y-12">
            {milestones.map((milestone, index) => <motion.div key={milestone.year} initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="relative pl-12">
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-rose-500 border-4 border-white shadow-sm" />

                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                  <span className="text-3xl font-serif font-bold text-rose-600 md:w-32 flex-shrink-0">
                    {milestone.year}
                  </span>
                  <p className="text-lg text-gray-900 font-medium">
                    {milestone.event}
                  </p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="bg-stone-900 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <ShoppingBag className="h-16 w-16 mx-auto mb-8 text-rose-300" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Únete a Nuestra Comunidad
              </h2>
              <p className="text-xl mb-10 text-white/80 font-light leading-relaxed">
                Descubre productos excepcionales y forma parte de una comunidad
                que celebra la belleza en todas sus formas.
              </p>
              <Link to="/shop">
                <Button size="lg" className="bg-white text-stone-900 hover:bg-rose-50 border-none px-8 py-4 text-lg">
                  Explorar Productos <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>;
}