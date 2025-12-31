import { useEffect, useRef } from 'react';
interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}
interface SwipeOptions {
  threshold?: number;
  preventDefault?: boolean;
}
export function useSwipeGestures(handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const {
    threshold = 50,
    preventDefault = false
  } = options;
  const touchStart = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const touchEnd = useRef<{
    x: number;
    y: number;
  } | null>(null);
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchEnd.current = null;
      touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };
    };
    const handleTouchMove = (e: TouchEvent) => {
      touchEnd.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };
      if (preventDefault && touchStart.current) {
        const xDiff = touchStart.current.x - e.targetTouches[0].clientX;
        const yDiff = touchStart.current.y - e.targetTouches[0].clientY;

        // If horizontal swipe is dominant, prevent default (scrolling)
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          e.preventDefault();
        }
      }
    };
    const handleTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;
      const xDiff = touchStart.current.x - touchEnd.current.x;
      const yDiff = touchStart.current.y - touchEnd.current.y;
      const absXDiff = Math.abs(xDiff);
      const absYDiff = Math.abs(yDiff);
      if (absXDiff > absYDiff) {
        // Horizontal swipe
        if (absXDiff > threshold) {
          if (xDiff > 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          } else if (xDiff < 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          }
        }
      } else {
        // Vertical swipe
        if (absYDiff > threshold) {
          if (yDiff > 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          } else if (yDiff < 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          }
        }
      }

      // Reset
      touchStart.current = null;
      touchEnd.current = null;
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, {
      passive: !preventDefault
    });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold, preventDefault]);
}