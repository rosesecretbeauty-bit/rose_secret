import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Mail, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToastStore } from '../../stores/toastStore';
import { getAbandonedCarts, AbandonedCart } from '../../api/admin';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutos`;
  if (diffHours < 24) return `${diffHours} horas`;
  return `${diffDays} días`;
};

export function AbandonedCartsPage() {
  const addToast = useToastStore(state => state.addToast);
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, recoverable: 0, recoveryRate: '0' });

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      setLoading(true);
      const response = await getAbandonedCarts({ page: 1, limit: 50 });
      if (response.success && response.data) {
        setCarts(response.data.carts);
        setStats(response.data.stats);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar carritos abandonados'
        });
      }
    } catch (error: any) {
      console.error('Error loading abandoned carts:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar carritos abandonados'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSendRecovery = (cart: any) => {
    addToast({
      type: 'success',
      message: `Recovery email sent to ${cart.email}`
    });
  };
  const columns = [{
    key: 'id',
    label: 'Cart ID',
    render: (item: any) => <span className="font-mono">{item.id}</span>
  }, {
    key: 'customer',
    label: 'Customer',
    render: (item: any) => <div>
          <p className="font-medium text-gray-900">{item.customer}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
  }, {
    key: 'total',
    label: 'Value',
    render: (item: any) => <span className="font-medium">${item.total.toFixed(2)}</span>
  }, {
    key: 'abandonedAt',
    label: 'Time',
    render: (item: AbandonedCart) => <div className="flex items-center gap-1 text-gray-500">
          <Clock className="h-3 w-3" /> {formatTimeAgo(item.abandonedAt)}
        </div>
  }, {
    key: 'status',
    label: 'Status',
    render: (item: any) => {
      const colors: any = {
        Pending: 'yellow',
        Recovered: 'green',
        Lost: 'red'
      };
      return <Badge variant={colors[item.status]}>{item.status}</Badge>;
    }
  }, {
    key: 'actions',
    label: 'Actions',
    render: (item: any) => <div className="flex gap-2">
          {!item.recoverySent && item.status === 'Pending' && <Button size="sm" onClick={() => handleSendRecovery(item)} className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> Send Email
            </Button>}
          <Button size="sm" variant="outline">
            View <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
  }];
  return <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Abandoned Carts
            </h1>
            <p className="text-gray-600">
              Recover lost sales by engaging with customers who left without
              purchasing.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center min-w-[120px]">
              <p className="text-xs text-gray-500 uppercase font-bold">
                Recoverable
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.recoverable.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center min-w-[120px]">
              <p className="text-xs text-gray-500 uppercase font-bold">
                Recovery Rate
              </p>
              <p className="text-2xl font-bold text-rose-600">{stats.recoveryRate}%</p>
            </div>
          </div>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
          ) : (
            <DataTable data={carts} columns={columns} searchPlaceholder="Search by customer or email..." />
          )}
        </motion.div>
      </div>
    </AdminLayout>;
}