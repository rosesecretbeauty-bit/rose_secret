import { useEffect, useCallback } from 'react';
export function useAccessibility() {
  // Trap focus within modal
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Manage focus on route change
  useEffect(() => {
    const handleRouteChange = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.focus();
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  return {
    trapFocus,
    announce
  };
}

// Skip to main content link
export function SkipToMain() {
  return <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-rose-600 focus:text-white focus:rounded-lg focus:shadow-lg">
      Skip to main content
    </a>;
}