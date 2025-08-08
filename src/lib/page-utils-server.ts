// Server-side page utility functions

import { Page, PageSEOConfig, PageListItem } from './page-types';
import fs from 'fs/promises';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

// Directories to exclude from page scanning
const EXCLUDED_DIRS = ['admin', 'api', 'blog', '_components', '_utils'];

// Get all pages from the file system
export async function getAllPages(): Promise<PageListItem[]> {
  try {
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

// Save page
export async function savePage(slug: string, content: string, seoConfig: PageSEOConfig): Promise<void> {
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
}

// Delete page
export async function deletePage(slug: string): Promise<void> {
  if (slug === 'home') {
    throw new Error('Cannot delete the home page');
  }
  
  // First try (pages) directory, then fall back to root
  const pagesDir = path.join(APP_DIR, '(pages)', slug);
  const rootDir = path.join(APP_DIR, slug);
  
  // Try to delete from (pages) first
  try {
    await fs.rm(pagesDir, { recursive: true, force: true });
    return;
  } catch (error) {
    // Try root directory
  }
  
  try {
    // Remove the entire directory from root
    await fs.rm(rootDir, { recursive: true, force: true });
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
  
  return `'use client';

import { PageWrapper } from "@/components/admin/PageWrapper";
import { SEO } from "@/seo";
import { pageMetadata } from "@/seo/seo.config";

export default function ${componentName}Page() {
  return (
    <PageWrapper>
      <SEO 
        pageData={{
          title: "${title}",
          description: "${title} page description",
          dateModified: "${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}",
        }}
        breadcrumbs={[
          { name: "Home", url: "https://valiancemedia.com" },
          { name: "${title}", url: "https://valiancemedia.com/${generateSlug(title)}" }
        ]}
      />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">${title}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">
              This is the ${title} page. Add your content here.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
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