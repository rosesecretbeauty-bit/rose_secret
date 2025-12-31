import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Eye, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getAuditLogs, AuditLog } from '../../api/admin';
import { useToastStore } from '../../stores/toastStore';

export function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setLogs(response.data.logs);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar logs de auditoría'
        });
      }
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar logs de auditoría'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.user?.name?.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.entity?.toLowerCase().includes(query) ||
      JSON.stringify(log.metadata)?.toLowerCase().includes(query)
    );
  });
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Auditoría del Sistema
            </h1>
            <p className="text-gray-500 mt-1">
              Registro detallado de todas las acciones del sistema
            </p>
          </div>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Exportar
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input leftIcon={<Search className="h-5 w-5" />} placeholder="Buscar en logs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            Filtros
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay logs de auditoría disponibles
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {log.user?.name || 'Sistema'}
                      </p>
                      <p className="text-sm text-gray-600">{log.action}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 flex-shrink-0">{log.entity}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {log.new_value?.name || log.new_value?.email || log.entity_id || '-'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(log.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-mono">{log.ip || '-'}</span>
                  </div>
                  <button className="w-full mt-2 p-2 text-center text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    Ver Detalles
                  </button>
                </motion.div>
              ))
            )}
          </div>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Usuario
                </th>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Acción
                </th>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Módulo
                </th>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Detalles
                </th>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  IP
                </th>
                <th className="text-center py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No hay logs de auditoría disponibles
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 lg:py-4 lg:px-6 font-medium text-gray-900 text-xs lg:text-sm">
                      {log.user?.name || 'Sistema'}
                    </td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6 text-gray-600 text-xs lg:text-sm">{log.action}</td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6">
                      <Badge variant="outline" className="text-xs">{log.entity}</Badge>
                    </td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6 text-gray-600 text-xs lg:text-sm truncate max-w-[200px]">
                      {log.new_value?.name || log.new_value?.email || log.entity_id || '-'}
                    </td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6 text-gray-500 text-xs lg:text-sm whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6 text-gray-500 text-xs lg:text-sm font-mono">
                      {log.ip || '-'}
                    </td>
                    <td className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                      <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Ver detalles">
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}