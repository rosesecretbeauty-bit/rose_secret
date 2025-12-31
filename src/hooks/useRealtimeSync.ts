import { useEffect, useCallback, useRef } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';

// Real-time synchronization hook for cross-tab and cross-device sync
// Uses BroadcastChannel API for same-device sync and localStorage events

interface SyncMessage {
  type: 'cart' | 'wishlist' | 'auth' | 'preferences' | 'browsing_history';
  action: 'update' | 'clear' | 'add' | 'remove';
  data: any;
  timestamp: number;
  deviceId: string;
}
export function useRealtimeSync() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const deviceIdRef = useRef<string>('');
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const authStore = useAuthStore();

  // Get or create device ID
  useEffect(() => {
    let deviceId = localStorage.getItem('rs_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rs_device_id', deviceId);
    }
    deviceIdRef.current = deviceId;
  }, []);

  // Initialize BroadcastChannel for same-device cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      console.warn('BroadcastChannel not supported');
      return;
    }
    const channel = new BroadcastChannel('rose_secret_sync');
    channelRef.current = channel;

    // Listen for messages from other tabs
    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const message = event.data;

      // Ignore messages from same device to prevent loops
      if (message.deviceId === deviceIdRef.current) return;
      handleSyncMessage(message);
    };
    return () => {
      channel.close();
    };
  }, []);

  // Listen for localStorage changes (cross-device sync simulation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key?.startsWith('rs_sync_')) return;
      try {
        const message: SyncMessage = JSON.parse(e.newValue || '{}');
        if (message.deviceId !== deviceIdRef.current) {
          handleSyncMessage(message);
        }
      } catch (error) {
        console.error('Failed to parse sync message:', error);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle incoming sync messages
  const handleSyncMessage = useCallback((message: SyncMessage) => {
    console.log('📡 Sync received:', message);
    switch (message.type) {
      case 'cart':
        if (message.action === 'update') {
          // Update cart from sync
          cartStore.items = message.data.items;
        } else if (message.action === 'clear') {
          cartStore.clearCart();
        }
        break;
      case 'wishlist':
        if (message.action === 'update') {
          wishlistStore.items = message.data.items;
        } else if (message.action === 'add') {
          wishlistStore.addItem(message.data.product);
        } else if (message.action === 'remove') {
          wishlistStore.removeItem(message.data.productId);
        }
        break;
      case 'auth':
        if (message.action === 'update') {
          authStore.user = message.data.user;
          authStore.isAuthenticated = message.data.isAuthenticated;
        }
        break;
      case 'preferences':
        if (message.action === 'update') {
          // Update user preferences
          Object.keys(message.data).forEach(key => {
            localStorage.setItem(`rs_pref_${key}`, message.data[key]);
          });
        }
        break;
      case 'browsing_history':
        if (message.action === 'add') {
          const history = JSON.parse(localStorage.getItem('rs_browsing_history') || '[]');
          history.unshift(message.data.product);
          localStorage.setItem('rs_browsing_history', JSON.stringify(history.slice(0, 20)));
        }
        break;
    }
  }, [cartStore, wishlistStore, authStore]);

  // Broadcast sync message
  const broadcastSync = useCallback((message: Omit<SyncMessage, 'timestamp' | 'deviceId'>) => {
    const fullMessage: SyncMessage = {
      ...message,
      timestamp: Date.now(),
      deviceId: deviceIdRef.current
    };

    // Broadcast to other tabs (same device)
    if (channelRef.current) {
      channelRef.current.postMessage(fullMessage);
    }

    // Store in localStorage for cross-device sync
    const syncKey = `rs_sync_${message.type}_${Date.now()}`;
    localStorage.setItem(syncKey, JSON.stringify(fullMessage));

    // Clean up old sync messages
    setTimeout(() => {
      localStorage.removeItem(syncKey);
    }, 5000);
  }, []);

  // Sync cart
  const syncCart = useCallback(() => {
    broadcastSync({
      type: 'cart',
      action: 'update',
      data: {
        items: cartStore.items,
        total: cartStore.total
      }
    });
  }, [cartStore.items, cartStore.total, broadcastSync]);

  // Sync wishlist
  const syncWishlist = useCallback(() => {
    broadcastSync({
      type: 'wishlist',
      action: 'update',
      data: {
        items: wishlistStore.items
      }
    });
  }, [wishlistStore.items, broadcastSync]);

  // Sync auth state
  const syncAuth = useCallback(() => {
    broadcastSync({
      type: 'auth',
      action: 'update',
      data: {
        user: authStore.user,
        isAuthenticated: authStore.isAuthenticated
      }
    });
  }, [authStore.user, authStore.isAuthenticated, broadcastSync]);

  // Sync preferences
  const syncPreferences = useCallback((preferences: Record<string, any>) => {
    broadcastSync({
      type: 'preferences',
      action: 'update',
      data: preferences
    });
  }, [broadcastSync]);

  // Sync browsing history
  const syncBrowsingHistory = useCallback((product: any) => {
    broadcastSync({
      type: 'browsing_history',
      action: 'add',
      data: {
        product
      }
    });
  }, [broadcastSync]);

  // Auto-sync cart on changes
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(state => {
      syncCart();
    });
    return unsubscribe;
  }, [syncCart]);

  // Auto-sync wishlist on changes
  useEffect(() => {
    const unsubscribe = useWishlistStore.subscribe(state => {
      syncWishlist();
    });
    return unsubscribe;
  }, [syncWishlist]);
  return {
    syncCart,
    syncWishlist,
    syncAuth,
    syncPreferences,
    syncBrowsingHistory,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true
  };
}

// Hook for monitoring sync status
export function useSyncStatus() {
  const [lastSyncTime, setLastSyncTime] = React.useState<number | null>(null);
  const [syncErrors, setSyncErrors] = React.useState<string[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  useEffect(() => {
    const channel = new BroadcastChannel('rose_secret_sync');
    channel.onmessage = () => {
      setLastSyncTime(Date.now());
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 500);
    };
    return () => channel.close();
  }, []);
  return {
    lastSyncTime,
    syncErrors,
    isSyncing,
    timeSinceLastSync: lastSyncTime ? Date.now() - lastSyncTime : null
  };
}