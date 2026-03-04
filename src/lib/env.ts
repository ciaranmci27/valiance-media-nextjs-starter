/**
 * Centralized Environment Variable Configuration
 *
 * Typed exports for all env vars used across the project.
 * Import from '@/lib/env' instead of reading process.env directly.
 *
 * Production validation for critical vars (SIMPLE_ADMIN_TOKEN, etc.)
 * lives in the consuming modules (auth.ts, auth-edge.ts) where the
 * error context is most useful.
 *
 * Supabase client files (client.ts, server.ts, middleware.ts) use
 * process.env directly with ! assertions per Supabase convention.
 */

// ==========================================================================
// HELPERS
// ==========================================================================

function optional(value: string | undefined, fallback = ''): string {
  return value ?? fallback;
}

// ==========================================================================
// RUNTIME
// ==========================================================================

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';

// ==========================================================================
// SITE
// ==========================================================================

export const NEXT_PUBLIC_SITE_URL = optional(process.env.NEXT_PUBLIC_SITE_URL, 'https://example.com');

// ==========================================================================
// AUTH - PROVIDER
// ==========================================================================

export type AuthProviderType = 'simple' | 'supabase';

export const ADMIN_AUTH_PROVIDER: AuthProviderType =
  process.env.ADMIN_AUTH_PROVIDER?.toLowerCase() === 'supabase' ? 'supabase' : 'simple';

export const DISABLE_ADMIN_AUTH = process.env.DISABLE_ADMIN_AUTH === 'true';

// ==========================================================================
// AUTH - SIMPLE
// ==========================================================================

export const SIMPLE_ADMIN_TOKEN = optional(process.env.SIMPLE_ADMIN_TOKEN);
export const SIMPLE_ADMIN_USERNAME = optional(process.env.SIMPLE_ADMIN_USERNAME, 'admin');
export const SIMPLE_ADMIN_PASSWORD_HASH = optional(process.env.SIMPLE_ADMIN_PASSWORD_HASH);

// ==========================================================================
// AUTH - SUPABASE
// ==========================================================================

export const NEXT_PUBLIC_SUPABASE_URL = optional(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const ADMIN_ALLOWED_EMAILS = optional(process.env.ADMIN_ALLOWED_EMAILS);

// ==========================================================================
// EMAIL
// ==========================================================================

export const SMTP_ENCRYPTION_KEY = optional(process.env.SMTP_ENCRYPTION_KEY);

// ==========================================================================
// ANALYTICS (all optional, client-side)
// ==========================================================================

export const NEXT_PUBLIC_GA_ID = optional(process.env.NEXT_PUBLIC_GA_ID);
export const NEXT_PUBLIC_FB_PIXEL_ID = optional(process.env.NEXT_PUBLIC_FB_PIXEL_ID);
export const NEXT_PUBLIC_HOTJAR_ID = optional(process.env.NEXT_PUBLIC_HOTJAR_ID);
export const NEXT_PUBLIC_CLARITY_ID = optional(process.env.NEXT_PUBLIC_CLARITY_ID);

// ==========================================================================
// VERIFICATION (optional, client-side)
// ==========================================================================

export const NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = optional(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
export const NEXT_PUBLIC_BING_SITE_VERIFICATION = optional(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION);
export const NEXT_PUBLIC_YANDEX_SITE_VERIFICATION = optional(process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION);
export const NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION = optional(process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION);
