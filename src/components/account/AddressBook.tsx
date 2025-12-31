import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAddressesStore } from '../../stores/addressesStore';
import { useToastStore } from '../../stores/toastStore';
import { useAuthStore } from '../../stores/authStore';
import { AddressForm } from './AddressForm';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PremiumLoader } from '../ui/PremiumLoader';
import { Address } from '../../api/addresses';

export function AddressBook() {
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  
  const {
    addresses,
    defaultAddress,
    loading,
    error,
    fetchAddresses,
    removeAddress,
    setDefault
  } = useAddressesStore();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  // Cargar direcciones al montar
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await removeAddress(id);
      addToast({
        type: 'success',
        message: 'Dirección eliminada exitosamente'
      });
      setDeletingAddressId(null);
    } catch (error: any) {
      let errorMessage = 'Error al eliminar dirección';
      
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
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setSettingDefaultId(id);
      await setDefault(id);
      addToast({
        type: 'success',
        message: 'Dirección marcada como por defecto'
      });
    } catch (error: any) {
      let errorMessage = 'Error al marcar dirección como default';
      
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

  const handleFormSuccess = () => {
    addToast({
      type: 'success',
      message: editingAddress ? 'Dirección actualizada exitosamente' : 'Dirección creada exitosamente'
    });
    setShowForm(false);
    setEditingAddress(null);
  };

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Debes iniciar sesión para gestionar tus direcciones</p>
        <Button onClick={() => window.location.href = '/login'}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Loading state
  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl font-medium">Address Book</h2>
        </div>
        <PremiumLoader />
      </div>
    );
  }

  // Error state
  if (error && addresses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl font-medium">Address Book</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAddresses}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-medium">Address Book</h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Nueva Dirección
        </Button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
            No tienes direcciones guardadas
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega una dirección para facilitar tus compras futuras
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Primera Dirección
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 relative group hover:border-rose-200 transition-colors"
            >
              {addr.is_default && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Por Defecto
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {addr.first_name} {addr.last_name}
                  </h3>
                  {addr.company && (
                    <p className="text-sm text-gray-500">{addr.company}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-gray-600 mb-6">
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.zip_code}
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="text-sm">{addr.phone}</p>}
                {addr.type !== 'both' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tipo: {addr.type === 'billing' ? 'Facturación' : 'Envío'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {!addr.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefaultId === addr.id}
                  >
                    {settingDefaultId === addr.id ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3 mr-2" />
                    )}
                    Marcar Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(addr)}
                >
                  <Edit2 className="h-3 w-3 mr-2" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 border-gray-200"
                  onClick={() => setDeletingAddressId(addr.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AddressForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingAddressId !== null}
        onClose={() => setDeletingAddressId(null)}
        onConfirm={() => {
          if (deletingAddressId) {
            handleDelete(deletingAddressId);
          }
        }}
        title="Eliminar Dirección"
        message="¿Estás seguro de que quieres eliminar esta dirección? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
