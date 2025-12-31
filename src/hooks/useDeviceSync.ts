import { useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useSyncStore } from '../stores/syncStore';
type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';
export function useDeviceSync() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const syncStore = useSyncStore();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus('syncing');
      setTimeout(() => setStatus('synced'), 1000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate periodic sync
    const syncInterval = setInterval(() => {
      if (isOnline) {
        setStatus('syncing');
        // Mock sync process
        syncStore.syncWithCloud().then(() => {
          setStatus('synced');
        }).catch(() => {
          setStatus('error');
        });
      }
    }, 30000); // Sync every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [isOnline, syncStore]);

  // Listen for changes in other tabs via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('rose_secret_sync');
    channel.onmessage = event => {
      if (event.data.type === 'CART_UPDATE') {
        // Refresh cart from storage
        useCartStore.persist.rehydrate();
      }
    };
    return () => channel.close();
  }, []);
  return {
    status,
    isOnline,
    lastSynced: syncStore.lastSynced,
    deviceId: syncStore.deviceId
  };
}