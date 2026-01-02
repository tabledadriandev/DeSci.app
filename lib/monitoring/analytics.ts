/**
 * Analytics Integration
 * Tracks page views, user actions, and performance metrics
 */

/**
 * Track page view
 */
export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;

  // In production, would send to analytics service
  console.log('Page view:', path);
  
  // Example: Google Analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: path,
    });
  }
}

/**
 * Track user action
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  console.log('Event:', eventName, properties);
  
  // Example: Google Analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, properties);
  }
}

/**
 * Track performance metric
 */
export function trackPerformance(metricName: string, value: number) {
  if (typeof window === 'undefined') return;

  trackEvent('performance', {
    metric: metricName,
    value,
  });
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
