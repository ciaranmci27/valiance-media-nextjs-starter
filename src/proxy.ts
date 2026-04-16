import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_AUTH_PROVIDER, DISABLE_ADMIN_AUTH, isProduction } from '@/lib/env';
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

// In-memory cache for redirects (5 minute TTL)
let redirectsCache: Redirect[] = [];
let redirectsCacheTime = 0;
let redirectsCacheInitialized = false;
const CACHE_DURATION = 300000; // 5 minutes

async function getRedirects(request: NextRequest): Promise<Redirect[]> {
  const now = Date.now();

  // Return cached redirects if still valid (even if empty array)
  if (redirectsCacheInitialized && (now - redirectsCacheTime) < CACHE_DURATION) {
    return redirectsCache;
  }

  try {
    // Fetch from static CDN asset (zero compute, no serverless function)
    const cdnUrl = new URL('/redirects.json', request.url);
    const response = await fetch(cdnUrl.toString());

    if (response.ok) {
      const data = await response.json();
      redirectsCache = Array.isArray(data?.redirects) ? data.redirects : [];
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
  return ADMIN_AUTH_PROVIDER === 'supabase';
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============================================================================
  // Early Exit: Redirects JSON (Prevents Circular Dependency)
  // ============================================================================
  // MUST be checked BEFORE getRedirects() to prevent infinite loop
  // getRedirects() fetches /redirects.json, which would trigger proxy again
  if (path === '/redirects.json') {
    return NextResponse.next();
  }

  // ============================================================================
  // Admin-Managed SEO Redirects (Highest Priority - Runtime)
  // ============================================================================
  // Load redirects from /redirects.json (static CDN asset)
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
  // Blog markdown alternates: /blog/{category}/{slug}.md -> /api/blog-md/...
  // ============================================================================
  // The literal-suffix segment folder pattern (`[slug].md`) silently shadows
  // the human-readable `[slug]/page.tsx` route, so we rewrite to a dedicated
  // API route instead. The public URL stays `/blog/{cat}/{slug}.md` for the
  // llms.txt index and AI crawlers.
  const blogMdMatch = path.match(/^\/blog\/([^/]+)\/([^/]+)\.md$/);
  if (blogMdMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/blog-md/${blogMdMatch[1]}/${blogMdMatch[2]}`;
    return NextResponse.rewrite(url);
  }

  // ============================================================================
  // Page markdown alternates: /{path}.md -> /api/page-md/{path}
  // ============================================================================
  // Mirrors the blog pattern for every other server-rendered page so AI
  // crawlers can fetch a clean markdown version of any page. The handler
  // gates on the admin AI Search master toggle and the page's own
  // llms.exclude / noIndex flags. The /index.md special case maps the home
  // page (a `/.md` URL would be malformed). The blog rewrite above already
  // claimed `/blog/...md` so we deliberately do not re-handle it here.
  if (path !== '/llms.txt' && path.endsWith('.md') && !path.startsWith('/_next/')) {
    const stripped = path.slice(0, -3); // remove ".md"
    // Reject paths with empty segments or that look like assets (no slash
    // segments inside the basename other than the path).
    const url = request.nextUrl.clone();
    if (stripped === '/index') {
      url.pathname = '/api/page-md';
    } else if (stripped !== '' && stripped !== '/') {
      url.pathname = `/api/page-md${stripped}`;
    } else {
      // /.md is malformed; let it fall through to a 404.
      return NextResponse.next();
    }
    return NextResponse.rewrite(url);
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
    // Skip auth check if auth is disabled (development only, guarded)
    if (DISABLE_ADMIN_AUTH && !isProduction) {
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
