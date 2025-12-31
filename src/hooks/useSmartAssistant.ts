import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { analyticsManager } from '../utils/advancedAnalytics';

// Smart Shopping Assistant Hook
// Analyzes user behavior and provides contextual recommendations

interface AssistantSuggestion {
  id: string;
  type: 'product' | 'bundle' | 'discount' | 'tip' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  expiresAt?: number;
}
interface UserContext {
  currentPage: string;
  cartValue: number;
  cartItemCount: number;
  wishlistCount: number;
  timeOnSite: number;
  pagesVisited: number;
  lastPurchaseDate?: number;
  browsingHistory: string[];
  searchHistory: string[];
}
export function useSmartAssistant() {
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [userContext, setUserContext] = useState<UserContext>({
    currentPage: '',
    cartValue: 0,
    cartItemCount: 0,
    wishlistCount: 0,
    timeOnSite: 0,
    pagesVisited: 0,
    browsingHistory: [],
    searchHistory: []
  });
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  // Update user context
  useEffect(() => {
    const updateContext = () => {
      const behavior = analyticsManager.getUserBehavior();
      setUserContext({
        currentPage: window.location.pathname,
        cartValue: cartStore.total,
        cartItemCount: cartStore.items.length,
        wishlistCount: wishlistStore.items.length,
        timeOnSite: behavior.timeOnSite,
        pagesVisited: behavior.pagesVisited,
        browsingHistory: behavior.journey.map(j => j.page).slice(-10),
        searchHistory: behavior.interactions.filter(i => i.type === 'search').map(i => i.metadata?.query as string).filter(Boolean).slice(-5)
      });
    };
    updateContext();
    const interval = setInterval(updateContext, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [cartStore.total, cartStore.items.length, wishlistStore.items.length]);

  // Generate smart suggestions based on context
  const generateSuggestions = useCallback(() => {
    const newSuggestions: AssistantSuggestion[] = [];

    // 1. Cart Abandonment Warning
    if (userContext.cartItemCount > 0 && userContext.timeOnSite > 300000) {
      // 5 minutes
      newSuggestions.push({
        id: 'cart-reminder',
        type: 'reminder',
        priority: 'high',
        title: '¡No olvides tu carrito!',
        message: `Tienes ${userContext.cartItemCount} productos esperando por ti. ¿Listo para finalizar tu compra?`,
        action: {
          label: 'Ir al Carrito',
          onClick: () => window.location.href = '/cart'
        },
        dismissible: true,
        expiresAt: Date.now() + 600000 // 10 minutes
      });
    }

    // 2. Free Shipping Threshold
    const freeShippingThreshold = 150;
    if (userContext.cartValue > 0 && userContext.cartValue < freeShippingThreshold) {
      const remaining = freeShippingThreshold - userContext.cartValue;
      newSuggestions.push({
        id: 'free-shipping',
        type: 'tip',
        priority: 'medium',
        title: '¡Envío gratis cerca!',
        message: `Añade $${remaining.toFixed(2)} más para obtener envío gratis`,
        action: {
          label: 'Ver Productos',
          onClick: () => window.location.href = '/shop'
        },
        dismissible: true
      });
    }

    // 3. Wishlist Reminder
    if (userContext.wishlistCount > 3 && userContext.cartItemCount === 0) {
      newSuggestions.push({
        id: 'wishlist-reminder',
        type: 'reminder',
        priority: 'low',
        title: 'Tu lista de deseos te espera',
        message: `Tienes ${userContext.wishlistCount} productos guardados. ¿Quieres revisarlos?`,
        action: {
          label: 'Ver Wishlist',
          onClick: () => window.location.href = '/wishlist'
        },
        dismissible: true
      });
    }

    // 4. Bundle Suggestion
    if (userContext.cartItemCount >= 2) {
      newSuggestions.push({
        id: 'bundle-suggestion',
        type: 'bundle',
        priority: 'medium',
        title: '💡 Crea un look completo',
        message: 'Combina tus productos seleccionados en un look curado y ahorra hasta 20%',
        action: {
          label: 'Ver Looks',
          onClick: () => window.location.href = '/complete-your-look'
        },
        dismissible: true
      });
    }

    // 5. First-time Visitor Welcome
    if (userContext.pagesVisited === 1 && userContext.timeOnSite < 60000) {
      newSuggestions.push({
        id: 'welcome',
        type: 'tip',
        priority: 'medium',
        title: '¡Bienvenido a Rose Secret! 🌹',
        message: 'Descubre nuestras experiencias únicas: AI Shopper, Virtual Try-On y más',
        action: {
          label: 'Explorar',
          onClick: () => window.location.href = '/#unique-experiences'
        },
        dismissible: true,
        expiresAt: Date.now() + 120000 // 2 minutes
      });
    }

    // 6. Loyalty Program Reminder
    if (userContext.cartValue > 100 && !localStorage.getItem('loyalty_enrolled')) {
      newSuggestions.push({
        id: 'loyalty-program',
        type: 'discount',
        priority: 'high',
        title: '🎁 Gana puntos con esta compra',
        message: 'Únete al programa de lealtad y obtén 500 puntos de bienvenida',
        action: {
          label: 'Unirse Ahora',
          onClick: () => window.location.href = '/loyalty'
        },
        dismissible: true
      });
    }

    // 7. Personalized Product Recommendation
    if (userContext.searchHistory.length > 0 && userContext.cartItemCount === 0) {
      const lastSearch = userContext.searchHistory[0];
      newSuggestions.push({
        id: 'search-recommendation',
        type: 'product',
        priority: 'medium',
        title: 'Basado en tu búsqueda',
        message: `Encontramos productos perfectos relacionados con "${lastSearch}"`,
        action: {
          label: 'Ver Resultados',
          onClick: () => window.location.href = `/search?q=${encodeURIComponent(lastSearch)}`
        },
        dismissible: true
      });
    }

    // 8. Time-sensitive Flash Sale
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && currentHour <= 20) {
      // 6 PM - 8 PM
      newSuggestions.push({
        id: 'flash-sale',
        type: 'discount',
        priority: 'urgent',
        title: '⚡ Flash Sale Activo',
        message: 'Hasta 30% de descuento en productos seleccionados. ¡Solo por 2 horas!',
        action: {
          label: 'Ver Ofertas',
          onClick: () => window.location.href = '/flash-sale'
        },
        dismissible: false,
        expiresAt: Date.now() + 7200000 // 2 hours
      });
    }

    // 9. AI Shopper Suggestion
    if (userContext.pagesVisited > 5 && userContext.cartItemCount === 0) {
      newSuggestions.push({
        id: 'ai-shopper',
        type: 'tip',
        priority: 'medium',
        title: '🤖 ¿Necesitas ayuda para decidir?',
        message: 'Nuestro AI Personal Shopper puede ayudarte a encontrar el producto perfecto',
        action: {
          label: 'Hablar con AI',
          onClick: () => window.location.href = '/ai-shopper'
        },
        dismissible: true
      });
    }

    // 10. Complete Your Look Suggestion
    if (userContext.currentPage.includes('/product/') && userContext.cartItemCount > 0) {
      newSuggestions.push({
        id: 'complete-look',
        type: 'bundle',
        priority: 'high',
        title: '✨ Completa tu look',
        message: 'Descubre productos que combinan perfectamente con tu selección',
        action: {
          label: 'Ver Combinaciones',
          onClick: () => window.location.href = '/complete-your-look'
        },
        dismissible: true
      });
    }

    // Filter expired suggestions
    const validSuggestions = newSuggestions.filter(s => !s.expiresAt || s.expiresAt > Date.now());

    // Sort by priority
    const priorityOrder = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3
    };
    validSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setSuggestions(validSuggestions.slice(0, 3)); // Show max 3 suggestions
  }, [userContext]);

  // Generate suggestions when context changes
  useEffect(() => {
    if (isActive) {
      generateSuggestions();
    }
  }, [isActive, generateSuggestions]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    localStorage.setItem(`dismissed_${id}`, Date.now().toString());
  }, []);

  // Toggle assistant
  const toggleAssistant = useCallback(() => {
    setIsActive(prev => !prev);
    localStorage.setItem('smart_assistant_active', (!isActive).toString());
  }, [isActive]);
  return {
    suggestions,
    isActive,
    userContext,
    dismissSuggestion,
    toggleAssistant
  };
}