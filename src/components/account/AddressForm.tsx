import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Address, CreateAddressPayload, UpdateAddressPayload } from '../../api/addresses';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null; // Si existe, es edición; si no, es creación
  onSuccess?: () => void;
}

interface AddressFormData {
  type: 'billing' | 'shipping' | 'both';
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export function AddressForm({ isOpen, onClose, address, onSuccess }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AddressFormData>({
    defaultValues: {
      type: address?.type || 'both',
      first_name: address?.first_name || '',
      last_name: address?.last_name || '',
      company: address?.company || '',
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      zip_code: address?.zip_code || '',
      country: address?.country || '',
      phone: address?.phone || '',
      is_default: address?.is_default || false
    }
  });

  // Reset form cuando cambia el address o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      reset({
        type: address?.type || 'both',
        first_name: address?.first_name || '',
        last_name: address?.last_name || '',
        company: address?.company || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zip_code: address?.zip_code || '',
        country: address?.country || '',
        phone: address?.phone || '',
        is_default: address?.is_default || false
      });
    }
  }, [isOpen, address, reset]);

  const isDefault = watch('is_default');
  const isEditing = !!address;

  const onSubmit = async (data: AddressFormData) => {
    try {
      const { useAddressesStore } = await import('../../stores/addressesStore');
      const { useToastStore } = await import('../../stores/toastStore');
      const { addAddress, updateAddress } = useAddressesStore.getState();
      const addToast = useToastStore.getState().addToast;

      if (isEditing && address) {
        await updateAddress(address.id, data as UpdateAddressPayload);
      } else {
        await addAddress(data as CreateAddressPayload);
      }

      addToast({
        type: 'success',
        message: isEditing ? 'Dirección actualizada exitosamente' : 'Dirección creada exitosamente'
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error guardando dirección:', error);
      
      // Mejorar mensajes de error
      const { useToastStore } = await import('../../stores/toastStore');
      const addToast = useToastStore.getState().addToast;
      
      let errorMessage = isEditing ? 'Error al actualizar dirección' : 'Error al crear dirección';
      
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Dirección' : 'Nueva Dirección'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Dirección
          </label>
          <select
            {...register('type')}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
          >
            <option value="both">Facturación y Envío</option>
            <option value="billing">Solo Facturación</option>
            <option value="shipping">Solo Envío</option>
          </select>
        </div>

        {/* Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            {...register('first_name', {
              required: 'Nombre requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' }
            })}
            error={errors.first_name?.message}
          />
          <Input
            label="Apellido"
            {...register('last_name', {
              required: 'Apellido requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' }
            })}
            error={errors.last_name?.message}
          />
        </div>

        {/* Empresa (opcional) */}
        <Input
          label="Empresa (opcional)"
          {...register('company', {
            maxLength: { value: 255, message: 'Máximo 255 caracteres' }
          })}
          error={errors.company?.message}
        />

        {/* Dirección */}
        <Input
          label="Dirección"
          {...register('street', {
            required: 'Dirección requerida',
            minLength: { value: 5, message: 'Mínimo 5 caracteres' },
            maxLength: { value: 255, message: 'Máximo 255 caracteres' }
          })}
          error={errors.street?.message}
        />

        {/* Ciudad y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            {...register('city', {
              required: 'Ciudad requerida',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 255, message: 'Máximo 255 caracteres' }
            })}
            error={errors.city?.message}
          />
          <Input
            label="Estado/Provincia"
            {...register('state', {
              required: 'Estado requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
            error={errors.state?.message}
          />
        </div>

        {/* Código Postal y País */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código Postal"
            {...register('zip_code', {
              required: 'Código postal requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 20, message: 'Máximo 20 caracteres' }
            })}
            error={errors.zip_code?.message}
          />
          <Input
            label="País"
            {...register('country', {
              required: 'País requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
            error={errors.country?.message}
          />
        </div>

        {/* Teléfono (opcional) */}
        <Input
          label="Teléfono (opcional)"
          type="tel"
          {...register('phone', {
            maxLength: { value: 20, message: 'Máximo 20 caracteres' }
          })}
          error={errors.phone?.message}
        />

        {/* Dirección por defecto */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_default"
            {...register('is_default')}
            className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          />
          <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
            Marcar como dirección por defecto
          </label>
        </div>

        {isDefault && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700"
          >
            Esta dirección será tu dirección por defecto para futuros pedidos.
          </motion.div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? 'Guardar Cambios' : 'Crear Dirección'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

