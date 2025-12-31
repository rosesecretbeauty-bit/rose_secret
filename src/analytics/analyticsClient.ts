// ============================================
// Analytics Client
// ============================================
// Cliente centralizado para tracking de analytics

import { analyticsConfig, isAnalyticsEnabled, shouldTrack } from './config';
import { validatePayload, sanitizePayload } from './schemas';
import type { AnalyticsEvent, AnalyticsEventType, AnalyticsEventPayload } from './events';
import type { AnalyticsProvider } from './analyticsProviders/console.provider';
import { ConsoleProvider } from './analyticsProviders/console.provider';
import { GoogleProvider } from './analyticsProviders/google.provider';
import { MetaProvider } from './analyticsProviders/meta.provider';

// ============================================
// Session Management
// ============================================

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('rs_analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('rs_analytics_session_id', sessionId);
  }
  return sessionId;
}

function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  let anonymousId = localStorage.getItem('rs_analytics_anonymous_id');
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('rs_analytics_anonymous_id', anonymousId);
  }
  return anonymousId;
}

// ============================================
// Analytics Client Class
// ============================================

class AnalyticsClient {
  private providers: AnalyticsProvider[] = [];
  private userId: string | null = null;
  private userTraits: Record<string, any> | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (!isAnalyticsEnabled()) return;

    // Console provider siempre activo en desarrollo
    if (analyticsConfig.providers.console) {
      this.providers.push(new ConsoleProvider(analyticsConfig.debug));
    }

    // Google Analytics
    if (analyticsConfig.providers.google) {
      const googleId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
      if (googleId) {
        this.providers.push(new GoogleProvider(googleId));
      }
    }

    // Meta Pixel
    if (analyticsConfig.providers.meta) {
      const metaId = import.meta.env.VITE_META_PIXEL_ID;
      if (metaId) {
        this.providers.push(new MetaProvider(metaId));
      }
    }
  }

  /**
   * Trackea un evento
   */
  track(eventType: AnalyticsEventType, payload: AnalyticsEventPayload): void {
    if (!isAnalyticsEnabled() || !shouldTrack()) return;

    try {
      // Validar payload
      const validation = validatePayload(eventType, payload);
      if (!validation.valid) {
        if (analyticsConfig.debug) {
          console.warn('[Analytics] Invalid payload:', validation.errors);
        }
        return;
      }

      // Sanitizar payload
      const sanitized = sanitizePayload(payload);

      // Enriquecer con metadata
      const enriched: AnalyticsEventPayload = {
        ...sanitized,
        timestamp: Date.now(),
        sessionId: getOrCreateSessionId(),
        anonymousId: getOrCreateAnonymousId(),
        userId: this.userId || undefined,
      };

      // Crear evento
      const event: AnalyticsEvent = {
        type: eventType,
        payload: enriched,
      };

      // Enviar a todos los providers
      this.providers.forEach((provider) => {
        try {
          provider.track(event);
        } catch (error) {
          if (analyticsConfig.debug) {
            console.error(`[Analytics] Provider error:`, error);
          }
        }
      });
    } catch (error) {
      // Errores silenciosos en producción
      if (analyticsConfig.debug) {
        console.error('[Analytics] Error tracking event:', error);
      }
    }
  }

  /**
   * Identifica un usuario
   */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!isAnalyticsEnabled()) return;

    try {
      this.userId = userId;
      this.userTraits = traits || null;

      // Sanitizar traits (evitar PII innecesaria)
      const sanitizedTraits = traits
        ? Object.fromEntries(
            Object.entries(traits).filter(([key]) => {
              // No incluir campos sensibles
              const sensitiveFields = ['password', 'creditCard', 'ssn', 'cvv'];
              return !sensitiveFields.includes(key.toLowerCase());
            })
          )
        : undefined;

      this.providers.forEach((provider) => {
        try {
          provider.identify(userId, sanitizedTraits);
        } catch (error) {
          if (analyticsConfig.debug) {
            console.error(`[Analytics] Provider identify error:`, error);
          }
        }
      });
    } catch (error) {
      if (analyticsConfig.debug) {
        console.error('[Analytics] Error identifying user:', error);
      }
    }
  }

  /**
   * Trackea una vista de página
   */
  page(path: string, properties?: Record<string, any>): void {
    if (!isAnalyticsEnabled() || !shouldTrack()) return;

    try {
      const pageProperties = {
        ...properties,
        path,
        title: properties?.title || document.title,
        referrer: document.referrer || undefined,
      };

      this.providers.forEach((provider) => {
        try {
          provider.page(path, pageProperties);
        } catch (error) {
          if (analyticsConfig.debug) {
            console.error(`[Analytics] Provider page error:`, error);
          }
        }
      });
    } catch (error) {
      if (analyticsConfig.debug) {
        console.error('[Analytics] Error tracking page:', error);
      }
    }
  }

  /**
   * Resetea la sesión (logout)
   */
  reset(): void {
    this.userId = null;
    this.userTraits = null;

    this.providers.forEach((provider) => {
      try {
        provider.reset();
      } catch (error) {
        if (analyticsConfig.debug) {
          console.error(`[Analytics] Provider reset error:`, error);
        }
      }
    });
  }

  /**
   * Obtiene el userId actual
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Obtiene el anonymousId
   */
  getAnonymousId(): string {
    return getOrCreateAnonymousId();
  }
}

// ============================================
// Singleton Instance
// ============================================

export const analyticsClient = new AnalyticsClient();

// ============================================
// Convenience Functions
// ============================================

export function trackEvent(
  eventType: AnalyticsEventType,
  payload: AnalyticsEventPayload
): void {
  analyticsClient.track(eventType, payload);
}

export function identifyUser(userId: string, traits?: Record<string, any>): void {
  analyticsClient.identify(userId, traits);
}

export function trackPageView(path: string, properties?: Record<string, any>): void {
  analyticsClient.page(path, properties);
}

export function resetAnalytics(): void {
  analyticsClient.reset();
}

