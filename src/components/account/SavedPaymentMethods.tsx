import React, { useEffect, useState } from 'react';
import { CreditCard, Trash2, Plus, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { usePaymentMethodsStore } from '../../stores/paymentMethodsStore';
import { useToastStore } from '../../stores/toastStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function SavedPaymentMethods() {
  const { methods, loading, loadMethods, removeMethod, setDefault } = usePaymentMethodsStore();
  const addToast = useToastStore(state => state.addToast);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await removeMethod(id);
      addToast({
        type: 'success',
        message: 'Método de pago eliminado exitosamente'
      });
      setDeletingId(null);
    } catch (error: any) {
      let errorMessage = 'Error al eliminar método de pago';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const firstError = error.response.data.errors[0];
        errorMessage = firstError.msg || firstError.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage
      });
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setSettingDefaultId(id);
      await setDefault(id);
      addToast({
        type: 'success',
        message: 'Método de pago marcado como predeterminado'
      });
    } catch (error: any) {
      let errorMessage = 'Error al marcar método como predeterminado';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const firstError = error.response.data.errors[0];
        errorMessage = firstError.msg || firstError.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatExpiry = (month: number | null, year: number | null) => {
    if (!month || !year) return 'N/A';
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  const getCardBrandName = (brand: string | null) => {
    if (!brand) return 'Card';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (loading && methods.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }
  const handleAddNew = () => {
    addToast({
      type: 'info',
      message: 'Para agregar métodos de pago, úsalos durante el proceso de checkout. Los métodos utilizados se guardarán automáticamente.'
    });
  };

  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-medium">Payment Methods</h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add New Card
        </Button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No tienes métodos de pago guardados</p>
          <p className="text-sm text-gray-500 mb-4">
            Los métodos de pago se guardan automáticamente cuando los usas durante el checkout
          </p>
          <Button variant="outline" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Ver Información
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {methods.map(method => (
            <div key={method.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between group hover:border-rose-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold text-xs">
                  {getCardBrandName(method.card_brand)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">
                      •••• •••• •••• {method.card_last4 || '****'}
                    </p>
                    {method.is_default && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    Expires {formatExpiry(method.card_exp_month, method.card_exp_year)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!method.is_default && (
                  <button 
                    onClick={() => handleSetDefault(method.id)}
                    disabled={settingDefaultId === method.id}
                    className="text-sm text-gray-600 hover:text-rose-600 font-medium disabled:opacity-50"
                  >
                    {settingDefaultId === method.id ? 'Setting...' : 'Make Default'}
                  </button>
                )}
                <button 
                  onClick={() => setDeletingId(method.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            handleDelete(deletingId);
          }
        }}
        title="Eliminar Método de Pago"
        message="¿Estás seguro de que quieres eliminar este método de pago? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 text-sm text-gray-600">
        <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p>
          Your payment information is securely stored and encrypted. We never
          store your full card number or CVV code.
        </p>
      </div>
    </div>;
}