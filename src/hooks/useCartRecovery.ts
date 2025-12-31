import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cartStorePersisted';
import { useToastStore } from '../stores/toastStore';
interface CartRecoveryOptions {
  showNotification?: boolean;
  minItems?: number;
  cooldownMinutes?: number;
}
export function useCartRecovery(options: CartRecoveryOptions = {}) {
  const {
    showNotification = true,
    minItems = 1,
    cooldownMinutes = 60
  } = options;
  const {
    items,
    getTotal
  } = useCartStore();
  const {
    addToast
  } = useToastStore();
  const [hasShownRecovery, setHasShownRecovery] = useState(false);
  useEffect(() => {
    // Check if we should show cart recovery notification
    const lastRecoveryTime = localStorage.getItem('rose-secret-last-cart-recovery');
    const now = Date.now();
    if (lastRecoveryTime) {
      const timeSinceLastRecovery = now - parseInt(lastRecoveryTime);
      const cooldownMs = cooldownMinutes * 60 * 1000;
      if (timeSinceLastRecovery < cooldownMs) {
        return;
      }
    }

    // Show recovery notification if cart has items and we haven't shown it yet
    if (showNotification && items.length >= minItems && !hasShownRecovery && !sessionStorage.getItem('cart-recovery-shown')) {
      setTimeout(() => {
        addToast({
          type: 'info',
          message: `Tienes ${items.length} ${items.length === 1 ? 'producto' : 'productos'} en tu carrito (${getTotal().toFixed(2)} USD)`,
          duration: 8000
        });
        setHasShownRecovery(true);
        sessionStorage.setItem('cart-recovery-shown', 'true');
        localStorage.setItem('rose-secret-last-cart-recovery', now.toString());
      }, 2000);
    }
  }, [items.length, showNotification, minItems, hasShownRecovery, addToast, getTotal, cooldownMinutes]);
  return {
    hasItems: items.length > 0,
    itemCount: items.length,
    total: getTotal()
  };
}