// Advanced Analytics System for Rose Secret Platform
// Includes conversion funnels, user journey tracking, and behavioral analytics

import { trackFeatureUsage } from './analytics';

// --- Types ---

export interface UserJourneyStep {
  page: string;
  timestamp: number;
  action?: string;
  metadata?: Record<string, any>;
}
export interface ConversionFunnel {
  name: string;
  steps: string[];
  currentStep: number;
  startTime: number;
  completedSteps: string[];
  dropoffPoint?: string;
}
export interface UserBehavior {
  sessionId: string;
  userId?: string;
  journey: UserJourneyStep[];
  funnels: ConversionFunnel[];
  interactions: InteractionEvent[];
  timeOnSite: number;
  pagesVisited: number;
  deviceInfo: DeviceInfo;
}
export interface InteractionEvent {
  type: 'click' | 'scroll' | 'hover' | 'form_interaction' | 'search' | 'filter';
  element: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
}

// --- Conversion Funnels ---

export const CONVERSION_FUNNELS = {
  purchase: {
    name: 'Purchase Funnel',
    steps: ['product_view', 'add_to_cart', 'view_cart', 'begin_checkout', 'shipping_info', 'payment_info', 'purchase_complete']
  },
  signup: {
    name: 'Signup Funnel',
    steps: ['landing', 'signup_start', 'email_entered', 'password_created', 'profile_completed', 'signup_complete']
  },
  aiShopper: {
    name: 'AI Shopper Funnel',
    steps: ['ai_shopper_view', 'conversation_start', 'product_recommended', 'product_clicked', 'add_to_cart']
  },
  styleQuiz: {
    name: 'Style Quiz Funnel',
    steps: ['quiz_start', 'question_1', 'question_2', 'question_3', 'results_view', 'product_clicked']
  }
};

// --- Analytics Manager ---

class AdvancedAnalyticsManager {
  private static instance: AdvancedAnalyticsManager;
  private userBehavior: UserBehavior;
  private sessionStartTime: number;
  private constructor() {
    this.sessionStartTime = Date.now();
    this.userBehavior = this.initializeUserBehavior();
    this.setupEventListeners();
  }
  static getInstance(): AdvancedAnalyticsManager {
    if (!AdvancedAnalyticsManager.instance) {
      AdvancedAnalyticsManager.instance = new AdvancedAnalyticsManager();
    }
    return AdvancedAnalyticsManager.instance;
  }
  private initializeUserBehavior(): UserBehavior {
    const sessionId = this.getOrCreateSessionId();
    return {
      sessionId,
      journey: [],
      funnels: [],
      interactions: [],
      timeOnSite: 0,
      pagesVisited: 0,
      deviceInfo: this.getDeviceInfo()
    };
  }
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('rs_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('rs_session_id', sessionId);
    }
    return sessionId;
  }
  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width < 768) type = 'mobile';else if (width < 1024) type = 'tablet';
    return {
      type,
      browser: this.getBrowser(ua),
      os: this.getOS(ua),
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }
  private getBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }
  private getOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  // --- Journey Tracking ---

  trackPageView(page: string, metadata?: Record<string, any>) {
    const step: UserJourneyStep = {
      page,
      timestamp: Date.now(),
      metadata
    };
    this.userBehavior.journey.push(step);
    this.userBehavior.pagesVisited++;

    // Update time on site
    this.userBehavior.timeOnSite = Date.now() - this.sessionStartTime;
    this.persistBehavior();
  }
  trackAction(page: string, action: string, metadata?: Record<string, any>) {
    const step: UserJourneyStep = {
      page,
      action,
      timestamp: Date.now(),
      metadata
    };
    this.userBehavior.journey.push(step);
    this.persistBehavior();
  }

  // --- Funnel Tracking ---

  startFunnel(funnelType: keyof typeof CONVERSION_FUNNELS) {
    const funnelConfig = CONVERSION_FUNNELS[funnelType];
    const funnel: ConversionFunnel = {
      name: funnelConfig.name,
      steps: funnelConfig.steps,
      currentStep: 0,
      startTime: Date.now(),
      completedSteps: []
    };
    this.userBehavior.funnels.push(funnel);
    this.persistBehavior();

    // Track funnel start
    trackFeatureUsage(`funnel_${funnelType}`, 'start');
  }
  advanceFunnel(funnelType: keyof typeof CONVERSION_FUNNELS, stepName: string) {
    const funnel = this.userBehavior.funnels.find(f => f.name === CONVERSION_FUNNELS[funnelType].name && !f.dropoffPoint);
    if (!funnel) {
      console.warn(`Funnel ${funnelType} not started`);
      return;
    }
    const stepIndex = funnel.steps.indexOf(stepName);
    if (stepIndex === -1) {
      console.warn(`Step ${stepName} not found in funnel ${funnelType}`);
      return;
    }
    funnel.completedSteps.push(stepName);
    funnel.currentStep = stepIndex + 1;

    // Check if funnel completed
    if (funnel.currentStep === funnel.steps.length) {
      const duration = Date.now() - funnel.startTime;
      trackFeatureUsage(`funnel_${funnelType}`, 'complete');
      this.trackConversion(funnelType, duration);
    }
    this.persistBehavior();
  }
  abandonFunnel(funnelType: keyof typeof CONVERSION_FUNNELS, dropoffStep: string) {
    const funnel = this.userBehavior.funnels.find(f => f.name === CONVERSION_FUNNELS[funnelType].name && !f.dropoffPoint);
    if (funnel) {
      funnel.dropoffPoint = dropoffStep;
      trackFeatureUsage(`funnel_${funnelType}`, 'abandon');
      this.persistBehavior();
    }
  }

  // --- Interaction Tracking ---

  trackInteraction(event: InteractionEvent) {
    this.userBehavior.interactions.push(event);

    // Keep only last 100 interactions to prevent memory issues
    if (this.userBehavior.interactions.length > 100) {
      this.userBehavior.interactions = this.userBehavior.interactions.slice(-100);
    }
    this.persistBehavior();
  }

  // --- Conversion Tracking ---

  private trackConversion(funnelType: string, duration: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;
      (window as any).gtag('event', 'conversion', {
        funnel_type: funnelType,
        duration_ms: duration,
        session_id: this.userBehavior.sessionId
      });
    }
  }

  // --- Setup Event Listeners ---

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      this.trackInteraction({
        type: 'click',
        element: `${tagName}.${className}`,
        timestamp: Date.now(),
        metadata: {
          x: e.clientX,
          y: e.clientY
        }
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        // Track milestones
        if (maxScroll > 25 && maxScroll < 30) {
          trackFeatureUsage('scroll_depth', '25%');
        } else if (maxScroll > 50 && maxScroll < 55) {
          trackFeatureUsage('scroll_depth', '50%');
        } else if (maxScroll > 75 && maxScroll < 80) {
          trackFeatureUsage('scroll_depth', '75%');
        } else if (maxScroll > 90) {
          trackFeatureUsage('scroll_depth', '100%');
        }
      }
    });

    // Track time on page before unload
    window.addEventListener('beforeunload', () => {
      this.userBehavior.timeOnSite = Date.now() - this.sessionStartTime;
      this.persistBehavior();
    });
  }

  // --- Persistence ---

  private persistBehavior() {
    try {
      localStorage.setItem('rs_user_behavior', JSON.stringify(this.userBehavior));
    } catch (error) {
      console.error('Failed to persist user behavior:', error);
    }
  }

  // --- Analytics Export ---

  getUserBehavior(): UserBehavior {
    return {
      ...this.userBehavior
    };
  }
  getJourney(): UserJourneyStep[] {
    return [...this.userBehavior.journey];
  }
  getFunnels(): ConversionFunnel[] {
    return [...this.userBehavior.funnels];
  }

  // --- Heatmap Data (Simulated) ---

  getHeatmapData(): {
    x: number;
    y: number;
    intensity: number;
  }[] {
    const clicks = this.userBehavior.interactions.filter(i => i.type === 'click' && i.metadata?.x && i.metadata?.y).map(i => ({
      x: i.metadata!.x as number,
      y: i.metadata!.y as number,
      intensity: 1
    }));

    // Aggregate nearby clicks
    const aggregated: {
      x: number;
      y: number;
      intensity: number;
    }[] = [];
    const radius = 50;
    clicks.forEach(click => {
      const existing = aggregated.find(a => Math.abs(a.x - click.x) < radius && Math.abs(a.y - click.y) < radius);
      if (existing) {
        existing.intensity++;
      } else {
        aggregated.push({
          ...click
        });
      }
    });
    return aggregated;
  }
}

// --- Exports ---

export const analyticsManager = AdvancedAnalyticsManager.getInstance();

// Helper functions
export const trackPageView = (page: string, metadata?: Record<string, any>) => analyticsManager.trackPageView(page, metadata);
export const trackUserAction = (page: string, action: string, metadata?: Record<string, any>) => analyticsManager.trackAction(page, action, metadata);
export const startConversionFunnel = (funnelType: keyof typeof CONVERSION_FUNNELS) => analyticsManager.startFunnel(funnelType);
export const advanceConversionFunnel = (funnelType: keyof typeof CONVERSION_FUNNELS, step: string) => analyticsManager.advanceFunnel(funnelType, step);
export const abandonConversionFunnel = (funnelType: keyof typeof CONVERSION_FUNNELS, dropoffStep: string) => analyticsManager.abandonFunnel(funnelType, dropoffStep);
export const trackClick = (element: string, metadata?: Record<string, any>) => analyticsManager.trackInteraction({
  type: 'click',
  element,
  timestamp: Date.now(),
  metadata
});
export const trackSearch = (query: string, resultsCount: number) => analyticsManager.trackInteraction({
  type: 'search',
  element: 'search_bar',
  timestamp: Date.now(),
  metadata: {
    query,
    resultsCount
  }
});
export const trackFilter = (filterType: string, filterValue: string) => analyticsManager.trackInteraction({
  type: 'filter',
  element: filterType,
  timestamp: Date.now(),
  metadata: {
    value: filterValue
  }
});