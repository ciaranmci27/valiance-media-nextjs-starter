import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';
import { loadPageSeoConfig } from '@/lib/page-seo-utils';
import fs from 'fs';
import path from 'path';

// TypeScript interface for static routes
interface StaticRoute {
  route: string;
  defaultPriority: number;
  defaultChangeFreq: string;
}

/**
 * Pages Sitemap - Contains all static pages
 * This dynamically includes all pages with SEO configurations
 */
export function sitemapPages(customBaseUrl?: string): MetadataRoute.Sitemap {
  const baseUrl = customBaseUrl || (seoConfig as any).siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const sitemapConfig = seoConfig.sitemap;

  let staticRoutes: StaticRoute[] = [];

  try {
    // Try to load dynamically generated routes
    const generatedRoutesPath = path.join(process.cwd(), 'src', 'seo', 'generated-sitemap-routes.json');
    
    if (fs.existsSync(generatedRoutesPath)) {
      const generatedData = JSON.parse(fs.readFileSync(generatedRoutesPath, 'utf-8'));
      staticRoutes = generatedData.staticRoutes.map((r: any) => ({
        route: r.route,
        defaultPriority: r.priority,
        defaultChangeFreq: r.changeFrequency
      }));
      
      console.log(`Loaded ${staticRoutes.length} routes from generated sitemap`);
    } else {
      console.warn('Generated sitemap routes not found, using fallback static routes');
      // Fallback to static routes if generated file doesn't exist
      staticRoutes = getFallbackStaticRoutes(sitemapConfig);
    }
  } catch (error) {
    console.error('Error loading generated sitemap routes:', error);
    // Fallback to static routes on error
    staticRoutes = getFallbackStaticRoutes(sitemapConfig);
  }

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

// Fallback static routes if dynamic generation fails
function getFallbackStaticRoutes(sitemapConfig: any): StaticRoute[] {
  return [
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
    // Blog main page  
    { 
      route: '/blog', 
      defaultPriority: 0.9, 
      defaultChangeFreq: 'daily' as any
    },
    { 
      route: '/admin', 
      defaultPriority: 0.1, 
      defaultChangeFreq: sitemapConfig.changeFrequency.pages 
    },
  ];
}