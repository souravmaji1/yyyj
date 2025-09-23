/**
 * Enhanced Analytics System for High-Converting E-commerce
 * Provides comprehensive event tracking with privacy compliance and performance optimization
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

interface ConversionEvent {
  event_name: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'sign_up' | 'login';
  event_category: 'ecommerce' | 'engagement' | 'conversion';
  value?: number;
  currency?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  quantity?: number;
  checkout_step?: number;
  payment_method?: string;
}

class EnhancedAnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracker();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracker() {
    if (typeof window === 'undefined') return;

    // Initialize session tracking
    this.sessionId = sessionStorage.getItem('analytics_session') || this.generateSessionId();
    sessionStorage.setItem('analytics_session', this.sessionId);

    // Initialize user tracking (if consent given)
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.userId = userId;
    }

    this.isInitialized = true;

    // Flush queue periodically
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 5000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track page views
    this.trackPageView();
  }

  /**
   * Track a generic event
   */
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      // Queue events until initialized
      this.queue.push({ event, properties });
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.sanitizeProperties(properties),
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    this.queue.push(analyticsEvent);

    // Immediate flush for critical events
    if (this.isCriticalEvent(event)) {
      this.flush();
    }
  }

  /**
   * Track conversion events with enhanced data
   */
  trackConversion(eventData: ConversionEvent): void {
    this.track(eventData.event_name, {
      ...eventData,
      event_type: 'conversion',
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
    });
  }

  /**
   * Track e-commerce events
   */
  trackEcommerce = {
    viewItem: (itemId: string, itemName: string, category: string, value: number) => {
      this.trackConversion({
        event_name: 'view_item',
        event_category: 'ecommerce',
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        value,
        currency: 'USD',
      });
    },

    addToCart: (itemId: string, itemName: string, category: string, quantity: number, value: number) => {
      this.trackConversion({
        event_name: 'add_to_cart',
        event_category: 'ecommerce',
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        quantity,
        value,
        currency: 'USD',
      });
    },

    beginCheckout: (value: number, items: Array<{id: string; name: string; category: string; quantity: number}>) => {
      this.trackConversion({
        event_name: 'begin_checkout',
        event_category: 'ecommerce',
        value,
        currency: 'USD',
        checkout_step: 1,
      });
      
      // Track individual items
      items.forEach(item => {
        this.track('checkout_item', {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          quantity: item.quantity,
        });
      });
    },

    purchase: (transactionId: string, value: number, paymentMethod: string, items: any[]) => {
      this.trackConversion({
        event_name: 'purchase',
        event_category: 'ecommerce',
        value,
        currency: 'USD',
        payment_method: paymentMethod,
      });

      this.track('transaction_complete', {
        transaction_id: transactionId,
        revenue: value,
        payment_method: paymentMethod,
        item_count: items.length,
      });
    },
  };

  /**
   * Track user engagement events
   */
  trackEngagement = {
    pageView: (page?: string) => {
      this.track('page_view', {
        page: page || window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    },

    click: (element: string, category: string = 'button') => {
      this.track('click', {
        element,
        category,
        page: window.location.pathname,
      });
    },

    search: (query: string, resultsCount: number, category?: string) => {
      this.track('search', {
        query: query.substring(0, 100), // Limit query length for privacy
        results_count: resultsCount,
        category,
        page: window.location.pathname,
      });
    },

    formSubmit: (formName: string, success: boolean) => {
      this.track('form_submit', {
        form_name: formName,
        success,
        page: window.location.pathname,
      });
    },

    error: (errorType: string, errorMessage: string, context?: string) => {
      this.track('error', {
        error_type: errorType,
        error_message: errorMessage.substring(0, 200), // Limit for privacy
        context,
        page: window.location.pathname,
      });
    },
  };

  /**
   * Track user authentication events
   */
  trackAuth = {
    signUp: (method: string) => {
      this.trackConversion({
        event_name: 'sign_up',
        event_category: 'conversion',
      });
      
      this.track('auth_signup', {
        method,
        timestamp: Date.now(),
      });
    },

    login: (method: string) => {
      this.trackConversion({
        event_name: 'login',
        event_category: 'engagement',
      });
      
      this.track('auth_login', {
        method,
        timestamp: Date.now(),
      });
    },

    logout: () => {
      this.track('auth_logout', {
        session_duration: this.getSessionDuration(),
      });
    },
  };

  /**
   * Set user identity (with consent)
   */
  identify(userId: string, traits?: Record<string, any>): void {
    this.userId = userId;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', userId);
    }

    this.track('identify', {
      user_id: userId,
      traits: this.sanitizeProperties(traits),
    });
  }

  /**
   * Clear user identity (for logout/privacy)
   */
  reset(): void {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
      sessionStorage.setItem('analytics_session', this.sessionId);
    }
  }

  /**
   * Flush events to analytics service
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed('📊 Enhanced Analytics Events');
        events.forEach(event => {
          console.log(event.event, event.properties);
        });
        console.groupEnd();
        return;
      }

      // Send to analytics service (implement based on your analytics provider)
      await this.sendToAnalyticsService(events);
      
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events for retry (limit to prevent memory leaks)
      if (this.queue.length < 100) {
        this.queue.unshift(...events);
      }
    }
  }

  private async sendToAnalyticsService(events: AnalyticsEvent[]): Promise<void> {
    // Implement your analytics service integration here
    // Examples: Google Analytics 4, Mixpanel, Amplitude, etc.
    
    // Example for custom analytics endpoint:
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      throw new Error(`Analytics service error: ${error}`);
    }
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Remove sensitive data
      if (this.isSensitiveKey(key)) {
        continue;
      }

      // Limit string lengths for privacy and performance
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'apikey', 'api_key',
      'credit_card', 'ssn', 'social_security', 'phone', 'email'
    ];
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      'purchase', 'sign_up', 'error', 'form_submit'
    ];
    return criticalEvents.includes(event);
  }

  private trackPageView(): void {
    if (typeof window === 'undefined') return;
    
    this.trackEngagement.pageView();
    
    // Track route changes for SPAs
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackEngagement.pageView();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private getSessionDuration(): number {
    const sessionStart = sessionStorage.getItem('session_start');
    if (!sessionStart) return 0;
    
    return Date.now() - parseInt(sessionStart, 10);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Create singleton instance
export const enhancedAnalytics = new EnhancedAnalyticsTracker();

// Convenience functions for common tracking patterns
export const trackConversion = {
  // Page tracking
  pageView: (page?: string) => enhancedAnalytics.trackEngagement.pageView(page),
  
  // User interactions
  click: (element: string, category?: string) => enhancedAnalytics.trackEngagement.click(element, category),
  search: (query: string, resultsCount: number) => enhancedAnalytics.trackEngagement.search(query, resultsCount),
  
  // E-commerce
  viewItem: (id: string, name: string, category: string, value: number) => 
    enhancedAnalytics.trackEcommerce.viewItem(id, name, category, value),
  addToCart: (id: string, name: string, category: string, quantity: number, value: number) => 
    enhancedAnalytics.trackEcommerce.addToCart(id, name, category, quantity, value),
  purchase: (id: string, value: number, method: string, items: any[]) => 
    enhancedAnalytics.trackEcommerce.purchase(id, value, method, items),
  
  // Authentication
  signUp: (method: string) => enhancedAnalytics.trackAuth.signUp(method),
  login: (method: string) => enhancedAnalytics.trackAuth.login(method),
  logout: () => enhancedAnalytics.trackAuth.logout(),
  
  // Forms and errors
  formSubmit: (formName: string, success: boolean) => 
    enhancedAnalytics.trackEngagement.formSubmit(formName, success),
  error: (type: string, message: string, context?: string) => 
    enhancedAnalytics.trackEngagement.error(type, message, context),
  
  // User identification
  identify: (userId: string, traits?: Record<string, any>) => enhancedAnalytics.identify(userId, traits),
  reset: () => enhancedAnalytics.reset(),
};

export default enhancedAnalytics;