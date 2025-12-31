// src/stores/addressesStore.ts
// Zustand store para direcciones de usuario

import { create } from 'zustand';
import { 
  getAddresses, 
  getAddress,
  createAddress as createAddressAPI,
  updateAddress as updateAddressAPI,
  deleteAddress as deleteAddressAPI,
  setDefaultAddress as setDefaultAddressAPI,
  Address,
  CreateAddressPayload,
  UpdateAddressPayload
} from '../api/addresses';

interface AddressesState {
  // Estado
  addresses: Address[];
  loading: boolean;
  error: string | null;
  
  // Computed
  defaultAddress: Address | null;
  
  // Acciones
  fetchAddresses: () => Promise<void>;
  addAddress: (payload: CreateAddressPayload) => Promise<Address | null>;
  updateAddress: (id: number, payload: UpdateAddressPayload) => Promise<void>;
  removeAddress: (id: number) => Promise<void>;
  setDefault: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useAddressesStore = create<AddressesState>((set, get) => ({
  addresses: [],
  loading: false,
  error: null,
  defaultAddress: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });

    try {
      const addresses = await getAddresses();
      
      // Calcular dirección por defecto
      const defaultAddress = addresses.find(addr => addr.is_default) || null;
      
      set({ 
        addresses,
        defaultAddress,
        loading: false,
        error: null
      });
    } catch (error: any) {
      // Si es error 401 (no autenticado), no es un error real, solo retornar vacío
      if (error.response?.status === 401) {
        set({ 
          addresses: [],
          defaultAddress: null,
          loading: false,
          error: null
        });
        return;
      }
      
      set({ 
        loading: false,
        error: error.message || 'Error al cargar direcciones'
      });
    }
  },

  addAddress: async (payload) => {
    try {
      const address = await createAddressAPI(payload);
      
      if (address) {
        // Recargar direcciones para obtener estado actualizado
        await get().fetchAddresses();
        return address;
      }
      
      return null;
    } catch (error: any) {
      set({ error: error.message || 'Error al crear dirección' });
      throw error;
    }
  },

  updateAddress: async (id, payload) => {
    try {
      const address = await updateAddressAPI(id, payload);
      
      if (address) {
        // Recargar direcciones para obtener estado actualizado
        await get().fetchAddresses();
      }
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar dirección' });
      throw error;
    }
  },

  removeAddress: async (id) => {
    try {
      await deleteAddressAPI(id);
      
      // Optimistic update: remover de estado local
      set(state => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        defaultAddress: state.defaultAddress?.id === id 
          ? state.addresses.find(addr => addr.id !== id) || null
          : state.defaultAddress
      }));
      
      // Recargar para asegurar sincronización (especialmente si se promovió una nueva default)
      await get().fetchAddresses();
    } catch (error: any) {
      set({ error: error.message || 'Error al eliminar dirección' });
      throw error;
    }
  },

  setDefault: async (id) => {
    try {
      const address = await setDefaultAddressAPI(id);
      
      if (address) {
        // Recargar direcciones para obtener estado actualizado
        await get().fetchAddresses();
      }
    } catch (error: any) {
      set({ error: error.message || 'Error al marcar dirección como default' });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

