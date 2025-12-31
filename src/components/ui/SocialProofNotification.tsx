import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
interface Notification {
  id: number;
  name: string;
  action: string;
  product: string;
  time: string;
  image: string;
}
const notifications: Notification[] = [{
  id: 1,
  name: 'Sarah from New York',
  action: 'purchased',
  product: 'Rose Éternelle Eau de Parfum',
  time: '2 minutes ago',
  image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&q=80'
}, {
  id: 2,
  name: 'Emily from London',
  action: 'added to wishlist',
  product: 'Velvet Matte Lipstick',
  time: 'Just now',
  image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100&q=80'
}, {
  id: 3,
  name: 'Jessica from Paris',
  action: 'purchased',
  product: 'Silk Charmeuse Gown',
  time: '5 minutes ago',
  image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=100&q=80'
}, {
  id: 4,
  name: 'Michael from Toronto',
  action: 'reviewed',
  product: 'Luminous Foundation',
  time: '1 minute ago',
  image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=100&q=80'
}];
export function SocialProofNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotif, setCurrentNotif] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  useEffect(() => {
    if (isDismissed) return;
    // Initial delay
    const initialTimer = setTimeout(() => setIsVisible(true), 12000);
    // Cycle notifications
    const cycleInterval = setInterval(() => {
      if (isDismissed) return;
      setIsVisible(false);
      setTimeout(() => {
        setCurrentNotif(prev => (prev + 1) % notifications.length);
        if (!isDismissed) setIsVisible(true);
      }, 1000); // Wait for exit animation
    }, 20000); // Show every 20 seconds
    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [isDismissed]);
  const notification = notifications[currentNotif];
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };
  return <AnimatePresence>
      {isVisible && !isDismissed && <motion.div initial={{
      opacity: 0,
      y: 50,
      x: -20
    }} animate={{
      opacity: 1,
      y: 0,
      x: 0
    }} exit={{
      opacity: 0,
      y: 50,
      x: -20
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30
    }} className="fixed bottom-24 left-6 z-[60] max-w-sm w-full hidden md:block">
          
        </motion.div>}
    </AnimatePresence>;
}