// ============================================
// Stripe Payment Form Component
// ============================================

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { trackEvent } from '../../analytics/analyticsClient';

// Función para inicializar Stripe de forma segura (lazy)
let stripePromise: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('VITE_STRIPE_PUBLISHABLE_KEY no está definida');
      // Retornar una promesa rechazada para manejar el error
      return Promise.reject(new Error('Stripe publishable key no configurada'));
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

/**
 * Componente interno que maneja el formulario de pago
 */
function PaymentFormInner({
  orderId,
  amount,
  onSuccess,
  onError,
  isLoading: externalLoading
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const addToast = useToastStore(state => state.addToast);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar Payment Intent cuando el componente se monta
  useEffect(() => {
    const loadPaymentIntent = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const response = await api.post('/payments/create-intent', {
          order_id: parseInt(orderId)
        });

        if (response.success && response.data) {
          setClientSecret(response.data.clientSecret);

          // Track payment intent created
          trackEvent('PAYMENT_INTENT_CREATED', {
            orderId: orderId,
            amount: amount,
            currency: 'USD',
          });
        } else {
          throw new Error(response.message || 'Error al crear intención de pago');
        }
      } catch (err: any) {
        console.error('Error loading payment intent:', err);
        const errorMessage = err.message || 'Error al inicializar el pago';
        setError(errorMessage);
        onError(errorMessage);
        addToast({
          type: 'error',
          message: errorMessage
        });
      } finally {
        setIsProcessing(false);
      }
    };

    if (orderId) {
      loadPaymentIntent();
    }
  }, [orderId, onError, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe no está listo. Por favor, espera un momento.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('No se encontró el elemento de tarjeta');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Opcional: agregar detalles de facturación
            }
          }
        }
      );

      if (stripeError) {
        // Manejar errores específicos de Stripe
        let errorMessage = 'Error al procesar el pago';
        
        if (stripeError.type === 'card_error') {
          errorMessage = stripeError.message || 'Tu tarjeta fue rechazada. Por favor verifica los datos o usa otra tarjeta.';
        } else if (stripeError.type === 'validation_error') {
          errorMessage = stripeError.message || 'Error de validación. Por favor verifica los datos ingresados.';
        } else {
          errorMessage = stripeError.message || 'Error al procesar el pago. Por favor intenta nuevamente.';
        }

        // Track payment failed
        trackEvent('PAYMENT_FAILED', {
          orderId: orderId,
          amount: amount,
          currency: 'USD',
          paymentMethod: 'card',
          error: errorMessage,
        });

        throw new Error(errorMessage);
      }

      if (!paymentIntent) {
        throw new Error('No se recibió información del pago');
      }

      // Manejar diferentes estados del payment intent
      if (paymentIntent.status === 'succeeded') {
        // Confirmar el pago en nuestro backend
        try {
          const confirmResponse = await api.post('/payments/confirm', {
            payment_intent_id: paymentIntent.id,
            order_id: parseInt(orderId)
          });

          if (confirmResponse.success) {
            // Track payment success
            trackEvent('PAYMENT_SUCCESS', {
              orderId: orderId,
              orderNumber: confirmResponse.data?.order?.order_number || orderId,
              amount: amount,
              currency: 'USD',
              paymentMethod: 'card',
              paymentIntentId: paymentIntent.id,
            });

            addToast({
              type: 'success',
              message: '¡Pago procesado exitosamente!'
            });
            onSuccess(paymentIntent.id);
          } else {
            throw new Error(confirmResponse.message || 'Error al confirmar el pago');
          }
        } catch (confirmErr: any) {
          // Si el backend falla pero Stripe ya procesó el pago, el webhook lo manejará
          // Pero informamos al usuario
          console.error('Error confirming payment in backend:', confirmErr);
          addToast({
            type: 'warning',
            message: 'El pago fue procesado, pero hay un retraso en la confirmación. Verifica tu pedido en unos momentos.'
          });
          onSuccess(paymentIntent.id);
        }
      } else if (paymentIntent.status === 'requires_action') {
        // 3D Secure u otra acción requerida
        // Stripe maneja esto automáticamente, pero informamos al usuario
        setError('Se requiere una acción adicional para completar el pago. Por favor, sigue las instrucciones en pantalla.');
        addToast({
          type: 'info',
          message: 'Completa la verificación de seguridad para continuar'
        });
        setIsProcessing(false);
      } else if (paymentIntent.status === 'processing') {
        // El pago está siendo procesado
        setError(null);
        addToast({
          type: 'info',
          message: 'Tu pago está siendo procesado. Por favor espera...'
        });
        // Polling para verificar estado
        pollPaymentStatus(paymentIntent.id);
      } else if (paymentIntent.status === 'requires_payment_method') {
        throw new Error('Se requiere un método de pago válido. Por favor verifica los datos de tu tarjeta.');
      } else {
        throw new Error(`El pago está en estado: ${paymentIntent.status}. Por favor intenta nuevamente.`);
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const errorMessage = err.message || 'Error al procesar el pago';
      setError(errorMessage);
      onError(errorMessage);
      addToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Polling para verificar estado de pago cuando está en processing
  const pollPaymentStatus = async (paymentIntentId: string, maxAttempts = 10) => {
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('El pago está tomando más tiempo del esperado. Verifica tu pedido en unos momentos.');
        return;
      }

      attempts++;

      try {
        const response = await api.get(`/payments/orders/${orderId}/status`);
        
        if (response.success && response.data) {
          const paymentStatus = response.data.payment?.status;
          
          if (paymentStatus === 'paid') {
            addToast({
              type: 'success',
              message: '¡Pago procesado exitosamente!'
            });
            onSuccess(paymentIntentId);
            return;
          } else if (paymentStatus === 'failed') {
            const failureReason = response.data.payment?.failure_reason || 'El pago fue rechazado';
            setError(failureReason);
            onError(failureReason);
            return;
          }
        }

        // Si aún está procesando, esperar y volver a intentar
        setTimeout(poll, 2000); // 2 segundos
      } catch (err) {
        console.error('Error polling payment status:', err);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const isLoading = isProcessing || externalLoading || !clientSecret;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
          Información de Pago
        </h2>
        <p className="text-sm text-gray-500">
          Pago seguro procesado por Stripe
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error de pago</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Información de Tarjeta
          </label>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Pago 100% Seguro</p>
            <p>
              Tus datos están protegidos con encriptación SSL de 256-bits. No
              almacenamos los datos de tu tarjeta.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-600">Total a pagar</p>
            <p className="text-2xl font-bold text-gray-900">
              ${amount.toFixed(2)}
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            className="min-w-[160px]"
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            {isLoading ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Componente principal que envuelve el formulario con Stripe Elements
 */
export function StripePaymentForm(props: StripePaymentFormProps) {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);

  // Cargar Stripe de forma segura
  useEffect(() => {
    getStripePromise()
      .then(stripe => {
        setStripeInstance(stripe);
        setStripeError(null);
      })
      .catch(err => {
        console.error('Error loading Stripe:', err);
        setStripeError('Error al inicializar el sistema de pagos. Por favor, recarga la página.');
      });
  }, []);

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(props.amount * 100), // Stripe usa centavos
    currency: 'usd',
  };

  // Si hay error o Stripe no está cargado, mostrar mensaje
  if (stripeError || !stripeInstance) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            {stripeError || 'Cargando sistema de pagos...'}
          </p>
        </div>
        {!stripeError && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Elements stripe={stripeInstance} options={options}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}

