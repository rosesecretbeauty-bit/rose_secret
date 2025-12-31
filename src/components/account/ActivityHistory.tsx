import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Mail, Lock, Package, MapPin, CreditCard, LogIn, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getActivityHistory, Activity } from '../../api/profile';
import { useToastStore } from '../../stores/toastStore';

const actionIcons: Record<string, React.ElementType> = {
  'EMAIL_VERIFIED': Mail,
  'PASSWORD_CHANGED': Lock,
  'PROFILE_UPDATED': Shield,
  'ORDER_CREATED': Package,
  'ADDRESS_CREATED': MapPin,
  'ADDRESS_UPDATED': MapPin,
  'ADDRESS_DELETED': MapPin,
  'PAYMENT_METHOD_ADDED': CreditCard,
  'PAYMENT_METHOD_REMOVED': CreditCard,
  'LOGIN': LogIn,
  'LOGOUT': LogOut,
};

const actionColors: Record<string, string> = {
  'EMAIL_VERIFIED': 'bg-green-100 text-green-700',
  'PASSWORD_CHANGED': 'bg-rose-100 text-rose-700',
  'PROFILE_UPDATED': 'bg-blue-100 text-blue-700',
  'ORDER_CREATED': 'bg-purple-100 text-purple-700',
  'ADDRESS_CREATED': 'bg-amber-100 text-amber-700',
  'ADDRESS_UPDATED': 'bg-amber-100 text-amber-700',
  'ADDRESS_DELETED': 'bg-red-100 text-red-700',
  'PAYMENT_METHOD_ADDED': 'bg-indigo-100 text-indigo-700',
  'PAYMENT_METHOD_REMOVED': 'bg-red-100 text-red-700',
  'LOGIN': 'bg-green-100 text-green-700',
  'LOGOUT': 'bg-gray-100 text-gray-700',
};

export function ActivityHistory() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivityHistory(50, 0);
      setActivities(data.activities);
      setHasMore(data.pagination.hasMore);
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar historial de actividad'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-LATAM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Historial de Actividad
          </h2>
          <p className="text-gray-500">
            Revisa las últimas actividades en tu cuenta
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto mb-4" />
            <p className="text-gray-500">Cargando historial...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Historial de Actividad
        </h2>
        <p className="text-gray-500">
          Revisa las últimas actividades y cambios en tu cuenta
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">No hay actividad registrada</p>
            <p className="text-sm text-gray-400">
              Las actividades en tu cuenta aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = actionIcons[activity.action] || Clock;
            const colorClass = actionColors[activity.action] || 'bg-gray-100 text-gray-700';

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-1">
                              {activity.message}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(activity.created_at)}
                              </span>
                              {activity.ip && (
                                <>
                                  <span>•</span>
                                  <span>{activity.ip}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className={colorClass}>
                            {activity.action.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

