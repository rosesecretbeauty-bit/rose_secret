import { useEffect } from 'react';
import { useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
export function useScrollReveal(threshold = 0.1) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true
  });
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };
  return {
    ref,
    controls,
    variants
  };
}