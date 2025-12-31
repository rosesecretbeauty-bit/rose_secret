import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Calendar, Users, DollarSign, Percent, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { getCoupons, Coupon } from '../../api/admin';
import { useToastStore } from '../../stores/toastStore';

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setCoupons(response.data.coupons);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar cupones'
        });
      }
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar cupones'
      });
    } finally {
      setLoading(false);
    }
  };
  return <AdminLayout>
      <PermissionGuard module="coupons" action="view" showError>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Cupones y Descuentos
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona códigos promocionales y reglas de descuento
              </p>
            </div>
            <PermissionGuard module="coupons" action="create">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Crear Cupón
              </Button>
            </PermissionGuard>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay cupones disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon, index) => <motion.div key={coupon.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                        <Ticket className="h-6 w-6 text-rose-600" />
                      </div>
                      <Badge variant={coupon.status === 'active' ? 'success' : 'secondary'}>
                        {coupon.status === 'active' ? 'Activo' : 'Expirado'}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {coupon.code}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      {coupon.type === 'percentage' && `${coupon.value}% de descuento`}
                      {coupon.type === 'fixed' && `$${coupon.value} de descuento`}
                      {coupon.type === 'shipping' && 'Envío Gratis'}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Uso</span>
                        </div>
                        <span className="font-medium">
                          {coupon.usage} / {coupon.limit || '∞'}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000" style={{
                      width: coupon.limit ? `${((coupon.usage / coupon.limit) * 100)}%` : '0%'
                    }} />
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Expira</span>
                        </div>
                        <span className="font-medium">{coupon.expiry ? new Date(coupon.expiry).toLocaleDateString('es-ES') : 'Sin expiración'}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button variant="outline" size="sm" fullWidth>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                        Desactivar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
            </div>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>;
}