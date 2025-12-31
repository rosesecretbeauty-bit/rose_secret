import { create } from 'zustand';
import { api } from '../api/client';

interface AppSettings {
  logo_url: string | null;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  platform_name: string;
  platform_tagline: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: number | null;
  default_shipping_cost: number | null;
  [key: string]: any;
}

interface AppSettingsStore {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  getSetting: (key: string) => any;
  updateCSSVariables: () => void;
}

const defaultSettings: AppSettings = {
  logo_url: '/t.webp',
  logo_light_url: null,
  logo_dark_url: null,
  favicon_url: null,
  platform_name: 'Rose Secret',
  platform_tagline: 'El poder de consentirte',
  primary_color: '#ec4899',
  secondary_color: '#f43f5e',
  contact_email: 'contacto@rosesecret.com',
  contact_phone: null,
  contact_address: null,
  currency: 'MXN',
  currency_symbol: '$',
  free_shipping_threshold: 999,
  default_shipping_cost: 99
};

/**
 * Ajusta el brillo de un color hex
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export const useAppSettingsStore = create<AppSettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  loadSettings: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/app-settings/public') as {
        success: boolean;
        data: AppSettings;
      };

      if (response.success && response.data) {
        const settings = { ...defaultSettings, ...response.data };
        set({ settings, loading: false });
        get().updateCSSVariables();
      } else {
        // Si no hay respuesta, usar defaults
        set({ settings: defaultSettings, loading: false });
        get().updateCSSVariables();
      }
    } catch (error: any) {
      console.warn('Error loading app settings, using defaults:', error);
      // En caso de error, usar configuraciones por defecto
      set({ settings: defaultSettings, loading: false, error: error.message });
      get().updateCSSVariables();
    }
  },

  getSetting: (key: string) => {
    const { settings } = get();
    return settings?.[key] ?? defaultSettings[key] ?? null;
  },

  updateCSSVariables: () => {
    const { settings } = get();
    const root = document.documentElement;
    
    if (settings) {
      // Actualizar colores primarios
      if (settings.primary_color) {
        root.style.setProperty('--color-primary', settings.primary_color);
        root.style.setProperty('--color-rose-600', settings.primary_color);
        // Calcular variaciones del color primario para mejor compatibilidad
        try {
          const primary = settings.primary_color;
          root.style.setProperty('--color-primary-hover', adjustBrightness(primary, -10));
          root.style.setProperty('--color-primary-light', adjustBrightness(primary, 20));
        } catch (e) {
          // Si falla el cálculo, usar valores por defecto
        }
      }
      if (settings.secondary_color) {
        root.style.setProperty('--color-secondary', settings.secondary_color);
        root.style.setProperty('--color-rose-500', settings.secondary_color);
      }
    }
  }
}));

