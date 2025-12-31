import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Filter, Download, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/admin/StatCard';
import { getCustomerSegments, CustomerSegment, CustomerSegmentCustomer } from '../../api/admin';
import { useToastStore } from '../../stores/toastStore';

export function CustomerSegmentsPage() {
  const [activeSegment, setActiveSegment] = useState('all');
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<CustomerSegmentCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadSegments();
  }, []);

  useEffect(() => {
    if (activeSegment) {
      loadCustomers(activeSegment === 'all' ? undefined : activeSegment);
    }
  }, [activeSegment]);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const response = await getCustomerSegments();
      if (response.success && response.data) {
        setSegments(response.data.segments);
        setCustomers(response.data.customers || []);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar segmentos de clientes'
        });
      }
    } catch (error: any) {
      console.error('Error loading customer segments:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar segmentos de clientes'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async (segmentId?: string) => {
    try {
      const response = await getCustomerSegments(segmentId);
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
    }
  };
  return <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Customer Segments
            </h1>
            <p className="text-gray-500">
              Analyze and target specific customer groups
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Segment
            </Button>
          </div>
        </div>

        {/* Segment Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {segments.map(segment => {
              const colorClasses: Record<string, { bg: string; text: string }> = {
                rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
                blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
                purple: { bg: 'bg-purple-50', text: 'text-purple-600' }
              };
              const colorClass = colorClasses[segment.color] || colorClasses.rose;
              
              return (
                <motion.div key={segment.id} whileHover={{
                  y: -5
                }} className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all ${activeSegment === segment.id ? 'ring-2 ring-rose-500' : ''}`} onClick={() => setActiveSegment(segment.id)}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant={segment.growth > 0 ? 'success' : 'warning'}>
                  {segment.growth > 0 ? '+' : ''}
                  {segment.growth}%
                </Badge>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{segment.name}</h3>
              <p className="text-xs text-gray-500 mb-4">
                {segment.description}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {segment.count}
                  </p>
                  <p className="text-xs text-gray-500">Customers</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ${(segment.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </motion.div>
            );
            })}
          </div>
        )}

        {/* Segment Builder & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-rose-600" /> Segment Filters
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Spending Tier
                </label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500">
                  <option>All Tiers</option>
                  <option>High Spenders ($500+)</option>
                  <option>Mid Tier ($100-$500)</option>
                  <option>Low Tier (&lt;$100)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Purchase Frequency
                </label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500">
                  <option>Any Frequency</option>
                  <option>Frequent (3+ orders/mo)</option>
                  <option>Regular (1 order/mo)</option>
                  <option>Occasional</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Last Activity
                </label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500">
                  <option>Any Time</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Inactive (&gt;90 Days)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category Preference
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500" defaultChecked />
                    <span className="text-sm text-gray-600">Fragrances</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500" />
                    <span className="text-sm text-gray-600">Cosmetics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500" />
                    <span className="text-sm text-gray-600">Skincare</span>
                  </label>
                </div>
              </div>
              <Button fullWidth>Apply Filters</Button>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row justify-between items-center">
              <h3 className="font-bold text-lg">Segment Preview</h3>
              <Button size="sm" variant="outline">
                Create Campaign
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Spent</th>
                      <th className="px-4 py-3">Orders</th>
                      <th className="px-4 py-3">Last Order</th>
                      <th className="px-4 py-3">Segment</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No hay clientes en este segmento
                        </td>
                      </tr>
                    ) : (
                      customers.map(customer => <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ${customer.spent}
                        </td>
                        <td className="px-4 py-3">{customer.orders}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {customer.lastOrder}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={customer.segment === 'VIP' ? 'primary' : customer.segment === 'At Risk' ? 'warning' : 'secondary'}>
                            {customer.segment}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-400 hover:text-rose-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>)
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>;
}