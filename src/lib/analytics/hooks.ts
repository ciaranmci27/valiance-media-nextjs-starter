'use client';

/**
 * Analytics React Hooks
 * React hooks for tracking analytics events in components.
 */

import { useCallback } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { trackEvent as trackEventFn, trackGA, trackFB, isAnalyticsExcluded } from './track';
import { EventParams, TrackEventOptions } from './types';

/**
 * React hook for tracking analytics events.
 * Provides tracking functions that automatically respect exclusion settings.
 *
 * @example
 * ```tsx
 * function ContactForm() {
 *   const { trackEvent, trackLead, isExcluded } = useTrackEvent();
 *
 *   const handleSubmit = async (data: FormData) => {
 *     // Submit form...
 *
 *     // Track the lead
 *     trackLead('contact-form', 100);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {isExcluded && <small>Analytics disabled for your IP</small>}
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
export function useTrackEvent() {
  const { isExcluded, userIP, exclusionReason } = useAnalytics();

  /**
   * Track an event to both GA and FB Pixel.
   */
  const trackEvent = useCallback(
    (eventName: string, params?: EventParams, options?: TrackEventOptions) => {
      if (isExcluded) {
        // Always log excluded events so users can verify exclusion is working
        console.log('[Analytics] Event excluded:', eventName, params);
        return;
      }
      trackEventFn(eventName, params, options);
    },
    [isExcluded]
  );

  /**
   * Track an event to Google Analytics only.
   */
  const trackGAEvent = useCallback(
    (eventName: string, params?: EventParams, options?: TrackEventOptions) => {
      if (isExcluded) return;
      trackGA(eventName, params, options);
    },
    [isExcluded]
  );

  /**
   * Track an event to Facebook Pixel only.
   */
  const trackFBEvent = useCallback(
    (eventName: string, params?: EventParams, options?: TrackEventOptions) => {
      if (isExcluded) return;
      trackFB(eventName, params, options);
    },
    [isExcluded]
  );

  /**
   * Track a lead generation event.
   */
  const trackLead = useCallback(
    (formId: string, value?: number, currency: string = 'USD') => {
      trackEvent('generate_lead', { form_id: formId, value, currency });
    },
    [trackEvent]
  );

  /**
   * Track a purchase event.
   */
  const trackPurchase = useCallback(
    (
      transactionId: string,
      value: number,
      currency: string = 'USD',
      items?: Array<{ item_id?: string; item_name?: string; price?: number; quantity?: number }>
    ) => {
      trackEvent('purchase', { transaction_id: transactionId, value, currency, items });
    },
    [trackEvent]
  );

  /**
   * Track a sign-up event.
   */
  const trackSignUp = useCallback(
    (method: string = 'email') => {
      trackEvent('sign_up', { method });
    },
    [trackEvent]
  );

  /**
   * Track a button/CTA click.
   */
  const trackClick = useCallback(
    (buttonId: string, buttonText?: string) => {
      trackEvent('cta_click', { button_id: buttonId, button_text: buttonText });
    },
    [trackEvent]
  );

  return {
    // Tracking functions
    trackEvent,
    trackGAEvent,
    trackFBEvent,
    trackLead,
    trackPurchase,
    trackSignUp,
    trackClick,
    // State
    isExcluded,
    userIP,
    exclusionReason,
    // Utility
    isAnalyticsExcluded,
  };
}
