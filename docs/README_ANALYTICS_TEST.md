# Analytics Guide

## Overview

The boilerplate includes a comprehensive analytics system with:
- **Multi-platform support**: Google Analytics, Facebook Pixel, Hotjar, Microsoft Clarity
- **IP/Bot exclusions**: Exclude localhost, bots, and specific IPs from tracking
- **Custom events utility**: Developer-friendly API for tracking events
- **Admin configuration**: Manage settings via `/admin/settings`

## Configuration

Analytics are configured in two places:

### 1. Analytics IDs (`seo.config.ts`)
Configure your tracking IDs in the SEO config file or via Admin Settings > Analytics:
- Google Analytics ID (G-XXXXXXXXXX)
- Facebook Pixel ID
- Hotjar ID
- Microsoft Clarity ID

### 2. Exclusion Settings (`settings.json`)
Configure via Admin Settings > Analytics:
- **Enable exclusions**: Master toggle
- **Exclude localhost**: Don't track from development environments
- **Exclude bots**: Don't track search engines, crawlers, social media bots
- **Excluded IPs**: Specific IP addresses to exclude (e.g., office IPs)

## Analytics Exclusions

The exclusion system prevents tracking for:
- **Localhost**: 127.0.0.1, ::1, localhost
- **Bots**: Googlebot, Bingbot, Facebookexternalhit, etc.
- **Custom IPs**: Any IPs you add in admin settings

### How It Works
1. On page load, client fetches `/api/analytics/check-exclusion`
2. API checks user's IP, user-agent against exclusion rules
3. If excluded, analytics scripts don't load at all
4. Result is cached in sessionStorage for 5 minutes

### Console Logging
When traffic is excluded, you'll see in the browser console:
```
[Analytics] Traffic excluded (reason: localhost, ip: ::1)
```

When events are excluded:
```
[Analytics] Event excluded: cta_click {button_id: "hero-btn"}
```

## Custom Events Tracking

### Using the React Hook (Recommended)
```tsx
import { useTrackEvent } from '@/lib/analytics';

function ContactForm() {
  const { trackEvent, trackLead, isExcluded } = useTrackEvent();

  const handleSubmit = () => {
    // Track a lead
    trackLead('contact-form', 100, 'USD');

    // Or track custom event
    trackEvent('form_submit', { form_id: 'contact' });
  };

  return (
    <form onSubmit={handleSubmit}>
      {isExcluded && <small>Analytics disabled for your session</small>}
      {/* form fields */}
    </form>
  );
}
```

### Available Hook Methods
- `trackEvent(name, params)` - Track to GA + FB Pixel
- `trackGAEvent(name, params)` - Track to GA only
- `trackFBEvent(name, params)` - Track to FB only
- `trackLead(formId, value?, currency?)` - Lead generation
- `trackPurchase(transactionId, value, currency, items?)` - Purchases
- `trackSignUp(method?)` - Sign ups
- `trackClick(buttonId, buttonText?)` - Button clicks

### Outside React Components
```typescript
import { trackEvent, trackClick, trackPageView } from '@/lib/analytics';

// Track custom events
trackEvent('video_play', { video_id: 'intro' });
trackClick('cta-hero', 'Get Started');
trackPageView('/custom-page');
```

## Testing

### 1. Verify Exclusion Works
On localhost, you should see:
- Console log: `[Analytics] Traffic excluded (reason: localhost, ip: ::1)`
- No analytics network requests in DevTools
- Scripts not loaded (check Elements tab)

### 2. Verify Tracking Works (Production)
With valid analytics IDs and non-excluded IP:
- Network tab: Requests to googletagmanager.com, facebook.com, etc.
- Console: No exclusion logs
- Real-time reports in analytics dashboards

### 3. Test Custom Events
```javascript
// In browser console (when not excluded)
trackEvent('test_event', { test: true });
```

## Admin Settings

Navigate to `/admin/settings` > Analytics tab:

1. **Analytics IDs**: Enter your tracking IDs
2. **Enable Exclusions**: Toggle the master switch
3. **Exclude Localhost**: Recommended ON for development
4. **Exclude Bots**: Recommended ON to filter crawlers
5. **Excluded IPs**: Add office/team IPs (one per line)

**Note**: Settings are saved to `settings.json` locally (gitignored). For fresh setups, copy `settings.example.json` to `settings.json`. The admin panel is read-only in production — edit `settings.json` locally and redeploy.

## Implementation Details

| Component | Location | Purpose |
|-----------|----------|---------|
| Analytics | `src/components/admin/Analytics.tsx` | Loads tracking scripts |
| AnalyticsTracking | `src/components/admin/AnalyticsTracking.tsx` | Page view tracking |
| AnalyticsContext | `src/contexts/AnalyticsContext.tsx` | Exclusion state provider |
| Check Exclusion API | `src/app/api/analytics/check-exclusion/route.ts` | Server-side exclusion check |
| Tracking Utility | `src/lib/analytics/track.ts` | Event tracking functions |
| React Hook | `src/lib/analytics/hooks.ts` | useTrackEvent hook |

## Features

- Automatic page view tracking on route changes
- IP-based exclusion (localhost, custom IPs)
- Bot/crawler detection and exclusion
- Session caching for exclusion status
- Console logging for debugging
- TypeScript support
- Works in private browsing mode
- Production read-only admin settings
