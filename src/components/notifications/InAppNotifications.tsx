// ============================================
// In-App Notifications Component
// ============================================
// Componente para mostrar notificaciones in-app con dropdown

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X, Package, CreditCard, Tag, User, Settings, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useNotifications } from '../../hooks/useNotifications';
import { trackEvent } from '../../analytics/analyticsClient';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos por tipo de notificación
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return Package;
    case 'payment':
      return CreditCard;
    case 'promo':
      return Tag;
    case 'account':
      return User;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

// Colores por tipo
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order':
      return 'text-blue-600 bg-blue-50';
    case 'payment':
      return 'text-green-600 bg-green-50';
    case 'promo':
      return 'text-rose-600 bg-rose-50';
    case 'account':
      return 'text-purple-600 bg-purple-50';
    case 'system':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function InAppNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    isMarkingAsRead,
    openNotifications,
    closeNotifications,
    markAsRead,
    loadNotifications,
  } = useNotificationStore();

  const { hasUnread } = useNotifications({ autoRefresh: true });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeNotifications]);

  const handleToggle = () => {
    if (isOpen) {
      closeNotifications();
    } else {
      openNotifications();
      trackEvent('NOTIFICATION_OPENED', {
        notification_id: undefined,
        type: 'in_app',
        channel: 'in_app',
      });
    }
  };

  const handleMarkAsRead = async (notificationId?: number) => {
    await markAsRead(notificationId);
    
    if (notificationId) {
      trackEvent('NOTIFICATION_CLICKED', {
        notification_id: notificationId,
        type: notifications.find(n => n.id === notificationId)?.type || 'unknown',
        channel: 'in_app',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAsRead(undefined, true);
    trackEvent('NOTIFICATION_CLICKED', {
      notification_id: undefined,
      type: 'all',
      channel: 'in_app',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-stone-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5 text-stone-600" />
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"
          />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-serif font-medium text-gray-900">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAsRead}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                  >
                    {isMarkingAsRead ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Marcar todas como leídas'
                    )}
                  </button>
                )}
                <button
                  onClick={closeNotifications}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    const isRead = !!notification.read_at;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !isRead ? 'bg-rose-50/30' : ''
                        }`}
                        onClick={() => !isRead && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!isRead && (
                                <span className="h-2 w-2 bg-rose-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                              {!isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                                >
                                  Marcar como leída
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    // TODO: Navegar a página de todas las notificaciones
                    closeNotifications();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

