import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in Server Components and API Routes.
 *
 * Reads auth tokens from cookies automatically. Cookie writes are
 * wrapped in try/catch because Server Components are read-only — the
 * proxy handles token refresh, so this is safe.
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('products').select('*');
 * }
 * ```
 *
 * @example API Route
 * ```ts
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('orders').select('*');
 *   return NextResponse.json(data);
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components (read-only).
            // Middleware handles token refresh, so this is safe to ignore.
          }
        },
      },
    }
  );
}
