import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export function StyleQuizPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    label: string;
    image?: string;
  }[];
}
const questions: Question[] = [{
  id: 1,
  text: 'What is your primary skin concern?',
  options: [{
    id: 'hydration',
    label: 'Dryness & Hydration',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'
  }, {
    id: 'aging',
    label: 'Fine Lines & Aging',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'
  }, {
    id: 'acne',
    label: 'Blemishes & Acne',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
  }, {
    id: 'dullness',
    label: 'Dullness & Uneven Tone',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'
  }]
}, {
  id: 2,
  text: 'How would you describe your style?',
  options: [{
    id: 'classic',
    label: 'Classic & Timeless',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'
  }, {
    id: 'bold',
    label: 'Bold & Daring',
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400'
  }, {
    id: 'natural',
    label: 'Natural & Minimalist',
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400'
  }, {
    id: 'romantic',
    label: 'Soft & Romantic',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
  }]
}, {
  id: 3,
  text: "What's your preferred fragrance family?",
  options: [{
    id: 'floral',
    label: 'Floral',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
  }, {
    id: 'woody',
    label: 'Woody & Earthy',
    image: 'https://images.unsplash.com/photo-1585218356057-dc0e8d3558bb?w=400'
  }, {
    id: 'fresh',
    label: 'Fresh & Citrus',
    image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=400'
  }, {
    id: 'oriental',
    label: 'Spicy & Oriental',
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400'
  }]
}];
export function StyleQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 10 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);
  const handleAnswer = (optionId: string) => {
    setAnswers({
      ...answers,
      [questions[step].id]: optionId
    });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setShowResults(true);
      }, 1500);
    }
  };
  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  };
  // Get recommendations based on answers
  const recommendations = products.slice(0, 3);
  if (isLoadingProducts && !showResults) {
    return <div className="min-h-screen flex items-center justify-center">
      <PremiumLoader />
    </div>;
  }

  return <div className="min-h-screen bg-rose-50/30 py-12 md:py-20">
      <div className="container-custom max-w-4xl">
        <AnimatePresence mode="wait">
          {!showResults && !loading && <motion.div key="quiz" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }}>
              <div className="text-center mb-12">
                <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-2 block">
                  Personalized Beauty Profile
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Discover Your Perfect Match
                </h1>
                <div className="w-full max-w-md mx-auto bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-rose-600" initial={{
                width: 0
              }} animate={{
                width: `${(step + 1) / questions.length * 100}%`
              }} />
                </div>
                <p className="text-gray-500 mt-2 text-sm">
                  Question {step + 1} of {questions.length}
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-10">
                  {questions[step].text}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questions[step].options.map(option => <motion.button key={option.id} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => handleAnswer(option.id)} className="group relative overflow-hidden rounded-xl aspect-[4/3] text-left">
                      <div className="absolute inset-0">
                        <img src={option.image} alt={option.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <span className="text-white font-serif text-xl md:text-2xl font-bold text-center">
                          {option.label}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </motion.button>)}
                </div>
              </div>
            </motion.div>}

          {loading && <motion.div key="loading" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-6" />
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                Analyzing Your Profile
              </h2>
              <p className="text-gray-500">
                Curating your personalized collection...
              </p>
            </motion.div>}

          {showResults && <motion.div key="results" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="text-center">
              <div className="mb-12">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-rose-600" />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Your Curated Collection
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Based on your unique profile, we've selected these products to
                  enhance your natural beauty.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                {recommendations.map((product, index) => <motion.div key={product.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }}>
                    <ProductCard product={product} />
                  </motion.div>)}
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={resetQuiz} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
                <Button size="lg">Shop All Recommendations</Button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}