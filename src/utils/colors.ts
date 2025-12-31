import { useAppSettingsStore } from '../stores/appSettingsStore';

/**
 * Obtiene el color primario desde las configuraciones
 */
export function getPrimaryColor(): string {
  const { getSetting } = useAppSettingsStore.getState();
  return getSetting('primary_color') || '#ec4899';
}

/**
 * Obtiene el color secundario desde las configuraciones
 */
export function getSecondaryColor(): string {
  const { getSetting } = useAppSettingsStore.getState();
  return getSetting('secondary_color') || '#f43f5e';
}

/**
 * Obtiene un color desde las configuraciones
 */
export function getColor(key: string, defaultValue: string = ''): string {
  const { getSetting } = useAppSettingsStore.getState();
  return getSetting(key) || defaultValue;
}

/**
 * Hook para usar colores dinámicos en componentes
 */
export function useColors() {
  const { getSetting } = useAppSettingsStore();
  
  return {
    primary: getSetting('primary_color') || '#ec4899',
    secondary: getSetting('secondary_color') || '#f43f5e',
    getColor: (key: string, defaultValue?: string) => getSetting(key) || defaultValue || ''
  };
}

