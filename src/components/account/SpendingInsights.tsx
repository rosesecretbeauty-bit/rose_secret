import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, DollarSign, PieChart, ArrowUpRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useInsightsStore } from '../../stores/insightsStore';

export function SpendingInsights() {
  const { insights, loading, loadInsights } = useInsightsStore();

  useEffect(() => {
    loadInsights(6);
  }, [loadInsights]);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay estadísticas disponibles
      </div>
    );
  }

  const stats = {
    totalSpent: insights.total_spent,
    ordersCount: insights.orders_count,
    avgOrderValue: insights.avg_order_value,
    savedAmount: insights.saved_amount,
    topCategory: insights.top_category || 'N/A'
  };
  
  const monthlySpending = insights.monthly_spending || [];
  const maxAmount = monthlySpending.length > 0 
    ? Math.max(...monthlySpending.map(m => m.amount))
    : 1;
  return <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-2xl font-medium text-gray-900">
          Mis Estadísticas
        </h2>
        <span className="text-sm text-gray-500">Últimos 6 meses</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Gasto Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalSpent.toFixed(2)}
            </p>
            {insights.growth_percent > 0 && (
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +{insights.growth_percent}% vs período anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Pedidos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Promedio ${stats.avgOrderValue.toFixed(0)}/orden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Ahorrado</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.savedAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">En ofertas y cupones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <PieChart className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Top Categoría</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.topCategory}
            </p>
            <p className="text-xs text-gray-500 mt-1">{insights.top_category_count} compras</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <h3 className="font-serif text-lg font-medium">Gasto Mensual</h3>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-4">
            {monthlySpending.length > 0 ? (
              monthlySpending.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.amount / maxAmount) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full max-w-[40px] bg-rose-200 rounded-t-lg group-hover:bg-rose-500 transition-colors relative min-h-[4px]"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ${item.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.month}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-gray-500 py-8">
                No hay datos de gasto mensual disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>;
}