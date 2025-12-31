// ============================================
// Analytics Configuration
// ============================================
// Feature flags y configuración por entorno

export interface AnalyticsConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  providers: {
    console: boolean;
    google?: boolean;
    meta?: boolean;
    segment?: boolean;
  };
  debug: boolean;
  sampleRate: number; // 0-1, porcentaje de eventos a trackear
}

// Obtener configuración desde variables de entorno
const getConfig = (): AnalyticsConfig => {
  const isEnabled = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
  const env = (import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production';
  const isDev = env === 'development';

  return {
    enabled: isEnabled,
    environment: env,
    providers: {
      console: isDev || import.meta.env.VITE_ANALYTICS_CONSOLE === 'true',
      google: import.meta.env.VITE_ANALYTICS_GOOGLE === 'true',
      meta: import.meta.env.VITE_ANALYTICS_META === 'true',
      segment: import.meta.env.VITE_ANALYTICS_SEGMENT === 'true',
    },
    debug: isDev || import.meta.env.VITE_ANALYTICS_DEBUG === 'true',
    sampleRate: parseFloat(import.meta.env.VITE_ANALYTICS_SAMPLE_RATE || '1.0'),
  };
};

export const analyticsConfig = getConfig();

// Helper para verificar si analytics está habilitado
export const isAnalyticsEnabled = (): boolean => {
  return analyticsConfig.enabled && typeof window !== 'undefined';
};

// Helper para verificar si debemos trackear (sample rate)
export const shouldTrack = (): boolean => {
  if (!isAnalyticsEnabled()) return false;
  return Math.random() < analyticsConfig.sampleRate;
};

