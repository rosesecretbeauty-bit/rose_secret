import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { Logo } from '../branding/Logo';
import { Button } from '../ui/Button';
import { useAppSetting } from '../../hooks/useAppSettings';
export function Footer() {
  const { value: platformName } = useAppSetting('platform_name');
  const { value: platformTagline } = useAppSetting('platform_tagline');
  const { value: contactEmail } = useAppSetting('contact_email');
  const { value: contactPhone } = useAppSetting('contact_phone');
  const { value: contactAddress } = useAppSetting('contact_address');
  const finalName = platformName || 'Rose Secret';
  const finalTagline = platformTagline || 'El poder de consentirte';
  const footerSections = [{
    title: 'Comprar',
    links: [{
      label: 'Tienda',
      path: '/shop'
    }, {
      label: 'Novedades',
      path: '/new-arrivals'
    }, {
      label: 'Ofertas',
      path: '/sale'
    }, {
      label: 'Best Sellers',
      path: '/best-sellers'
    }, {
      label: 'Tarjetas Regalo',
      path: '/gift-cards'
    }]
  }, {
    title: 'Experiencias',
    links: [{
      label: 'AI Personal Shopper',
      path: '/ai-shopper'
    }, {
      label: 'Social Shopping',
      path: '/social-shopping'
    }, {
      label: 'Style DNA',
      path: '/style-dna'
    }, {
      label: 'Virtual Try-On',
      path: '/virtual-try-on'
    }, {
      label: 'Consulta Expertos',
      path: '/expert-consultation'
    }]
  }, {
    title: 'Descubre',
    links: [{
      label: 'Blog',
      path: '/blog'
    }, {
      label: 'Beauty Academy',
      path: '/academy'
    }, {
      label: 'Lookbooks',
      path: '/lookbooks'
    }, {
      label: 'Historias de Clientes',
      path: '/customer-stories'
    }, {
      label: 'Sostenibilidad',
      path: '/sustainability'
    }]
  }, {
    title: 'Ayuda',
    links: [{
      label: 'Mi Cuenta',
      path: '/account'
    }, {
      label: 'Mis Pedidos',
      path: '/account/orders'
    }, {
      label: 'Rastrear Pedido',
      path: '/track-order'
    }, {
      label: 'FAQ',
      path: '/faq'
    }, {
      label: 'Contacto',
      path: '/contact'
    }]
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
  return <footer className="bg-gradient-to-b from-white to-rose-50/30 border-t border-stone-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="container-custom pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 relative z-10">
        {/* Newsletter Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20 bg-stone-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Únete a {finalName}
              </h3>
              <p className="text-white/80 text-base sm:text-lg font-light max-w-md">
                Suscríbete para recibir ofertas exclusivas, consejos de belleza
                y un 10% de descuento en tu primera compra.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input type="email" placeholder="Tu correo electrónico" className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500 backdrop-blur-sm" />
              <Button size="lg" className="bg-white text-stone-900 hover:bg-rose-50 border-none">
                Suscribirse <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
          {/* Brand Section */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" linkTo="/" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {finalName}
                  </h3>
                  <p className="text-xs text-stone-500 italic">
                    {finalTagline}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-stone-600 mb-6 sm:mb-8 leading-relaxed text-sm max-w-sm">
              Descubre nuestra selección exclusiva de cosméticos, perfumes y
              experiencias de belleza únicas. Tu destino para el lujo accesible
              y el cuidado personal.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <a href="mailto:hola@rosesecret.com" className="flex items-center gap-3 text-sm text-stone-600 hover:text-rose-600 transition-colors group">
                <div className="p-2 bg-white border border-stone-100 rounded-lg group-hover:border-rose-200 group-hover:bg-rose-50 transition-colors shadow-sm">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hola@rosesecret.com</span>
              </a>

              <a href="tel:+34900000000" className="flex items-center gap-3 text-sm text-stone-600 hover:text-rose-600 transition-colors group">
                <div className="p-2 bg-white border border-stone-100 rounded-lg group-hover:border-rose-200 group-hover:bg-rose-50 transition-colors shadow-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+34 900 000 000</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="p-2 bg-white border border-stone-100 rounded-lg shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Madrid, España</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => <motion.a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" initial={{
              opacity: 0,
              scale: 0
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} whileHover={{
              scale: 1.1,
              rotate: 5
            }} whileTap={{
              scale: 0.9
            }} className="p-3 bg-white border border-stone-100 hover:border-rose-200 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md" aria-label={social.label}>
                  <social.icon className="h-5 w-5" />
                </motion.a>)}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerSections.map((section, sectionIndex) => <motion.div key={section.title} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1 + sectionIndex * 0.1
        }}>
              <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 mb-4 sm:mb-6 relative inline-block">
                {section.title}
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-rose-300 rounded-full" />
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link, linkIndex) => <motion.li key={link.path} initial={{
              opacity: 0,
              x: -10
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: 0.2 + linkIndex * 0.05
            }}>
                    <Link to={link.path} className="text-sm text-stone-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1 group">
                      <span className="w-0 group-hover:w-1.5 h-1.5 bg-rose-400 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  </motion.li>)}
              </ul>
            </motion.div>)}
        </div>

        {/* Bottom Bar */}
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.4
        }} className="pt-6 sm:pt-8 border-t border-stone-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-sm text-stone-500 text-center md:text-left">
              © {new Date().getFullYear()} {finalName}. Todos los derechos
              reservados.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-stone-500">
              <Link to="/privacy" className="hover:text-rose-600 transition-colors">
                Privacidad
              </Link>
              <Link to="/terms" className="hover:text-rose-600 transition-colors">
                Términos
              </Link>
              <Link to="/cookies" className="hover:text-rose-600 transition-colors">
                Cookies
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white border border-stone-100 rounded-lg shadow-sm">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-[10px] sm:text-xs font-medium text-stone-600">
                  Pago Seguro
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4 sm:h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 sm:h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 sm:h-5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>;
}