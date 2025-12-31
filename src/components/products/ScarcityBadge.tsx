import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Package } from 'lucide-react';
interface ScarcityBadgeProps {
  type: 'stock' | 'time' | 'social';
  value?: number;
  threshold?: number;
  endTime?: Date;
}
export function ScarcityBadge({
  type,
  value = 0,
  threshold = 5,
  endTime
}: ScarcityBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (type === 'time' && endTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = endTime.getTime();
        const distance = end - now;
        if (distance < 0) {
          setTimeLeft('Oferta finalizada');
          clearInterval(interval);
          return;
        }
        const hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        const minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
        const seconds = Math.floor(distance % (1000 * 60) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type, endTime]);
  if (type === 'stock' && value > threshold) return null;
  const configs = {
    stock: {
      icon: Package,
      text: `Solo quedan ${value} unidades`,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-900',
      bgColor: 'bg-orange-50'
    },
    time: {
      icon: Clock,
      text: `Termina en ${timeLeft}`,
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-900',
      bgColor: 'bg-rose-50'
    },
    social: {
      icon: Users,
      text: `${value} personas viendo esto`,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-50'
    }
  };
  const config = configs[type];
  return <motion.div initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20
  }} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${config.bgColor} border border-current/20`}>
      <motion.div animate={{
      scale: [1, 1.2, 1]
    }} transition={{
      duration: 2,
      repeat: Infinity
    }} className={`p-1 rounded-full bg-gradient-to-br ${config.color}`}>
        <config.icon className="h-3 w-3 text-white" />
      </motion.div>
      <span className={`text-xs font-semibold ${config.textColor}`}>
        {config.text}
      </span>
    </motion.div>;
}