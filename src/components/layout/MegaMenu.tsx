import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Video, Camera, Gift, ArrowRight, TrendingUp, Clock, Brain, BookOpen, Users, Palette, MessageCircle } from 'lucide-react';
interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
export function MegaMenu({
  isOpen,
  onClose
}: MegaMenuProps) {
  const categories = [{
    title: 'Fragancias',
    items: [{
      name: 'Perfumes de Mujer',
      path: '/shop?category=perfumes&gender=women'
    }, {
      name: 'Perfumes de Hombre',
      path: '/shop?category=perfumes&gender=men'
    }, {
      name: 'Unisex / Nicho',
      path: '/shop?category=perfumes&type=niche'
    }, {
      name: 'Sets de Regalo',
      path: '/shop?category=sets'
    }, {
      name: 'Novedades',
      path: '/new-arrivals'
    }, {
      name: 'Best Sellers',
      path: '/best-sellers'
    }],
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80'
  }, {
    title: 'Cosmética',
    items: [{
      name: 'Cuidado Facial',
      path: '/shop?category=skincare'
    }, {
      name: 'Maquillaje',
      path: '/shop?category=makeup'
    }, {
      name: 'Cuidado Corporal',
      path: '/shop?category=body'
    }, {
      name: 'Cabello',
      path: '/shop?category=hair'
    }, {
      name: 'Herramientas',
      path: '/shop?category=tools'
    }, {
      name: 'Marcas Premium',
      path: '/brands'
    }],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=400&q=80'
  }, {
    title: 'Experiencias Únicas',
    items: [{
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
      name: 'Consulta con Expertos',
      path: '/expert-consultation',
      icon: MessageCircle
    }, {
      name: 'Diario de Aromas',
      path: '/scent-journal',
      icon: BookOpen
    }],
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80'
  }, {
    title: 'Descubre',
    items: [{
      name: 'Blog & Tendencias',
      path: '/blog',
      icon: BookOpen
    }, {
      name: 'Beauty Academy',
      path: '/academy'
    }, {
      name: 'Fragrance Layering',
      path: '/fragrance-layering'
    }, {
      name: 'Bundle Builder',
      path: '/bundle-builder'
    }, {
      name: 'Lookbooks',
      path: '/lookbooks'
    }, {
      name: 'Historias de Clientes',
      path: '/customer-stories'
    }],
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80'
  }];
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="fixed inset-0 top-[80px] bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

          {/* MegaMenu Dropdown */}
          <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -10
      }} transition={{
        duration: 0.2
      }} className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-premium-lg z-50" onMouseLeave={onClose}>
            <div className="container-custom py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Categories Columns */}
                <div className="col-span-9 grid grid-cols-4 gap-6">
                  {categories.map(category => <div key={category.title} className="group">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-serif text-base font-bold text-gray-900">
                          {category.title}
                        </h3>
                        <ArrowRight className="h-3.5 w-3.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                      </div>

                      <ul className="space-y-2">
                        {category.items.map(item => <li key={item.name}>
                            <Link to={item.path} onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors py-1 group/item">
                              {item.icon && <item.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                              <span className="group-hover/item:translate-x-0.5 transition-transform">
                                {item.name}
                              </span>
                            </Link>
                          </li>)}
                      </ul>
                    </div>)}
                </div>

                {/* Featured / Offers Column */}
                <div className="col-span-3 border-l border-gray-100 pl-8">
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-rose-500" />
                    Destacados
                  </h3>

                  <div className="space-y-4">
                    <Link to="/sale" onClick={onClose} className="block p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          OFERTA
                        </span>
                        <Clock className="h-4 w-4 text-rose-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">
                        Flash Sale
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Hasta 40% dto. en perfumes seleccionados
                      </p>
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver Ofertas <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>

                    <Link to="/gift-finder" onClick={onClose} className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">
                            Buscador de Regalos
                          </h4>
                          <p className="text-xs text-gray-600">
                            Encuentra el regalo perfecto
                          </p>
                        </div>
                      </div>
                    </Link>

                    <Link to="/occasions" onClick={onClose} className="block p-4 border border-gray-200 rounded-xl hover:border-rose-200 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-rose-50 transition-colors">
                          <Gift className="h-4 w-4 text-gray-600 group-hover:text-rose-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">
                            Comprar por Ocasión
                          </h4>
                          <p className="text-xs text-gray-500">
                            San Valentín, Navidad...
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}