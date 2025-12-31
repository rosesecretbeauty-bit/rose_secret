import React, { useEffect, useState, createElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Gift, Sparkles, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const {
    isAuthenticated
  } = useAuthStore();
  useEffect(() => {
    // Show only to non-authenticated users who haven't seen it
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!isAuthenticated && !hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  const steps = [{
    title: 'Welcome to Rose Secret',
    description: 'Discover a world of luxury fragrances and premium beauty curated just for you.',
    icon: Sparkles,
    color: 'bg-rose-100 text-rose-600'
  }, {
    title: 'Exclusive Rewards',
    description: 'Join our loyalty program to earn points on every purchase and unlock VIP perks.',
    icon: Gift,
    color: 'bg-purple-100 text-purple-600'
  }, {
    title: 'Personalized for You',
    description: 'Take our style quiz to find your perfect scent match and tailored recommendations.',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600'
  }];
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={handleClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div initial={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X className="h-5 w-5" />
            </button>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
              <motion.div className="h-full bg-rose-600" initial={{
            width: '0%'
          }} animate={{
            width: `${(step + 1) / steps.length * 100}%`
          }} transition={{
            duration: 0.3
          }} />
            </div>

            <div className="p-8 text-center">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{
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
            }} className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${steps[step].color}`}>
                    {createElement(steps[step].icon, {
                  className: 'h-10 w-10'
                })}
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                    {steps[step].title}
                  </h2>

                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {steps[step].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Skip
                </Button>
                <Button className="flex-1" onClick={handleNext}>
                  {step === steps.length - 1 ? 'Get Started' : 'Next'}
                  {step < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === step ? 'bg-rose-600' : 'bg-gray-200'}`} />)}
              </div>
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}