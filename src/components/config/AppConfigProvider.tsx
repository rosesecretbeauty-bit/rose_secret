import React, { useEffect } from 'react';
import { useAppSettingsStore } from '../../stores/appSettingsStore';
import { useAppSetting } from '../../hooks/useAppSettings';

/**
 * Provider que actualiza el favicon y título de la página
 * basado en las configuraciones de la app
 */
export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const { settings, loadSettings } = useAppSettingsStore();
  const { value: faviconUrl } = useAppSetting('favicon_url');
  const { value: platformName } = useAppSetting('platform_name');
  const { value: platformTagline } = useAppSetting('platform_tagline');

  useEffect(() => {
    if (!settings) {
      loadSettings();
    }
  }, [settings, loadSettings]);

  // Actualizar favicon
  useEffect(() => {
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [faviconUrl]);

  // Actualizar título de la página
  useEffect(() => {
    const finalName = platformName || 'Rose Secret';
    const finalTagline = platformTagline || 'El poder de consentirte';
    document.title = `${finalName} - ${finalTagline}`;
  }, [platformName, platformTagline]);

  return <>{children}</>;
}

