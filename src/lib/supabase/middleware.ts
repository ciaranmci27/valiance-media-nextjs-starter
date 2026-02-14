import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Creates a Supabase client for use in the proxy (middleware).
 *
 * Handles token refresh by setting cookies on both the request
 * (for downstream Server Components) and the response (for the browser).
 * The returned `response` **must** be returned from the proxy to deliver
 * refreshed auth tokens to the browser.
 *
 * You typically don't need to use this directly — it's called automatically
 * by `src/proxy.ts` on every request when Supabase is the auth provider.
 *
 * @returns `{ supabase, response }` — always return `response` from proxy
 */
export async function createClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request so downstream server components see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Recreate the response so it carries the updated cookies to the browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}
