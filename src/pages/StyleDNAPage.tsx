import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, RefreshCw, Share2, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getProducts } from '../api/products';
import { ProductCard } from '../components/products/ProductCard';
import { Product } from '../types';
// Quiz Questions
const questions = [{
  id: 1,
  question: '¿Cómo describirías tu estilo diario?',
  options: [{
    label: 'Minimalista & Chic',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'
  }, {
    label: 'Bohemio & Relajado',
    image: 'https://images.unsplash.com/photo-1524041255072-7da0525d6b34?w=400'
  }, {
    label: 'Clásico & Elegante',
    image: 'https://images.unsplash.com/photo-1548863255-363dd96c9f18?w=400'
  }, {
    label: 'Audaz & Moderno',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'
  }]
}, {
  id: 2,
  question: '¿Qué aroma te atrae más?',
  options: [{
    label: 'Flores Frescas',
    color: 'bg-pink-100'
  }, {
    label: 'Cítricos Vibrantes',
    color: 'bg-yellow-100'
  }, {
    label: 'Maderas Cálidas',
    color: 'bg-amber-100'
  }, {
    label: 'Vainilla Dulce',
    color: 'bg-orange-50'
  }]
}, {
  id: 3,
  question: '¿Cuál es tu ocasión favorita para arreglarte?',
  options: [{
    label: 'Cena Romántica',
    icon: '🍷'
  }, {
    label: 'Reunión de Trabajo',
    icon: '💼'
  }, {
    label: 'Brunch con Amigas',
    icon: '🥂'
  }, {
    label: 'Noche de Fiesta',
    icon: '💃'
  }]
}];
export function StyleDNAPage() {
  const [step, setStep] = useState(0); // 0 = Intro, 1-N = Questions, 99 = Results
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load products when results are shown
  useEffect(() => {
    async function loadProducts() {
      if (step === 99 && products.length === 0 && !isLoadingProducts) {
        setIsLoadingProducts(true);
        try {
          const data = await getProducts({ limit: 8 });
          setProducts(data.products);
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    }
    loadProducts();
  }, [step]);

  const handleStart = () => setStep(1);
  const handleAnswer = (answer: any) => {
    setAnswers({
      ...answers,
      [step]: answer
    });
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep(99);
      }, 2000);
    }
  };
  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setProducts([]);
  };
  // Intro Screen
  if (step === 0) {
    return <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="max-w-2xl w-full text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-premium-lg">
            <Sparkles className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu ADN de Estilo
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
            Descubre tu perfil único de belleza y fragancia. Analizaremos tus
            preferencias para crear una colección curada exclusivamente para ti.
          </p>
          <Button size="lg" onClick={handleStart} className="px-12 py-4 text-lg">
            Comenzar Análisis
          </Button>
          <p className="text-sm text-gray-400 mt-4">Toma menos de 2 minutos</p>
        </motion.div>
      </div>;
  }
  // Analysis Loading Screen
  if (isAnalyzing) {
    return <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }} className="w-full h-full border-4 border-rose-100 border-t-rose-600 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Analizando tu Perfil...
        </h2>
        <p className="text-gray-500">
          Conectando puntos de estilo y preferencias olfativas
        </p>
      </div>;
  }
  // Results Screen
  if (step === 99) {
    return <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gray-900 text-white py-12 px-4">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <span className="text-rose-400 font-bold tracking-widest text-sm uppercase mb-2 block">
                  Resultado del Análisis
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
                  Musa Romántica Moderna
                </h1>
                <p className="text-gray-400">
                  Tu estilo equilibra la elegancia clásica con toques
                  contemporáneos.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" leftIcon={<Share2 className="w-4 h-4" />}>
                  Compartir
                </Button>
                <Button variant="champagne" onClick={resetQuiz} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Repetir Test
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom -mt-8">
          {/* DNA Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-white rounded-2xl p-8 shadow-premium lg:col-span-1">
              <h3 className="font-serif font-bold text-xl mb-6">
                Tu Composición
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Elegancia</span>
                    <span className="text-rose-600 font-bold">85%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: '85%'
                  }} transition={{
                    duration: 1
                  }} className="h-full bg-rose-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Audacia</span>
                    <span className="text-purple-600 font-bold">45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: '45%'
                  }} transition={{
                    duration: 1,
                    delay: 0.2
                  }} className="h-full bg-purple-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Sensualidad</span>
                    <span className="text-pink-600 font-bold">70%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: '70%'
                  }} transition={{
                    duration: 1,
                    delay: 0.4
                  }} className="h-full bg-pink-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">
                  Notas Olfativas Clave
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Rosa Damascena', 'Pimienta Rosa', 'Vainilla', 'Ámbar'].map(note => <span key={note} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium">
                        {note}
                      </span>)}
                </div>
              </div>
            </motion.div>

            {/* Mood Board */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="bg-white rounded-2xl p-8 shadow-premium lg:col-span-2">
              <h3 className="font-serif font-bold text-xl mb-6">
                Tu Mood Board
              </h3>
              <div className="grid grid-cols-3 gap-4 h-64 md:h-80">
                <div className="col-span-2 row-span-2 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden bg-rose-100 flex items-center justify-center">
                  <span className="font-serif text-2xl text-rose-800 italic">
                    Chic
                  </span>
                </div>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed">
                Te atraen las texturas suaves, los colores atemporales y los
                detalles refinados. Tu estilo no grita, susurra confianza y
                sofisticación. Prefieres la calidad sobre la cantidad y buscas
                productos que cuenten una historia.
              </p>
            </motion.div>
          </div>

          {/* Recommendations */}
          <div className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Curado Para Ti
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {isLoadingProducts ? (
                <div className="col-span-4 text-center py-8 text-gray-500">Cargando productos...</div>
              ) : products.length > 0 ? (
                products.slice(0, 4).map((product, idx) => (
                  <motion.div key={product.id} initial={{
                    opacity: 0,
                    y: 20
                  }} whileInView={{
                    opacity: 1,
                    y: 0
                  }} viewport={{
                    once: true
                  }} transition={{
                    delay: idx * 0.1
                  }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-gray-500">No hay productos disponibles</div>
              )}
            </div>
          </div>
        </div>
      </div>;
  }
  // Question Screen
  const currentQuestion = questions[step - 1];
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200">
        <motion.div className="h-full bg-rose-600" initial={{
        width: `${(step - 1) / questions.length * 100}%`
      }} animate={{
        width: `${step / questions.length * 100}%`
      }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <motion.div key={step} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="text-center">
            <span className="text-rose-500 font-bold tracking-widest uppercase text-sm mb-4 block">
              Pregunta {step} de {questions.length}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {currentQuestion.options.map((option, idx) => <motion.button key={idx} whileHover={{
              scale: 1.03,
              borderColor: '#db7093'
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleAnswer(option)} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-premium border-2 border-transparent transition-all text-left h-full">
                  {option.image && <div className="h-48 overflow-hidden">
                      <img src={option.image} alt={option.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>}
                  {option.color && <div className={`h-32 ${option.color}`} />}
                  {option.icon && <div className="h-32 flex items-center justify-center text-6xl bg-gray-50">
                      {option.icon}
                    </div>}
                  <div className="p-6 flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      {option.label}
                    </span>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-rose-500 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.button>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}