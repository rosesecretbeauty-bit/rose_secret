import React from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useCheckoutStore } from '../../stores/checkoutStore';
import { useDiscountStore } from '../../stores/discountStore';
import { Button } from '../ui/Button';
import { CouponInput } from './CouponInput';

export function OrderReview() {
  const {
    items,
    getCartTotal
  } = useCartStore();
  const {
    shippingAddress,
    paymentMethod,
    setStep,
    manualAddress
  } = useCheckoutStore();
  const {
    cartTotals,
    appliedDiscounts,
    automaticDiscounts
  } = useDiscountStore();
  
  // Usar totales del discountStore si están disponibles, sino calcular localmente
  const subtotal = getCartTotal();
  const allDiscounts = [...appliedDiscounts, ...automaticDiscounts];
  const discountTotal = cartTotals?.discount_total || 
    allDiscounts.reduce((sum, d) => sum + d.amount, 0);
  const shipping = cartTotals?.shipping ?? 0; // Envío gratis por ahora
  const tax = cartTotals?.tax ?? (subtotal * 0.16); // 16% de impuestos
  const total = cartTotals?.total ?? (subtotal - discountTotal + shipping + tax);
  
  // La función handlePlaceOrder se maneja en CheckoutPage
  // Este componente solo muestra la revisión
  
  const address = manualAddress || shippingAddress;
  
  return <div className="space-y-8 animate-fade-in">
      <h2 className="text-xl font-serif font-medium text-gray-900">
        Revisar Pedido
      </h2>

      {/* Shipping & Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Dirección de Envío</h3>
          {address ? (
            <p className="text-sm text-gray-600">
              {address.shipping_name || `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim()}
              <br />
              {address.shipping_street || shippingAddress?.address}
              <br />
              {address.shipping_city || shippingAddress?.city}, {address.shipping_zip || shippingAddress?.zipCode}
              <br />
              {address.shipping_country || shippingAddress?.country}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No hay dirección seleccionada</p>
          )}
          <Button variant="link" onClick={() => setStep('shipping')} className="mt-2 text-xs">
            Editar
          </Button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Método de Pago</h3>
          <p className="text-sm text-gray-600 capitalize">
            {paymentMethod === 'credit_card' ? 'Tarjeta de Crédito / Débito' : 
             paymentMethod === 'paypal' ? 'PayPal' : 
             paymentMethod || 'No seleccionado'}
          </p>
          <Button variant="link" onClick={() => setStep('payment')} className="mt-2 text-xs">
            Editar
          </Button>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Productos ({items.length})
        </h3>
        <div className="space-y-4">
          {items.map(item => <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                  <img src={item.images?.[0] || item.product?.images?.[0] || ''} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name || item.product?.name}
                  </p>
                  <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
              </p>
            </div>)}
        </div>
      </div>

      {/* Coupon Input */}
      <div className="border-t border-gray-200 pt-6">
        <CouponInput />
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-6 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {/* Descuentos */}
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Descuentos</span>
            <span>-${discountTotal.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Envío</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Impuestos {tax > 0 && `(${((tax / subtotal) * 100).toFixed(0)}%)`}</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-serif font-medium text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* El botón de "Crear Pedido" está en CheckoutPage, no aquí */}
    </div>;
}