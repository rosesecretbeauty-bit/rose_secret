import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Check, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../stores/toastStore';
interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  image: string;
}
export function WaitlistModal({
  isOpen,
  onClose,
  productName,
  image
}: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa un email válido'
      });
      return;
    }

    try {
      // Nota: Este endpoint aún no existe en el backend
      // Por ahora, guardamos en localStorage como solución temporal
      // En producción, esto debería ser: await api.post('/products/waitlist', { productName, email })
      
      const waitlistKey = `waitlist_${productName}`;
      const existing = JSON.parse(localStorage.getItem(waitlistKey) || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(waitlistKey, JSON.stringify(existing));
      }

      setSubmitted(true);
      addToast({
        type: 'success',
        message: '¡Has sido añadido a la lista de espera! Te notificaremos cuando el producto esté disponible.'
      });
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      addToast({
        type: 'error',
        message: 'Error al añadirte a la lista de espera. Por favor intenta de nuevo.'
      });
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} size="md">
      <AnimatePresence mode="wait">
        {!submitted ? <motion.div key="form" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 text-rose-600" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              Únete a la Lista de Espera
            </h2>
            <p className="text-gray-600 mb-6">
              Recibe una notificación cuando{' '}
              <span className="font-medium text-gray-900">{productName}</span>{' '}
              vuelva a estar disponible.
            </p>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-left">
              <img src={image} alt={productName} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="font-medium text-gray-900">{productName}</p>
                <p className="text-sm text-rose-600 font-medium">
                  Actualmente Agotado
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" placeholder="Ingresa tu dirección de correo" value={email} onChange={e => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4 text-gray-400" />} />
              <p className="text-xs text-gray-500 text-left">
                Al unirte, aceptas recibir una notificación única cuando
                este artículo esté disponible.
              </p>
              <Button fullWidth type="submit" size="lg">
                Notificarme
              </Button>
            </form>
          </motion.div> : <motion.div key="success" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              ¡Estás en la lista!
            </h2>
            <p className="text-gray-600 mb-8">
              Te enviaremos un correo a{' '}
              <span className="font-medium text-gray-900">{email}</span> tan pronto
              como este producto esté disponible.
            </p>
            <Button onClick={onClose} variant="outline">
              Continuar Comprando
            </Button>
          </motion.div>}
      </AnimatePresence>
    </Modal>;
}