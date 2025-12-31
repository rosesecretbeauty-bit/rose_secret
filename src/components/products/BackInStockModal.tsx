import React, { useState } from 'react';
import { Bell, Mail, Phone } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
interface BackInStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  image: string;
}
export function BackInStockModal({
  isOpen,
  onClose,
  productName,
  image
}: BackInStockModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
      setPhone('');
    }, 2000);
  };
  return <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {!submitted ? <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Alerta de Disponibilidad
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Te notificaremos cuando <strong>{productName}</strong> vuelva
                a estar disponible.
              </p>
            </div>

            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <img src={image} alt={productName} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="font-medium text-gray-900">{productName}</p>
                <p className="text-sm text-gray-500">
                  Reabastecimiento estimado: 2 semanas
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setMethod('email')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === 'email' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Mail className="h-4 w-4 inline mr-2" /> Email
                </button>
                <button type="button" onClick={() => setMethod('sms')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === 'sms' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Phone className="h-4 w-4 inline mr-2" /> SMS
                </button>
              </div>

              {method === 'email' ? <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de Correo
                  </label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@ejemplo.com" />
                </div> : <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Teléfono
                  </label>
                  <Input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>}

              <Button fullWidth type="submit">
                Notificarme
              </Button>
            </form>
          </> : <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡Estás en la lista!
            </h3>
            <p className="text-gray-500">
              Te avisaremos tan pronto como esté disponible.
            </p>
          </div>}
      </div>
    </Modal>;
}