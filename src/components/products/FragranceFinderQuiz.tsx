import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { getProducts } from '../../api/products';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
interface FragranceFinderQuizProps {
  isOpen: boolean;
  onClose: () => void;
}
const questions = [{
  id: 'occasion',
  question: '¿Para qué ocasión buscas tu perfume?',
  options: [{
    value: 'daily',
    label: 'Uso diario',
    emoji: '☀️'
  }, {
    value: 'work',
    label: 'Trabajo / Oficina',
    emoji: '💼'
  }, {
    value: 'evening',
    label: 'Noche / Eventos',
    emoji: '🌙'
  }, {
    value: 'special',
    label: 'Ocasiones especiales',
    emoji: '✨'
  }]
}, {
  id: 'personality',
  question: '¿Cómo describirías tu personalidad?',
  options: [{
    value: 'romantic',
    label: 'Romántica y soñadora',
    emoji: '💕'
  }, {
    value: 'bold',
    label: 'Audaz y segura',
    emoji: '🔥'
  }, {
    value: 'elegant',
    label: 'Elegante y sofisticada',
    emoji: '👑'
  }, {
    value: 'fresh',
    label: 'Fresca y natural',
    emoji: '🌿'
  }]
}, {
  id: 'notes',
  question: '¿Qué tipo de aromas prefieres?',
  options: [{
    value: 'floral',
    label: 'Florales (rosa, jazmín)',
    emoji: '🌸'
  }, {
    value: 'oriental',
    label: 'Orientales (vainilla, ámbar)',
    emoji: '🌺'
  }, {
    value: 'woody',
    label: 'Amaderados (sándalo, cedro)',
    emoji: '🌲'
  }, {
    value: 'fresh',
    label: 'Frescos (cítricos, acuáticos)',
    emoji: '🍋'
  }]
}, {
  id: 'intensity',
  question: '¿Qué intensidad prefieres?',
  options: [{
    value: 'light',
    label: 'Ligera y sutil',
    emoji: '💨'
  }, {
    value: 'moderate',
    label: 'Moderada',
    emoji: '💫'
  }, {
    value: 'intense',
    label: 'Intensa y duradera',
    emoji: '⚡'
  }]
}, {
  id: 'season',
  question: '¿En qué estación lo usarás más?',
  options: [{
    value: 'spring',
    label: 'Primavera',
    emoji: '🌷'
  }, {
    value: 'summer',
    label: 'Verano',
    emoji: '☀️'
  }, {
    value: 'fall',
    label: 'Otoño',
    emoji: '🍂'
  }, {
    value: 'winter',
    label: 'Invierno',
    emoji: '❄️'
  }]
}];
export function FragranceFinderQuiz({
  isOpen,
  onClose
}: FragranceFinderQuizProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 20 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };
  // Get recommended products based on answers
  const getRecommendations = () => {
    // Filter by category if available, otherwise just take featured/bestseller products
    const perfumes = products.filter(p => {
      const category = typeof p.category === 'string' ? p.category.toLowerCase() : '';
      return category.includes('perfume') || category.includes('fragancia') || p.is_featured || p.is_bestseller;
    });
    // Simple recommendation logic - in real app would be more sophisticated
    return perfumes.slice(0, 4);
  };
  const recommendations = getRecommendations();
  const progress = (currentStep + 1) / questions.length * 100;
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6" />
                <h2 className="font-serif text-2xl font-bold">
                  Encuentra tu Fragancia
                </h2>
              </div>
              <p className="text-rose-100 text-sm">
                Responde algunas preguntas y descubre tu perfume ideal
              </p>

              {/* Progress bar */}
              {!showResults && <div className="mt-4">
                  <div className="flex justify-between text-xs text-rose-200 mb-1">
                    <span>
                      Pregunta {currentStep + 1} de {questions.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-rose-400/50 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-white rounded-full" initial={{
                width: 0
              }} animate={{
                width: `${progress}%`
              }} transition={{
                duration: 0.3
              }} />
                  </div>
                </div>}
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {!showResults ? <motion.div key={currentStep} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      {questions[currentStep].question}
                    </h3>

                    <div className="space-y-3">
                      {questions[currentStep].options.map(option => <button key={option.value} onClick={() => handleAnswer(questions[currentStep].id, option.value)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${answers[questions[currentStep].id] === option.value ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'}`}>
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                          {answers[questions[currentStep].id] === option.value && <Check className="h-5 w-5 text-rose-500 ml-auto" />}
                        </button>)}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                      <button onClick={handleBack} disabled={currentStep === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>
                    </div>
                  </motion.div> : <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                      ¡Tus Fragancias Ideales!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Basado en tus respuestas, te recomendamos:
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {recommendations.map(product => <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} className="group bg-gray-50 rounded-xl p-4 hover:bg-rose-50 transition-colors">
                          <div className="aspect-square rounded-lg overflow-hidden mb-3">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-rose-600 font-bold">
                            ${product.price}
                          </p>
                        </Link>)}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleReset} className="flex-1">
                        Volver a empezar
                      </Button>
                      <Link to="/shop?category=perfumes" onClick={onClose} className="flex-1">
                        <Button className="w-full">
                          Ver todos los perfumes
                        </Button>
                      </Link>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}