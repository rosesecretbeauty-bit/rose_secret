import React, { useState } from 'react';
import { CreditCard, Wallet, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCheckoutStore } from '../../stores/checkoutStore';
import { motion, AnimatePresence } from 'framer-motion';
export function PaymentForm() {
  const {
    setPaymentMethod,
    setStep
  } = useCheckoutStore();
  const [selected, setSelected] = useState<string>('credit_card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    let formattedValue = value;
    // Simple formatting logic
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (selected === 'credit_card') {
      if (formData.cardNumber.length < 19) newErrors.cardNumber = 'Número de tarjeta inválido';
      if (formData.expiry.length < 5) newErrors.expiry = 'Fecha inválida';
      if (formData.cvc.length < 3) newErrors.cvc = 'CVC inválido';
      if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsProcessing(true);
      // Simulate processing delay
      setTimeout(() => {
        setPaymentMethod(selected);
        setStep('review');
        setIsProcessing(false);
      }, 1000);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
          Método de Pago
        </h2>
        <p className="text-sm text-gray-500">
          Todas las transacciones son seguras y están encriptadas.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Credit Card Option */}
        <label className={`relative flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selected === 'credit_card' ? 'border-rose-600 bg-rose-50/50 shadow-sm ring-1 ring-rose-600' : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'}`}>
          <div className="flex items-center h-5">
            <input type="radio" name="payment" value="credit_card" checked={selected === 'credit_card'} onChange={e => setSelected(e.target.value)} className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500" />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="block text-sm font-bold text-gray-900">
                Tarjeta de Crédito / Débito
              </span>
              <div className="flex gap-2">
                <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="Visa" className="h-6 opacity-70" />
                <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" alt="Mastercard" className="h-6 opacity-70" />
              </div>
            </div>

            <AnimatePresence>
              {selected === 'credit_card' && <motion.div initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: 'auto',
              opacity: 1
            }} exit={{
              height: 0,
              opacity: 0
            }} className="overflow-hidden">
                  <div className="mt-4 space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all`} />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.cardNumber && <p className="text-xs text-red-500">
                          {errors.cardNumber}
                        </p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">
                          Vencimiento
                        </label>
                        <input type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.expiry ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all`} />
                        {errors.expiry && <p className="text-xs text-red-500">
                            {errors.expiry}
                          </p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">
                          CVC
                        </label>
                        <div className="relative">
                          <input type="text" name="cvc" placeholder="123" value={formData.cvc} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.cvc ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all`} />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.cvc && <p className="text-xs text-red-500">{errors.cvc}</p>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Nombre en la Tarjeta
                      </label>
                      <input type="text" name="name" placeholder="Como aparece en la tarjeta" value={formData.name} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all`} />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </label>

        {/* PayPal Option */}
        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selected === 'paypal' ? 'border-rose-600 bg-rose-50/50 shadow-sm ring-1 ring-rose-600' : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'}`}>
          <input type="radio" name="payment" value="paypal" checked={selected === 'paypal'} onChange={e => setSelected(e.target.value)} className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500" />
          <div className="ml-4 flex-1 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-gray-900">
                PayPal
              </span>
              <span className="block text-xs text-gray-500">
                Paga de forma segura con tu cuenta PayPal
              </span>
            </div>
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
        </label>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-600">
          <p className="font-medium text-gray-900 mb-1">Pago 100% Seguro</p>
          <p>
            Tus datos están protegidos con encriptación SSL de 256-bits. No
            almacenamos los datos de tu tarjeta.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={() => setStep('shipping')}>
          Atrás
        </Button>
        <Button type="submit" size="lg" disabled={isProcessing} className="min-w-[160px]">
          {isProcessing ? 'Procesando...' : 'Revisar Pedido'}
        </Button>
      </div>
    </form>;
}