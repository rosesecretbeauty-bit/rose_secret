import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Package, ShoppingCart, Settings, Clock, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAuditLogs, AuditLog } from '../../api/admin';
import { useToastStore } from '../../stores/toastStore';

const getActionIcon = (entity: string) => {
  switch (entity) {
    case 'product':
      return Package;
    case 'order':
      return ShoppingCart;
    case 'user':
      return User;
    case 'settings':
      return Settings;
    default:
      return FileText;
  }
};

const getActionType = (action: string): 'create' | 'update' | 'delete' => {
  if (action.includes('CREATE') || action.includes('Creó') || action.includes('creó')) return 'create';
  if (action.includes('DELETE') || action.includes('Eliminó') || action.includes('eliminó')) return 'delete';
  return 'update';
};

export function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs({ page: 1, limit: 50 });
      if (response.success && response.data) {
        setLogs(response.data.logs);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar logs de actividad'
        });
      }
    } catch (error: any) {
      console.error('Error loading activity logs:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar logs de actividad'
      });
    } finally {
      setLoading(false);
    }
  };
  const getActionColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'update':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'delete':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };
  return <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Logs de Actividad
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historial completo de acciones administrativas
          </p>
        </div>

        {/* Filters */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex gap-2 overflow-x-auto pb-2">
          {['Todas', 'Crear', 'Actualizar', 'Eliminar', 'Hoy', 'Esta Semana'].map((filter, index) => <motion.button key={filter} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'Todas' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {filter}
            </motion.button>)}
        </motion.div>

        {/* Activity Timeline */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay logs de actividad disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const Icon = getActionIcon(log.entity);
                  const actionType = getActionType(log.action);
                  const userName = log.user?.name || 'Sistema';
                  const target = log.new_value?.name || log.new_value?.email || log.entity_id || log.entity;
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className={`p-3 rounded-lg ${getActionColor(actionType)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userName}
                          </p>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                          {target}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.created_at).toLocaleString('es-ES')}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>;
}