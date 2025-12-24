/**
 * Analytics Types
 * TypeScript types for analytics tracking across GA4 and Facebook Pixel.
 */

/**
 * Standard analytics events that are commonly tracked.
 * These map to GA4 recommended events and FB standard events.
 */
export type StandardEvent =
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'purchase'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'view_item'
  | 'view_item_list'
  | 'search'
  | 'share'
  | 'generate_lead'
  | 'contact_form_submit'
  | 'cta_click'
  | 'file_download'
  | 'video_start'
  | 'video_complete'
  | 'scroll_depth';

/**
 * E-commerce event parameters for purchase/cart events.
 */
export interface EcommerceEventParams {
  currency?: string;
  value?: number;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}

/**
 * Lead generation event parameters.
 */
export interface LeadEventParams {
  form_id?: string;
  form_name?: string;
  form_type?: string;
  value?: number;
  currency?: string;
}

/**
 * Content interaction event parameters.
 */
export interface ContentEventParams {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
}

/**
 * Click event parameters.
 */
export interface ClickEventParams {
  button_id?: string;
  button_text?: string;
  link_url?: string;
  link_text?: string;
  element_class?: string;
}

/**
 * Generic event parameters for custom events.
 */
export type EventParams =
  | EcommerceEventParams
  | LeadEventParams
  | ContentEventParams
  | ClickEventParams
  | Record<string, unknown>;

/**
 * Options for tracking events.
 */
export interface TrackEventOptions {
  /** Only send to Google Analytics, not Facebook Pixel */
  gaOnly?: boolean;
  /** Only send to Facebook Pixel, not Google Analytics */
  fbOnly?: boolean;
  /** Log event to console (useful for debugging) */
  debug?: boolean;
}

/**
 * Facebook Pixel standard event mapping.
 * Maps GA4-style events to FB Pixel standard events.
 */
export const FB_EVENT_MAP: Record<string, string> = {
  'page_view': 'PageView',
  'sign_up': 'CompleteRegistration',
  'login': 'Login',
  'purchase': 'Purchase',
  'add_to_cart': 'AddToCart',
  'begin_checkout': 'InitiateCheckout',
  'add_payment_info': 'AddPaymentInfo',
  'view_item': 'ViewContent',
  'search': 'Search',
  'generate_lead': 'Lead',
  'contact_form_submit': 'Contact',
};
