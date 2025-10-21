'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { seoConfig } from '@/seo/seo.config';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

function AnalyticsTrackingContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get analytics IDs from seo config
  const googleAnalyticsId = (seoConfig as any).analytics?.googleAnalyticsId || '';
  const facebookPixelId = (seoConfig as any).analytics?.facebookPixelId || '';

  // Google Analytics pageview tracking
  useEffect(() => {
    if (googleAnalyticsId && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', googleAnalyticsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, googleAnalyticsId]);

  // Facebook Pixel pageview tracking
  useEffect(() => {
    if (facebookPixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, facebookPixelId]);

  return null;
}

export function AnalyticsTracking() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackingContent />
    </Suspense>
  );
}
