import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthProxy } from '@/lib/admin/auth-provider-edge';

/**
 * Minimal Proxy - Handles only essential requirements
 *
 * This proxy intentionally does NOT validate routes or assume which
 * pages exist. It trusts Next.js routing to handle page resolution and 404s.
 *
 * Only handles:
 * 1. Admin-managed SEO redirects (runtime, instant updates)
 * 2. Admin authentication (security requirement)
 * 3. Sitemap redirects (SEO infrastructure)
 * 4. Static file pass-through (Next.js requirement)
 * 5. Supabase token refresh (when provider is supabase)
 */

interface Redirect {
  from: string;
  to: string;
  permanent: boolean;
}

// In-memory cache for redirects (1 minute TTL)
let redirectsCache: Redirect[] = [];
let redirectsCacheTime = 0;
let redirectsCacheInitialized = false;
const CACHE_DURATION = 60000; // 1 minute

async function getRedirects(request: NextRequest): Promise<Redirect[]> {
  const now = Date.now();

  // Return cached redirects if still valid (even if empty array)
  if (redirectsCacheInitialized && (now - redirectsCacheTime) < CACHE_DURATION) {
    return redirectsCache;
  }

  try {
    // Fetch from API endpoint (excluded from proxy, no circular dependency)
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
      redirectsCacheInitialized = true;
      return redirectsCache;
    }
  } catch (error) {
    // Fail gracefully - continue without redirects
    console.error('Error fetching redirects in proxy:', error);
  }

  return [];
}

function isSupabaseProvider(): boolean {
  return process.env.ADMIN_AUTH_PROVIDER?.toLowerCase() === 'supabase';
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================================================
  // Early Exit: Redirects API (Prevents Circular Dependency)
  // ============================================================================
  // MUST be checked BEFORE getRedirects() to prevent infinite loop
  // getRedirects() fetches /api/redirects/list, which would trigger proxy again
  if (path === '/api/redirects/list') {
    return NextResponse.next();
  }

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
  // Supabase Token Refresh (all routes when provider is supabase)
  // ============================================================================
  // Refreshes expired JWTs on any page load so sessions persist across tab close.
  // Only runs when Supabase cookies are present (sb- prefix).
  let supabaseUser: import('@supabase/supabase-js').User | null = null;
  let supabaseResponse: NextResponse | undefined;

  if (isSupabaseProvider()) {
    const hasSupabaseCookies = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-'));

    if (hasSupabaseCookies) {
      try {
        const { createClient } = await import('@/lib/supabase/middleware');
        const { supabase, response } = await createClient(request);
        const { data } = await supabase.auth.getUser();
        supabaseUser = data.user;
        supabaseResponse = response;
      } catch {
        // Supabase not configured or network error — continue without refresh
      }
    }
  }

  // ============================================================================
  // Admin Authentication (Security Requirement)
  // ============================================================================
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // Skip auth check if auth is disabled (development only — guarded)
    if (
      process.env.DISABLE_ADMIN_AUTH === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      return supabaseResponse ?? NextResponse.next();
    }

    // Allow access to login page and login API without auth
    if (path === '/admin/login' || path === '/api/admin/login') {
      return supabaseResponse ?? NextResponse.next();
    }

    // Allow access to logout API without auth (needs to work for logout)
    if (path === '/api/admin/auth/logout') {
      return supabaseResponse ?? NextResponse.next();
    }

    const authResult = await verifyAuthProxy(request, {
      cachedUser: supabaseUser,
      cachedResponse: supabaseResponse,
    });

    if (!authResult.authenticated) {
      return authResult.response!;
    }

    // Authenticated — return the auth result's response (carries Supabase cookies)
    // or fall through to NextResponse.next() for simple auth
    return authResult.response ?? NextResponse.next();
  }

  // ============================================================================
  // Default: Let Next.js Handle Routing
  // ============================================================================
  // All other routes pass through to Next.js for natural routing:
  // - Valid routes → Render page
  // - Invalid routes → Show 404 (not-found.tsx)
  // - Dynamic routes → Next.js matches them
  // For Supabase: return the response with refreshed cookies
  return supabaseResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * Note: /api/admin routes ARE matched for authentication
     * Other /api routes are excluded by the proxy logic itself
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
