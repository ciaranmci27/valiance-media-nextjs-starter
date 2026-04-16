import { MetadataRoute } from 'next';
import { seoConfig } from './config';
import { getSiteUrl } from './site-url';
import { getLlmsSettings, KNOWN_AI_CRAWLERS } from './llms-settings';

// Force dynamic so the admin AI Search toggle takes effect immediately
// instead of being baked into the build output.
export const dynamic = 'force-dynamic';

/**
 * Generate robots.txt for the website dynamically based on configuration
 * This file automatically generates a robots.txt at /robots.txt
 *
 * - Core crawl rules come from seoConfig.robots.txt.rules
 * - AI-search (AEO) surface and crawler allowlist come from llms-settings.json,
 *   which the admin AI Search tab owns. Both pieces can be toggled
 *   independently without rebuilding.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
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

  const llms = await getLlmsSettings();

  // Paths we surface explicitly so they survive any future tightening of the
  // configured allow/disallow lists. /llms.txt is the AI-search index;
  // /blog/*.md serves the per-post markdown; /*.md covers every page's
  // markdown sibling (e.g. /tools/data-visualizer/docs.md, /index.md).
  const llmsAllowPaths = llms.enabled ? ['/llms.txt', '/*.md'] : [];

  // Build rules from configuration
  const rules: any[] = [];

  if (seoConfig.robots.txt?.rules) {
    seoConfig.robots.txt.rules.forEach(rule => {
      const ruleObj: any = {
        userAgent: rule.userAgent,
      };

      // Add allow rules and merge in the AEO-required allows
      const allow = Array.from(new Set([...(rule.allow || []), ...llmsAllowPaths]));
      if (allow.length > 0) {
        ruleObj.allow = allow;
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
      allow: ['/', ...llmsAllowPaths],
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
      allow: ['/', ...llmsAllowPaths],
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
      ],
    });
  }

  // AEO: per-crawler rule blocks. When the whole llms feature is off we skip
  // these entirely (crawlers still fall under the `*` rule). When the feature
  // is on we emit a dedicated block for each crawler the admin has enabled;
  // disabled ones get a hard disallow so the platform stops citing the site.
  if (llms.enabled) {
    const aiDisallow = ['/api/', '/admin/', '/private/'];
    for (const userAgent of KNOWN_AI_CRAWLERS) {
      if (llms.aiCrawlers[userAgent]) {
        rules.push({
          userAgent,
          allow: ['/', ...llmsAllowPaths],
          disallow: aiDisallow,
        });
      } else {
        rules.push({
          userAgent,
          disallow: '/',
        });
      }
    }
  }

  // Note: We use /sitemap because we're using sitemap indexes
  // The sitemap index is served at /sitemap
  return {
    rules,
    sitemap: `${siteUrl}/sitemap`,
    host: siteUrl,
  };
}
