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

// Generate routes
function generateRoutes() {
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  // Get static routes
  const staticRoutes = scanAppDirectory(appDir);
  
  // Add known static routes
  staticRoutes.add('/');
  staticRoutes.add('/blog');
  staticRoutes.add('/privacy');
  staticRoutes.add('/terms-of-service');
  staticRoutes.add('/robots.txt');
  staticRoutes.add('/sitemap.xml');
  
  // Get blog routes
  const blogRoutes = scanBlogDirectory();
  
  // Read the middleware template
  const templatePath = path.join(__dirname, 'middleware-template.txt');
  let middlewareContent;
  
  if (fs.existsSync(templatePath)) {
    // Use the template if it exists
    middlewareContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with actual routes
    const routesPlaceholder = Array.from(staticRoutes).map(route => `  '${route}'`).join(',\n');
    const blogRoutesPlaceholder = Array.from(blogRoutes).map(route => `  '${route}'`).join(',\n');
    
    middlewareContent = middlewareContent
      .replace('  // ROUTES_PLACEHOLDER', routesPlaceholder)
      .replace('  // BLOG_ROUTES_PLACEHOLDER', blogRoutesPlaceholder);
  } else {
    // Fallback to inline template with authentication
    middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthEdge } from '@/lib/auth-edge';

// Valid routes generated at build time
const validRoutes = new Set([
${Array.from(staticRoutes).map(route => `  '${route}'`).join(',\n')}
]);

// Valid blog routes generated at build time
const validBlogRoutes = new Set([
${Array.from(blogRoutes).map(route => `  '${route}'`).join(',\n')}
]);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Handle sitemap redirects BEFORE allowing static files
  const sitemapRedirects: { [key: string]: string } = {
    '/sitemap.xml': '/sitemap',
    '/sitemap-pages.xml': '/sitemap/pages',
    '/sitemap-blog-posts.xml': '/sitemap/blog-posts',
    '/sitemap-blog-categories.xml': '/sitemap/blog-categories',
  };

  // Check for sitemap redirects first
  if (sitemapRedirects[path]) {
    return NextResponse.redirect(new URL(sitemapRedirects[path], request.url));
  }

  // Allow static files and API routes (except admin API routes)
  if (
    path.startsWith('/_next') ||
    (path.startsWith('/api') && !path.startsWith('/api/admin')) ||
    path.includes('.') || // Files with extensions
    path.startsWith('/favicon') ||
    path.startsWith('/images') ||
    path.startsWith('/logos')
  ) {
    return NextResponse.next();
  }

  // Check authentication for admin routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // Skip auth check if auth is disabled (development only)
    if (process.env.DISABLE_ADMIN_AUTH === 'true') {
      return NextResponse.next();
    }

    // Allow access to login page and login API without auth
    if (path === '/admin/login' || path === '/api/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      // Redirect to login page for admin UI routes
      if (path.startsWith('/admin') && !path.startsWith('/api/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      // Return 401 for API routes
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const isValid = await verifyAuthEdge(token);

    if (!isValid) {
      // Clear invalid token
      const response = path.startsWith('/admin') && !path.startsWith('/api/admin')
        ? NextResponse.redirect(new URL('/admin/login', request.url))
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      response.cookies.delete('admin-token');
      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // Check if it's a valid static route
  if (validRoutes.has(path) || validRoutes.has(path.replace(/\\/\\$/, ''))) {
    return NextResponse.next();
  }

  // Check if it's a valid blog route
  if (validBlogRoutes.has(path) || validBlogRoutes.has(path.replace(/\\/\\$/, ''))) {
    return NextResponse.next();
  }

  // Smart redirect logic for invalid paths
  
  // If path starts with /blog but doesn't match valid blog patterns
  if (path.startsWith('/blog')) {
    // Let the 404 page handle blog redirects for consistent UX
    return NextResponse.next();
  }

  // For common misspellings or variations
  const redirectMap: { [key: string]: string } = {
    '/term': '/terms-of-service',
    '/tos': '/terms-of-service',
    '/terms': '/terms-of-service',
    '/policy': '/privacy',
    '/privacy-policy': '/privacy',
    '/about': '/',
    '/contact': '/',
    '/support': '/',
  };

  // Check if we have a redirect mapping
  const normalizedPath = path.toLowerCase().replace(/\\/\\$/, '');
  if (redirectMap[normalizedPath]) {
    return NextResponse.redirect(new URL(redirectMap[normalizedPath], request.url));
  }

  // Check for partial matches (e.g., /priv -> /privacy)
  for (const [partial, full] of Object.entries(redirectMap)) {
    if (normalizedPath.startsWith(partial.slice(0, 4))) {
      return NextResponse.redirect(new URL(full, request.url));
    }
  }

  // Let Next.js handle it (will trigger not-found.tsx)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
`;
  }

  // Write the generated middleware
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  fs.writeFileSync(middlewarePath, middlewareContent);
  
  console.log('✅ Generated middleware with routes:');
  console.log('Static routes:', Array.from(staticRoutes).length);
  console.log('Blog routes:', Array.from(blogRoutes).length);
}

// Run if called directly
if (require.main === module) {
  generateRoutes();
}

module.exports = { generateRoutes }; 