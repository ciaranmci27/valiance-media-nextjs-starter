import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';

/**
 * Generate robots.txt for the website
 * This file automatically generates a robots.txt at /robots.txt
 * 
 * Customize the rules based on your SEO strategy.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoConfig.siteUrl;

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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}