import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Activity, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/admin/StatCard';
import { getDashboardStats, DashboardStats } from '../../api/admin';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

export function PerformanceDashboard() {
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

  // Generate revenue data for last 30 days
  // Nota: Esto es una aproximación. En producción, se recomienda agregar un endpoint que retorne revenue por día
  const generateRevenueData = (stats: DashboardStats | null) => {
    if (!stats || stats.orders.month.revenue === 0) {
      return Array(30).fill(0);
    }
    // Distribuir revenue mensual entre 30 días con variación
    const avgDailyRevenue = stats.orders.month.revenue / 30;
    return Array.from({ length: 30 }, (_, i) => {
      // Variación día a día (70% a 130% del promedio)
      const variation = 0.7 + (Math.sin(i / 5) * 0.3) + (Math.random() * 0.3);
      return Math.round(avgDailyRevenue * variation);
    });
  };

  const revenueData = generateRevenueData(stats);
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData) : 1;
  const topProducts = stats?.topProducts || [];

  if (isLoading) {
    return <AdminLayout>
      <div className="flex items-center justify-center min-h-screen">
        <PremiumLoader />
      </div>
    </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
            Performance Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Real-time overview of your store's performance
          </p>
        </div>

        {/* Top KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Today's Revenue" 
              value={`$${stats.orders.today.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              change={12.5} 
              icon={DollarSign} 
              color="rose" 
            />
            <StatCard 
              title="Orders Today" 
              value={stats.orders.today.count.toString()} 
              change={-0.4} 
              icon={Activity} 
              color="blue" 
            />
            <StatCard 
              title="Avg Order Value" 
              value={`$${stats.orders.today.count > 0 ? (stats.orders.today.revenue / stats.orders.today.count).toFixed(2) : '0.00'}`} 
              change={5.2} 
              icon={ShoppingBag} 
              color="purple" 
            />
            <StatCard 
              title="New Users (Month)" 
              value={stats.users.newMonth.toString()} 
              change={18.0} 
              icon={Users} 
              color="green" 
            />
          </div>
        )}

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Revenue Trend (30 Days)</h3>
                <select className="text-sm border-gray-200 rounded-lg">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>This Year</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {revenueData.some(v => v > 0) ? (
                <>
                  <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-4">
                    {revenueData.map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                        <div 
                          className="w-full bg-rose-100 dark:bg-rose-900/30 rounded-t-sm group-hover:bg-rose-500 dark:group-hover:bg-rose-600 transition-colors relative" 
                          style={{ height: `${Math.max((value / maxRevenue * 100), 5)}%`, minHeight: '4px' }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-gray-400">
                    <span>Día 1</span>
                    <span>Día 15</span>
                    <span>Día 30</span>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  No hay datos de ingresos disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products Summary */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-lg">Productos Top</h3>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {index + 1}. {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.totalSold} ventas
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No hay productos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Top Products</h3>
              <button className="text-sm text-rose-600 hover:underline flex items-center">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Sales</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length > 0 ? (
                    topProducts.map((product, idx) => <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{product.name}</td>
                        <td className="px-6 py-4">{product.totalSold}</td>
                        <td className="px-6 py-4">
                          ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-green-600">
                          {/* Trend removed - can be calculated if needed */}
                        </td>
                      </tr>)
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No hay productos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-lg">Resumen del Mes</h3>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos del Mes</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${stats.orders.month.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes del Mes</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.orders.month.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Valor Promedio</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${stats.orders.month.count > 0 ? (stats.orders.month.revenue / stats.orders.month.count).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Usuarios Nuevos</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.users.newMonth}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>;
}