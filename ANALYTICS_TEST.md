# Analytics Testing Guide

## How the Analytics Implementation Works

The boilerplate now includes automatic analytics tracking that:
1. **Only loads when configured** - Scripts are only injected if environment variables are set
2. **Supports multiple platforms** - Google Analytics, Facebook Pixel, Hotjar, and Microsoft Clarity
3. **Tracks page views automatically** - Updates on route changes in your Next.js app
4. **Zero performance impact when disabled** - No scripts load if env vars are not set

## Testing the Implementation

### 1. Without Environment Variables
When no analytics environment variables are set:
- No tracking scripts are loaded
- No network requests to analytics services
- No console errors
- Zero performance impact

### 2. With Google Analytics
Add to your `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Then check browser DevTools:
- Network tab: Should see requests to `googletagmanager.com`
- Console: Should see no errors
- Application > Scripts: Google Analytics script should be loaded

### 3. With Facebook Pixel
Add to your `.env.local`:
```
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX
```

Then check browser DevTools:
- Network tab: Should see requests to `facebook.com`
- Console: Should see "PageView" events being tracked

### 4. With Multiple Analytics
You can enable multiple analytics services simultaneously:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=XXXXXXXXXX
```

## Vercel Deployment
When deploying to Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add any analytics IDs you want to use
4. Redeploy your application

The analytics will automatically start working with your real IDs!

## Implementation Details

- **Location**: `src/components/Analytics.tsx`
- **Integration**: Automatically included in `src/app/layout.tsx`
- **Configuration**: Reads from `src/seo/seo.config.ts`
- **Environment Variables**: All prefixed with `NEXT_PUBLIC_` for client-side access

## Features

✅ Automatic page view tracking
✅ SPA route change tracking
✅ TypeScript support with proper type definitions
✅ Suspense boundary for better loading
✅ Uses Next.js Script component for optimal loading
✅ Zero configuration required - just add env vars!