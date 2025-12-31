import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useSearchStore } from '../stores/searchStore';
import { useWishlistStore } from '../stores/wishlistStore';
type ShortcutAction = () => void;
interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean; // Command key on Mac
  action: ShortcutAction;
  description: string;
}
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const {
    toggleCart,
    closeCart
  } = useCartStore();
  const {
    toggleSearch,
    closeSearch
  } = useSearchStore();
  // Assuming wishlist store might not have toggle, we navigate
  const [showHelper, setShowHelper] = useState(false);
  const shortcuts: ShortcutConfig[] = [{
    key: 'k',
    ctrlKey: true,
    action: (e?: Event) => {
      e?.preventDefault();
      toggleSearch();
    },
    description: 'Search products'
  }, {
    key: 'b',
    ctrlKey: true,
    action: (e?: Event) => {
      e?.preventDefault();
      toggleCart();
    },
    description: 'Toggle cart'
  }, {
    key: 'w',
    ctrlKey: true,
    action: (e?: Event) => {
      e?.preventDefault();
      navigate('/wishlist');
    },
    description: 'Go to wishlist'
  }, {
    key: 'h',
    ctrlKey: true,
    action: (e?: Event) => {
      e?.preventDefault();
      navigate('/');
    },
    description: 'Go to home'
  }, {
    key: 'Escape',
    action: () => {
      closeCart();
      closeSearch();
      setShowHelper(false);
    },
    description: 'Close modals'
  }, {
    key: '?',
    shiftKey: true,
    action: () => setShowHelper(prev => !prev),
    description: 'Show shortcuts help'
  }];
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        // Allow Escape to blur input
        if (event.key === 'Escape') {
          ;
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }
      const shortcut = shortcuts.find(s => {
        // Verificar que tanto s.key como event.key existan antes de comparar
        if (!s.key || !event.key) {
          return false;
        }
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!s.ctrlKey === (event.ctrlKey || event.metaKey); // Support Cmd on Mac
        const shiftMatch = !!s.shiftKey === event.shiftKey;
        const altMatch = !!s.altKey === event.altKey;
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });
      if (shortcut) {
        shortcut.action(event as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
  return {
    showHelper,
    setShowHelper,
    shortcuts
  };
};