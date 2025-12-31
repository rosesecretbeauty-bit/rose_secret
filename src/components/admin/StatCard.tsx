import React from 'react';
import { motion } from 'framer-motion';
import { BoxIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: BoxIcon;
  color?: 'rose' | 'blue' | 'green' | 'purple';
}
export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'rose'
}: StatCardProps) {
  const colorClasses = {
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };
  const isPositive = change !== undefined && change >= 0;
  return <motion.div whileHover={{
    y: -4,
    scale: 1.02
  }} transition={{
    duration: 0.2
  }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-premium transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}
            {change}%
          </span>}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </motion.div>;
}