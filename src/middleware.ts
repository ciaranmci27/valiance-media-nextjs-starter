import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthEdge } from '@/lib/admin/auth-edge';

/**
 * Minimal Middleware - Handles only essential requirements
 *
 * This middleware intentionally does NOT validate routes or assume which
 * pages exist. It trusts Next.js routing to handle page resolution and 404s.
 *
 * Only handles:
 * 1. Admin-managed SEO redirects (runtime, instant updates)
 * 2. Admin authentication (security requirement)
 * 3. Sitemap redirects (SEO infrastructure)
 * 4. Static file pass-through (Next.js requirement)
 */

interface Redirect {
  from: string;
  to: string;
  permanent: boolean;
}

// In-memory cache for redirects (1 minute TTL)
let redirectsCache: Redirect[] = [];
let redirectsCacheTime = 0;
const CACHE_DURATION = 60000; // 1 minute

async function getRedirects(request: NextRequest): Promise<Redirect[]> {
  const now = Date.now();

  // Return cached redirects if still valid
  if (redirectsCache.length > 0 && (now - redirectsCacheTime) < CACHE_DURATION) {
    return redirectsCache;
  }

  try {
    // Fetch from API endpoint (excluded from middleware, no circular dependency)
    const apiUrl = new URL('/api/redirects/list', request.url);
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const data = await response.json();
      redirectsCache = data.redirects || [];
      redirectsCacheTime = now;
      return redirectsCache;
    }
  } catch (error) {
    // Fail gracefully - continue without redirects
    console.error('Error fetching redirects in middleware:', error);
  }

  return [];
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================================================
  // Admin-Managed SEO Redirects (Highest Priority - Runtime)
  // ============================================================================
  // Load redirects from /api/redirects/list endpoint
  // This allows instant updates without server restart
  const redirects = await getRedirects(request);
  const redirect = redirects.find(r => r.from === path);

  if (redirect) {
    const status = redirect.permanent ? 308 : 307;
    return NextResponse.redirect(new URL(redirect.to, request.url), status);
  }

  // ============================================================================
  // Sitemap Redirects (SEO Infrastructure)
  // ============================================================================
  // Redirect legacy sitemap URLs to Next.js route handlers
  const sitemapRedirects: { [key: string]: string } = {
    '/sitemap.xml': '/sitemap',
    '/sitemap-pages.xml': '/sitemap/pages',
    '/sitemap-blog-posts.xml': '/sitemap/blog-posts',
    '/sitemap-blog-categories.xml': '/sitemap/blog-categories',
  };

  if (sitemapRedirects[path]) {
    return NextResponse.redirect(new URL(sitemapRedirects[path], request.url));
  }

  // ============================================================================
  // Static Files & Non-Admin API Routes (Pass Through)
  // ============================================================================
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

  // ============================================================================
  // Admin Authentication (Security Requirement)
  // ============================================================================
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

  // ============================================================================
  // Default: Let Next.js Handle Routing
  // ============================================================================
  // All other routes pass through to Next.js for natural routing:
  // - Valid routes → Render page
  // - Invalid routes → Show 404 (not-found.tsx)
  // - Dynamic routes → Next.js matches them
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
