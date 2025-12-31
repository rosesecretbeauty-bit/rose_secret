import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product } from '../../types';
import { useToastStore } from '../../stores/toastStore';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}
export function SubscriptionModal({
  isOpen,
  onClose,
  product
}: SubscriptionModalProps) {
  const [frequency, setFrequency] = useState<'1' | '2' | '3'>('1');
  const addToast = useToastStore(state => state.addToast);
  const discount = 15; // 15% off for subscription
  const subscriptionPrice = product.price * (1 - discount / 100);
  const savings = product.price - subscriptionPrice;
  const handleSubscribe = () => {
    addToast({
      type: 'success',
      message: `¡Suscripción activada! Recibirás este producto cada ${frequency} mes(es).`
    });
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-rose-600" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Suscríbete y Ahorra
        </h2>
        <p className="text-gray-600">
          Recibe {product.name} automáticamente y ahorra un {discount}% en cada
          envío.
        </p>
      </div>

      <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Precio regular:</span>
          <span className="text-gray-500 line-through">
            ${parseFloat(product.price?.toString() || '0').toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">Precio suscripción:</span>
          <span className="font-bold text-rose-600 text-xl">
            ${subscriptionPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-rose-200">
          <span className="text-sm text-rose-800">Ahorro por envío:</span>
          <span className="text-sm font-bold text-rose-800">
            ${savings.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <label className="block text-left">
          <span className="text-sm font-medium text-gray-700 mb-2 block">
            Frecuencia de envío
          </span>
          <div className="grid grid-cols-3 gap-3">
            {[{
            id: '1',
            label: 'Cada Mes',
            desc: 'Más popular'
          }, {
            id: '2',
            label: 'Cada 2 Meses',
            desc: 'Recomendado'
          }, {
            id: '3',
            label: 'Cada 3 Meses',
            desc: 'Uso ligero'
          }].map(opt => <button key={opt.id} onClick={() => setFrequency(opt.id as any)} className={`p-3 rounded-lg border-2 text-left transition-all ${frequency === opt.id ? 'border-rose-600 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`font-medium text-sm ${frequency === opt.id ? 'text-rose-900' : 'text-gray-900'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
              </button>)}
          </div>
        </label>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 text-left">
            Cancela o pausa en cualquier momento sin penalización.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 text-left">
            Precio garantizado por 12 meses.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 text-left">
            Te avisaremos 3 días antes de cada envío.
          </p>
        </div>
      </div>

      <Button fullWidth onClick={handleSubscribe}>
        Activar Suscripción
      </Button>
      <button onClick={onClose} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2">
        No gracias, solo compra única
      </button>
    </Modal>;
}