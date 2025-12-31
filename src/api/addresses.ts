// src/api/addresses.ts
// API helpers para direcciones de usuario

import { api } from './client';

// ============================================
// Types
// ============================================

export interface Address {
  id: number;
  user_id: number;
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
  created_at: string;
  updated_at: string;
}

export interface AddressesResponse {
  success: boolean;
  data: {
    addresses: Address[];
  };
}

export interface AddressResponse {
  success: boolean;
  message?: string;
  data: {
    address: Address;
  };
}

export interface CreateAddressPayload {
  type?: 'billing' | 'shipping' | 'both';
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export interface UpdateAddressPayload {
  type?: 'billing' | 'shipping' | 'both';
  first_name?: string;
  last_name?: string;
  company?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
}

// ============================================
// API Functions
// ============================================

/**
 * Obtener todas las direcciones del usuario autenticado
 */
export async function getAddresses(): Promise<Address[]> {
  try {
    const response = await api.get('/user/addresses') as AddressesResponse;
    
    if (response.success && response.data) {
      return response.data.addresses;
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    throw error;
  }
}

/**
 * Obtener una dirección específica por ID
 */
export async function getAddress(id: number): Promise<Address | null> {
  try {
    const response = await api.get(`/user/addresses/${id}`) as AddressResponse;
    
    if (response.success && response.data) {
      return response.data.address;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    throw error;
  }
}

/**
 * Crear una nueva dirección
 */
export async function createAddress(
  payload: CreateAddressPayload
): Promise<Address | null> {
  try {
    const response = await api.post('/user/addresses', payload) as AddressResponse;
    
    if (response.success && response.data) {
      return response.data.address;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error creando dirección:', error);
    
    // Re-lanzar error para que el componente pueda manejarlo
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw error;
  }
}

/**
 * Actualizar una dirección existente
 */
export async function updateAddress(
  id: number,
  payload: UpdateAddressPayload
): Promise<Address | null> {
  try {
    const response = await api.put(`/user/addresses/${id}`, payload) as AddressResponse;
    
    if (response.success && response.data) {
      return response.data.address;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error actualizando dirección:', error);
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw error;
  }
}

/**
 * Eliminar una dirección
 */
export async function deleteAddress(id: number): Promise<boolean> {
  try {
    const response = await api.delete(`/user/addresses/${id}`) as { success: boolean; message?: string };
    
    return response.success;
  } catch (error: any) {
    console.error('Error eliminando dirección:', error);
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw error;
  }
}

/**
 * Marcar una dirección como por defecto
 */
export async function setDefaultAddress(id: number): Promise<Address | null> {
  try {
    const response = await api.put(`/user/addresses/${id}/set-default`) as AddressResponse;
    
    if (response.success && response.data) {
      return response.data.address;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error marcando dirección como default:', error);
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw error;
  }
}

