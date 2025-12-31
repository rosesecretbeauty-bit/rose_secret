import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Clock, CheckCircle, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { StatCard } from '../../components/admin/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { usePermission } from '../../hooks/usePermission';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  item_count: number;
  date: string;
}

export function OrdersManagement() {
  const { can } = usePermission();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Todas');
  const addToast = useToastStore(state => state.addToast);

  // Cargar pedidos desde la API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/admin/orders') as {
          success: boolean;
          data?: {
            orders: any[];
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
          // Transformar datos del backend al formato del frontend
          const transformedOrders: Order[] = response.data.orders.map((order: any) => ({
            id: order.id.toString(),
            order_number: order.order_number,
            customer_name: order.customer_name || 'N/A',
            customer_email: order.customer_email || 'N/A',
            status: order.status as Order['status'],
            total: parseFloat(order.total),
            item_count: parseInt(order.item_count) || 0,
            date: order.created_at
          }));
          
          setOrders(transformedOrders);
        }
      } catch (err: any) {
        console.error('Error loading orders:', err);
        setError(err.message || 'Error al cargar pedidos');
        addToast({
          type: 'error',
          message: 'Error al cargar pedidos'
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [addToast]);

  // Recargar pedidos después de operaciones
  const reloadOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      if (response.success && response.data) {
        const transformedOrders: Order[] = response.data.orders.map((order: any) => ({
          id: order.id.toString(),
          order_number: order.order_number,
          customer_name: order.customer_name || 'N/A',
          customer_email: order.customer_email || 'N/A',
          status: order.status as Order['status'],
          total: parseFloat(order.total),
          item_count: parseInt(order.item_count) || 0,
          date: order.created_at
        }));
        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error('Error reloading orders:', err);
    }
  };

  // Cambiar estado del pedido
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus }) as {
        success: boolean;
        message?: string;
      };
      addToast({
        type: 'success',
        message: 'Estado del pedido actualizado'
      });
      await reloadOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      addToast({
        type: 'error',
        message: err.message || 'Error al actualizar estado'
      });
    }
  };

  // Filtrar pedidos por estado
  const filteredOrders = selectedStatus === 'Todas' 
    ? orders 
    : orders.filter(order => {
        const statusMap: Record<string, Order['status'][]> = {
          'Pendiente': ['pending'],
          'Procesando': ['processing'],
          'Enviado': ['shipped'],
          'Completado': ['delivered'],
          'Cancelado': ['cancelled']
        };
        return statusMap[selectedStatus]?.includes(order.status);
      });

  // Columnas de la tabla
  const orderColumns = [{
    key: 'order_number',
    label: 'Número de Pedido',
    sortable: true,
    render: (order: Order) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {order.order_number}
      </span>
    )
  }, {
    key: 'customer_name',
    label: 'Cliente',
    sortable: true,
    render: (order: Order) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email}</p>
      </div>
    )
  }, {
    key: 'date',
    label: 'Fecha',
    sortable: true,
    render: (order: Order) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {new Date(order.date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </span>
    )
  }, {
    key: 'total',
    label: 'Total',
    sortable: true,
    render: (order: Order) => (
      <span className="font-semibold text-gray-900 dark:text-white">
        ${order.total.toFixed(2)}
      </span>
    )
  }, {
    key: 'item_count',
    label: 'Items',
    sortable: true,
    render: (order: Order) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {order.item_count}
      </span>
    )
  }, {
    key: 'status',
    label: 'Estado',
    render: (order: Order) => {
      const statusMap: Record<Order['status'], { label: string; color: string }> = {
        pending: { label: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
        processing: { label: 'Procesando', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
        shipped: { label: 'Enviado', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
        delivered: { label: 'Completado', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
        cancelled: { label: 'Cancelado', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' }
      };
      const statusInfo = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400' };
      return (
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${statusInfo.color}`}
        >
          <option value="pending">Pendiente</option>
          <option value="processing">Procesando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      );
    }
  }];

  const handleEdit = (order: Order) => {
    // Navegar al detalle del pedido (usando OrderDetailPage existente)
    window.open(`/account/orders/${order.id}`, '_blank');
  };

  const handleDelete = (order: Order) => {
    // Cambiar a cancelado
    if (confirm(`¿Cancelar orden ${order.order_number}?`)) {
      handleStatusChange(order.id, 'cancelled');
    }
  };

  // Calcular estadísticas
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  // Estado de carga
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Estado de error
  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar pedidos
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Órdenes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra y monitorea todas las órdenes de compra
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Órdenes" value={totalOrders} change={12.5} icon={Package} color="blue" />
          <StatCard title="Completadas" value={completedOrders} change={8.2} icon={CheckCircle} color="green" />
          <StatCard title="En Proceso" value={processingOrders} icon={Clock} color="purple" />
          <StatCard title="Ingresos" value={`$${totalRevenue.toFixed(2)}`} change={15.3} icon={TrendingUp} color="rose" />
        </div>

        {/* Status Filter Tabs */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="flex gap-2 overflow-x-auto pb-2">
          {['Todas', 'Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'].map((status, index) => <motion.button key={status} whileHover={{
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
        }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${status === selectedStatus ? 'bg-rose-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setSelectedStatus(status)}>
              {status}
            </motion.button>)}
        </motion.div>

        {/* Orders Table */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <DataTable 
            data={filteredOrders} 
            columns={orderColumns} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            searchPlaceholder="Buscar órdenes por número, cliente o email..." 
          />
        </motion.div>
      </div>
    </AdminLayout>
  );
}