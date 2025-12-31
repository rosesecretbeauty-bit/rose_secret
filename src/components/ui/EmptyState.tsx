import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { BoxIcon } from 'lucide-react';
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 ${className}`}>
      <div className="p-4 bg-rose-50 rounded-full mb-6">
        <Icon className="h-10 w-10 text-rose-400" />
      </div>
      <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-2">
        {title}
      </h3>
      <p className="text-charcoal-500 max-w-sm mb-8">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>}
    </motion.div>;
}