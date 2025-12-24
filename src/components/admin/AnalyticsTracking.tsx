'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { seoConfig } from '@/seo/seo.config';
import { useAnalytics } from '@/contexts/AnalyticsContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    hj?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __ANALYTICS_EXCLUDED__?: boolean;
  }
}

function AnalyticsTrackingContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isExcluded } = useAnalytics();

  // Get analytics IDs from seo config
  const googleAnalyticsId = (seoConfig as unknown as { analytics?: { googleAnalyticsId?: string } }).analytics?.googleAnalyticsId || '';
  const facebookPixelId = (seoConfig as unknown as { analytics?: { facebookPixelId?: string } }).analytics?.facebookPixelId || '';

  // Google Analytics pageview tracking
  useEffect(() => {
    // Skip if user is excluded from analytics
    // Note: This component won't render when excluded (Analytics returns null),
    // but this check remains for safety
    if (isExcluded) {
      return;
    }

    if (googleAnalyticsId && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', googleAnalyticsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, googleAnalyticsId, isExcluded]);

  // Facebook Pixel pageview tracking
  useEffect(() => {
    // Skip if user is excluded from analytics
    if (isExcluded) {
      return;
    }

    if (facebookPixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, facebookPixelId, isExcluded]);

  return null;
}

export function AnalyticsTracking() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackingContent />
    </Suspense>
  );
}
