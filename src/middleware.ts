import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Valid routes generated at build time
const validRoutes = new Set([
  '/blog',
  '/',
  '/privacy',
  '/terms-of-service',
  '/robots.txt',
  '/sitemap.xml'
]);

// Valid blog routes generated at build time
const validBlogRoutes = new Set([
  '/blog',
  '/blog/guides',
  '/blog/guides/blog-post-example',
  '/blog/guides/seo-config',
  '/blog/blog-post-no-category-example'
]);

export function middleware(request: NextRequest) {
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

  // Allow static files and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') || // Files with extensions
    path.startsWith('/favicon') ||
    path.startsWith('/images') ||
    path.startsWith('/logos')
  ) {
    return NextResponse.next();
  }

  // Check if it's a valid static route
  if (validRoutes.has(path) || validRoutes.has(path.replace(/\/\$/, ''))) {
    return NextResponse.next();
  }

  // Check if it's a valid blog route
  if (validBlogRoutes.has(path) || validBlogRoutes.has(path.replace(/\/\$/, ''))) {
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
  const normalizedPath = path.toLowerCase().replace(/\/\$/, '');
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
