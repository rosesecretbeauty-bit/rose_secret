import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, AlertCircle, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getNotifications, markNotificationAsRead, Notification } from '../../api/notifications';
import { useToastStore } from '../../stores/toastStore';

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'payment' | 'promo' | 'account' | 'system'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications({
        limit: 100,
        type: filter !== 'all' && filter !== 'unread' ? filter : undefined,
        unread_only: filter === 'unread'
      });
      
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar notificaciones'
        });
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar notificaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId?: number, markAll?: boolean) => {
    try {
      const response = await markNotificationAsRead(notificationId, markAll);
      if (response.success) {
        addToast({
          type: 'success',
          message: response.message || 'Notificación marcada como leída'
        });
        loadNotifications();
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      addToast({
        type: 'error',
        message: 'Error al marcar notificación'
      });
    }
  };
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return CheckCircle;
      case 'payment':
        return CheckCircle;
      case 'promo':
        return Info;
      case 'account':
        return Info;
      case 'system':
        return AlertCircle;
      default:
        return Info;
    }
  };
  
  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'bg-green-100 text-green-600';
      case 'payment':
        return 'bg-blue-100 text-blue-600';
      case 'promo':
        return 'bg-purple-100 text-purple-600';
      case 'account':
        return 'bg-amber-100 text-amber-600';
      case 'system':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read_at;
    return n.type === filter;
  });
  return <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              Notificaciones
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {notifications.filter(n => !n.read_at).length} notificaciones sin leer
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              leftIcon={<Check className="h-4 w-4" />}
              onClick={() => handleMarkAsRead(undefined, true)}
              className="text-xs sm:text-sm"
            >
              Marcar Todas Leídas
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'unread', 'order', 'payment', 'promo', 'account', 'system'] as const).map(f => (
            <Button 
              key={f} 
              variant={filter === f ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setFilter(f)} 
              className="capitalize text-xs sm:text-sm"
            >
              {f === 'all' ? 'Todas' : f === 'unread' ? 'No leídas' : f}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredNotifications.map((notif, index) => {
              const Icon = getIcon(notif.type);
              const isRead = !!notif.read_at;
              return (
                <motion.div 
                  key={notif.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-4 sm:p-6 border transition-all ${
                    isRead ? 'border-gray-200' : 'border-rose-200 shadow-soft'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${getColor(notif.type)}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base break-words">
                          {notif.title}
                        </h3>
                        {!isRead && (
                          <Badge variant="primary" className="flex-shrink-0 text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs sm:text-sm text-gray-400">
                          {formatTimeAgo(notif.created_at)}
                        </p>
                        {!isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium"
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
    </AdminLayout>;
}