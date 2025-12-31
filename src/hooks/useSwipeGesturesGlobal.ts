import { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
export const useSwipeGesturesGlobal = () => {
  const navigate = useNavigate();
  const {
    openCart,
    closeCart,
    isOpen: isCartOpen
  } = useCartStore();

  // Global swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: eventData => {
      // If cart is closed and we swipe left near the right edge, open cart
      if (!isCartOpen && eventData.initial[0] > window.innerWidth - 50) {
        openCart();
      }
    },
    onSwipedRight: eventData => {
      // If cart is open, close it
      if (isCartOpen) {
        closeCart();
      } else if (eventData.initial[0] < 50) {
        // If swiping from left edge, go back
        navigate(-1);
      }
    },
    trackMouse: false,
    // Only touch gestures
    preventScrollOnSwipe: false
  });
  return handlers;
};