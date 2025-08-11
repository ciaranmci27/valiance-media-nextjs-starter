import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';

/**
 * Generate robots.txt for the website dynamically based on configuration
 * This file automatically generates a robots.txt at /robots.txt
 * 
 * Uses configuration from seo.config.ts to:
 * - Set crawling rules based on robots settings
 * - Use the correct site URL for the sitemap
 * - Apply custom rules if specified
 */
export default function robots(): MetadataRoute.Robots {
  // Get the site URL from config, with fallbacks
  const getSiteUrl = (): string => {
    // First try the config
    const siteUrl = (seoConfig as any).siteUrl;
    if (siteUrl && siteUrl !== 'https://example.com') {
      return siteUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    
    // Then try environment variable
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    }
    
    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3000';
    }
    
    // Production fallback - will need to be configured
    return 'https://example.com';
  };

  const siteUrl = getSiteUrl();

  // If indexing is disabled globally, return restrictive robots.txt
  if (!seoConfig.robots.index) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${siteUrl}/sitemap`,
    };
  }

  // Build rules from configuration
  const rules: any[] = [];
  
  if (seoConfig.robots.txt?.rules) {
    seoConfig.robots.txt.rules.forEach(rule => {
      const ruleObj: any = {
        userAgent: rule.userAgent,
      };
      
      // Add allow rules
      if (rule.allow && rule.allow.length > 0) {
        ruleObj.allow = rule.allow;
      }
      
      // Add disallow rules
      if (rule.disallow && rule.disallow.length > 0) {
        ruleObj.disallow = rule.disallow;
      }
      
      // Add crawl delay if specified and greater than 0
      if (rule.crawlDelay && rule.crawlDelay > 0) {
        ruleObj.crawlDelay = rule.crawlDelay;
      }
      
      rules.push(ruleObj);
    });
  } else {
    // Fallback to default rules if configuration is missing
    rules.push({
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
        '*.json',
        '/*?*',
      ],
    });
    
    rules.push({
      userAgent: 'Googlebot',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
      ],
    });
  }

  // Note: We use /sitemap because we're using sitemap indexes
  // The sitemap index is served at /sitemap
  return {
    rules,
    sitemap: `${siteUrl}/sitemap`,
    host: siteUrl,
  };
}