import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import { useCheckoutStore } from '../stores/checkoutStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { CheckoutSteps } from '../components/checkout/CheckoutSteps';
import { ShippingForm } from '../components/checkout/ShippingForm';
import { PaymentForm } from '../components/checkout/PaymentForm';
import { OrderReview } from '../components/checkout/OrderReview';
import { PremiumLoader } from '../components/ui/PremiumLoader';

// Lazy load StripePaymentForm para evitar errores de carga
const StripePaymentForm = lazy(() => 
  import('../components/checkout/StripePaymentForm').then(module => ({
    default: module.StripePaymentForm
  }))
);
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ChevronRight, ArrowLeft, Lock, CheckCircle, Package } from 'lucide-react';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Confetti } from '../components/ui/Confetti';
import { GlassCard } from '../components/ui/GlassCard';
function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    getCartTotal,
    clearCart,
    loadCart
  } = useCartStore();
  const {
    step: currentStep,
    setStep,
    processOrder,
    isProcessing,
    paymentMethod
  } = useCheckoutStore();
  const {
    isAuthenticated
  } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Los items del carrito ya son productos directamente, no necesitan item.product
  const validItems = items.filter(item => item && item.id);
  
  // Validar autenticación al entrar a la página
  useEffect(() => {
    // Si no está autenticado, redirigir a login con redirect al checkout
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('redirect', currentPath);
      navigate(`/login?${searchParams.toString()}`);
      return;
    }
  }, [isAuthenticated, navigate]);
  
  const handleNext = () => {
    // Validar autenticación antes de avanzar de shipping a payment
    if (currentStep === 'shipping') {
      if (!isAuthenticated) {
        addToast({
          type: 'error',
          message: 'Debes iniciar sesión para continuar con el pago'
        });
        navigate('/login?redirect=/checkout');
        return;
      }
      setStep('payment');
    } else if (currentStep === 'payment') {
      setStep('review');
    }
  };
  const handleBack = () => {
    if (currentStep === 'payment') setStep('shipping');else if (currentStep === 'review') setStep('payment');else navigate('/cart');
  };
  // Crear pedido y procesar pago simulado (sin backend)
  const handleCreateOrder = async (e?: React.MouseEvent) => {
    // Prevenir cualquier comportamiento por defecto
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setError(null);
      
      // Validar que el carrito no esté vacío SOLO cuando intenta pagar
      if (items.length === 0) {
        setError('Tu carrito está vacío');
        addToast({
          type: 'error',
          message: 'Tu carrito está vacío. Agrega productos antes de continuar.'
        });
        navigate('/cart');
        return;
      }
      
      // Validar que el usuario esté autenticado SOLO cuando intenta pagar
      if (!isAuthenticated) {
        setError('Debes iniciar sesión para completar tu pedido');
        addToast({
          type: 'error',
          message: 'Debes iniciar sesión para completar tu pedido'
        });
        navigate('/login?redirect=/checkout');
        return;
      }
      
      // Crear pedido simulado
      const order = await processOrder();
      
      if (!order) {
        throw new Error('No se recibió información del pedido');
      }
      
      // Guardar información del pedido
      if (order.order_number) {
        setOrderNumber(order.order_number);
      } else {
        setOrderNumber(`RS-${Date.now().toString().slice(-8)}`);
      }
      
      if (order.id) {
        setOrderId(order.id.toString());
      }
      
      // Cambiar a paso de procesamiento de pago (StripePaymentForm)
      setStep('payment_processing');
      
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error.message || 'Error al crear el pedido. Por favor, intenta nuevamente.';
      setError(errorMessage);
      addToast({
        type: 'error',
        message: errorMessage
      });
    }
  };

  // Manejar éxito del pago
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Mostrar éxito
      setShowConfetti(true);
      addToast({
        type: 'success',
        message: '¡Pago procesado exitosamente!'
      });
      
      // Limpiar carrito (el webhook también lo limpiará, pero limpiamos el estado local)
      clearCart();
      await loadCart();
      
      // Cambiar a confirmación
      setStep('confirmation');
      
      // Redirigir a página de éxito después de 3 segundos
      setTimeout(() => {
        if (orderId) {
          navigate(`/order-success/${orderId}`);
        } else {
          navigate('/order-success');
        }
      }, 3000);
    } catch (error: any) {
      console.error('Error after payment success:', error);
    }
  };

  // Manejar error del pago
  const handlePaymentError = (error: string) => {
    setError(error);
    addToast({
      type: 'error',
      message: error || 'Error al procesar el pago'
    });
    // El pedido queda en estado pending, el usuario puede reintentar
    // Volver al paso de revisión para que pueda intentar nuevamente
    setStep('review');
  };
  // Calculate progress based on step
  const getProgress = () => {
    switch (currentStep) {
      case 'shipping':
        return 25;
      case 'payment':
        return 50;
      case 'review':
        return 75;
      case 'payment_processing':
        return 90;
      case 'confirmation':
        return 100;
      default:
        return 0;
    }
  };
  // Order Confirmation View
  if (currentStep === 'confirmation') {
    return <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 min-h-screen flex items-center justify-center py-20">
        <Confetti isActive={showConfetti} />

        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="max-w-2xl w-full mx-4">
          <GlassCard className="text-center p-12" blur="lg">
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 200
          }} className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }} className="font-serif text-4xl font-bold text-gray-900 mb-4">
              ¡Pedido Confirmado!
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} className="text-lg text-gray-600 mb-8">
              Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }} className="bg-white rounded-2xl p-6 mb-8 border-2 border-rose-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="w-6 h-6 text-rose-600" />
                <p className="text-sm text-gray-600">Número de Pedido</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-mono">
                {orderNumber}
              </p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6
          }} className="space-y-4">
              <p className="text-sm text-gray-600">
                Recibirás un email de confirmación con los detalles de tu pedido
                y el seguimiento de envío.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                {orderId && (
                  <Button 
                    onClick={() => navigate(`/account/orders/${orderId}`)} 
                    className="bg-gradient-to-r from-rose-600 to-pink-600"
                  >
                    Ver Detalle del Pedido
                  </Button>
                )}
                <Button onClick={() => navigate('/account/orders')} className="bg-gradient-to-r from-rose-600 to-pink-600">
                  Ver Mis Pedidos
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>;
  }
  // NO retornar null - permitir que el usuario vea la página incluso sin items
  // Solo mostrar mensaje si no hay items
  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-8">
            Agrega productos a tu carrito para continuar con el pago.
          </p>
          <Button onClick={() => navigate('/cart')}>
            Ver Carrito
          </Button>
        </div>
      </div>
    );
  }
  return <div className="bg-gray-50 min-h-screen pb-20">
      {isProcessing && <PremiumLoader fullScreen text="Procesando tu pago seguro..." />}

      <div className="container-custom py-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Finalizar Compra
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Completa tu pedido de forma segura</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <ProgressBar progress={getProgress()} height={4} color="bg-rose-600" showPercentage={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CheckoutSteps currentStep={currentStep} />

            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                {currentStep === 'shipping' && <ShippingForm />}
                {currentStep === 'payment' && <PaymentForm />}
                {currentStep === 'review' && <OrderReview />}
                {currentStep === 'payment_processing' && orderId && (
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <PremiumLoader />
                    </div>
                  }>
                    <StripePaymentForm
                      orderId={orderId}
                      amount={getCartTotal()}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      isLoading={isProcessing}
                    />
                  </Suspense>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                leftIcon={<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
                className="text-xs sm:text-sm order-2 sm:order-1"
              >
                <span className="hidden sm:inline">{currentStep === 'shipping' ? 'Volver al Carrito' : 'Atrás'}</span>
                <span className="sm:hidden">Atrás</span>
              </Button>

              {currentStep === 'review' ? (
                <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                  {error && (
                    <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 sm:px-4 py-2 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Button 
                    type="button"
                    onClick={handleCreateOrder} 
                    disabled={isProcessing || items.length === 0} 
                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap" 
                    leftIcon={<Lock className="w-3 h-3 sm:w-4 sm:h-4" />}
                    isLoading={isProcessing}
                  >
                    {isProcessing ? (
                      'Creando pedido...'
                    ) : (
                      <>
                        <span className="hidden sm:inline">Crear Pedido y Pagar ${getCartTotal().toFixed(2)}</span>
                        <span className="sm:hidden">Pagar ${(getCartTotal() * 1.16).toFixed(2)}</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : currentStep === 'payment_processing' ? (
                // El formulario de Stripe maneja sus propios botones
                null
              ) : (
                <Button 
                  onClick={handleNext} 
                  rightIcon={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
                  className="text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto"
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="sticky top-16 sm:top-20 lg:top-24" blur="sm" border={false}>
              <CardHeader className="p-4 sm:p-6">
                <h3 className="font-serif text-base sm:text-lg font-bold">
                  Resumen del Pedido
                </h3>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Products */}
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
                    {validItems.map(item => (
                      <div key={item.id} className="flex gap-2 sm:gap-3 md:gap-4">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={item.images?.[0] || ''} alt={item.name || ''} className="w-full h-full object-cover" />
                          <span className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-bl-md font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 break-words">
                            {item.name}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
                            ${(item.price || 0).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 flex-shrink-0">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Envío</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Impuestos</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${(getCartTotal() * 0.16).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-rose-600">
                        ${(getCartTotal() * 1.16).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Pago 100% seguro con encriptación SSL</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Garantía de devolución de 30 días</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Envío gratis en todos los pedidos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>;
}

export default CheckoutPage;