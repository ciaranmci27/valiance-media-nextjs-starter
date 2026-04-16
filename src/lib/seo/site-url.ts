import { seoConfig } from './config';

/**
 * Resolve the canonical site URL for server-side SEO output (robots.txt,
 * sitemap, llms.txt, the blog .md route). Single source of truth so every
 * consumer produces identical URLs.
 *
 * Resolution order:
 *   1. seoConfig.siteUrl (from NEXT_PUBLIC_SITE_URL)
 *   2. process.env.NEXT_PUBLIC_SITE_URL
 *   3. http://localhost:3000 in development
 *   4. https://example.com (triggers a runtime warning)
 *
 * The trailing slash is always stripped.
 */
export function getSiteUrl(): string {
  const configured = (seoConfig as { siteUrl?: string }).siteUrl;
  if (configured && configured !== 'https://example.com') {
    return configured.replace(/\/$/, '');
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://example.com';
}

/**
 * True when the resolved site URL is still the placeholder. Callers can use
 * this to warn loudly that externally-visible URLs will be broken until the
 * user configures NEXT_PUBLIC_SITE_URL.
 */
export function isPlaceholderSiteUrl(url: string = getSiteUrl()): boolean {
  return url === 'https://example.com';
}
