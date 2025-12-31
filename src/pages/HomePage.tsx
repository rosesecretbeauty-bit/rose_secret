import React, { useEffect, useState, useRef, Component } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Camera, Sparkles, Play, Star, ShoppingBag, ShieldCheck, Truck, Heart, ChevronRight, ChevronLeft, Zap, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { getProducts } from '../api/products';
import { BrandStory } from '../components/home/BrandStory';
import { NewsletterSection } from '../components/newsletter/NewsletterSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { getCategories, Category } from '../api/categories';
import { Product } from '../types';
// --- Marketing Components ---
// SocialProofBanner removed - was using mock data
// FlashSaleTimer removido - ahora se usa FlashSaleBanner dinámico
// --- Hero Section ---
const Hero = () => {
  const {
    scrollY
  } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY = useTransform(scrollY, [0, 300], [0, 100]);
  // Mouse parallax effect
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const handleMouseMove = (e: React.MouseEvent) => {
    const {
      clientX,
      clientY
    } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setMousePosition({
      x: moveX,
      y: moveY
    });
  };
  return <section className="relative h-[90vh] sm:h-[95vh] min-h-[500px] sm:min-h-[600px] overflow-hidden bg-stone-900" onMouseMove={handleMouseMove}>
      {/* Background Video/Image */}
      <motion.div style={{
      y,
      opacity
    }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />

        <video autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000" className="w-full h-full object-cover opacity-90 scale-105">
          <source src="https://player.vimeo.com/external/494252666.sd.mp4?s=2650029b67484b068832525bd577531741270525&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
        </video>
      </motion.div>


      {/* Content */}
      <div className="relative z-20 container-custom h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div style={{
        y: textY
      }} initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="mb-6">
          <span className="inline-block py-1.5 px-4 border border-white/30 rounded-full text-white/90 text-xs uppercase tracking-[0.2em] backdrop-blur-sm bg-white/5">
            Colección 2024
          </span>
        </motion.div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-9xl text-white leading-tight mb-4 sm:mb-6 mix-blend-overlay tracking-tight">
          <motion.span initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }} className="block">
            Essence
          </motion.span>
          <motion.span initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }} className="block italic font-light text-rose-200">
            of Beauty
          </motion.span>
        </h1>

        <motion.p initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 1,
        delay: 0.8
      }} className="text-white/80 text-base sm:text-lg md:text-xl font-light max-w-xl leading-relaxed mb-6 sm:mb-8 md:mb-10 px-4">
          Una exploración sensorial donde la elegancia atemporal se encuentra
          con la innovación moderna.
        </motion.p>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 1
      }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/shop" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white text-stone-900 hover:bg-rose-50 hover:text-rose-900 border-none px-8 py-4 text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Explorar Colección
            </Button>
          </Link>
          <Link to="/style-quiz" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 hover:border-white px-8 py-4 text-base backdrop-blur-sm">
              <Play className="w-4 h-4 mr-2 fill-current" />
              Ver Film
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Floating Elements (Parallax) */}
      <motion.div className="absolute bottom-20 left-10 hidden lg:block pointer-events-none" animate={{
      x: mousePosition.x * -20,
      y: mousePosition.y * -20
    }} transition={{
      type: 'spring',
      damping: 50
    }}>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Nueva Fórmula</p>
              <p className="text-white/60 text-xs">98% Natural</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1,
      y: [0, 10, 0]
    }} transition={{
      delay: 2,
      duration: 2,
      repeat: Infinity
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest">Descubre</span>
        <ChevronRight className="w-4 h-4 rotate-90" />
      </motion.div>
    </section>;
};
// --- Categories Section ---
const CategoryCard = ({
  title,
  image,
  link,
  delay
}: {
  title: string;
  image: string;
  link: string;
  delay: number;
}) => {
  return <motion.div initial={{
    opacity: 0,
    y: 40
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    margin: '-50px'
  }} transition={{
    delay,
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1]
  }} whileHover={{
    y: -10
  }} className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-500">
      <Link to={link}>
        <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors z-10" />
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />

        <div className="absolute bottom-0 left-0 p-8 z-30 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h3 className="font-serif text-3xl text-white mb-2 italic group-hover:text-rose-200 transition-colors duration-300 translate-y-2 group-hover:translate-y-0">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span>Descubrir</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>;
};
// --- Experiences Section ---
const ExperienceCard = ({
  icon: Icon,
  title,
  desc,
  link,
  image,
  delay
}: any) => {
  return <motion.div initial={{
    opacity: 0,
    x: -20
  }} whileInView={{
    opacity: 1,
    x: 0
  }} viewport={{
    once: true
  }} transition={{
    delay,
    duration: 0.6
  }} className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 border border-stone-100 hover:border-rose-100">
      <div className="flex flex-col md:flex-row h-full">
        <div className="p-8 flex-1 flex flex-col justify-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-3 group-hover:text-rose-700 transition-colors">
              {title}
            </h3>
            <p className="text-stone-500 font-light mb-6 leading-relaxed">
              {desc}
            </p>
            <Link to={link}>
              <Button variant="outline" size="sm" className="group-hover:bg-rose-50 group-hover:border-rose-200 group-hover:text-rose-700 transition-all">
                Probar Ahora <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-rose-900/10 group-hover:bg-transparent transition-colors" />
        </div>
      </div>
    </motion.div>;
};
// --- Main HomePage Component ---
export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Cargar productos destacados desde API
  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 8 });
        // Transform API products to match frontend Product type
        const transformedProducts = data.products.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          images: p.image_url ? [p.image_url] : [],
          rating: p.rating || 0,
          reviews: p.reviews_count || 0,
          isNew: p.is_new || false,
          isBestSeller: p.is_bestseller || false,
          stock: p.stock || 0
        }));
        setFeaturedProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadFeaturedProducts();
  }, []);

  // Cargar categorías desde API
  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await getCategories();
        // Obtener solo categorías principales (sin parent_id) o las primeras 3
        const mainCategories = categoriesData
          .filter(cat => !cat.parent_id)
          .slice(0, 3);
        setCategories(mainCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  return <div className="bg-stone-50 selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden">
      <Hero />

      {/* Trust Badges - Marketing Psychology */}
      <div className="bg-white border-b border-stone-100 py-8 overflow-x-auto relative z-20 shadow-sm">
        <div className="container-custom flex justify-between gap-8 min-w-max md:min-w-0">
          {[{
          icon: Truck,
          text: 'Envío Gratis > $150',
          sub: 'Entrega en 24/48h'
        }, {
          icon: ShieldCheck,
          text: 'Garantía de Autenticidad',
          sub: 'Productos 100% originales'
        }, {
          icon: Clock,
          text: 'Devoluciones 30 Días',
          sub: 'Sin preguntas'
        }, {
          icon: Star,
          text: '4.9/5 Valoración Clientes',
          sub: 'Más de 10k reseñas'
        }].map((badge, idx) => <motion.div key={idx} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: idx * 0.1
        }} className="flex items-center gap-4 px-6 py-2 group cursor-default">
              <div className="p-3 bg-rose-50 rounded-full text-rose-600 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                <badge.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-sm font-bold text-stone-900 uppercase tracking-wide group-hover:text-rose-700 transition-colors">
                  {badge.text}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {badge.sub}
                </span>
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 lg:py-24 bg-stone-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-4">
            <div className="max-w-xl">
              <motion.span initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} className="text-rose-600 uppercase tracking-widest text-xs font-bold mb-3 block flex items-center gap-2">
                <span className="w-8 h-px bg-rose-600" /> Catálogo
              </motion.span>
              <motion.h2 initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: 0.1
            }} className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-tight">
                Curaduría Exclusiva
              </motion.h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-stone-900 hover:text-rose-600 transition-colors border-b border-stone-300 pb-1 hover:border-rose-600 group">
              Ver Todo{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {isLoadingCategories ? (
              // Skeleton loaders mientras cargan las categorías
              [0, 1, 2].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
              ))
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  title={category.name}
                  image={category.image_url || `https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80`}
                  link={`/category/${category.slug}`}
                  delay={index * 0.1}
                />
              ))
            ) : (
              // Fallback si no hay categorías
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p>No hay categorías disponibles</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/shop">
              <Button variant="outline" fullWidth>
                Ver Todo el Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white overflow-hidden relative">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-rose-600 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" /> Tendencias
                </span>
                {/* FlashSaleTimer removido - ahora se usa FlashSaleBanner dinámico en Header */}
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900">
                Los Más Deseados
              </h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-3 rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95" aria-label="Scroll left">
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              </button>
              <button onClick={() => scroll('right')} className="p-3 rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95" aria-label="Scroll right">
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-8 sm:pb-12 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory" style={{
          scrollBehavior: 'smooth'
        }}>
            {featuredProducts.map((product, index) => <motion.div key={product.id} className="min-w-[240px] sm:min-w-[280px] md:min-w-[320px] snap-start" initial={{
            opacity: 0,
            x: 50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <ProductCard product={product} />
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Innovation / Experiences */}
      <section className="py-12 sm:py-16 lg:py-24 bg-stone-50 relative">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-rose-600 uppercase tracking-widest text-xs font-bold mb-3 block">
              Innovación
            </motion.span>
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.1
          }} className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-4 sm:mb-6">
              Tecnología al servicio de tu Belleza
            </motion.h2>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.2
          }} className="text-stone-600 text-lg font-light leading-relaxed">
              Descubre experiencias personalizadas impulsadas por inteligencia
              artificial para encontrar exactamente lo que necesitas.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExperienceCard icon={Brain} title="AI Personal Shopper" desc="Nuestro algoritmo analiza tu estilo y preferencias para curar una selección única para ti." link="/ai-shopper" image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800" delay={0} />
            <ExperienceCard icon={Camera} title="Virtual Atelier" desc="Prueba nuestros productos en tiempo real con nuestra tecnología de realidad aumentada." link="/virtual-try-on" image="https://images.unsplash.com/photo-1522335789203-abd652327216?q=80&w=800" delay={0.2} />
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <BrandStory />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>;
}