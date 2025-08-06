import { MetadataRoute } from 'next';

/**
 * Generate robots.txt for the website
 * This file automatically generates a robots.txt at /robots.txt
 * 
 * Uses relative sitemap URL so it works on any domain automatically.
 */
export default function robots(): MetadataRoute.Robots {

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '*.json',
          '/*?*', // Block URL parameters for most crawlers
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
        // Google can handle URL parameters better
      },
    ],
    sitemap: '/sitemap',
  };
}