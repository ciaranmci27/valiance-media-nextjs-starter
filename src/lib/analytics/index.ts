/**
 * Analytics Library
 *
 * Central export point for all analytics utilities.
 *
 * @example
 * ```ts
 * // Import tracking functions
 * import { trackEvent, trackLead, trackPurchase } from '@/lib/analytics';
 *
 * // Track a custom event
 * trackEvent('button_click', { button_id: 'hero-cta' });
 *
 * // Track a lead
 * trackLead('contact-form', 100, 'USD');
 *
 * // Track a purchase
 * trackPurchase('order-123', 99.99, 'USD', [
 *   { item_id: 'prod-1', item_name: 'Product', price: 99.99, quantity: 1 }
 * ]);
 * ```
 *
 * @example
 * ```tsx
 * // Using the React hook in components
 * import { useTrackEvent } from '@/lib/analytics';
 *
 * function MyComponent() {
 *   const { trackEvent, isExcluded } = useTrackEvent();
 *
 *   const handleClick = () => {
 *     trackEvent('button_click', { button_id: 'my-button' });
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */

// Export types
export type {
  StandardEvent,
  EcommerceEventParams,
  LeadEventParams,
  ContentEventParams,
  ClickEventParams,
  EventParams,
  TrackEventOptions,
} from './types';

export { FB_EVENT_MAP } from './types';

// Export tracking functions
export {
  trackEvent,
  trackGA,
  trackFB,
  trackPageView,
  trackPurchase,
  trackLead,
  trackSignUp,
  trackClick,
  isAnalyticsExcluded,
} from './track';

// Export React hook
export { useTrackEvent } from './hooks';
