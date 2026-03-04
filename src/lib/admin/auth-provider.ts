import {
  ADMIN_AUTH_PROVIDER,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  type AuthProviderType,
} from '@/lib/env';

export type AuthProvider = AuthProviderType;

export interface AuthResult {
  authenticated: boolean;
  user?: { email?: string; username?: string };
  error?: string;
}

export function getAuthProvider(): AuthProvider {
  return ADMIN_AUTH_PROVIDER;
}

export function isSupabaseConfigured(): boolean {
  return !!(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
