import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressSelector } from './AddressSelector';
import { Button } from '../ui/Button';
import { useCheckoutStore } from '../../stores/checkoutStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { ChevronRight } from 'lucide-react';

export function ShippingForm() {
  const navigate = useNavigate();
  const { setStep, addressId, manualAddress } = useCheckoutStore();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);

  const handleNext = () => {
    // Validar autenticación antes de continuar
    if (!isAuthenticated) {
      addToast({
        type: 'error',
        message: 'Debes iniciar sesión para continuar con el pago'
      });
      navigate('/login?redirect=/checkout');
      return;
    }
    
    // Validar que haya una dirección seleccionada o manual
    if (!addressId && !manualAddress) {
      return; // El AddressSelector mostrará el error
    }
    setStep('payment');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-serif font-medium text-gray-900">
        Información de Envío
      </h2>

      <AddressSelector />

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleNext} 
          size="lg"
          disabled={!addressId && !manualAddress}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Continuar al Pago
        </Button>
      </div>
    </div>
  );
}