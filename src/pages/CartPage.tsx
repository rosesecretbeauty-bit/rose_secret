import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { CartItem } from '../components/cart/CartItem';
import { Button } from '../components/ui/Button';
import { trackEvent } from '../analytics/analyticsClient';

export function CartPage() {
  const {
    items,
    getCartTotal,
    getItemCount
  } = useCartStore();

  // Track cart view
  useEffect(() => {
    trackEvent('VIEW_CART', {
      itemCount: getItemCount(),
      totalValue: getCartTotal(),
      currency: 'USD',
    });
  }, [getItemCount, getCartTotal]);
  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;
  if (items.length === 0) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-2xl font-medium text-gray-900 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-500 mb-8">
          Parece que aún no has agregado nada.
        </p>
        <Link to="/shop">
          <Button size="lg">Comenzar a Comprar</Button>
        </Link>
      </div>;
  }
  return <div className="bg-white py-6 sm:py-8 md:py-12 animate-fade-in">
      <div className="container-custom">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900 mb-6 sm:mb-8">
          Carrito de Compras
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="border-t border-gray-200">
              {items.map(item => <CartItem key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} item={item} />)}
            </div>
            <div className="mt-6 sm:mt-8">
              <Link to="/shop" className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96 lg:sticky lg:top-4 lg:self-start">
            <div className="bg-gray-50 rounded-lg p-5 sm:p-6">
              <h2 className="font-serif text-base sm:text-lg font-medium text-gray-900 mb-5 sm:mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Envío Estimado</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Impuestos Estimados</span>
                  <span className="text-xs">Se calculan en checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-5 sm:mb-6">
                <div className="flex justify-between text-base sm:text-lg font-medium text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button fullWidth size="lg" className="text-sm sm:text-base">
                  Proceder al Pago
                </Button>
              </Link>

              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-center text-gray-500">
                Checkout seguro con Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}