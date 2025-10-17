const fs = require('fs');
const path = require('path');

// Function to scan app directory for page files
function scanAppDirectory(dir, basePath = '') {
  const routes = new Set();
  
  if (!fs.existsSync(dir)) return routes;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip special Next.js directories
      if (item.startsWith('(') || item.startsWith('[') || item === 'layout' || item === 'loading' || item === 'error' || item === 'not-found') {
        continue;
      }
      
      // Recursively scan subdirectories
      const newBasePath = basePath ? `${basePath}/${item}` : `/${item}`;
      const subRoutes = scanAppDirectory(fullPath, newBasePath);
      subRoutes.forEach(route => routes.add(route));
    } else if (item === 'page.tsx' || item === 'page.ts') {
      // Found a page file, add the route
      routes.add(basePath || '/');
    }
  }
  
  return routes;
}

// Function to scan blog content directory
function scanBlogDirectory() {
  const blogRoutes = new Set();
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  
  if (!fs.existsSync(blogContentDir)) return blogRoutes;
  
  // Add main blog route
  blogRoutes.add('/blog');
  
  // Scan for categories
  const categoriesDir = path.join(blogContentDir, 'categories');
  if (fs.existsSync(categoriesDir)) {
    const categories = fs.readdirSync(categoriesDir);
    
    for (const category of categories) {
      const categoryPath = path.join(categoriesDir, category);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        // Add category route
        blogRoutes.add(`/blog/${category}`);
        
        // Scan for posts in this category (excluding config files)
        const posts = fs.readdirSync(categoryPath);
        for (const post of posts) {
          if (post.endsWith('.json') && !post.startsWith('.')) {
            const slug = post.replace('.json', '');
            blogRoutes.add(`/blog/${category}/${slug}`);
          }
        }
      }
    }
  }
  
  // Scan for root-level blog posts
  const rootFiles = fs.readdirSync(blogContentDir);
  for (const file of rootFiles) {
    if (file.endsWith('.json') && file !== 'categories.json') {
      const slug = file.replace('.json', '');
      blogRoutes.add(`/blog/${slug}`);
    }
  }
  
  return blogRoutes;
}

// Generate routes (DEPRECATED - Middleware no longer uses route whitelists)
function generateRoutes() {
  // This function is kept for backwards compatibility but middleware
  // no longer requires route generation. Next.js handles routing naturally.

  console.log('⏭️  Skipping route generation (middleware now uses dynamic routing)');
  console.log('✅ Middleware allows Next.js to handle all routing naturally');
}

// Run if called directly
if (require.main === module) {
  generateRoutes();
}

module.exports = { generateRoutes }; 