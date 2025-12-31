// ============================================
// Admin Dashboard Page
// ============================================
// Dashboard ejecutivo con métricas reales

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, Eye, ArrowUpRight, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { DataTable } from '../../components/admin/DataTable';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { usePermission } from '../../hooks/usePermission';

interface DashboardStats {
  orders: {
    today: { count: number; revenue: number };
    month: { count: number; revenue: number };
    total: { revenue: number };
    byStatus: Array<{ status: string; count: number }>;
  };
  users: {
    newToday: number;
    newMonth: number;
  };
  coupons: {
    usedToday: number;
  };
  topProducts: Array<{
    id: number;
    name: string;
    price: number;
    totalSold: number;
    revenue: number;
  }>;
}

export function DashboardPage() {
  const { can } = usePermission();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/admin/dashboard/stats') as {
          success: boolean;
          data?: DashboardStats;
          message?: string;
        };

        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'Error al cargar estadísticas');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar si tiene permiso
    if (can('analytics.read')) {
      loadStats();
    } else {
      setError('No tienes permisos para ver esta página');
      setLoading(false);
    }
  }, [can]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <PremiumLoader />
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">{error || 'Error al cargar estadísticas'}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Preparar datos para gráficos
  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
  };

  const pieData = stats.orders.byStatus.map(item => ({
    name: item.status,
    value: item.count,
    color: statusColors[item.status] || '#6B7280',
  }));

  const recentOrders = stats.topProducts.slice(0, 5).map((p, idx) => ({
    id: `TOP-${idx + 1}`,
    customer: p.name,
    product: `${p.totalSold} unidades`,
    amount: `$${p.revenue.toFixed(2)}`,
    status: 'Top Product',
    date: new Date().toISOString().split('T')[0],
  }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Dashboard Ejecutivo
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Resumen de métricas clave del negocio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Ingresos Hoy"
            value={`$${stats.orders.today.revenue.toFixed(2)}`}
            change={`${stats.orders.today.count} órdenes`}
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Ingresos del Mes"
            value={`$${stats.orders.month.revenue.toFixed(2)}`}
            change={`${stats.orders.month.count} órdenes`}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Usuarios Nuevos"
            value={stats.users.newMonth.toString()}
            change={`${stats.users.newToday} hoy`}
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Cupones Usados"
            value={stats.coupons.usedToday.toString()}
            change="Hoy"
            icon={Package}
            trend="neutral"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Orders by Status - Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 overflow-hidden"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Órdenes por Estado
            </h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Products - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 overflow-x-auto"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Productos Más Vendidos
            </h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]" minWidth={300}>
              <BarChart data={stats.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSold" fill="#E91E63" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Productos Top
            </h3>
            <button className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
              Ver todos
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <DataTable
            data={recentOrders}
            columns={[
              {
                key: 'id',
                label: 'Rank',
                render: (order) => <span className="font-mono text-sm">#{order.id}</span>,
              },
              {
                key: 'customer',
                label: 'Producto',
                sortable: true,
              },
              {
                key: 'product',
                label: 'Ventas',
                sortable: true,
              },
              {
                key: 'amount',
                label: 'Ingresos',
                sortable: true,
                render: (order) => (
                  <span className="font-semibold text-gray-900">
                    {order.amount}
                  </span>
                ),
              },
            ]}
          />
        </motion.div>
      </div>
    </AdminLayout>
  );
}

