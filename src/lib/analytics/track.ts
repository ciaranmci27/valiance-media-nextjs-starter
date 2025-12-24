'use client';

/**
 * Analytics Tracking Utility
 * Provides functions for tracking events across GA4 and Facebook Pixel.
 * Automatically respects analytics exclusion settings.
 */

import { EventParams, TrackEventOptions, FB_EVENT_MAP } from './types';

/**
 * Check if analytics is currently excluded for this user.
 * Reads from the global flag set by AnalyticsProvider.
 *
 * Returns true (excluded) if:
 * - Flag is explicitly true
 * - Flag is undefined (exclusion check hasn't completed yet - fail safe)
 *
 * This prevents tracking from firing before the exclusion check completes.
 */
export function isAnalyticsExcluded(): boolean {
  if (typeof window === 'undefined') return true; // SSR - don't track
  // If flag is undefined, exclusion check hasn't completed yet
  // Default to excluded (safe) until we know for sure
  if (window.__ANALYTICS_EXCLUDED__ === undefined) return true;
  return window.__ANALYTICS_EXCLUDED__ === true;
}

/**
 * Check if we're in development mode.
 */
function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Track a custom event to Google Analytics.
 * Automatically respects exclusion settings.
 *
 * @param eventName - The name of the event (e.g., 'button_click', 'form_submit')
 * @param params - Optional event parameters
 * @param options - Optional tracking options
 *
 * @example
 * ```ts
 * trackGA('cta_click', { button_id: 'hero-cta', button_text: 'Get Started' });
 * ```
 */
export function trackGA(
  eventName: string,
  params?: EventParams,
  options?: TrackEventOptions
): void {
  // Skip if user is excluded from analytics
  if (isAnalyticsExcluded()) {
    if (options?.debug || isDev()) {
      console.log('[Analytics Excluded] GA event prevented:', eventName, params);
    }
    return;
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);

    if (options?.debug || isDev()) {
      console.log('[GA] Event tracked:', eventName, params);
    }
  }
}

/**
 * Track a custom event to Facebook Pixel.
 * Automatically respects exclusion settings.
 *
 * @param eventName - The Facebook Pixel event name (e.g., 'Lead', 'Purchase')
 * @param params - Optional event parameters
 * @param options - Optional tracking options
 *
 * @example
 * ```ts
 * trackFB('Lead', { value: 100, currency: 'USD' });
 * ```
 */
export function trackFB(
  eventName: string,
  params?: EventParams,
  options?: TrackEventOptions
): void {
  // Skip if user is excluded from analytics
  if (isAnalyticsExcluded()) {
    if (options?.debug || isDev()) {
      console.log('[Analytics Excluded] FB event prevented:', eventName, params);
    }
    return;
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);

    if (options?.debug || isDev()) {
      console.log('[FB Pixel] Event tracked:', eventName, params);
    }
  }
}

/**
 * Track an event to both Google Analytics and Facebook Pixel.
 * The event name will be automatically mapped to the appropriate FB Pixel event.
 * Automatically respects exclusion settings.
 *
 * @param eventName - The event name (uses GA4 naming convention)
 * @param params - Optional event parameters
 * @param options - Optional tracking options
 *
 * @example
 * ```ts
 * // Track a lead generation event to both platforms
 * trackEvent('generate_lead', {
 *   form_id: 'contact-form',
 *   value: 50,
 *   currency: 'USD'
 * });
 *
 * // Track only to GA
 * trackEvent('custom_event', { custom_param: 'value' }, { gaOnly: true });
 * ```
 */
export function trackEvent(
  eventName: string,
  params?: EventParams,
  options?: TrackEventOptions
): void {
  // Skip if user is excluded from analytics
  if (isAnalyticsExcluded()) {
    if (options?.debug || isDev()) {
      console.log('[Analytics Excluded] Event prevented:', eventName, params);
    }
    return;
  }

  // Track to Google Analytics (unless fbOnly is set)
  if (!options?.fbOnly) {
    trackGA(eventName, params, options);
  }

  // Track to Facebook Pixel (unless gaOnly is set)
  if (!options?.gaOnly) {
    // Map GA4 event name to FB Pixel event name
    const fbEventName = FB_EVENT_MAP[eventName] || eventName;
    trackFB(fbEventName, params, options);
  }
}

/**
 * Track a page view event.
 * Typically called by AnalyticsTracking component, but can be called manually.
 *
 * @param path - The page path (defaults to current pathname)
 */
export function trackPageView(path?: string): void {
  if (isAnalyticsExcluded()) {
    if (isDev()) {
      console.log('[Analytics Excluded] PageView prevented:', path);
    }
    return;
  }

  const pagePath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');

  trackGA('page_view', { page_path: pagePath });
  trackFB('PageView');
}

/**
 * Track a purchase event with e-commerce data.
 *
 * @param transactionId - Unique transaction identifier
 * @param value - Total purchase value
 * @param currency - Currency code (e.g., 'USD')
 * @param items - Array of purchased items
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{ item_id?: string; item_name?: string; price?: number; quantity?: number }>
): void {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
}

/**
 * Track a lead generation event.
 *
 * @param formId - Identifier for the form
 * @param value - Optional lead value
 * @param currency - Currency code for the value
 */
export function trackLead(
  formId: string,
  value?: number,
  currency: string = 'USD'
): void {
  trackEvent('generate_lead', {
    form_id: formId,
    value,
    currency,
  });
}

/**
 * Track a sign-up/registration event.
 *
 * @param method - The sign-up method (e.g., 'email', 'google', 'facebook')
 */
export function trackSignUp(method: string = 'email'): void {
  trackEvent('sign_up', { method });
}

/**
 * Track a button or CTA click.
 *
 * @param buttonId - Identifier for the button/CTA
 * @param buttonText - Optional text of the button
 */
export function trackClick(buttonId: string, buttonText?: string): void {
  trackEvent('cta_click', {
    button_id: buttonId,
    button_text: buttonText,
  });
}
