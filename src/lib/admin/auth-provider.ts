export type AuthProvider = 'simple' | 'supabase';

export interface AuthResult {
  authenticated: boolean;
  user?: { email?: string; username?: string };
  error?: string;
}

export function getAuthProvider(): AuthProvider {
  const provider = process.env.ADMIN_AUTH_PROVIDER?.toLowerCase();
  if (provider === 'supabase') return 'supabase';
  return 'simple';
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
