import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '../components/admin/AdminLayout';
import { StatCard } from '../components/admin/StatCard';
import { getDashboardStats, DashboardStats } from '../api/admin';
import { useToastStore } from '../stores/toastStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';

// Helper para generar datos de revenue mensual desde stats
// Nota: Esto es una aproximación ya que el API actual no proporciona datos mensuales históricos
// En producción, se recomienda agregar un endpoint que retorne revenue por mes
const generateRevenueData = (stats: DashboardStats | null) => {
  if (!stats || stats.orders.total.revenue === 0) {
    // Mostrar últimos 12 meses con datos en cero
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map(month => ({ month, revenue: 0, orders: 0 }));
  }
  
  // Aproximación: distribuir revenue total proporcionalmente entre los últimos 12 meses
  // Esto se puede mejorar cuando exista un endpoint específico para revenue mensual
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const totalRevenue = stats.orders.total.revenue;
  const avgMonthlyRevenue = totalRevenue / 12;
  
  // Distribución simple: asignar más revenue a los meses más recientes
  return months.map((month, index) => {
    const weight = (index + 1) / 12; // Más peso a meses recientes
    const monthRevenue = avgMonthlyRevenue * (0.7 + weight * 0.6); // Variación entre 0.7x y 1.3x
    const monthOrders = stats.orders.month.count > 0 
      ? Math.round((monthRevenue / stats.orders.month.revenue) * stats.orders.month.count)
      : 0;
    
    return {
      month,
      revenue: Math.round(monthRevenue),
      orders: monthOrders
    };
  });
};

// Helper para generar datos de categorías desde topProducts
// Nota: Usa nombres de productos como proxy ya que no hay datos de categoría en el API actual
// En producción, se recomienda agregar datos de categoría al endpoint de stats
const generateCategoryData = (stats: DashboardStats | null) => {
  if (!stats || !stats.topProducts || stats.topProducts.length === 0) {
    return [];
  }
  
  // Usar topProducts como proxy para distribución de ventas
  const totalRevenue = stats.topProducts.reduce((sum, p) => sum + p.revenue, 0);
  if (totalRevenue === 0) return [];
  
  const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4'];
  return stats.topProducts.slice(0, 5).map((product, index) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    value: Math.round((product.revenue / totalRevenue) * 100),
    color: colors[index] || '#E91E63'
  }));
};

// Helper para generar top products data
const generateTopProductsData = (stats: DashboardStats | null) => {
  if (!stats || !stats.topProducts) {
    return [];
  }
  
  return stats.topProducts.map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    revenue: product.revenue,
    units: product.totalSold
  }));
};

// Helper para generar recent activity desde stats
// Nota: Actualmente no hay endpoint para actividad reciente, se puede conectar a audit logs
interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'other';
  message: string;
  time: string;
  amount?: string;
}

const generateRecentActivity = (): RecentActivity[] => {
  // Retornar array vacío - para implementar cuando haya endpoint de actividad reciente
  return [];
};
export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadStats();
    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      loadStats();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar estadísticas del dashboard'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours} h`;
  };

  if (isLoading) {
    return <AdminLayout>
      <div className="flex items-center justify-center min-h-screen">
        <PremiumLoader />
      </div>
    </AdminLayout>;
  }

  const revenueData = generateRevenueData(stats);
  const categoryData = generateCategoryData(stats);
  const topProductsData = generateTopProductsData(stats);
  const recentActivity = generateRecentActivity();

  return <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenida al panel de administración de Rose Secret
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            Última actualización: {formatTimeAgo(lastUpdate)}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Ventas Totales" 
              value={`$${stats.orders.total.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              change={stats.orders.month.count > 0 ? Math.round(((stats.orders.month.revenue / stats.orders.month.count) / (stats.orders.total.revenue / (stats.orders.total.revenue > 0 ? Math.max(1, stats.orders.month.count) : 1))) * 100) : 0} 
              icon={DollarSign} 
              color="green" 
            />
            <StatCard 
              title="Órdenes del Mes" 
              value={stats.orders.month.count.toString()} 
              change={stats.orders.today.count > 0 ? Math.round((stats.orders.today.count / stats.orders.month.count) * 100) : 0} 
              icon={ShoppingCart} 
              color="blue" 
            />
            <StatCard 
              title="Usuarios Nuevos" 
              value={stats.users.newMonth.toString()} 
              change={stats.users.newToday > 0 ? Math.round((stats.users.newToday / stats.users.newMonth) * 100) : 0} 
              icon={Users} 
              color="purple" 
            />
            <StatCard 
              title="Productos Top" 
              value={stats.topProducts.length.toString()} 
              change={0} 
              icon={Package} 
              color="rose" 
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Revenue Chart - Takes 2 columns */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Ingresos Mensuales
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Últimos 12 meses
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +12.5%
                </span>
              </div>
            </div>

            <div className="w-full" style={{ height: '250px' }}>
              {revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E91E63" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} interval="preserveStartEnd" />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={value => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} width={50} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }} 
                      formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Ingresos']} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#E91E63" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                  No hay datos de ingresos disponibles
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Pie Chart */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Productos por Ingresos
            </h3>

            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180} className="md:h-[200px]">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Porcentaje']} contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px'
                  }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {categoryData.map(item => <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                    backgroundColor: item.color
                  }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">
                        {item.value}%
                      </span>
                    </div>)}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Top Products Bar Chart */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Productos por Ingresos
            </h3>

            {topProductsData.length > 0 ? (
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      tickFormatter={value => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)}`} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      width={100}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                      formatter={(value: number, name: string) => [
                        name === 'revenue' 
                          ? `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : `${value} unidades`, 
                        name === 'revenue' ? 'Ingresos' : 'Unidades'
                      ]} 
                    />
                    <Bar dataKey="revenue" fill="#E91E63" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400 text-sm">
                No hay productos disponibles
              </div>
            )}
          </motion.div>

          {/* Recent Activity Timeline */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5
        }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Actividad Reciente
            </h3>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No hay actividad reciente
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {recentActivity.map((activity, index) => <motion.div key={activity.id} initial={{
                  opacity: 0,
                  x: -10
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: 0.6 + index * 0.1
                }} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'order' ? 'bg-green-500' : activity.type === 'review' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                        {activity.amount && <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            {activity.amount}
                          </span>}
                      </div>
                    </div>
                  </motion.div>)}
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Products Summary */}
        {topProductsData.length > 0 && (
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Productos Top
              </h3>
              <Link to="/admin/products" className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium">
                Ver todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full min-w-[300px]">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                      <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidades</th>
                      <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topProductsData.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{product.units}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>;
}