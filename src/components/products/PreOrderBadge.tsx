import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
interface PreOrderBadgeProps {
  releaseDate: string;
  className?: string;
}
export function PreOrderBadge({
  releaseDate,
  className = ''
}: PreOrderBadgeProps) {
  return <motion.div initial={{
    opacity: 0,
    scale: 0.9
  }} animate={{
    opacity: 1,
    scale: 1
  }} className={`inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-200 ${className}`}>
      <Clock className="h-3 w-3" />
      <span>Pre-Order • Ships {releaseDate}</span>
    </motion.div>;
}