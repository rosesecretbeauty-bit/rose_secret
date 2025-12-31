import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, User, DollarSign, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export function GiftFinderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
const steps = [{
  id: 'recipient',
  question: '¿Para quién es el regalo?',
  options: [{
    id: 'partner',
    label: 'Pareja',
    icon: Heart
  }, {
    id: 'mother',
    label: 'Madre',
    icon: User
  }, {
    id: 'friend',
    label: 'Amiga',
    icon: User
  }, {
    id: 'self',
    label: 'Para Mí',
    icon: Sparkles
  }]
}, {
  id: 'occasion',
  question: '¿Cuál es la ocasión?',
  options: [{
    id: 'birthday',
    label: 'Cumpleaños',
    icon: '🎂'
  }, {
    id: 'anniversary',
    label: 'Aniversario',
    icon: '💍'
  }, {
    id: 'holiday',
    label: 'Navidad',
    icon: '🎄'
  }, {
    id: 'just-because',
    label: 'Porque sí',
    icon: '💝'
  }]
}, {
  id: 'budget',
  question: '¿Cuál es tu presupuesto?',
  options: [{
    id: 'low',
    label: '$50 - $100',
    icon: DollarSign
  }, {
    id: 'medium',
    label: '$100 - $200',
    icon: DollarSign
  }, {
    id: 'high',
    label: '$200+',
    icon: DollarSign
  }]
}];
export function GiftFinderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 8 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);
  const handleSelect = (optionId: string) => {
    setSelections({
      ...selections,
      [steps[currentStep].id]: optionId
    });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setShowResults(true);
      }, 2000);
    }
  };
  const resetFinder = () => {
    setCurrentStep(0);
    setSelections({});
    setShowResults(false);
  };
  if (isSearching) {
    return <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center">
        <motion.div animate={{
        scale: [1, 1.2, 1]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className="mb-8">
          <Gift className="w-20 h-20 text-rose-500" />
        </motion.div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Buscando el regalo perfecto...
        </h2>
        <p className="text-gray-500 mt-2">Analizando miles de combinaciones</p>
      </div>;
  }
  if (showResults) {
    return <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white py-12 border-b border-gray-100">
          <div className="container-custom text-center">
            <span className="text-rose-500 font-bold tracking-widest uppercase text-sm mb-4 block">
              Resultados
            </span>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              ¡Lo Encontramos!
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              Basado en tus respuestas, hemos seleccionado estos regalos que
              seguramente le encantarán.
            </p>
            <Button variant="outline" onClick={resetFinder}>
              Comenzar de nuevo
            </Button>
          </div>
        </div>

        <div className="container-custom py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product, idx) => <motion.div key={product.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }}>
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                    {idx === 0 ? 'Mejor Opción' : 'Alternativa Excelente'}
                  </div>
                  <ProductCard product={product} />
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>;
  }
  const stepData = steps[currentStep];
  return <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Progress */}
          <div className="flex justify-between mb-8 px-2">
            {steps.map((s, idx) => <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${idx <= currentStep ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {idx === 0 ? 'Persona' : idx === 1 ? 'Ocasión' : 'Presupuesto'}
                </span>
              </div>)}
          </div>

          <motion.div key={currentStep} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-3xl p-8 md:p-12 shadow-premium-lg text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              {stepData.question}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {stepData.options.map(option => <button key={option.id} onClick={() => handleSelect(option.id)} className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-rose-500 hover:bg-rose-50 transition-all flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center text-3xl transition-colors shadow-sm">
                    {typeof option.icon === 'string' ? option.icon : <option.icon className="w-8 h-8 text-gray-600 group-hover:text-rose-600" />}
                  </div>
                  <span className="font-bold text-gray-900 group-hover:text-rose-700">
                    {option.label}
                  </span>
                </button>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}