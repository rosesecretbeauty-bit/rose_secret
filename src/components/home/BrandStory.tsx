import React, { memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
export function BrandStory() {
  const {
    scrollYProgress
  } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  return <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <motion.img style={{
              y
            }} src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1000&auto=format&fit=crop" alt="Perfume Creation" className="w-full h-[120%] object-cover -mt-[10%]" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-champagne-200 rounded-full blur-3xl opacity-50 -z-10" />

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4
          }} className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl max-w-xs z-20 hidden md:block">
              <p className="font-serif text-2xl font-bold text-rose-900 mb-1">
                100%
              </p>
              <p className="text-gray-600 text-sm">
                Ingredientes naturales de Grasse, Francia
              </p>
            </motion.div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }}>
            <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-4 block">
              Nuestra Historia
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              El arte de la perfumería <br />
              <span className="text-rose-500 italic">reimaginado</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              En Rose Secret, creemos que un perfume es más que una fragancia;
              es una memoria líquida, una emoción capturada en cristal.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Nuestros maestros perfumistas en Grasse combinan técnicas
              centenarias con una visión moderna para crear aromas que no solo
              huelen bien, sino que cuentan tu historia. Cada botella es una
              obra de arte, cada gota una promesa de elegancia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/about">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
                  Conoce más sobre nosotros
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="group">
                  Ver Colección
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}