import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface SyncState {
  lastSynced: number;
  deviceId: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
  viewedProducts: string[];

  // Actions
  updatePreferences: (prefs: Partial<SyncState['preferences']>) => void;
  addViewedProduct: (productId: string) => void;
  syncWithCloud: () => Promise<void>;
}
export const useSyncStore = create<SyncState>()(persist((set, get) => ({
  lastSynced: Date.now(),
  deviceId: Math.random().toString(36).substring(2, 15),
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'es'
  },
  viewedProducts: [],
  updatePreferences: prefs => {
    set(state => ({
      preferences: {
        ...state.preferences,
        ...prefs
      },
      lastSynced: Date.now()
    }));
  },
  addViewedProduct: productId => {
    set(state => {
      const newViewed = [productId, ...state.viewedProducts.filter(id => id !== productId)].slice(0, 20);
      return {
        viewedProducts: newViewed,
        lastSynced: Date.now()
      };
    });
  },
  syncWithCloud: async () => {
    // Mock cloud sync
    console.log('Syncing with cloud...', {
      device: get().deviceId,
      data: get()
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({
      lastSynced: Date.now()
    });
  }
}), {
  name: 'rose-secret-sync',
  storage: createJSONStorage(() => localStorage)
}));

// Listen for storage events to sync across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === 'rose-secret-sync' && e.newValue) {
      useSyncStore.setState(JSON.parse(e.newValue).state);
    }
  });
}