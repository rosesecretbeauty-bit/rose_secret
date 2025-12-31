import { useState, useEffect, useRef } from 'react';
interface UseImageLazyLoadProps {
  src: string;
  rootMargin?: string;
  threshold?: number;
}
export const useImageLazyLoad = ({
  src,
  rootMargin = '50px',
  threshold = 0.1
}: UseImageLazyLoadProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin,
      threshold
    });
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [rootMargin, threshold]);
  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
      };
    }
  }, [isInView, src]);
  return {
    imgRef,
    isLoaded,
    isInView
  };
};