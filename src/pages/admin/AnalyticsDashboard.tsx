import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Users, Eye, MousePointerClick } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { getDashboardStats, DashboardStats } from '../../api/admin';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate revenue data for last 6 months
  // Nota: Esto es una aproximación. En producción, se recomienda agregar un endpoint que retorne revenue por mes
  const generateRevenueData = (stats: DashboardStats | null) => {
    if (!stats || stats.orders.total.revenue === 0) {
      return [];
    }
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = months.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);
    
    // Distribuir revenue total proporcionalmente entre los últimos 6 meses
    const avgMonthlyRevenue = stats.orders.total.revenue / 6;
    
    return last6Months.map((month, index) => {
      // Más peso a meses recientes
      const weight = (index + 1) / 6;
      const value = avgMonthlyRevenue * (0.7 + weight * 0.6);
      return { month, value: Math.round(value) };
    });
  };

  const revenueData = generateRevenueData(stats);

  const topProducts = stats?.topProducts || [];
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.value)) : 1;

  if (isLoading) {
    return <AdminLayout>
      <div className="flex items-center justify-center min-h-screen">
        <PremiumLoader />
      </div>
    </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Analíticas Avanzadas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Métricas detalladas y análisis de rendimiento
          </p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard 
              title="Ingresos Totales" 
              value={`$${stats.orders.total.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              change={18.5} 
              icon={DollarSign} 
              color="green" 
            />
            <StatCard 
              title="Órdenes del Mes" 
              value={stats.orders.month.count.toString()} 
              change={12.3} 
              icon={ShoppingCart} 
              color="blue" 
            />
            <StatCard 
              title="Valor Promedio Orden" 
              value={`$${stats.orders.month.count > 0 ? (stats.orders.month.revenue / stats.orders.month.count).toFixed(2) : '0.00'}`} 
              change={8.7} 
              icon={TrendingUp} 
              color="purple" 
            />
            <StatCard 
              title="Usuarios Nuevos (Mes)" 
              value={stats.users.newMonth.toString()} 
              change={22.1} 
              icon={Users} 
              color="rose" 
            />
            <StatCard 
              title="Órdenes Hoy" 
              value={stats.orders.today.count.toString()} 
              change={15.8} 
              icon={Eye} 
              color="blue" 
            />
            <StatCard 
              title="Ingresos Hoy" 
              value={`$${stats.orders.today.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              change={5.3} 
              icon={MousePointerClick} 
              color="green" 
            />
          </div>
        )}

        {/* Revenue Chart */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Ingresos Mensuales
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Últimos 6 meses
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold">+18.5%</span>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between gap-4">
            {revenueData.map((data, index) => {
            const height = data.value / maxRevenue * 100;
            return <div key={data.month} className="flex-1 flex flex-col items-center gap-3">
                  <motion.div initial={{
                height: 0
              }} animate={{
                height: `${height}%`
              }} transition={{
                delay: 0.3 + index * 0.1,
                duration: 0.5
              }} className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg relative group cursor-pointer">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ${(data.value / 1000).toFixed(1)}K
                    </div>
                  </motion.div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>;
          })}
          </div>
        </motion.div>

        {/* Top Products & Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Productos Más Vendidos
            </h3>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => <motion.div key={product.id} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.4 + index * 0.1
              }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.totalSold} ventas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </motion.div>)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay productos disponibles
              </div>
            )}
          </motion.div>

          {/* Orders by Status */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Órdenes por Estado
            </h3>
            {stats && stats.orders.byStatus.length > 0 ? (
              <div className="space-y-4">
                {stats.orders.byStatus.map((statusItem, index) => {
                  const totalOrders = stats.orders.byStatus.reduce((sum, s) => sum + s.count, 0);
                  const percentage = totalOrders > 0 ? Math.round((statusItem.count / totalOrders) * 100) : 0;
                  const colors: Record<string, string> = {
                    'pending': 'bg-yellow-500',
                    'paid': 'bg-blue-500',
                    'processing': 'bg-purple-500',
                    'shipped': 'bg-indigo-500',
                    'delivered': 'bg-green-500',
                    'cancelled': 'bg-red-500'
                  };
                  const color = colors[statusItem.status] || 'bg-gray-500';
                  
                  return (
                    <motion.div key={statusItem.status} initial={{
                      opacity: 0,
                      x: -20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: 0.5 + index * 0.1
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {statusItem.status}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {statusItem.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                          className={`h-full ${color} rounded-full`} 
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No hay datos disponibles
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>;
}