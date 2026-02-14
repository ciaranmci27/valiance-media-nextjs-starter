import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/admin/require-auth';
import { isSupabaseConfigured } from '@/lib/admin/auth-provider';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ tables: [], buckets: [], configured: false });
  }

  try {
    // Use a plain client (anon key only, no cookies) so this works
    // regardless of whether auth provider is simple or supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Fetch tables and buckets in parallel via RPC (security definer)
    const [tablesResult, bucketsResult] = await Promise.all([
      supabase.rpc('list_public_tables'),
      supabase.rpc('list_storage_buckets'),
    ]);

    return NextResponse.json({
      tables: tablesResult.data ?? [],
      buckets: bucketsResult.data ?? [],
      configured: true,
      rpcError: tablesResult.error?.message,
      bucketsError: bucketsResult.error?.message,
    });
  } catch (error) {
    console.error('Error fetching storage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage data' },
      { status: 500 }
    );
  }
}
