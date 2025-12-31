import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Sparkles, Gift, BookOpen, Users, Camera, Brain, Palette, MessageCircle, TrendingUp, Star, Award, Heart, Package } from 'lucide-react';
export function SiteMap() {
  const siteStructure = [{
    category: 'Comprar',
    icon: ShoppingBag,
    links: [{
      name: 'Inicio',
      path: '/',
      icon: Home
    }, {
      name: 'Tienda',
      path: '/shop',
      icon: ShoppingBag
    }, {
      name: 'Novedades',
      path: '/new-arrivals',
      icon: Sparkles
    }, {
      name: 'Ofertas',
      path: '/sale',
      icon: TrendingUp
    }, {
      name: 'Best Sellers',
      path: '/best-sellers',
      icon: Star
    }, {
      name: 'Pre-Ordenes',
      path: '/pre-orders',
      icon: Package
    }]
  }, {
    category: 'Experiencias Únicas',
    icon: Sparkles,
    links: [{
      name: 'AI Personal Shopper',
      path: '/ai-shopper',
      icon: Brain
    }, {
      name: 'Social Shopping',
      path: '/social-shopping',
      icon: Users
    }, {
      name: 'Style DNA',
      path: '/style-dna',
      icon: Palette
    }, {
      name: 'Virtual Try-On',
      path: '/virtual-try-on',
      icon: Camera
    }, {
      name: 'Consulta Expertos',
      path: '/expert-consultation',
      icon: MessageCircle
    }, {
      name: 'Diario de Aromas',
      path: '/scent-journal',
      icon: BookOpen
    }]
  }, {
    category: 'Regalos',
    icon: Gift,
    links: [{
      name: 'Buscador de Regalos',
      path: '/gift-finder',
      icon: Sparkles
    }, {
      name: 'Comprar por Ocasión',
      path: '/occasions',
      icon: Gift
    }, {
      name: 'Tarjetas Regalo',
      path: '/gift-cards',
      icon: Award
    }, {
      name: 'Bundle Builder',
      path: '/bundle-builder',
      icon: Package
    }]
  }, {
    category: 'Descubre',
    icon: BookOpen,
    links: [{
      name: 'Blog & Tendencias',
      path: '/blog',
      icon: BookOpen
    }, {
      name: 'Beauty Academy',
      path: '/academy',
      icon: Award
    }, {
      name: 'Lookbooks',
      path: '/lookbooks',
      icon: Camera
    }, {
      name: 'Historias de Clientes',
      path: '/customer-stories',
      icon: Heart
    }, {
      name: 'Fragrance Layering',
      path: '/fragrance-layering',
      icon: Sparkles
    }]
  }];
  return <div className="bg-white min-h-screen py-20">
      <div className="container-custom">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mapa del Sitio
          </h1>
          <p className="text-gray-600 text-lg">
            Explora todas las secciones de Rose Secret
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {siteStructure.map((section, idx) => <motion.div key={section.category} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: idx * 0.1
        }} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <section.icon className="h-5 w-5 text-rose-600" />
                </div>
                <h2 className="font-serif text-xl font-bold text-gray-900">
                  {section.category}
                </h2>
              </div>

              <ul className="space-y-3">
                {section.links.map(link => <li key={link.path}>
                    <Link to={link.path} className="flex items-center gap-3 text-gray-600 hover:text-rose-600 transition-colors group">
                      <link.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.name}
                      </span>
                    </Link>
                  </li>)}
              </ul>
            </motion.div>)}
        </div>
      </div>
    </div>;
}