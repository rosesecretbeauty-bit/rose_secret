import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CreditCard, MapPin, Truck, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../stores/toastStore';
export function MobileCheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    getCartTotal,
    clearCart
  } = useCartStore();
  const addToast = useToastStore(state => state.addToast);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 10;
  const finalTotal = total + shipping;
  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      clearCart();
      addToast({
        type: 'success',
        message: 'Order placed successfully!'
      });
      setTimeout(() => navigate('/account/orders'), 2000);
    }, 2000);
  };
  if (items.length === 0 && !isComplete) {
    return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>;
  }
  if (isComplete) {
    return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-serif font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. You will receive an email confirmation
          shortly.
        </p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link to="/cart" className="p-2 -ml-2">
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="font-medium text-lg flex-1 text-center pr-8">
          Checkout
        </h1>
        <Lock className="h-4 w-4 text-green-600" />
      </header>

      <div className="p-4 space-y-4">
        {/* Express Checkout */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-[#5A31F4] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            Shop Pay
          </button>
          <button className="bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            Apple Pay
          </button>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-sm text-gray-400 font-medium">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Shipping Address */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-600" /> Shipping
            </h2>
            <button className="text-rose-600 text-sm font-medium">Edit</button>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-900">Jane Doe</p>
            <p>123 Luxury Avenue, Apt 4B</p>
            <p>New York, NY 10001</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </section>

        {/* Delivery Method */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-rose-600" /> Delivery Method
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-rose-200 bg-rose-50 rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-rose-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Standard Shipping</p>
                  <p className="text-xs text-gray-500">3-5 business days</p>
                </div>
              </div>
              <span className="font-medium text-gray-900">
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <div>
                  <p className="font-medium text-gray-900">Express Shipping</p>
                  <p className="text-xs text-gray-500">1-2 business days</p>
                </div>
              </div>
              <span className="font-medium text-gray-900">$15.00</span>
            </label>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-rose-600" /> Payment
          </h2>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
              VISA
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                •••• •••• •••• 4242
              </p>
              <p className="text-xs text-gray-500">Expires 12/25</p>
            </div>
            <button className="text-rose-600 text-sm font-medium">
              Change
            </button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.length} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${(total * 0.08).toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${(finalTotal + total * 0.08).toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Button fullWidth size="lg" onClick={handlePayment} disabled={isProcessing} className="h-14 text-lg font-bold shadow-xl shadow-rose-500/20">
          {isProcessing ? <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span> : `Pay $${(finalTotal + total * 0.08).toFixed(2)}`}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          Secure 256-bit SSL Encrypted Payment
        </div>
      </div>
    </div>;
}