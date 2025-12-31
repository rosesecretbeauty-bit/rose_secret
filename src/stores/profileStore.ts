// ============================================
// Profile Store - Zustand
// ============================================

import { create } from 'zustand';
import {
  getProfileCompletion,
  getSettings,
  updateSettings,
  ProfileCompletion,
  UserSettings
} from '../api/profile';

interface ProfileState {
  // Estado
  completion: ProfileCompletion | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadCompletion: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  completion: null,
  settings: null,
  loading: false,
  error: null,

  loadCompletion: async () => {
    set({ loading: true, error: null });
    try {
      const completion = await getProfileCompletion();
      set({ completion, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar completitud del perfil', loading: false });
    }
  },

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await getSettings();
      set({ settings, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar configuración', loading: false });
    }
  },

  updateUserSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      const settings = await updateSettings(newSettings);
      set({ settings });
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar configuración' });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

