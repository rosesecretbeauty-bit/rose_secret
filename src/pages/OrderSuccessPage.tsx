import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home, Receipt } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { api } from '../api/client';
import { useCartStore } from '../stores/cartStore';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart, loadCart } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Limpiar carrito al cargar la página
    clearCart();
    loadCart();

    // Cargar información de la orden si hay orderId
    if (orderId) {
      loadOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/orders/${orderId}`) as {
        success: boolean;
        data?: any;
      };

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('No se pudo cargar la información de la orden');
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      setError('Error al cargar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            ¡Orden Confirmada!
          </h1>
          <p className="text-lg text-stone-600">
            Gracias por tu compra. Hemos recibido tu pedido y te notificaremos cuando sea enviado.
          </p>
        </motion.div>

        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5 text-rose-600" />
                  <h2 className="text-xl font-semibold text-stone-900">
                    Detalles de la Orden
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Número de Orden:</span>
                    <span className="font-semibold text-stone-900">
                      {order.order_number || `#${order.id}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-600">Estado:</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {order.status === 'pending' ? 'Pendiente de Pago' : order.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-600">Total:</span>
                    <span className="font-bold text-stone-900 text-lg">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <h3 className="font-semibold text-stone-900 mb-2">Productos:</h3>
                      <ul className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="text-stone-600">
                              {item.product_name}
                              {item.variant_name && ` - ${item.variant_name}`}
                              {' '}x {item.quantity}
                            </span>
                            <span className="text-stone-900 font-medium">
                              ${parseFloat(item.subtotal || 0).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.shipping_name && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <h3 className="font-semibold text-stone-900 mb-2">Dirección de Envío:</h3>
                      <p className="text-sm text-stone-600">
                        {order.shipping_name}<br />
                        {order.shipping_street}<br />
                        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                        {order.shipping_country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ) : error ? (
          <Card className="mb-6">
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-stone-600">
                Tu orden ha sido creada exitosamente. Recibirás un correo de confirmación pronto.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="mb-6">
            <div className="p-6 text-center">
              <p className="text-stone-600 mb-4">
                Tu orden ha sido creada exitosamente.
              </p>
              <p className="text-sm text-stone-500">
                Recibirás un correo de confirmación pronto.
              </p>
            </div>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Button>

          {orderId && (
            <Link to={`/account/orders/${orderId}`}>
              <Button className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Ver Detalles de la Orden
              </Button>
            </Link>
          )}

          <Link to="/shop">
            <Button variant="outline" className="flex items-center gap-2">
              Seguir Comprando
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

