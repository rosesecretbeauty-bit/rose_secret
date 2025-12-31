import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics/analyticsClient';

export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    // Track page view with new analytics system
    trackPageView(location.pathname, {
      title: document.title,
      search: location.search,
    });

    // Update document title based on route
    const pageTitles: Record<string, string> = {
      '/': 'Rose Secret - El poder de consentirte',
      '/shop': 'Tienda - Rose Secret',
      '/blog': 'Blog & Tendencias - Rose Secret',
      '/ai-shopper': 'AI Personal Shopper - Rose Secret',
      '/social-shopping': 'Social Shopping - Rose Secret',
      '/style-dna': 'Style DNA - Rose Secret',
      '/expert-consultation': 'Consulta con Expertos - Rose Secret',
      '/gift-finder': 'Buscador de Regalos - Rose Secret',
      '/occasions': 'Comprar por Ocasión - Rose Secret',
      '/sustainability': 'Sostenibilidad - Rose Secret',
      '/press': 'Prensa - Rose Secret',
      '/partnerships': 'Colaboraciones - Rose Secret'
    };
    const title = pageTitles[location.pathname] || 'Rose Secret';
    document.title = title;

    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
}