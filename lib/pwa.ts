/**
 * PWA Utilities
 * Service worker registration and offline management
 */

export class PWAService {
  /**
   * Register service worker
   */
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
                // Show update notification to user
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  /**
   * Check if app is installed
   */
  static isInstalled(): boolean {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Check if added to home screen on iOS
    if ((window.navigator as any).standalone) {
      return true;
    }

    return false;
  }

  /**
   * Show install prompt
   */
  static async showInstallPrompt(): Promise<boolean> {
    // Check if beforeinstallprompt event is available
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  /**
   * Check online/offline status
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for online/offline events
   */
  static onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  /**
   * Sync data when back online
   */
  static async syncWhenOnline() {
    if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
      try {
        await (navigator.serviceWorker.ready as any).then((registration: any) => {
          registration.sync.register('sync-health-data');
          registration.sync.register('sync-meal-logs');
        });
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
}

