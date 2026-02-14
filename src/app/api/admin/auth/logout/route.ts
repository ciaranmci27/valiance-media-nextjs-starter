import { NextRequest, NextResponse } from 'next/server';
import { getAuthProvider } from '@/lib/admin/auth-provider';
import { sessionStore } from '@/lib/admin/auth-store';

export async function POST(request: NextRequest) {
  const provider = getAuthProvider();

  if (provider === 'supabase') {
    // Supabase: sign out via server client (clears Supabase cookies)
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase not configured — continue to clear cookies anyway
    }
  } else {
    // Simple: invalidate the session in the in-memory store
    const token = request.cookies.get('admin-token')?.value;
    if (token) {
      sessionStore.deleteSession(token);
    }
  }

  const response = NextResponse.json({ success: true });

  // Clear all admin cookies regardless of provider
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('admin-last', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('admin-timeout', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
