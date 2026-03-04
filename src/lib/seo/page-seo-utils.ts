import fs from 'fs/promises';
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
export async function loadPageSeoConfig(pagePath: string): Promise<PageSeoConfig | null> {
  try {
    // For the homepage, prefer route-group (pages)/(home) if present
    let configPath: string;
    if (pagePath === '/') {
      const groupedHomePath = path.join(process.cwd(), 'src', 'app', '(pages)', '(home)', 'seo-config.json');
      const oldGroupedHomePath = path.join(process.cwd(), 'src', 'app', '(home)', 'seo-config.json');
      configPath = await fileExists(groupedHomePath)
        ? groupedHomePath
        : await fileExists(oldGroupedHomePath)
        ? oldGroupedHomePath
        : path.join(process.cwd(), 'src', 'app', 'seo-config.json');
    } else {
      const normalizedPath = pagePath.replace('/(pages)', '');
      // Try (pages) directory first, then root
      const pagesConfigPath = path.join(process.cwd(), 'src', 'app', '(pages)', normalizedPath, 'seo-config.json');
      const rootConfigPath = path.join(process.cwd(), 'src', 'app', normalizedPath, 'seo-config.json');
      configPath = await fileExists(pagesConfigPath) ? pagesConfigPath : rootConfigPath;
    }

    if (!await fileExists(configPath)) {
      return null;
    }

    const configContent = await fs.readFile(configPath, 'utf-8');
    const rawConfig: PageSeoConfigRaw = JSON.parse(configContent);

    // Spread the full rawConfig so no fields (openGraph, twitter, robots, alternates, schemas) are dropped
    const config: PageSeoConfig = {
      ...rawConfig,
      slug: rawConfig.slug || path.basename(pagePath) || 'home',
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
export async function loadAllPageSeoConfigs(): Promise<PageSeoConfig[]> {
  const configs: PageSeoConfig[] = [];

  try {
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
      const config = await loadPageSeoConfig(fullPath);

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
export async function isPageExcludedFromSitemap(pagePath: string): Promise<boolean> {
  const config = await loadPageSeoConfig(pagePath);
  return config?.sitemap?.exclude === true;
}

/**
 * Check if a page should have noindex robots directive
 */
export async function isPageNoIndex(pagePath: string): Promise<boolean> {
  const config = await loadPageSeoConfig(pagePath);
  return config?.seo?.noIndex === true;
}

/**
 * Get custom sitemap priority for a page
 */
export async function getPageSitemapPriority(pagePath: string): Promise<number | undefined> {
  const config = await loadPageSeoConfig(pagePath);
  return config?.sitemap?.priority;
}

/**
 * Get custom change frequency for a page
 */
export async function getPageChangeFrequency(pagePath: string): Promise<string | undefined> {
  const config = await loadPageSeoConfig(pagePath);
  return config?.sitemap?.changeFrequency;
}

/** Helper: check if a file exists without throwing */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
