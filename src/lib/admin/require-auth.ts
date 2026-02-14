import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySignedToken } from './auth';
import { sessionStore } from './auth-store';
import { getAuthProvider } from './auth-provider';

interface AuthSuccess {
  authenticated: true;
  user: { email?: string; username?: string };
}

interface AuthFailure {
  authenticated: false;
  response: NextResponse;
}

type RequireAuthResult = AuthSuccess | AuthFailure;

/**
 * Defense-in-depth auth check for admin API routes.
 *
 * Call at the top of every admin API handler:
 * ```ts
 * const auth = await requireAuth();
 * if (!auth.authenticated) return auth.response;
 * ```
 */
export async function requireAuth(): Promise<RequireAuthResult> {
  // Dev bypass — only allowed outside production
  if (
    process.env.DISABLE_ADMIN_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return { authenticated: true, user: { username: 'dev' } };
  }

  const provider = getAuthProvider();

  if (provider === 'supabase') {
    return requireAuthSupabase();
  }

  return requireAuthSimple();
}

async function requireAuthSimple(): Promise<RequireAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return deny();
  }

  // Verify HMAC signature — this is the cryptographic proof of a valid token
  if (!verifySignedToken(token)) {
    return deny();
  }

  // Check session store for timeout/invalidation tracking.
  // If the session isn't in the store (e.g. cleared by hot reload in dev),
  // recover it — the HMAC already proved the token is legitimate.
  if (!sessionStore.isValidSession(token)) {
    sessionStore.createSession('admin', token);
  }

  const session = sessionStore.getSession(token);
  return {
    authenticated: true,
    user: { username: session?.username },
  };
}

async function requireAuthSupabase(): Promise<RequireAuthResult> {
  // Dynamic import to avoid pulling Supabase into simple-auth bundles
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return deny();
  }

  // Check ADMIN_ALLOWED_EMAILS as a fast path
  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS;
  if (allowedEmails) {
    const emailList = allowedEmails.split(',').map((e) => e.trim().toLowerCase());
    if (!emailList.includes(user.email?.toLowerCase() ?? '')) {
      return deny();
    }
  }

  // Defense-in-depth: check profiles table for admin role
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.role !== 'admin') {
        return deny();
      }
    } else if (!allowedEmails) {
      // No profile found AND no email allowlist — deny by default
      return deny();
    }
  } catch (err) {
    // Profiles table might not exist yet — log and fall back to ADMIN_ALLOWED_EMAILS
    console.warn('Profiles table query failed (table may not exist yet):', err);
    if (!allowedEmails) {
      return deny();
    }
  }

  return {
    authenticated: true,
    user: { email: user.email },
  };
}

function deny(): AuthFailure {
  return {
    authenticated: false,
    response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}
