import { useEffect } from 'react';
import { useAppSettingsStore } from '../stores/appSettingsStore';

/**
 * Hook para obtener configuraciones de la aplicación
 * Carga las configuraciones automáticamente si no están cargadas
 */
export function useAppSettings() {
  const { settings, loading, error, loadSettings, getSetting } = useAppSettingsStore();

  useEffect(() => {
    if (!settings && !loading) {
      loadSettings();
    }
  }, [settings, loading, loadSettings]);

  return {
    settings: settings || null,
    loading,
    error,
    getSetting,
    reload: loadSettings
  };
}

/**
 * Hook para obtener una configuración específica
 */
export function useAppSetting(key: string) {
  const { getSetting, settings, loading } = useAppSettings();
  
  return {
    value: getSetting(key),
    loading,
    settings
  };
}

