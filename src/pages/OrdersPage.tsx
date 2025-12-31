import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending' | 'pending_payment' | 'payment_failed';
  total: number;
  items: {
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  itemCount?: number;
  previewImage?: string | null;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Cargar pedidos desde la API
  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/orders');
        
        if (response.success && response.data) {
          // Transformar datos del backend al formato del frontend
          const transformedOrders: Order[] = response.data.orders.map((order: any) => ({
            id: order.id.toString(),
            orderNumber: order.order_number,
            date: order.created_at,
            status: order.status as Order['status'],
            total: parseFloat(order.total),
            items: order.preview_item ? [{
              id: order.preview_item.id.toString(),
              name: order.preview_item.product_name,
              image: order.preview_image || '',
              quantity: order.preview_item.quantity,
              price: parseFloat(order.preview_item.product_price)
            }] : [],
            itemCount: order.item_count || 0,
            previewImage: order.preview_image || null
          }));
          
          setOrders(transformedOrders);
        }
      } catch (err: any) {
        console.error('Error loading orders:', err);
        setError(err.message || 'Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
      case 'pending':
      case 'pending_payment':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'payment_failed':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'champagne';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };
  // Estado de carga
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </motion.div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
              <Package className="h-10 w-10" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-2">
              Error al cargar pedidos
            </h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()} size="lg">
              Reintentar
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl font-medium text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">View and track all your orders</p>
        </motion.div>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Order {order.orderNumber}
                        </h3>
                        <Badge variant={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Realizado el {new Date(order.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Total</p>
                      <p className="text-xl font-serif font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Items - Mostrar preview si hay items */}
                  {order.items.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Fallback a placeholder si la imagen falla
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="9" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                              {order.itemCount && order.itemCount > 1 && (
                                <span className="ml-2 text-gray-400">
                                  +{order.itemCount - 1} más
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Comprar de Nuevo
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button variant="outline" size="sm">
                        Rastrear Paquete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Package className="h-10 w-10" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-2">
              Aún no tienes pedidos
            </h2>
            <p className="text-gray-500 mb-8">
              Comienza a comprar para ver tus pedidos aquí
            </p>
            <Button size="lg" onClick={() => (window.location.href = '/shop')}>
              Explorar Productos
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}