#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all page.tsx files
function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!['node_modules', '.next', 'dist', 'build', 'api', 'admin', '_components'].includes(entry.name)) {
        findPageFiles(fullPath, files);
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract slug from file path
function getSlugFromPath(filePath) {
  // Convert path to slug format
  const appDir = path.join(process.cwd(), 'src', 'app');
  let relativePath = path.relative(appDir, path.dirname(filePath));
  
  // Remove route groups like (pages), (auth), etc.
  relativePath = relativePath.replace(/\([^)]+\)/g, '').replace(/\\/g, '/');
  
  // Clean up multiple slashes and trim
  relativePath = relativePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  
  // Special case for home page
  if (relativePath === '' || relativePath === '(home)') {
    return '';
  }
  
  return relativePath;
}

// Function to check if a file has metadata export
function hasMetadataExport(content) {
  return content.includes('export const metadata') || 
         content.includes('export async function generateMetadata');
}

// Function to check if file has 'use client' directive
function isClientComponent(content) {
  const firstLine = content.trimStart();
  return firstLine.startsWith("'use client'") || 
         firstLine.startsWith('"use client"');
}

// Main function
async function ensureMetadata() {
  const appDir = path.join(process.cwd(), 'src', 'app');
  const pageFiles = findPageFiles(appDir);
  
  console.log(`Found ${pageFiles.length} page files`);
  
  let updatedCount = 0;
  let skippedClientCount = 0;
  let alreadyHasMetadataCount = 0;
  
  for (const filePath of pageFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip client components
    if (isClientComponent(content)) {
      console.log(`⏭️  Skipping client component: ${filePath}`);
      skippedClientCount++;
      continue;
    }
    
    // Check if already has metadata
    if (hasMetadataExport(content)) {
      console.log(`✅ Already has metadata: ${filePath}`);
      alreadyHasMetadataCount++;
      continue;
    }
    
    // Get slug for this page
    const slug = getSlugFromPath(filePath);
    
    // Check if SEO config exists
    const seoConfigPath = path.join(path.dirname(filePath), 'seo-config.json');
    const hasSeoConfig = fs.existsSync(seoConfigPath);
    
    if (!hasSeoConfig) {
      console.log(`⚠️  No SEO config for: ${filePath} (slug: ${slug})`);
      continue;
    }
    
    // Add metadata export
    const metadataImport = `// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/generate-static-metadata';

export const metadata = generateStaticMetadata('${slug}');

`;
    
    // Find the right place to insert (after existing imports if any)
    let updatedContent;
    const importMatch = content.match(/^(import[\s\S]*?(?:\n\n|$))/);
    
    if (importMatch) {
      // Insert after imports
      updatedContent = content.replace(importMatch[0], importMatch[0] + metadataImport);
    } else {
      // Insert at the beginning
      updatedContent = metadataImport + content;
    }
    
    // Write updated content
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`🔧 Added metadata to: ${filePath} (slug: ${slug})`);
    updatedCount++;
  }
  
  console.log(`
Summary:
- Total pages found: ${pageFiles.length}
- Client components skipped: ${skippedClientCount}
- Already had metadata: ${alreadyHasMetadataCount}
- Updated with metadata: ${updatedCount}
`);
}

// Run the script
ensureMetadata().catch(console.error);