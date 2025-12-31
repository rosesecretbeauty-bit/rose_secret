import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../hooks/useNotifications';
interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}
export function NotificationBadge({
  onClick,
  className = ''
}: NotificationBadgeProps) {
  const {
    unreadCount
  } = useNotificationStore();
  return <button onClick={onClick} className={`relative p-2 text-gray-600 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 transition-colors ${className}`} aria-label="Notifications">
      <Bell className="w-6 h-6" />

      <AnimatePresence>
        {unreadCount > 0 && <motion.span initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} exit={{
        scale: 0
      }} className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>}
      </AnimatePresence>

      {unreadCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 animate-ping rounded-full bg-rose-400 opacity-75" />}
    </button>;
}