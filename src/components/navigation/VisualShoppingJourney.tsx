import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Sparkles, ChevronRight, Check, ChevronDown } from 'lucide-react';
import { analyticsManager } from '../../utils/advancedAnalytics';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useScrollDirection } from '../../hooks/useScrollDirection';
interface JourneyStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  completed: boolean;
  current: boolean;
  suggested: boolean;
  description?: string;
}
export function VisualShoppingJourney() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [showJourney, setShowJourney] = useState(true);
  const scrollDirection = useScrollDirection();
  const {
    scrollY
  } = useScroll();
  const cartItems = useCartStore(state => state.items);
  const wishlistItems = useWishlistStore(state => state.items);
  // Calculate if header is hidden
  const shouldHideHeader = scrollDirection === 'down' && scrollY.get() > 150;
  // Generate journey steps based on user behavior
  useEffect(() => {
    const behavior = analyticsManager.getUserBehavior();
    const visitedPages = behavior.journey.map(j => j.page);
    const allSteps: JourneyStep[] = [{
      id: 'home',
      icon: <Home className="w-4 h-4" />,
      label: 'Inicio',
      path: '/',
      completed: visitedPages.includes('/'),
      current: location.pathname === '/',
      suggested: false,
      description: 'Descubre nuestras experiencias únicas'
    }, {
      id: 'discover',
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Descubrir',
      path: '/shop',
      completed: visitedPages.includes('/shop') || visitedPages.some(p => p.includes('/product/')),
      current: location.pathname === '/shop' || location.pathname.includes('/product/'),
      suggested: !visitedPages.includes('/shop') && visitedPages.includes('/'),
      description: 'Explora nuestra colección'
    }, {
      id: 'wishlist',
      icon: <Heart className="w-4 h-4" />,
      label: 'Favoritos',
      path: '/wishlist',
      completed: wishlistItems.length > 0,
      current: location.pathname === '/wishlist',
      suggested: visitedPages.some(p => p.includes('/product/')) && wishlistItems.length === 0,
      description: `${wishlistItems.length} productos guardados`
    }, {
      id: 'cart',
      icon: <ShoppingBag className="w-4 h-4" />,
      label: 'Carrito',
      path: '/cart',
      completed: cartItems.length > 0,
      current: location.pathname === '/cart',
      suggested: wishlistItems.length > 0 && cartItems.length === 0,
      description: `${cartItems.length} productos`
    }, {
      id: 'checkout',
      icon: <Check className="w-4 h-4" />,
      label: 'Pagar',
      path: '/checkout',
      completed: false,
      current: location.pathname === '/checkout',
      suggested: cartItems.length > 0 && location.pathname !== '/checkout',
      description: 'Finaliza tu compra'
    }];
    setJourneySteps(allSteps);
  }, [location.pathname, cartItems.length, wishlistItems.length]);
  // Auto-hide on certain pages
  useEffect(() => {
    const hideOnPages = ['/admin', '/pos', '/login', '/register', '/checkout'];
    const shouldHide = hideOnPages.some(page => location.pathname.startsWith(page));
    setShowJourney(!shouldHide);
  }, [location.pathname]);
  if (!showJourney) return null;
  const completedSteps = journeySteps.filter(step => step.completed).length;
  const totalSteps = journeySteps.length;
  const progress = completedSteps / totalSteps * 100;
  return <>
      {/* Compact View - Synced with Header */}
      

      {/* Expanded View - Detailed Journey */}
      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="fixed top-32 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-premium">
            <div className="container-custom py-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6 text-center">
                  Tu Recorrido de Compra
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {journeySteps.map((step, index) => <Link key={step.id} to={step.path} onClick={() => setIsExpanded(false)} className={`
                        relative group p-6 rounded-2xl border-2 transition-all duration-300
                        ${step.completed ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 shadow-sm' : step.current ? 'bg-white border-rose-500 shadow-lg ring-4 ring-rose-100' : step.suggested ? 'bg-purple-50 border-purple-300 animate-pulse' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}
                      `}>
                      {/* Step Number */}
                      <div className={`
                        absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${step.completed ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : step.current ? 'bg-rose-500 text-white' : 'bg-gray-300 text-gray-600'}
                      `}>
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto
                        ${step.completed ? 'bg-white text-rose-600' : step.current ? 'bg-rose-100 text-rose-600' : step.suggested ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}
                      `}>
                        {step.completed ? <Check className="w-6 h-6" /> : step.icon}
                      </div>

                      {/* Label */}
                      <h4 className="font-bold text-gray-900 text-center mb-2">
                        {step.label}
                      </h4>

                      {/* Description */}
                      {step.description && <p className="text-sm text-gray-600 text-center">
                          {step.description}
                        </p>}

                      {/* Status Badge */}
                      {step.suggested && <div className="mt-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Sugerido
                          </span>
                        </div>}

                      {/* Connector Arrow */}
                      {index < journeySteps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                          <ChevronRight className={`
                            w-6 h-6
                            ${step.completed ? 'text-rose-400' : 'text-gray-300'}
                          `} />
                        </div>}
                    </Link>)}
                </div>

                {/* Suggestions */}
                {journeySteps.some(step => step.suggested) && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Siguiente Paso Sugerido
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Basado en tu navegación, te recomendamos continuar con
                          estos pasos para completar tu experiencia de compra.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {journeySteps.filter(step => step.suggested).map(step => <Link key={step.id} to={step.path} onClick={() => setIsExpanded(false)} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors text-sm font-semibold text-gray-900">
                                {step.icon}
                                {step.label}
                                <ChevronRight className="w-4 h-4" />
                              </Link>)}
                        </div>
                      </div>
                    </div>
                  </motion.div>}
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Overlay when expanded */}
      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setIsExpanded(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20" />}
      </AnimatePresence>
    </>;
}