import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingBag, Gift, Lightbulb, Bell, Zap } from 'lucide-react';
import { useSmartAssistant } from '../../hooks/useSmartAssistant';
import { Button } from '../ui/Button';
export function SmartAssistant() {
  const {
    suggestions,
    isActive,
    dismissSuggestion,
    toggleAssistant
  } = useSmartAssistant();
  if (!isActive || suggestions.length === 0) return null;
  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Sparkles className="w-5 h-5" />;
      case 'bundle':
        return <Gift className="w-5 h-5" />;
      case 'discount':
        return <Zap className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'reminder':
        return <Bell className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };
  const getColorClasses = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-500',
          border: 'border-red-200',
          text: 'text-white',
          icon: 'bg-white/20'
        };
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-rose-500 to-pink-500',
          border: 'border-rose-200',
          text: 'text-white',
          icon: 'bg-white/20'
        };
      case 'medium':
        return {
          bg: 'bg-white',
          border: 'border-purple-200',
          text: 'text-gray-900',
          icon: 'bg-purple-100 text-purple-600'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'bg-gray-100 text-gray-600'
        };
    }
  };
  return <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 max-w-sm">
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion, index) => {
        const colors = getColorClasses(suggestion.priority);
        return <motion.div key={suggestion.id} initial={{
          opacity: 0,
          y: 50,
          scale: 0.9
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: index * 0.1
          }
        }} exit={{
          opacity: 0,
          x: 100,
          scale: 0.8,
          transition: {
            duration: 0.2
          }
        }} className={`mb-3 ${colors.bg} ${colors.border} border-2 rounded-2xl shadow-premium overflow-hidden backdrop-blur-xl`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`${colors.icon} rounded-xl p-2 flex-shrink-0`}>
                    {getIcon(suggestion.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-bold text-sm ${colors.text}`}>
                        {suggestion.title}
                      </h4>

                      {suggestion.dismissible && <button onClick={() => dismissSuggestion(suggestion.id)} className={`${colors.text} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}>
                          <X className="w-4 h-4" />
                        </button>}
                    </div>

                    <p className={`text-sm ${colors.text} ${suggestion.priority === 'urgent' || suggestion.priority === 'high' ? 'opacity-90' : 'opacity-70'} mb-3`}>
                      {suggestion.message}
                    </p>

                    {/* Action Button */}
                    {suggestion.action && <button onClick={suggestion.action.onClick} className={`
                          text-sm font-semibold px-4 py-2 rounded-lg transition-all
                          ${suggestion.priority === 'urgent' || suggestion.priority === 'high' ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm' : 'bg-rose-500 hover:bg-rose-600 text-white'}
                        `}>
                        {suggestion.action.label}
                      </button>}
                  </div>
                </div>
              </div>

              {/* Priority Indicator */}
              {(suggestion.priority === 'urgent' || suggestion.priority === 'high') && <motion.div className="h-1 bg-white/30" initial={{
            width: '100%'
          }} animate={{
            width: '0%'
          }} transition={{
            duration: suggestion.expiresAt ? (suggestion.expiresAt - Date.now()) / 1000 : 300,
            ease: 'linear'
          }} />}
            </motion.div>;
      })}
      </AnimatePresence>

      {/* Assistant Toggle (Hidden for now, can be shown if needed) */}
      {/* <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={toggleAssistant}
          className="mt-4 w-full bg-white rounded-xl shadow-lg p-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          {isActive ? 'Pausar Asistente' : 'Activar Asistente'}
        </motion.button> */}
    </div>;
}