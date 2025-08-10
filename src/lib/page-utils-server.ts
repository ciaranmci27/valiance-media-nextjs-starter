// Server-side page utility functions

import { Page, PageSEOConfig, PageListItem } from './page-types';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const PAGES_CONFIG_PATH = path.join(process.cwd(), 'public', 'pages-config.json');

// Directories to exclude from page scanning
const EXCLUDED_DIRS = ['admin', 'api', 'blog', '_components', '_utils'];

// Get all pages from configuration file
export async function getAllPages(): Promise<PageListItem[]> {
  try {
    // Try to read from pages configuration file first (works in production)
    if (fsSync.existsSync(PAGES_CONFIG_PATH)) {
      const configContent = await fs.readFile(PAGES_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Enrich with SEO config data if available in development
      const enrichedPages = await Promise.all(config.pages.map(async (page: PageListItem) => {
        try {
          const seoConfig = await getPageSEOConfig(page.slug === 'home' ? '' : page.slug);
          if (seoConfig) {
            return {
              ...page,
              lastModified: seoConfig.metadata?.lastModified || page.lastModified,
              category: seoConfig.metadata?.category || page.category,
              featured: seoConfig.metadata?.featured ?? page.featured,
              draft: seoConfig.metadata?.draft ?? page.draft
            };
          }
        } catch (error) {
          // SEO config not available, use page data as is
        }
        return page;
      }));
      
      return enrichedPages;
    }
    
    // Fallback to filesystem scanning (development only)
    const pages: PageListItem[] = [];
    
    // Add home page (supports either root page.tsx or route-group (pages)/(home)/page.tsx)
    const groupedHomePath = path.join(APP_DIR, '(pages)', '(home)', 'page.tsx');
    const rootHomePath = path.join(APP_DIR, 'page.tsx');
    try {
      // Prefer route-group home if present, otherwise fallback to root
      try {
        await fs.access(groupedHomePath);
      } catch {
        await fs.access(rootHomePath);
      }
      const homeSeoConfig = await getPageSEOConfig('');
      pages.push({
        slug: 'home',
        title: 'Home', // Always show "Home" for the homepage
        path: '/',
        lastModified: homeSeoConfig?.metadata?.lastModified,
        category: homeSeoConfig?.metadata?.category,
        featured: homeSeoConfig?.metadata?.featured,
        draft: homeSeoConfig?.metadata?.draft,
        isHomePage: true
      });
    } catch (error) {
      console.log('Home page not found');
    }
    
    // Scan for other pages in (pages) directory
    const pagesDir = path.join(APP_DIR, '(pages)');
    try {
      const entries = await fs.readdir(pagesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('_') && !entry.name.startsWith('[') && !entry.name.startsWith('(')) {
          const pagePath = path.join(pagesDir, entry.name, 'page.tsx');
          
          try {
            await fs.access(pagePath);
            const seoConfig = await getPageSEOConfig(entry.name);
            
            pages.push({
              slug: entry.name,
              title: seoConfig?.seo?.title?.replace(' - Valiance Media', '') || formatTitle(entry.name),
              path: `/${entry.name}`,
              lastModified: seoConfig?.metadata?.lastModified,
              category: seoConfig?.metadata?.category,
              featured: seoConfig?.metadata?.featured,
              draft: seoConfig?.metadata?.draft,
              isHomePage: false
            });
          } catch (error) {
            // Page.tsx doesn't exist in this directory
          }
        }
      }
    } catch (error) {
      // (pages) directory might not exist yet
      console.log('(pages) directory not found, scanning root app directory');
    }
    
    // Also scan root app directory for backwards compatibility
    const rootEntries = await fs.readdir(APP_DIR, { withFileTypes: true });
    
    for (const entry of rootEntries) {
      if (entry.isDirectory() && !EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('_') && !entry.name.startsWith('[') && !entry.name.startsWith('(')) {
        const pagePath = path.join(APP_DIR, entry.name, 'page.tsx');
        
        try {
          await fs.access(pagePath);
          const seoConfig = await getPageSEOConfig(entry.name);
          
          pages.push({
            slug: entry.name,
            title: seoConfig?.seo?.title?.replace(' - Valiance Media', '') || formatTitle(entry.name),
            path: `/${entry.name}`,
            lastModified: seoConfig?.metadata?.lastModified,
            category: seoConfig?.metadata?.category,
            featured: seoConfig?.metadata?.featured,
            draft: seoConfig?.metadata?.draft,
            isHomePage: false
          });
        } catch (error) {
          // Page.tsx doesn't exist in this directory
        }
      }
    }
    
    // Sort by title
    return pages.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error getting pages:', error);
    return [];
  }
}

// Get page by slug
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const isHomePage = slug === 'home' || slug === '';
    let pagePath = '';
    if (isHomePage) {
      // Prefer route-group home if available
      const groupedHomePath = path.join(APP_DIR, '(pages)', '(home)', 'page.tsx');
      const rootHomePath = path.join(APP_DIR, 'page.tsx');
      try {
        await fs.access(groupedHomePath);
        pagePath = groupedHomePath;
      } catch {
        pagePath = rootHomePath;
      }
    } else {
      // First try (pages) directory, then fall back to root
      const pagesPath = path.join(APP_DIR, '(pages)', slug, 'page.tsx');
      const rootPath = path.join(APP_DIR, slug, 'page.tsx');
      try {
        await fs.access(pagesPath);
        pagePath = pagesPath;
      } catch {
        pagePath = rootPath;
      }
    }
    
    // Check if page exists
    await fs.access(pagePath);
    
    // Read page content
    const content = await fs.readFile(pagePath, 'utf-8');
    
    // Get SEO config
    const seoConfig = await getPageSEOConfig(isHomePage ? '' : slug);
    
    const page: Page = {
      slug: isHomePage ? 'home' : slug,
      path: isHomePage ? '/' : `/${slug}`,
      title: isHomePage ? 'Home' : (seoConfig?.seo?.title?.replace(' - Valiance Media', '') || formatTitle(slug)),
      content,
      ...(seoConfig ? { seoConfig } : {}),
      isHomePage,
      exists: true
    };
    return page;
  } catch (error) {
    return null;
  }
}

// Get SEO config for a page
export async function getPageSEOConfig(slug: string): Promise<PageSEOConfig | null> {
  try {
    let configPath: string;
    if (slug === '') {
      // Prefer route-group home if available
      const groupedSeoPath = path.join(APP_DIR, '(pages)', '(home)', 'seo-config.json');
      try {
        await fs.access(groupedSeoPath);
        configPath = groupedSeoPath;
      } catch {
        configPath = path.join(APP_DIR, 'seo-config.json');
      }
    } else {
      // First try (pages) directory, then fall back to root
      const pagesConfigPath = path.join(APP_DIR, '(pages)', slug, 'seo-config.json');
      const rootConfigPath = path.join(APP_DIR, slug, 'seo-config.json');
      try {
        await fs.access(pagesConfigPath);
        configPath = pagesConfigPath;
      } catch {
        configPath = rootConfigPath;
      }
    }
    
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    // SEO config doesn't exist or is invalid
    return null;
  }
}

// Update pages configuration file
async function updatePagesConfig(): Promise<void> {
  try {
    const pages: PageListItem[] = [];
    
    // Check for home page
    const groupedHomePath = path.join(APP_DIR, '(pages)', '(home)', 'page.tsx');
    const rootHomePath = path.join(APP_DIR, 'page.tsx');
    try {
      // Prefer route-group home if present, otherwise fallback to root
      try {
        await fs.access(groupedHomePath);
      } catch {
        await fs.access(rootHomePath);
      }
      const homeSeoConfig = await getPageSEOConfig('');
      pages.push({
        slug: 'home',
        title: 'Home',
        path: '/',
        category: homeSeoConfig?.metadata?.category || 'general',
        featured: homeSeoConfig?.metadata?.featured ?? true,
        draft: homeSeoConfig?.metadata?.draft ?? false,
        isHomePage: true
      });
    } catch (error) {
      // Home page not found
    }
    
    // Scan (pages) directory
    const pagesDir = path.join(APP_DIR, '(pages)');
    try {
      const entries = await fs.readdir(pagesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('_') && !entry.name.startsWith('[') && !entry.name.startsWith('(')) {
          const pagePath = path.join(pagesDir, entry.name, 'page.tsx');
          
          try {
            await fs.access(pagePath);
            const seoConfig = await getPageSEOConfig(entry.name);
            
            pages.push({
              slug: entry.name,
              title: seoConfig?.seo?.title?.replace(' - Valiance Media', '') || formatTitle(entry.name),
              path: `/${entry.name}`,
              category: seoConfig?.metadata?.category || 'general',
              featured: seoConfig?.metadata?.featured ?? false,
              draft: seoConfig?.metadata?.draft ?? false,
              isHomePage: false
            });
          } catch (error) {
            // Page.tsx doesn't exist in this directory
          }
        }
      }
    } catch (error) {
      // (pages) directory might not exist yet
    }
    
    // Write to config file
    const config = { pages };
    await fs.writeFile(PAGES_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error updating pages config:', error);
  }
}

// Save page
export async function savePage(slug: string, content: string, seoConfig: PageSEOConfig): Promise<void> {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Page editing is not available in production. Please edit pages locally and redeploy.');
  }
  
  const isHomePage = slug === 'home';
  
  if (isHomePage) {
    // For home page, write to the route-group (pages)/(home) for organization
    const homeDir = path.join(APP_DIR, '(pages)', '(home)');
    const pagePath = path.join(homeDir, 'page.tsx');
    const seoPath = path.join(homeDir, 'seo-config.json');
    
    await fs.mkdir(homeDir, { recursive: true });
    await fs.writeFile(pagePath, content, 'utf-8');
    if (seoConfig) {
      await fs.writeFile(seoPath, JSON.stringify(seoConfig, null, 2), 'utf-8');
    }
  } else {
    // For other pages, create directory in (pages) if needed
    const pageDir = path.join(APP_DIR, '(pages)', slug);
    const pagePath = path.join(pageDir, 'page.tsx');
    const seoPath = path.join(pageDir, 'seo-config.json');
    
    // Create directory if it doesn't exist
    await fs.mkdir(pageDir, { recursive: true });
    
    // Write files
    await fs.writeFile(pagePath, content, 'utf-8');
    await fs.writeFile(seoPath, JSON.stringify(seoConfig, null, 2), 'utf-8');
  }
  
  // Update pages configuration file
  await updatePagesConfig();
}

// Delete page
export async function deletePage(slug: string): Promise<void> {
  if (slug === 'home') {
    throw new Error('Cannot delete the home page');
  }
  
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Page deletion is not available in production. Please delete pages locally and redeploy.');
  }
  
  // First try (pages) directory, then fall back to root
  const pagesDir = path.join(APP_DIR, '(pages)', slug);
  const rootDir = path.join(APP_DIR, slug);
  
  // Try to delete from (pages) first
  try {
    await fs.rm(pagesDir, { recursive: true, force: true });
    // Update pages configuration file after successful deletion
    await updatePagesConfig();
    return;
  } catch (error) {
    // Try root directory
  }
  
  try {
    // Remove the entire directory from root
    await fs.rm(rootDir, { recursive: true, force: true });
    // Update pages configuration file after successful deletion
    await updatePagesConfig();
  } catch (error) {
    console.error(`Error deleting page ${slug}:`, error);
    throw error;
  }
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Format title from slug
function formatTitle(slug: string): string {
  if (slug === 'home' || slug === '') return 'Home';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate default page content
export function generateDefaultPageContent(title: string, template: string = 'default'): string {
  const componentName = title.replace(/[^a-zA-Z0-9]/g, '');
  
  return `export default function ${componentName}Page() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Your Next.js Boilerplate</h1>
      <p>This is an example "${title}" page. Replace this content with your own marketing site.</p>
    </div>
  );
}`;
}

// Generate default SEO config
export function generateDefaultSEOConfig(slug: string, title: string): PageSEOConfig {
  return {
    slug,
    seo: {
      title: `${title} - Valiance Media`,
      description: `${title} page for Valiance Media`,
      keywords: [slug, title.toLowerCase()],
      noIndex: false
    },
    sitemap: {
      exclude: false,
      priority: 0.5,
      changeFrequency: 'monthly'
    },
    metadata: {
      category: 'general',
      lastModified: new Date().toISOString().split('T')[0],
      featured: false,
      draft: false
    }
  };
}