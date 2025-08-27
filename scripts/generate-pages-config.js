#!/usr/bin/env node

/**
 * Generate pages configuration file for production
 * This script scans the app directory for pages and creates a static config file
 * that can be used in production environments where filesystem access is restricted
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'pages-config.json');
const EXCLUDED_DIRS = ['admin', 'api', 'blog', '_components', '_utils'];

// Helper function to format title from slug
function formatTitle(slug) {
  return slug
    .split(/[-/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to check if a page is a client component
function isClientComponent(pagePath) {
  try {
    // Try .tsx first, then .js
    let content = '';
    const tsxPath = pagePath.endsWith('.tsx') || pagePath.endsWith('.js') 
      ? pagePath 
      : fs.existsSync(path.join(pagePath, 'page.tsx'))
        ? path.join(pagePath, 'page.tsx')
        : path.join(pagePath, 'page.js');
    
    if (fs.existsSync(tsxPath)) {
      content = fs.readFileSync(tsxPath, 'utf-8');
    } else {
      return false;
    }
    
    // Check for explicit 'use client' directive
    if (content.trimStart().startsWith("'use client'") || 
        content.trimStart().startsWith('"use client"')) {
      return true;
    }
    
    // Check for React hooks
    const hasHooks = /\b(useState|useEffect|useCallback|useMemo|useReducer|useContext|useRef|useLayoutEffect|useImperativeHandle|useDebugValue|useDeferredValue|useTransition|useId|useSearchParams|useRouter|usePathname|useParams)\s*\(/g.test(content);
    if (hasHooks) {
      return true;
    }
    
    // Check for event handlers
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
    
    return false;
  } catch (error) {
    return false;
  }
}

// Helper function to read SEO config
function getSEOConfig(pagePath) {
  try {
    const seoConfigPath = path.join(pagePath, 'seo-config.json');
    if (fs.existsSync(seoConfigPath)) {
      const content = fs.readFileSync(seoConfigPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // SEO config not found or invalid
  }
  return null;
}

// Recursively scan directory for pages
function scanDirectoryForPages(dir, basePath = '') {
  const pages = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && 
          !EXCLUDED_DIRS.includes(entry.name) && 
          !entry.name.startsWith('_') && 
          !entry.name.startsWith('[') && 
          !entry.name.startsWith('(')) {
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        const pageTsxPath = path.join(fullPath, 'page.tsx');
        const pageJsPath = path.join(fullPath, 'page.js');
        
        // Check if this directory has a page file
        if (fs.existsSync(pageTsxPath) || fs.existsSync(pageJsPath)) {
          const seoConfig = getSEOConfig(fullPath);
          const isClient = isClientComponent(fullPath);
          
          pages.push({
            slug: relativePath,
            title: seoConfig?.seo?.title || formatTitle(entry.name),
            path: `/${relativePath}`,
            category: seoConfig?.metadata?.category || 'general',
            featured: seoConfig?.metadata?.featured || false,
            draft: seoConfig?.metadata?.draft || false,
            lastModified: seoConfig?.metadata?.lastModified,
            isHomePage: false,
            isClientComponent: isClient
          });
        }
        
        // Recursively scan subdirectories
        const subPages = scanDirectoryForPages(fullPath, relativePath);
        pages.push(...subPages);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return pages;
}

// Main function
function generatePagesConfig() {
  console.log('🔍 Scanning for pages...');
  
  const pages = [];
  
  // Check for home page
  const groupedHomePath = path.join(APP_DIR, '(pages)', '(home)');
  const rootHomePath = APP_DIR;
  let homePageFound = false;
  
  // Check grouped home first
  if (fs.existsSync(path.join(groupedHomePath, 'page.tsx')) || 
      fs.existsSync(path.join(groupedHomePath, 'page.js'))) {
    const seoConfig = getSEOConfig(groupedHomePath);
    const isClient = isClientComponent(groupedHomePath);
    pages.push({
      slug: 'home',
      title: 'Home',
      path: '/',
      category: seoConfig?.metadata?.category || 'homepage',
      featured: seoConfig?.metadata?.featured ?? true,
      draft: seoConfig?.metadata?.draft ?? false,
      lastModified: seoConfig?.metadata?.lastModified,
      isHomePage: true,
      isClientComponent: isClient
    });
    homePageFound = true;
    console.log('  ✓ Found home page (grouped)');
  } 
  // Check root home
  else if (fs.existsSync(path.join(rootHomePath, 'page.tsx')) || 
           fs.existsSync(path.join(rootHomePath, 'page.js'))) {
    const seoConfig = getSEOConfig(rootHomePath);
    const isClient = isClientComponent(rootHomePath);
    pages.push({
      slug: 'home',
      title: 'Home',
      path: '/',
      category: seoConfig?.metadata?.category || 'homepage',
      featured: seoConfig?.metadata?.featured ?? true,
      draft: seoConfig?.metadata?.draft ?? false,
      lastModified: seoConfig?.metadata?.lastModified,
      isHomePage: true,
      isClientComponent: isClient
    });
    homePageFound = true;
    console.log('  ✓ Found home page (root)');
  }
  
  // Scan (pages) directory
  const pagesDir = path.join(APP_DIR, '(pages)');
  if (fs.existsSync(pagesDir)) {
    console.log('  📁 Scanning (pages) directory...');
    const pagesInDir = scanDirectoryForPages(pagesDir);
    pages.push(...pagesInDir);
    console.log(`  ✓ Found ${pagesInDir.length} pages in (pages) directory`);
  }
  
  // Also scan root app directory for backwards compatibility
  console.log('  📁 Scanning root app directory...');
  const rootEntries = fs.readdirSync(APP_DIR, { withFileTypes: true });
  let rootPagesCount = 0;
  
  for (const entry of rootEntries) {
    if (entry.isDirectory() && 
        !EXCLUDED_DIRS.includes(entry.name) && 
        !entry.name.startsWith('_') && 
        !entry.name.startsWith('[') && 
        !entry.name.startsWith('(')) {
      
      const pagePath = path.join(APP_DIR, entry.name);
      const hasTsxPage = fs.existsSync(path.join(pagePath, 'page.tsx'));
      const hasJsPage = fs.existsSync(path.join(pagePath, 'page.js'));
      
      if ((hasTsxPage || hasJsPage) && !pages.find(p => p.slug === entry.name)) {
        const seoConfig = getSEOConfig(pagePath);
        const isClient = isClientComponent(pagePath);
        pages.push({
          slug: entry.name,
          title: seoConfig?.seo?.title || formatTitle(entry.name),
          path: `/${entry.name}`,
          category: seoConfig?.metadata?.category || 'general',
          featured: seoConfig?.metadata?.featured || false,
          draft: seoConfig?.metadata?.draft || false,
          lastModified: seoConfig?.metadata?.lastModified,
          isHomePage: false,
          isClientComponent: isClient
        });
        rootPagesCount++;
      }
    }
  }
  
  if (rootPagesCount > 0) {
    console.log(`  ✓ Found ${rootPagesCount} additional pages in root directory`);
  }
  
  // Sort pages by title
  pages.sort((a, b) => {
    // Home page always comes first
    if (a.isHomePage) return -1;
    if (b.isHomePage) return 1;
    return a.title.localeCompare(b.title);
  });
  
  // Write to file
  const config = { pages };
  
  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  
  console.log(`\n✅ Generated pages configuration with ${pages.length} pages`);
  console.log(`   Output: ${OUTPUT_FILE}`);
  
  // List all pages for verification
  console.log('\n📄 Pages found:');
  pages.forEach(page => {
    console.log(`   - ${page.path} (${page.title})`);
  });
}

// Run the script
try {
  generatePagesConfig();
  process.exit(0);
} catch (error) {
  console.error('❌ Error generating pages config:', error);
  process.exit(1);
}