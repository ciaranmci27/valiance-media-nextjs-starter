import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';
import { loadPageSeoConfig } from '@/lib/page-seo-utils';

/**
 * Pages Sitemap - Contains all static pages
 * This includes homepage, privacy, terms, contact, etc.
 */
export function sitemapPages(customBaseUrl?: string): MetadataRoute.Sitemap {
  const baseUrl = customBaseUrl || (seoConfig as any).siteUrl;
  const sitemapConfig = seoConfig.sitemap;

  const staticRoutes = [
    { 
      route: '', 
      defaultPriority: sitemapConfig.priority.homepage, 
      defaultChangeFreq: sitemapConfig.changeFrequency.homepage 
    },
    { 
      route: '/privacy', 
      defaultPriority: sitemapConfig.priority.mainPages, 
      defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    },
    { 
      route: '/terms-of-service', 
      defaultPriority: sitemapConfig.priority.mainPages, 
      defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    },
    { 
      route: '/admin', 
      defaultPriority: 0.1, 
      defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    },
    // Add other static pages here as your site grows
    // { 
    //   route: '/about', 
    //   defaultPriority: sitemapConfig.priority.mainPages, 
    //   defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    // },
    // { 
    //   route: '/services', 
    //   defaultPriority: sitemapConfig.priority.mainPages, 
    //   defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    // },
    // { 
    //   route: '/contact', 
    //   defaultPriority: sitemapConfig.priority.mainPages, 
    //   defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    // },
  ];

  // Filter and build sitemap entries with page-level configuration support
  return staticRoutes
    .filter(({ route }) => {
      // Check global exclusions
      if (sitemapConfig.excludedPages.includes(route)) return false;
      
      // Check page-level exclusions
      const pageConfig = loadPageSeoConfig(route === '' ? '/' : route);
      if (pageConfig?.sitemap?.exclude === true) return false;
      
      return true;
    })
    .map(({ route, defaultPriority, defaultChangeFreq }) => {
      // Load page-specific configuration
      const pageConfig = loadPageSeoConfig(route === '' ? '/' : route);
      
      // Use page config values if available, otherwise fall back to defaults
      const priority = pageConfig?.sitemap?.priority ?? defaultPriority;
      const changeFreq = pageConfig?.sitemap?.changeFrequency ?? defaultChangeFreq;
      
      // Use page-specific last modified date if available
      const lastModified = pageConfig?.metadata?.lastModified 
        ? new Date(pageConfig.metadata.lastModified)
        : new Date();

      return {
        url: `${baseUrl}${route}`,
        lastModified,
        changeFrequency: changeFreq as any,
        priority: priority,
      };
    });
}