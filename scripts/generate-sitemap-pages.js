#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all page.tsx/jsx files
function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.next', 'dist', 'build', '_components'].includes(entry.name)) {
        findPageFiles(fullPath, files);
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.ts' || entry.name === 'page.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract route from file path
function getRouteFromPath(filePath) {
  const appDir = path.join(process.cwd(), 'src', 'app');
  let relativePath = path.relative(appDir, path.dirname(filePath));
  
  // Convert Windows paths to Unix
  relativePath = relativePath.replace(/\\/g, '/');
  
  // Remove route groups like (pages), (auth), etc.
  relativePath = relativePath.replace(/\([^)]+\)/g, '');
  
  // Clean up multiple slashes and trim
  relativePath = relativePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  
  // Special case for home page
  if (relativePath === '' || relativePath === 'home') {
    return '';
  }
  
  return '/' + relativePath;
}

// Function to check if route is dynamic
function isDynamicRoute(route) {
  return route.includes('[') && route.includes(']');
}

// Function to check if file has 'use client' directive
function isClientComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLines = content.substring(0, 100).trimStart();
    return firstLines.startsWith("'use client'") || 
           firstLines.startsWith('"use client"');
  } catch {
    return false;
  }
}

// Function to get SEO config for a page
function getSeoConfig(filePath) {
  const seoConfigPath = path.join(path.dirname(filePath), 'seo-config.json');
  
  if (fs.existsSync(seoConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
      return config;
    } catch (error) {
      console.warn(`Error reading SEO config at ${seoConfigPath}:`, error.message);
    }
  }
  
  return null;
}

// Main function to generate sitemap routes
async function generateSitemapRoutes() {
  const appDir = path.join(process.cwd(), 'src', 'app');
  const pageFiles = findPageFiles(appDir);
  
  console.log(`Found ${pageFiles.length} page files`);
  
  const staticRoutes = [];
  const excludedRoutes = [];
  const dynamicRoutes = [];
  
  for (const filePath of pageFiles) {
    const route = getRouteFromPath(filePath);
    
    // Skip dynamic routes (with [param])
    if (isDynamicRoute(route)) {
      dynamicRoutes.push(route);
      continue;
    }
    
    // Skip API routes
    if (route.includes('/api/')) {
      excludedRoutes.push({ route, reason: 'API route' });
      continue;
    }
    
    // Skip admin routes (unless explicitly included)
    if (route.includes('/admin')) {
      const seoConfig = getSeoConfig(filePath);
      if (!seoConfig?.sitemap?.include) {
        excludedRoutes.push({ route, reason: 'Admin route' });
        continue;
      }
    }
    
    // Check SEO config
    const seoConfig = getSeoConfig(filePath);
    
    // Skip if explicitly excluded in SEO config
    if (seoConfig?.sitemap?.exclude === true) {
      excludedRoutes.push({ route, reason: 'Excluded in SEO config' });
      continue;
    }
    
    // Skip if noIndex is true
    if (seoConfig?.seo?.noIndex === true) {
      excludedRoutes.push({ route, reason: 'noIndex in SEO config' });
      continue;
    }
    
    // Determine priority and change frequency
    let priority = 0.5;
    let changeFrequency = 'monthly';
    
    // Set defaults based on route patterns
    if (route === '') {
      priority = 1.0;
      changeFrequency = 'daily';
    } else if (route.startsWith('/quiz')) {
      priority = 0.8;
      changeFrequency = 'weekly';
    } else if (route === '/privacy' || route === '/terms-of-service') {
      priority = 0.7;
      changeFrequency = 'monthly';
    } else if (route.includes('auth') || route.includes('signup') || route.includes('login')) {
      priority = 0.4;
      changeFrequency = 'yearly';
    }
    
    // Override with SEO config if available
    if (seoConfig?.sitemap?.priority !== undefined) {
      priority = seoConfig.sitemap.priority;
    }
    if (seoConfig?.sitemap?.changeFrequency) {
      changeFrequency = seoConfig.sitemap.changeFrequency;
    }
    
    staticRoutes.push({
      route,
      priority,
      changeFrequency,
      hasConfig: !!seoConfig,
      isClientComponent: isClientComponent(filePath)
    });
  }
  
  // Sort routes by priority
  staticRoutes.sort((a, b) => b.priority - a.priority);
  
  // Generate the output file
  const outputPath = path.join(process.cwd(), 'src', 'seo', 'generated-sitemap-routes.json');
  const output = {
    generated: new Date().toISOString(),
    staticRoutes,
    excludedRoutes,
    dynamicRoutes,
    stats: {
      total: pageFiles.length,
      included: staticRoutes.length,
      excluded: excludedRoutes.length,
      dynamic: dynamicRoutes.length
    }
  };
  
  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`
Sitemap Generation Complete:
- Static routes included: ${staticRoutes.length}
- Routes excluded: ${excludedRoutes.length}
- Dynamic routes skipped: ${dynamicRoutes.length}
- Output saved to: ${outputPath}
`);
  
  // Show included routes
  console.log('Included routes:');
  staticRoutes.forEach(r => {
    console.log(`  ${r.route || '/'} - priority: ${r.priority}, freq: ${r.changeFrequency}${r.isClientComponent ? ' (client)' : ''}`);
  });
  
  if (excludedRoutes.length > 0) {
    console.log('\nExcluded routes:');
    excludedRoutes.forEach(r => {
      console.log(`  ${r.route} - ${r.reason}`);
    });
  }
}

// Run the script
generateSitemapRoutes().catch(console.error);