// ============================================
// Audit Logs Page
// ============================================
// Vista de auditoría con datos reales

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { usePermission } from '../../hooks/usePermission';
import { useToastStore } from '../../stores/toastStore';

interface AuditLog {
  id: number;
  user: {
    name: string;
    email: string | null;
  } | null;
  action: string;
  entity: string;
  entity_id: number | null;
  old_value: any;
  new_value: any;
  metadata: any;
  ip: string | null;
  created_at: string;
}

export function AuditLogsPage() {
  const { can } = usePermission();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    entity: '',
    start_date: '',
    end_date: '',
  });
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    const loadLogs = async () => {
      if (!can('audit.read')) {
        setError('No tienes permisos para ver esta página');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '50',
        });

        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.entity) params.append('entity', filters.entity);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

        const response = await api.get(`/admin/audit-logs?${params.toString()}`) as {
          success: boolean;
          data?: {
            logs: AuditLog[];
            pagination: {
              page: number;
              limit: number;
              total: number;
              totalPages: number;
            };
          };
          message?: string;
        };

        if (response.success && response.data) {
          setLogs(response.data.logs);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setError(response.message || 'Error al cargar logs');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar logs');
        addToast({
          type: 'error',
          message: 'Error al cargar logs de auditoría',
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [can, page, filters]);

  const handleExport = async () => {
    if (!can('audit.export')) {
      addToast({
        type: 'error',
        message: 'No tienes permisos para exportar',
      });
      return;
    }

    addToast({
      type: 'info',
      message: 'Funcionalidad de exportación próximamente',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <PremiumLoader />
        </div>
      </AdminLayout>
    );
  }

  if (error && !can('audit.read')) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED')) return 'green';
    if (action.includes('UPDATED')) return 'blue';
    if (action.includes('DELETED')) return 'red';
    if (action.includes('DENIED')) return 'orange';
    return 'gray';
  };

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
          {can('audit.export') && (
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              leftIcon={<Search className="h-5 w-5" />}
              placeholder="Buscar en logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            Filtros
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay logs de auditoría</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Usuario
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Acción
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Entidad
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Detalles
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {log.user ? log.user.name : 'Sistema'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={getActionBadgeColor(log.action) as any}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline">{log.entity}</Badge>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {log.entity_id ? `ID: ${log.entity_id}` : '-'}
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-sm font-mono">
                          {log.ip || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

