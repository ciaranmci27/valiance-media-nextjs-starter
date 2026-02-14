import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { verifyAuthEdge } from './auth-edge';
import { getAuthProvider } from './auth-provider';

interface VerifyOptions {
  /** Pre-fetched Supabase user from middleware client (avoids double getUser call) */
  cachedUser?: User | null;
  /** Response carrying refreshed Supabase cookies */
  cachedResponse?: NextResponse;
  /** Supabase middleware client (needed if cachedUser is not provided) */
  supabase?: SupabaseClient;
}

interface ProxyAuthResult {
  authenticated: boolean;
  /** Response to return from proxy (carries cookies for Supabase, or redirect/401 for failures) */
  response?: NextResponse;
}

/**
 * Edge-compatible auth verification for the proxy.
 *
 * - Simple mode: reads admin-token cookie, verifies HMAC
 * - Supabase mode: uses pre-fetched user, checks ADMIN_ALLOWED_EMAILS
 */
export async function verifyAuthProxy(
  request: NextRequest,
  options: VerifyOptions = {}
): Promise<ProxyAuthResult> {
  const provider = getAuthProvider();

  if (provider === 'supabase') {
    return verifySupabaseProxy(request, options);
  }

  return verifySimpleProxy(request);
}

async function verifySimpleProxy(request: NextRequest): Promise<ProxyAuthResult> {
  const token = request.cookies.get('admin-token')?.value;
  const path = request.nextUrl.pathname;

  if (!token) {
    return {
      authenticated: false,
      response: buildUnauthResponse(request, path),
    };
  }

  const isValid = await verifyAuthEdge(token);

  if (!isValid) {
    const response = buildUnauthResponse(request, path);
    response.cookies.delete('admin-token');
    return { authenticated: false, response };
  }

  return { authenticated: true };
}

async function verifySupabaseProxy(
  request: NextRequest,
  options: VerifyOptions
): Promise<ProxyAuthResult> {
  const path = request.nextUrl.pathname;

  // Get user — prefer cached from earlier middleware call
  let user = options.cachedUser ?? null;

  if (!user && options.supabase) {
    const { data } = await options.supabase.auth.getUser();
    user = data.user;
  }

  if (!user) {
    return {
      authenticated: false,
      response: buildUnauthResponse(request, path),
    };
  }

  // Check ADMIN_ALLOWED_EMAILS if set
  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS;
  if (allowedEmails) {
    const emailList = allowedEmails.split(',').map((e) => e.trim().toLowerCase());
    if (!emailList.includes(user.email?.toLowerCase() ?? '')) {
      return {
        authenticated: false,
        response: buildUnauthResponse(request, path),
      };
    }
  }

  // Authenticated — return the cached response (carries refreshed cookies)
  return {
    authenticated: true,
    response: options.cachedResponse,
  };
}

function buildUnauthResponse(request: NextRequest, path: string): NextResponse {
  if (path.startsWith('/admin') && !path.startsWith('/api/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
