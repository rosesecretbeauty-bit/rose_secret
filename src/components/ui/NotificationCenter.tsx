import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Heart, Gift, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { trackEvent } from '../../analytics/analyticsClient';
import type { Notification } from '../../notifications/notificationTypes';
// Formatear tiempo relativo de forma simple
function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recientemente';
  }
}
import { Link } from 'react-router-dom';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    isMarkingAsRead,
    markAsRead,
    openNotifications,
    closeNotifications,
    loadNotifications,
  } = useNotificationStore();
  
  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return Package;
      case 'promo':
        return Gift;
      case 'stock':
        return AlertCircle;
      case 'system':
        return Sparkles;
      default:
        return Bell;
    }
  };


  // Si no está autenticado, no mostrar nada o mostrar mensaje
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
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
          setIsOpen(!isOpen);
        }}
        className="relative p-2 hover:bg-stone-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5 text-stone-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                closeNotifications();
              }}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-premium-lg border border-stone-100 overflow-hidden z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await markAsRead(undefined, true);
                      trackEvent('NOTIFICATION_CLICKED', {
                        notification_id: undefined,
                        type: 'all',
                        channel: 'in_app',
                      });
                    }}
                    disabled={isMarkingAsRead}
                    className="text-xs text-rose-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {isMarkingAsRead ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      'Marcar todas como leídas'
                    )}
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-stone-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p className="text-sm font-medium text-stone-700 mb-1">No hay notificaciones</p>
                    <p className="text-xs text-stone-500">
                      Te notificaremos cuando tengas actualizaciones
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {notifications.map((notification) => {
                      const Icon = getIcon(notification.type);
                      const isRead = !!notification.read_at;
                      const link = notification.metadata?.link;

                      const handleClick = async () => {
                        if (!isRead) {
                          await markAsRead(notification.id);
                          trackEvent('NOTIFICATION_CLICKED', {
                            notification_id: notification.id,
                            type: notification.type,
                            channel: notification.channel,
                          });
                        }
                        setIsOpen(false);
                      };

                      const content = link ? (
                        <Link
                          to={link}
                          onClick={handleClick}
                          className={`block w-full p-4 text-left hover:bg-stone-50 transition-colors ${
                            !isRead ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                !isRead
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p
                                  className={`text-sm font-medium ${
                                    !isRead ? 'text-stone-900' : 'text-stone-600'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {!isRead && (
                                  <div className="w-2 h-2 bg-rose-600 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-stone-500 mb-1">{notification.message}</p>
                              <p className="text-xs text-stone-400">{formatTime(notification.created_at)}</p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <button
                          onClick={handleClick}
                          className={`w-full p-4 text-left hover:bg-stone-50 transition-colors ${
                            !isRead ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                !isRead
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p
                                  className={`text-sm font-medium ${
                                    !isRead ? 'text-stone-900' : 'text-stone-600'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {!isRead && (
                                  <div className="w-2 h-2 bg-rose-600 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-stone-500 mb-1">{notification.message}</p>
                              <p className="text-xs text-stone-400">{formatTime(notification.created_at)}</p>
                            </div>
                          </div>
                        </button>
                      );

                      return <React.Fragment key={notification.id}>{content}</React.Fragment>;
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
