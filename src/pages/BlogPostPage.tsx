import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, MessageCircle, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
// Mock data for a single post
const post = {
  id: 1,
  title: 'El Arte de Elegir tu Fragancia Personal',
  subtitle: 'Una guía completa para descubrir las notas olfativas que mejor se adaptan a tu personalidad y estilo de vida.',
  category: 'Guía de Fragancias',
  author: {
    name: 'Isabella Rose',
    role: 'Perfume Expert',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
  },
  date: '15 Oct 2023',
  readTime: '8 min',
  image: 'https://images.unsplash.com/photo-1595867275517-2c1a821b9b77?w=1200&q=80',
  content: `
    <p class="lead">Elegir un perfume es mucho más que seleccionar un aroma agradable; es una extensión de tu personalidad, una firma invisible que dejas en cada habitación.</p>
    
    <p>Las fragancias tienen el poder único de evocar recuerdos, cambiar nuestro estado de ánimo y comunicar quiénes somos sin decir una palabra. En esta guía, exploraremos cómo navegar por el complejo mundo de la perfumería para encontrar esa esencia que se siente verdaderamente "tuya".</p>

    <h2>Entendiendo las Familias Olfativas</h2>
    <p>El primer paso para encontrar tu fragancia ideal es comprender las familias olfativas principales. Al igual que en la música o la pintura, los perfumes se agrupan por sus características dominantes:</p>
    
    <ul>
      <li><strong>Florales:</strong> Románticos y femeninos, dominados por notas como rosa, jazmín o lirio.</li>
      <li><strong>Cítricos:</strong> Frescos y energizantes, con limón, bergamota o mandarina.</li>
      <li><strong>Orientales:</strong> Sensuales y cálidos, con vainilla, ámbar y especias exóticas.</li>
      <li><strong>Amaderados:</strong> Elegantes y misteriosos, con sándalo, cedro o vetiver.</li>
    </ul>

    <blockquote>"El perfume es la forma más intensa del recuerdo." - Jean-Paul Guerlain</blockquote>

    <h2>La Química de tu Piel</h2>
    <p>¿Alguna vez has notado cómo un perfume huele diferente en ti que en tu mejor amiga? Esto se debe a la química única de tu piel. Factores como el pH, la dieta y el tipo de piel (seca o grasa) afectan cómo se desarrollan las notas de una fragancia.</p>
    
    <p>Por eso, la regla de oro es: <em>siempre prueba el perfume en tu piel</em>. No confíes solo en el papel secante. Rocía la fragancia en tu muñeca y espera al menos 30 minutos para que se revelen las notas de corazón y fondo.</p>
  `,
  relatedPosts: [{
    id: 2,
    title: 'Tendencias de Maquillaje para Otoño',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
    category: 'Tendencias'
  }, {
    id: 5,
    title: 'Layering: Cómo Mezclar Perfumes',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    category: 'Tips de Expertos'
  }]
};
export function BlogPostPage() {
  const {
    id
  } = useParams();
  const {
    scrollY
  } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  return <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <motion.div style={{
        scale: heroScale,
        opacity: heroOpacity
      }} className="absolute inset-0">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-custom text-center text-white">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }}>
              <Badge className="bg-white/20 backdrop-blur-md text-white border-none mb-6 hover:bg-white/30">
                {post.category}
              </Badge>
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
                {post.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 font-light">
                {post.subtitle}
              </p>

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border-2 border-white" />
                  <div className="text-left">
                    <p className="font-bold leading-none">{post.author.name}</p>
                    <p className="text-gray-300 text-xs">{post.author.role}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-custom py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar - Share & TOC */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-32 space-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Compartir
              </p>
              <div className="flex flex-col gap-3">
                <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-sky-50 hover:text-sky-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <Link to="/blog" className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Volver al Blog
          </Link>

          <article className="prose prose-lg prose-rose max-w-none font-serif">
            <div dangerouslySetInnerHTML={{
            __html: post.content
          }} />
          </article>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {['Perfumes', 'Guía', 'Estilo', 'Consejos'].map(tag => <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors">
                  #{tag}
                </span>)}
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-8 bg-rose-50 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <img src={post.author.avatar} alt={post.author.name} className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                Sobre {post.author.name}
              </h3>
              <p className="text-gray-600 mb-4">
                Experta en perfumería con más de 10 años de experiencia en la
                industria de lujo. Apasionada por ayudar a las personas a
                encontrar su firma olfativa única.
              </p>
              <Button variant="outline" size="sm">
                Ver más artículos
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" /> Comentarios (3)
            </h3>

            <div className="space-y-8 mb-12">
              {[{
              name: 'Elena G.',
              date: 'Hace 2 horas',
              text: '¡Me encantó este artículo! Justo estaba buscando consejos para elegir mi perfume de boda.'
            }, {
              name: 'Carlos M.',
              date: 'Hace 5 horas',
              text: 'Muy interesante la explicación sobre las familias olfativas. Nunca había entendido la diferencia entre oriental y amaderado.'
            }, {
              name: 'Sofia R.',
              date: 'Ayer',
              text: 'Gracias por los tips. ¿Podrían hacer un artículo sobre perfumes nicho?'
            }].map((comment, idx) => <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {comment.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">
                        {comment.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-gray-600">{comment.text}</p>
                    <button className="text-xs text-rose-600 font-medium mt-2 hover:underline">
                      Responder
                    </button>
                  </div>
                </div>)}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4">
                Deja un comentario
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input placeholder="Nombre" />
                <Input placeholder="Email" />
              </div>
              <Textarea placeholder="Escribe tu comentario aquí..." className="mb-4" />
              <Button>Publicar Comentario</Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Related */}
        <div className="lg:col-span-2">
          <div className="sticky top-32">
            <h3 className="font-serif font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              Artículos Relacionados
            </h3>
            <div className="space-y-6">
              {post.relatedPosts.map(related => <Link key={related.id} to={`/blog/${related.id}`} className="group block">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={related.image} alt={related.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {related.category}
                  </Badge>
                  <h4 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                </Link>)}
            </div>

            {/* Newsletter Widget */}
            <div className="mt-12 bg-rose-600 text-white p-6 rounded-xl text-center">
              <h4 className="font-serif font-bold text-xl mb-2">
                Rose Secret Club
              </h4>
              <p className="text-rose-100 text-sm mb-4">
                Suscríbete para recibir contenido exclusivo y ofertas.
              </p>
              <Input placeholder="Tu email" className="bg-white/10 border-white/20 text-white placeholder:text-rose-200 mb-3" />
              <Button variant="champagne" fullWidth size="sm">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}