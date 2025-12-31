import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MapPin, Plus, Check, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useAddressesStore } from '../../stores/addressesStore';
import { useCheckoutStore } from '../../stores/checkoutStore';
import { useAuthStore } from '../../stores/authStore';
import { AddressForm } from '../account/AddressForm';
import { Address } from '../../api/addresses';

export function AddressSelector() {
  const { addresses, defaultAddress, loading, fetchAddresses } = useAddressesStore();
  const { addressId, setAddressId, setManualAddress } = useCheckoutStore();
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Cargar direcciones al montar solo si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses().catch(err => {
        // Silencioso: si falla, mostrar formulario manual
        console.debug('Error loading addresses:', err);
      });
    } else {
      // Si no está autenticado, mostrar formulario manual directamente
      setUseManual(true);
    }
  }, [fetchAddresses, isAuthenticated]);

  // Preseleccionar dirección por defecto (solo si está autenticado)
  useEffect(() => {
    if (isAuthenticated && defaultAddress && !addressId && !useManual) {
      setAddressId(defaultAddress.id);
    }
  }, [isAuthenticated, defaultAddress, addressId, useManual, setAddressId]);

  const handleSelectAddress = (id: number) => {
    setAddressId(id);
    setUseManual(false);
  };

  const handleUseManual = () => {
    setUseManual(true);
    setAddressId(null);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    // Recargar direcciones y preseleccionar la nueva default si existe
    fetchAddresses().then(() => {
      // El useEffect se encargará de preseleccionar la default
    });
  };

  // Si no está autenticado, mostrar solo formulario manual
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Para guardar direcciones y agilizar futuras compras, 
            <a href="/login?redirect=/checkout" className="underline font-semibold ml-1">
              inicia sesión o crea una cuenta
            </a>.
          </p>
        </div>
        <ManualAddressForm onCancel={() => {}} />
      </div>
    );
  }

  // Si no hay direcciones guardadas, mostrar opción manual directamente
  if (!loading && addresses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No tienes direcciones guardadas</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleAddNew} variant="primary">
              <Plus className="h-4 w-4 mr-2" /> Guardar Dirección
            </Button>
            <Button onClick={handleUseManual} variant="outline">
              Usar Dirección Manual
            </Button>
          </div>
        </div>

        {useManual && (
          <ManualAddressForm onCancel={() => setUseManual(false)} />
        )}

        <AddressForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          address={editingAddress}
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista de direcciones guardadas */}
      {!useManual && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-gray-900">
              Selecciona una dirección
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" /> Nueva
              </Button>
              <Button variant="outline" size="sm" onClick={handleUseManual}>
                Manual
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando direcciones...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isSelected = addressId === addr.id;
                return (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectAddress(addr.id)}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-rose-500 bg-rose-50' 
                        : 'border-gray-200 bg-white hover:border-rose-200'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    {addr.is_default && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          Por Defecto
                        </Badge>
                      </div>
                    )}

                    <div className="pr-8">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <h4 className="font-semibold text-gray-900">
                          {addr.first_name} {addr.last_name}
                        </h4>
                      </div>
                      {addr.company && (
                        <p className="text-sm text-gray-600 mb-1">{addr.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} {addr.zip_code}
                      </p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                      {addr.phone && (
                        <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(addr);
                        }}
                        className="text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Editar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Formulario manual */}
      {useManual && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-gray-900">
              Dirección Manual
            </h3>
            <Button variant="outline" size="sm" onClick={() => setUseManual(false)}>
              Usar Dirección Guardada
            </Button>
          </div>
          <ManualAddressForm onCancel={() => setUseManual(false)} />
        </div>
      )}

      {/* Modal para agregar/editar dirección */}
      <AddressForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

// Componente para formulario manual
function ManualAddressForm({ onCancel }: { onCancel: () => void }) {
  const { setManualAddress } = useCheckoutStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    setManualAddress({
      shipping_name: `${data.first_name} ${data.last_name}`,
      shipping_street: data.street,
      shipping_city: data.city,
      shipping_state: data.state,
      shipping_zip: data.zip_code,
      shipping_country: data.country,
      shipping_phone: data.phone || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          {...register('first_name', { required: 'Nombre requerido' })}
          error={errors.first_name?.message}
        />
        <Input
          label="Apellido"
          {...register('last_name', { required: 'Apellido requerido' })}
          error={errors.last_name?.message}
        />
      </div>

      <Input
        label="Dirección"
        {...register('street', { required: 'Dirección requerida' })}
        error={errors.street?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ciudad"
          {...register('city', { required: 'Ciudad requerida' })}
          error={errors.city?.message}
        />
        <Input
          label="Estado/Provincia"
          {...register('state', { required: 'Estado requerido' })}
          error={errors.state?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Código Postal"
          {...register('zip_code', { required: 'Código postal requerido' })}
          error={errors.zip_code?.message}
        />
        <Input
          label="País"
          {...register('country', { required: 'País requerido' })}
          error={errors.country?.message}
        />
      </div>

      <Input
        label="Teléfono (opcional)"
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Usar Esta Dirección
        </Button>
      </div>
    </form>
  );
}

