// Server-side page utility functions

import { Page, PageSEOConfig, PageListItem } from './page-types';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { seoConfig as globalSeoConfig } from '@/seo/seo.config';

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const PAGES_CONFIG_PATH = path.join(process.cwd(), 'public', 'pages-config.json');

// Directories to exclude from page scanning
const EXCLUDED_DIRS = ['admin', 'api', 'blog', '_components', '_utils'];

// Helper function to check if a page is a client component
async function isClientComponent(pagePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(pagePath, 'utf-8');
    
    // Check for explicit 'use client' directive
    if (content.trimStart().startsWith("'use client'") || 
        content.trimStart().startsWith('"use client"')) {
      return true;
    }
    
    // Check for React hooks (useState, useEffect, useCallback, useMemo, etc.)
    const hasHooks = /\b(useState|useEffect|useCallback|useMemo|useReducer|useContext|useRef|useLayoutEffect|useImperativeHandle|useDebugValue|useDeferredValue|useTransition|useId|useSearchParams|useRouter|usePathname|useParams)\s*\(/g.test(content);
    if (hasHooks) {
      return true;
    }
    
    // Check for event handlers (onClick, onChange, onSubmit, etc.)
    const hasEventHandlers = /\bon[A-Z]\w*\s*=\s*[\{\(]/g.test(content);
    if (hasEventHandlers) {
      return true;
    }
    
    // Check for browser-only APIs
    const hasBrowserAPIs = /\b(window\.|document\.|localStorage\.|sessionStorage\.|navigator\.|location\.|history\.)/g.test(content);
    if (hasBrowserAPIs) {
      return true;
    }
    
    // Check for form handling and interactivity keywords
    const hasInteractivity = /\b(handleSubmit|handleClick|handleChange|setLoading|setError|setData|setValue)\s*[\(\=]/g.test(content);
    if (hasInteractivity) {
      return true;
    }
    
    // Check for common client-side libraries
    const hasClientLibraries = /from\s+['"](@supabase\/supabase-js|firebase|axios|react-hook-form|framer-motion|react-query|swr|react-spring)/g.test(content);
    if (hasClientLibraries) {
      return true;
    }
    
    // Check for Next.js client-side imports
    const hasClientImports = /from\s+['"]next\/(router|navigation)['"]/.test(content);
    if (hasClientImports) {
      return true;
    }
    
    // If none of the above, it's likely a static component
    return false;
  } catch (error) {
    return false;
  }
}

// Helper function to recursively scan directories for pages
async function scanDirectoryForPages(dir: string, basePath: string = ''): Promise<PageListItem[]> {
  const pages: PageListItem[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Handle route groups (directories starting with parentheses)
        if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
          // For route groups, scan inside but don't add to the path
          const subPages = await scanDirectoryForPages(entryPath, basePath);
          pages.push(...subPages);
          continue;
        }
        
        // Skip excluded directories and special directories (_, [)
        // But allow 'blog' if it's inside (pages) directory
        const isInPagesGroup = dir.includes('(pages)');
        const shouldExclude = !isInPagesGroup && EXCLUDED_DIRS.includes(entry.name);
        
        if (!shouldExclude && 
            !entry.name.startsWith('_') && 
            !entry.name.startsWith('[')) {
          
          const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
          const pagePath = path.join(entryPath, 'page.tsx');
        
          try {
            // Check if this directory has a page.tsx
            await fs.access(pagePath);
            const seoConfig = await getPageSEOConfig(relativePath);
            const isClient = await isClientComponent(pagePath);
            
            pages.push({
              slug: relativePath,
              title: seoConfig?.seo?.title?.replace(` - ${globalSeoConfig.siteName}`, '') || formatTitle(entry.name),
              path: `/${relativePath}`,
              lastModified: seoConfig?.metadata?.lastModified,
              category: seoConfig?.metadata?.category || 'general',
              featured: seoConfig?.metadata?.featured ?? false,
              draft: seoConfig?.metadata?.draft ?? false,
              isHomePage: false,
              isClientComponent: isClient
            });
          } catch {
            // No page.tsx in this directory, continue scanning
          }
          
          // Recursively scan subdirectories
          const subPages = await scanDirectoryForPages(entryPath, relativePath);
          pages.push(...subPages);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return pages;
}

// Get all pages from configuration file
export async function getAllPages(): Promise<PageListItem[]> {
  try {
    // In production, use the static pages-config.json
    // In development, always scan the filesystem dynamically
    if (process.env.NODE_ENV === 'production' && fsSync.existsSync(PAGES_CONFIG_PATH)) {
      const configContent = await fs.readFile(PAGES_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Enrich with SEO config data if available
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
    
    // Always scan filesystem in development
    const pages: PageListItem[] = [];
    
    // Add home page (supports either root page.tsx or route-group (pages)/(home)/page.tsx)
    const groupedHomePath = path.join(APP_DIR, '(pages)', '(home)', 'page.tsx');
    const rootHomePath = path.join(APP_DIR, 'page.tsx');
    try {
      // Prefer route-group home if present, otherwise fallback to root
      let homePagePath = groupedHomePath;
      try {
        await fs.access(groupedHomePath);
      } catch {
        await fs.access(rootHomePath);
        homePagePath = rootHomePath;
      }
      const homeSeoConfig = await getPageSEOConfig('');
      const isHomeClient = await isClientComponent(homePagePath);
      
      pages.push({
        slug: 'home',
        title: 'Home', // Always show "Home" for the homepage
        path: '/',
        lastModified: homeSeoConfig?.metadata?.lastModified,
        category: homeSeoConfig?.metadata?.category,
        featured: homeSeoConfig?.metadata?.featured,
        draft: homeSeoConfig?.metadata?.draft,
        isHomePage: true,
        isClientComponent: isHomeClient
      });
    } catch (error) {
      console.log('Home page not found');
    }
    
    // Scan (pages) directory recursively
    const pagesDir = path.join(APP_DIR, '(pages)');
    const scannedPages = await scanDirectoryForPages(pagesDir);
    pages.push(...scannedPages);
    
    // Also scan root app directory for backwards compatibility
    const rootPages = await scanDirectoryForPages(APP_DIR);
    // Filter out duplicates and pages already in (pages)
    const uniqueRootPages = rootPages.filter(rootPage => 
      !pages.some(page => page.slug === rootPage.slug)
    );
    pages.push(...uniqueRootPages);
    
    // Remove duplicates (keeping the first occurrence)
    const uniquePages = pages.filter((page, index, self) =>
      index === self.findIndex(p => p.slug === page.slug)
    );
    
    // Sort by title
    return uniquePages.sort((a, b) => a.title.localeCompare(b.title));
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
    
    // Check if it's a client component
    const isClient = await isClientComponent(pagePath);
    
    // Determine the title based on whether it's a dynamic page without SEO config
    let pageTitle = 'Home';
    if (!isHomePage) {
      if (seoConfig?.seo?.title) {
        pageTitle = seoConfig.seo.title.replace(` - ${globalSeoConfig.siteName}`, '');
      } else if (isClient) {
        // For dynamic pages without SEO config, format slug nicely
        pageTitle = slug
          .split('/')
          .map(part => part
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          )
          .join(' / ');
      } else {
        pageTitle = formatTitle(slug);
      }
    }
    
    const page: Page = {
      slug: isHomePage ? 'home' : slug,
      path: isHomePage ? '/' : `/${slug}`,
      title: pageTitle,
      content,
      ...(seoConfig ? { seoConfig } : {}),
      isHomePage,
      isClientComponent: isClient,
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

// Helper function to recursively scan directories for pages config
async function scanDirectoryForPagesConfig(dir: string, basePath: string = ''): Promise<PageListItem[]> {
  const pages: PageListItem[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip excluded directories and special directories (_, [, ()
      if (entry.isDirectory() && 
          !EXCLUDED_DIRS.includes(entry.name) && 
          !entry.name.startsWith('_') && 
          !entry.name.startsWith('[') && 
          !entry.name.startsWith('(')) {
        
        const entryPath = path.join(dir, entry.name);
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        const pagePath = path.join(entryPath, 'page.tsx');
        
        try {
          // Check if this directory has a page.tsx
          await fs.access(pagePath);
          const seoConfig = await getPageSEOConfig(relativePath);
          const isClient = await isClientComponent(pagePath);
          
          pages.push({
            slug: relativePath,
            title: seoConfig?.seo?.title?.replace(` - ${globalSeoConfig.siteName}`, '') || formatTitle(entry.name),
            path: `/${relativePath}`,
            category: seoConfig?.metadata?.category || 'general',
            featured: seoConfig?.metadata?.featured ?? false,
            draft: seoConfig?.metadata?.draft ?? false,
            isHomePage: false,
            isClientComponent: isClient
          });
        } catch {
          // No page.tsx in this directory, continue scanning
        }
        
        // Recursively scan subdirectories
        const subPages = await scanDirectoryForPagesConfig(entryPath, relativePath);
        pages.push(...subPages);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return pages;
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
      let homePagePath = groupedHomePath;
      try {
        await fs.access(groupedHomePath);
      } catch {
        await fs.access(rootHomePath);
        homePagePath = rootHomePath;
      }
      const homeSeoConfig = await getPageSEOConfig('');
      const isHomeClient = await isClientComponent(homePagePath);
      
      pages.push({
        slug: 'home',
        title: 'Home',
        path: '/',
        category: homeSeoConfig?.metadata?.category || 'general',
        featured: homeSeoConfig?.metadata?.featured ?? true,
        draft: homeSeoConfig?.metadata?.draft ?? false,
        isHomePage: true,
        isClientComponent: isHomeClient
      });
    } catch (error) {
      // Home page not found
    }
    
    // Scan (pages) directory recursively
    const pagesDir = path.join(APP_DIR, '(pages)');
    const scannedPages = await scanDirectoryForPagesConfig(pagesDir);
    pages.push(...scannedPages)
    
    // Write to config file
    const config = { pages };
    await fs.writeFile(PAGES_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error updating pages config:', error);
  }
}

// Save page
export async function savePage(slug: string, content: string | undefined, seoConfig: PageSEOConfig): Promise<void> {
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
    
    // Only write content if provided (not undefined/empty)
    if (content && content.trim()) {
      await fs.writeFile(pagePath, content, 'utf-8');
    }
    
    // Read the actual content for checks (use provided content or read from file)
    let actualContent = content;
    if (!actualContent) {
      try {
        actualContent = await fs.readFile(pagePath, 'utf-8');
      } catch {
        actualContent = '';
      }
    }
    
    // Check if this is a client component (has 'use client' directive at the top)
    const isClientComponent = actualContent.trimStart().startsWith("'use client'") || 
                             actualContent.trimStart().startsWith('"use client"');
    
    // Always write SEO config for admin metadata tracking
    // For dynamic pages, automatically set noindex and exclude from sitemap
    const configToSave = {
      ...seoConfig,
      seo: {
        ...seoConfig.seo,
        noIndex: isClientComponent ? true : (seoConfig.seo?.noIndex || false),
        noFollow: isClientComponent ? true : (seoConfig.seo?.noFollow || false)
      },
      sitemap: {
        ...seoConfig.sitemap,
        exclude: isClientComponent ? true : (seoConfig.sitemap?.exclude || false)
      },
      metadata: {
        ...seoConfig.metadata,
        isClientComponent // Track this in the config
      }
    };
    
    await fs.writeFile(seoPath, JSON.stringify(configToSave, null, 2), 'utf-8');
  } else {
    // First, try to find where the page currently exists
    const slugParts = slug.split('/');
    
    // List of possible locations to check (same as in getPageBySlug)
    const possibleLocations = [
      path.join(APP_DIR, '(pages)', ...slugParts),
      path.join(APP_DIR, '(pages)', '(auth)', ...slugParts),
      path.join(APP_DIR, ...slugParts),
    ];
    
    // Special handling for auth pages
    if (slugParts[0] === 'signup' || slugParts[0] === 'reset-password' || slugParts[0] === 'confirm-email') {
      // Prioritize (auth) route group for auth pages
      possibleLocations.unshift(path.join(APP_DIR, '(pages)', '(auth)', ...slugParts));
    }
    
    // Find the existing page location
    let pageDir = '';
    for (const location of possibleLocations) {
      try {
        await fs.access(path.join(location, 'page.tsx'));
        pageDir = location;
        break;
      } catch {
        // Continue to next location
      }
    }
    
    // If page doesn't exist yet, create it in the appropriate location
    if (!pageDir) {
      // For auth pages, create in (auth) route group
      if (slugParts[0] === 'signup' || slugParts[0] === 'reset-password' || slugParts[0] === 'confirm-email') {
        pageDir = path.join(APP_DIR, '(pages)', '(auth)', ...slugParts);
      } else {
        // Default location for new pages
        pageDir = path.join(APP_DIR, '(pages)', ...slugParts);
      }
    }
    
    const pagePath = path.join(pageDir, 'page.tsx');
    const seoPath = path.join(pageDir, 'seo-config.json');
    
    // Create directory if it doesn't exist
    await fs.mkdir(pageDir, { recursive: true });
    
    // Only write content if provided (not undefined/empty)
    if (content && content.trim()) {
      await fs.writeFile(pagePath, content, 'utf-8');
    }
    
    // Read the actual content for checks (use provided content or read from file)
    let actualContent = content;
    if (!actualContent) {
      try {
        actualContent = await fs.readFile(pagePath, 'utf-8');
      } catch {
        actualContent = '';
      }
    }
    
    // Check if this is a client component (has 'use client' directive at the top)
    const isClientComponent = actualContent.trimStart().startsWith("'use client'") || 
                             actualContent.trimStart().startsWith('"use client"');
    
    // Always write SEO config for admin metadata tracking
    // For dynamic pages, automatically set noindex and exclude from sitemap
    const configToSave = {
      ...seoConfig,
      seo: {
        ...seoConfig.seo,
        noIndex: isClientComponent ? true : (seoConfig.seo?.noIndex || false),
        noFollow: isClientComponent ? true : (seoConfig.seo?.noFollow || false)
      },
      sitemap: {
        ...seoConfig.sitemap,
        exclude: isClientComponent ? true : (seoConfig.sitemap?.exclude || false)
      },
      metadata: {
        ...seoConfig.metadata,
        isClientComponent // Track this in the config
      }
    };
    
    await fs.writeFile(seoPath, JSON.stringify(configToSave, null, 2), 'utf-8');
  }
  
  // Update pages configuration file
  await updatePagesConfig();
}

// Helper function to check if a directory has any subdirectories with page.tsx files
async function hasOtherPagesInParentDir(parentDir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(parentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pagePath = path.join(parentDir, entry.name, 'page.tsx');
        try {
          await fs.access(pagePath);
          return true; // Found another page in this directory
        } catch {
          // Check subdirectories recursively
          const hasPages = await hasOtherPagesInParentDir(path.join(parentDir, entry.name));
          if (hasPages) return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
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
  
  // Find where the page actually exists (similar to savePage logic)
  const slugParts = slug.split('/');
  const possibleLocations = [
    path.join(APP_DIR, '(pages)', ...slugParts),
    path.join(APP_DIR, '(pages)', '(auth)', ...slugParts),
    path.join(APP_DIR, ...slugParts),
  ];
  
  // Special handling for auth pages
  if (slugParts[0] === 'signup' || slugParts[0] === 'reset-password' || slugParts[0] === 'confirm-email') {
    possibleLocations.unshift(path.join(APP_DIR, '(pages)', '(auth)', ...slugParts));
  }
  
  // Find and delete the page from its actual location
  let deleted = false;
  for (const location of possibleLocations) {
    try {
      await fs.access(path.join(location, 'page.tsx'));
      await fs.rm(location, { recursive: true, force: true });
      deleted = true;
      break;
    } catch {
      // Continue to next location
    }
  }
  
  if (!deleted) {
    throw new Error(`Page '${slug}' not found`);
  }
  
  // Clean up empty parent directories if this was a nested page
  if (deleted && slug.includes('/')) {
    const parts = slug.split('/');
    parts.pop(); // Remove the last part (the page we just deleted)
    
    // Work backwards through parent directories
    while (parts.length > 0) {
      const parentPath = path.join(APP_DIR, '(pages)', ...parts);
      
      // Check if this parent directory has other pages
      const hasOtherPages = await hasOtherPagesInParentDir(parentPath);
      
      if (!hasOtherPages) {
        // Directory is empty (no other pages), safe to delete
        try {
          await fs.rmdir(parentPath);
        } catch {
          // Directory might have other non-page files, that's okay
          break;
        }
      } else {
        // Directory has other pages, stop cleaning up
        break;
      }
      
      parts.pop(); // Move up to next parent directory
    }
  }
  
  // Update pages configuration file after successful deletion
  await updatePagesConfig();
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
  const slug = generateSlug(title);
  
  return `// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/generate-static-metadata';

export const metadata = generateStaticMetadata('${slug}');

export default function ${componentName}Page() {
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
      title: `${title} - ${globalSeoConfig.siteName}`,
      description: `${title} page for ${globalSeoConfig.siteName}`,
      keywords: [slug, title.toLowerCase()],
      noIndex: false,
      noFollow: false
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