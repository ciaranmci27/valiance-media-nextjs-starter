import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper routing on Vercel
  trailingSlash: false,

  // Move dev indicator above fixed sidebar (z-index: 50)
  devIndicators: false,

  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy - permissive for marketing sites with analytics
          // Covers: GA4 (incl. region-specific subdomains), Facebook Pixel, Hotjar
          // (incl. session-recording workers + survey iframes), Microsoft Clarity, Supabase.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              [
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                // Google Analytics / GTM
                'https://www.googletagmanager.com https://*.googletagmanager.com',
                'https://www.google-analytics.com https://*.google-analytics.com',
                'https://ssl.google-analytics.com',
                // Facebook Pixel
                'https://connect.facebook.net https://*.facebook.net',
                // Hotjar
                'https://static.hotjar.com https://script.hotjar.com https://*.hotjar.com',
                // Microsoft Clarity
                'https://www.clarity.ms https://*.clarity.ms https://c.bing.com',
              ].join(' '),
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              [
                "connect-src 'self'",
                // Google Analytics / GTM (incl. regional collect endpoints)
                'https://www.google-analytics.com https://*.google-analytics.com',
                'https://analytics.google.com https://*.analytics.google.com',
                'https://www.googletagmanager.com https://*.googletagmanager.com',
                'https://stats.g.doubleclick.net',
                // Facebook Pixel
                'https://www.facebook.com https://*.facebook.com',
                'https://connect.facebook.net https://*.facebook.net',
                // Hotjar
                'https://*.hotjar.com https://*.hotjar.io',
                'wss://*.hotjar.com',
                // Microsoft Clarity
                'https://*.clarity.ms https://c.bing.com',
                // Supabase
                'https://*.supabase.co https://*.supabase.in wss://*.supabase.co',
              ].join(' '),
              // Hotjar session recording uses blob: Web Workers
              "worker-src 'self' blob:",
              // Hotjar surveys/feedback widgets and FB Pixel iframes
              'frame-src \'self\' https://www.youtube.com https://player.vimeo.com https://*.hotjar.com https://*.facebook.com https://*.doubleclick.net',
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
