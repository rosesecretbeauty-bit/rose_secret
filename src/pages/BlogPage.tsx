import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Main Page Component ---
export function BlogPage() {
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-rose-50 pt-24 pb-32 border-b border-rose-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-100/50 to-transparent pointer-events-none" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-600">
              Rose Secret Editorial
            </span>
          </motion.div>

          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="font-serif text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Historias de <span className="text-rose-600 italic">Belleza</span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Explora el universo de la alta perfumería, descubre tendencias
            globales y aprende de nuestros expertos.
          </motion.p>
        </div>
      </div>

      {/* Empty State */}
      <div className="container-custom py-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3
        }} className="mb-8">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Blog en Construcción
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Estamos preparando contenido exclusivo para ti. Pronto podrás disfrutar de artículos sobre perfumería, belleza, tendencias y mucho más.
            </p>
            <div className="flex items-center justify-center gap-2 text-rose-600 mb-8">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Próximamente disponible</span>
            </div>
            <Link to="/">
              <Button size="lg" variant="outline">
                Volver al Inicio
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>;
}