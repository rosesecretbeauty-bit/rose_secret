import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, MapPin, Phone, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { trackEvent } from '../analytics/analyticsClient';

interface OrderItem {
  id: number;
  product_id: number;
  variant_id?: number;
  variant_name?: string;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
  image_url?: string;
  variant_current_price?: number;
  variant_current_name?: string;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  shipping_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
  created_at: string;
  items: OrderItem[];
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!isAuthenticated || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/orders/${id}`);
        
        if (response.success && response.data) {
          const orderData = response.data.order;
          setOrder(orderData);

          // Track order viewed
          trackEvent('ORDER_VIEWED', {
            orderId: orderData.id.toString(),
            orderNumber: orderData.order_number,
            status: orderData.status,
            totalValue: parseFloat(orderData.total),
            currency: 'USD',
          });
        }
      } catch (err: any) {
        console.error('Error loading order:', err);
        if (err.message?.includes('404') || err.message?.includes('no encontrado')) {
          setError('not_found');
        } else {
          setError(err.message || 'Error al cargar el pedido');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, isAuthenticated]);

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
      case 'pending_payment':
        return 'secondary';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'champagne';
      case 'cancelled':
      case 'payment_failed':
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
          <div className="mb-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error - Not found
  if (error === 'not_found') {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Package className="h-10 w-10" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-2">
              Pedido no encontrado
            </h2>
            <p className="text-gray-500 mb-8">
              El pedido que buscas no existe o no tienes permisos para verlo.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/account/orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Pedidos
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Estado de error - Otro error
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
              Error al cargar pedido
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

  // Estado success - Mostrar pedido
  if (!order) {
    return null;
  }

  // Calcular subtotal desde items
  const subtotal = order.items.reduce((sum, item) => {
    return sum + parseFloat(item.subtotal);
  }, 0);

  // Calcular shipping (si existe, sino 0)
  const shipping = parseFloat(order.total) - subtotal;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        {/* Header con botón volver */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/account/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Link>
          <h1 className="font-serif text-3xl font-medium text-gray-900 mb-2">
            Detalle del Pedido
          </h1>
          <p className="text-gray-600">Order {order.order_number}</p>
        </motion.div>

        <div className="space-y-6">
          {/* Información del Pedido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Order {order.order_number}
                      </h3>
                      <Badge variant={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-xl font-serif font-medium text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Items del Pedido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Items del Pedido</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="h-20 w-20 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback a placeholder si la imagen falla
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h4>
                        {item.variant_name && (
                          <p className="text-sm text-rose-600 font-medium mb-1">
                            Variante: {item.variant_name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} × ${parseFloat(item.product_price).toFixed(2)}
                        </p>
                        {item.variant_current_price && item.variant_current_price !== parseFloat(item.product_price) && (
                          <p className="text-xs text-gray-400 mt-1">
                            Precio actual: ${item.variant_current_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resumen de Totales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Resumen</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="text-gray-900">${shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dirección de Envío */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Dirección de Envío</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{order.shipping_name}</p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                      </p>
                      <p className="text-sm text-gray-600">{order.shipping_country}</p>
                    </div>
                  </div>
                  {order.shipping_phone && (
                    <div className="flex items-center gap-2 pt-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{order.shipping_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking Timeline */}
          {order.status !== 'cancelled' && order.status !== 'payment_failed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="font-medium text-gray-900">Seguimiento del Pedido</h3>
                </CardHeader>
                <CardContent>
                  <OrderTrackingTimeline orderId={parseInt(id!)} orderStatus={order.status} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar timeline de tracking
function OrderTrackingTimeline({ orderId, orderStatus }: { orderId: number; orderStatus: string }) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracking = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}/tracking`) as {
          success: boolean;
          data?: {
            timeline: any[];
          };
        };
        
        if (response.success && response.data) {
          setTimeline(response.data.timeline);
        }
      } catch (error) {
        console.error('Error loading tracking:', error);
        // Si no hay tracking, crear timeline básico desde el estado del pedido
        setTimeline([{
          status: orderStatus,
          title: orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1).replace('_', ' '),
          description: 'Estado actual del pedido',
          date: new Date().toISOString(),
          is_completed: ['delivered', 'cancelled'].includes(orderStatus)
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [orderId, orderStatus]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (timeline.length === 0) {
    return <p className="text-sm text-gray-500">No hay información de tracking disponible</p>;
  }

  return (
    <div className="relative">
      {/* Timeline vertical */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {timeline.map((event, index) => (
          <div key={index} className="relative flex items-start gap-4">
            {/* Dot */}
            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              event.is_completed 
                ? 'bg-rose-600 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {event.is_completed ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                {event.is_completed && (
                  <Badge variant="champagne" className="text-xs">
                    Completado
                  </Badge>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-gray-600 mb-1">{event.description}</p>
              )}
              {event.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </p>
              )}
              {event.tracking_number && (
                <p className="text-xs text-gray-500 mt-1">
                  Tracking: <span className="font-mono">{event.tracking_number}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(event.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

