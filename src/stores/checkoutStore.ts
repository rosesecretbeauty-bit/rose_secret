import { create } from 'zustand';
import { CheckoutState } from '../types';
import { api } from '../api/client';
import { trackEvent } from '../analytics/analyticsClient';

interface ManualAddress {
  shipping_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
}

interface CheckoutStore extends CheckoutState {
  setStep: (step: CheckoutState['step']) => void;
  setAddressId: (addressId: number | null) => void;
  setManualAddress: (address: ManualAddress | null) => void;
  setPaymentMethod: (method: string) => void;
  processOrder: () => Promise<any>;
  resetCheckout: () => void;
  isProcessing?: boolean;
  currentStep?: CheckoutState['step'];
  addressId: number | null;
  manualAddress: ManualAddress | null;
}

const initialState: CheckoutState = {
  step: 'shipping',
  shippingAddress: null,
  paymentMethod: null
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  ...initialState,
  currentStep: 'shipping',
  isProcessing: false,
  addressId: null,
  manualAddress: null,
  
  setStep: step => {
    set({
      step,
      currentStep: step
    });

    // Track BEGIN_CHECKOUT when moving to payment step
    if (step === 'payment') {
      // Usar import dinámico en lugar de require (compatible con frontend)
      import('./cartStore').then(({ useCartStore }) => {
        const cartStore = useCartStore.getState();
        trackEvent('BEGIN_CHECKOUT', {
          totalValue: cartStore.getCartTotal(),
          currency: 'USD',
          itemCount: cartStore.getItemCount(),
          items: cartStore.items.map(item => ({
            productId: item.id?.toString() || item.product_id?.toString() || '',
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      }).catch(err => {
        console.warn('Error tracking BEGIN_CHECKOUT:', err);
      });
    }
  },
  
  setAddressId: addressId => {
    set({
      addressId,
      manualAddress: null // Limpiar dirección manual si se selecciona una guardada
    });
  },
  
  setManualAddress: address => {
    set({
      manualAddress: address,
      addressId: null // Limpiar address_id si se usa dirección manual
    });
  },
  
  setPaymentMethod: method => set({
    paymentMethod: method
  }),
  
  processOrder: async () => {
    try {
      set({ isProcessing: true });
      const { addressId, manualAddress } = get();
      
      // Validar que haya una dirección (guardada o manual)
      if (!addressId && !manualAddress) {
        throw new Error('Debes seleccionar o ingresar una dirección de envío');
      }
      
      // Obtener totales del carrito
      const { useCartStore } = await import('./cartStore');
      const cartStore = useCartStore.getState();
      const cartTotal = cartStore.getCartTotal();
      
      // Preparar payload para la API
      const payload: any = {};
      
      // Si hay address_id, usarlo; si no, usar campos manuales
      if (addressId) {
        payload.address_id = addressId;
      } else if (manualAddress) {
        // Usar campos manuales
        payload.shipping_name = manualAddress.shipping_name;
        payload.shipping_street = manualAddress.shipping_street;
        payload.shipping_city = manualAddress.shipping_city;
        payload.shipping_state = manualAddress.shipping_state;
        payload.shipping_zip = manualAddress.shipping_zip;
        payload.shipping_country = manualAddress.shipping_country;
        if (manualAddress.shipping_phone) {
          payload.shipping_phone = manualAddress.shipping_phone;
        }
      }
      
      // Los totales son opcionales, el backend los calcula desde el carrito
      // Pero podemos enviarlos para validación
      payload.subtotal = cartTotal;
      payload.shipping_cost = 0; // Por ahora, shipping gratis
      payload.tax = 0; // Por ahora, sin impuestos
      
      // Obtener descuentos aplicados del discountStore
      const { useDiscountStore } = await import('./discountStore');
      const discountStore = useDiscountStore.getState();
      const discountTotal = discountStore.cartTotals?.discount_total || 0;
      
      // Enviar código de cupón si hay descuentos manuales aplicados
      if (discountStore.appliedDiscounts.length > 0) {
        const couponCode = discountStore.appliedDiscounts[0].code;
        if (couponCode) {
          payload.coupon_code = couponCode;
        }
      }
      
      // Enviar monto de descuento (el backend lo validará)
      payload.discount = discountTotal;
      
      // Llamar al backend para crear la orden
      const response = await api.post('/orders', payload) as {
        success: boolean;
        message?: string;
        data?: {
          order: {
            id: number;
            order_number: string;
            status: string;
            total: number;
            subtotal: number;
            shipping_cost: number;
            tax: number;
            created_at: string;
            shipping_address: any;
          };
        };
      };
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al crear la orden');
      }
      
      const order = response.data.order;
      
      // Limpiar carrito después de crear la orden exitosamente
      // El backend ya limpia el carrito, pero recargamos para sincronizar
      await cartStore.loadCart();
      
      set({ 
        isProcessing: false
      });

      // Track analytics events
      trackEvent('ORDER_CREATED', {
        orderId: order.id.toString(),
        orderNumber: order.order_number,
        totalValue: order.total,
        currency: 'USD',
        itemCount: cartStore.items.length,
        items: cartStore.items.map(item => ({
          productId: item.id?.toString() || item.product_id?.toString() || '',
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Retornar orden en formato compatible con el frontend
      return {
        id: order.id.toString(),
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        tax: order.tax,
        created_at: order.created_at,
        shipping_address: order.shipping_address || manualAddress
      };
    } catch (error: any) {
      set({ isProcessing: false });
      console.error('Error processing order:', error);
      
      // Mejorar mensaje de error
      if (error.message) {
        throw error;
      }
      
      // Si hay error de respuesta del servidor, extraer mensaje
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Error al procesar el pedido. Por favor, intenta nuevamente.');
    }
  },
  
  resetCheckout: () => set({ 
    ...initialState, 
    currentStep: 'shipping', 
    isProcessing: false,
    addressId: null,
    manualAddress: null
  })
}));