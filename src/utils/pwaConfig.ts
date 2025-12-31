// PWA Configuration and Service Worker Management
// Enables offline support, push notifications, and app-like experience

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
}
export const PWA_CONFIG: PWAConfig = {
  name: 'Rose Secret - Belleza de Lujo',
  shortName: 'Rose Secret',
  description: 'La plataforma de e-commerce de belleza más avanzada con IA, experiencias únicas y personalización total',
  themeColor: '#db7093',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/'
};

// Service Worker registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    });
  }
}

// Show update notification
function showUpdateNotification() {
  if (confirm('Nueva versión disponible! ¿Actualizar ahora?')) {
    window.location.reload();
  }
}

// Push Notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
    });
    console.log('✅ Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
}

// Helper function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Install prompt
let deferredPrompt: any = null;
export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed');
    deferredPrompt = null;
  });
}
function showInstallButton() {
  // Trigger custom install UI
  const event = new CustomEvent('pwa-installable');
  window.dispatchEvent(event);
}
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const {
    outcome
  } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  deferredPrompt = null;
  return outcome === 'accepted';
}

// Check if running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

// Offline detection
export function setupOfflineDetection() {
  window.addEventListener('online', () => {
    console.log('✅ Back online');
    showOnlineNotification();
  });
  window.addEventListener('offline', () => {
    console.log('⚠️ Offline mode');
    showOfflineNotification();
  });
}
function showOnlineNotification() {
  const event = new CustomEvent('network-status', {
    detail: {
      online: true
    }
  });
  window.dispatchEvent(event);
}
function showOfflineNotification() {
  const event = new CustomEvent('network-status', {
    detail: {
      online: false
    }
  });
  window.dispatchEvent(event);
}

// Cache management for PWA
export async function clearPWACache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ PWA cache cleared');
  }
}

// Get cache size
export async function getPWACacheSize(): Promise<number> {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}