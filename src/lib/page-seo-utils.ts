import fs from 'fs';
import path from 'path';
import { PageSeoConfig, PageSeoConfigRaw } from './page-seo-types';

/**
 * Page SEO Configuration Utilities
 * 
 * These utilities help load and manage SEO configurations for individual pages
 */

/**
 * Load SEO configuration for a specific page
 * Looks for seo-config.json in the page's directory
 */
export function loadPageSeoConfig(pagePath: string): PageSeoConfig | null {
  try {
    // First, check for the new centralized SEO config format
    const fileName = pagePath === '/' ? 'home' : pagePath.replace(/\//g, '').replace(/-/g, '_');
    const centralConfigPath = path.join(process.cwd(), 'src', 'seo', 'pages', `${fileName}.seo.json`);
    
    if (fs.existsSync(centralConfigPath)) {
      const configContent = fs.readFileSync(centralConfigPath, 'utf-8');
      const centralConfig = JSON.parse(configContent);
      
      // Convert from the new format to the expected format
      return {
        slug: path.basename(pagePath) || 'home',
        metadata: centralConfig.metadata,
        openGraph: centralConfig.openGraph,
        twitter: centralConfig.twitter,
        robots: centralConfig.robots,
        alternates: centralConfig.alternates
      } as PageSeoConfig;
    }
    
    // Fallback to the old format (page-specific seo-config.json)
    // For the homepage, prefer route-group (pages)/(home) if present
    let configPath: string;
    if (pagePath === '/') {
      const groupedHomePath = path.join(process.cwd(), 'src', 'app', '(pages)', '(home)', 'seo-config.json');
      const oldGroupedHomePath = path.join(process.cwd(), 'src', 'app', '(home)', 'seo-config.json');
      configPath = fs.existsSync(groupedHomePath)
        ? groupedHomePath
        : fs.existsSync(oldGroupedHomePath)
        ? oldGroupedHomePath
        : path.join(process.cwd(), 'src', 'app', 'seo-config.json');
    } else {
      const normalizedPath = pagePath.replace('/(pages)', '');
      // Try (pages) directory first, then root
      const pagesConfigPath = path.join(process.cwd(), 'src', 'app', '(pages)', normalizedPath, 'seo-config.json');
      const rootConfigPath = path.join(process.cwd(), 'src', 'app', normalizedPath, 'seo-config.json');
      configPath = fs.existsSync(pagesConfigPath) ? pagesConfigPath : rootConfigPath;
    }
    
    if (!fs.existsSync(configPath)) {
      return null;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const rawConfig: PageSeoConfigRaw = JSON.parse(configContent);
    
    // Create a complete config with defaults
    const config: PageSeoConfig = {
      slug: rawConfig.slug || path.basename(pagePath) || 'home',
      seo: rawConfig.seo,
      sitemap: rawConfig.sitemap,
      metadata: rawConfig.metadata,
    };
    
    return config;
  } catch (error) {
    console.warn(`Error loading SEO config for page ${pagePath}:`, error);
    return null;
  }
}

/**
 * Load all page SEO configurations
 * Scans the app directory for pages with seo-config.json files
 */
export function loadAllPageSeoConfigs(): PageSeoConfig[] {
  const configs: PageSeoConfig[] = [];
  
  try {
    const appDir = path.join(process.cwd(), 'src', 'app');
    
    // Define known page directories to scan
    const pagePaths = [
      '', // Root/home page
      '(pages)/privacy',
      '(pages)/terms-of-service',
      '(pages)/(home)',
      'privacy', // backwards compatibility
      'terms-of-service', // backwards compatibility
      'home', // backwards compatibility
      'admin', // Example admin page (excluded from search/sitemap)
      // Add more page paths as your site grows
    ];
    
    for (const pagePath of pagePaths) {
      const fullPath = pagePath === '' ? '/' : `/${pagePath}`;
      const config = loadPageSeoConfig(fullPath);
      
      if (config) {
        configs.push(config);
      }
    }
    
    return configs;
  } catch (error) {
    console.warn('Error loading page SEO configs:', error);
    return [];
  }
}

/**
 * Check if a page should be excluded from sitemaps
 */
export function isPageExcludedFromSitemap(pagePath: string): boolean {
  const config = loadPageSeoConfig(pagePath);
  return config?.sitemap?.exclude === true;
}

/**
 * Check if a page should have noindex robots directive
 */
export function isPageNoIndex(pagePath: string): boolean {
  const config = loadPageSeoConfig(pagePath);
  return config?.seo?.noIndex === true;
}

/**
 * Get custom sitemap priority for a page
 */
export function getPageSitemapPriority(pagePath: string): number | undefined {
  const config = loadPageSeoConfig(pagePath);
  return config?.sitemap?.priority;
}

/**
 * Get custom change frequency for a page
 */
export function getPageChangeFrequency(pagePath: string): string | undefined {
  const config = loadPageSeoConfig(pagePath);
  return config?.sitemap?.changeFrequency;
}