'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { seoConfig } from '@/seo/seo.config';
import { Logo } from '@/components/layout/Logo';
import AdminButton from '@/components/admin/ui/AdminButton';
import { TextInput, PasswordInput } from '@/components/ui/inputs';
import { Mail, User } from 'lucide-react';
import type { AuthProvider } from '@/lib/admin/auth-provider';

interface LoginFormProps {
  showSetupHint: boolean;
  authProvider: AuthProvider;
}

export default function LoginForm({ showSetupHint, authProvider }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSupabase = authProvider === 'supabase';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSupabase) {
        // Supabase: sign in client-side
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Verify user has admin role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          // Not an admin — sign them out and show error
          await supabase.auth.signOut();
          setError('Access denied. Your account does not have admin privileges.');
          return;
        }
      } else {
        // Simple: POST to login API
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid credentials');
          return;
        }
      }

      // Redirect on success
      const fromParam = new URLSearchParams(window.location.search).get('from');
      let redirectTo = '/admin';
      if (fromParam) {
        const isValidRedirect =
          fromParam.startsWith('/') &&
          !fromParam.startsWith('//') &&
          !fromParam.includes(':');
        if (isValidRedirect) {
          redirectTo = fromParam;
        }
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Card */}
      <div className="login-card">
        {/* Logo + heading */}
        <div
          className="flex flex-col items-center mb-6 animate-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <Logo
            width={160}
            height={40}
            className="h-8 w-auto mb-5"
            alt={`${seoConfig.siteName} Logo`}
          />
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome back
          </h1>
          <p
            className="text-sm mb-0"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Sign in to your admin panel
          </p>
        </div>

        <div className="login-divider mb-6" />

        {/* Error banner */}
        {error && (
          <div
            className="admin-banner mb-4 flex items-start gap-3"
            data-variant="error"
          >
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username / Email */}
          <div
            className="mb-4 animate-fade-up"
            style={{ animationDelay: '60ms' }}
          >
            <TextInput
              label={isSupabase ? 'Email' : 'Username'}
              type={isSupabase ? 'email' : 'text'}
              id="identifier"
              value={identifier}
              onChange={(val) => setIdentifier(val)}
              required
              placeholder={isSupabase ? 'you@example.com' : 'admin'}
              autoComplete={isSupabase ? 'email' : 'username'}
              autoFocus
              leftIcon={isSupabase ? Mail : User}
            />
          </div>

          {/* Password */}
          <div
            className="mb-6 animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <PasswordInput
              label="Password"
              id="password"
              value={password}
              onChange={(val) => setPassword(val)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <AdminButton
              type="submit"
              disabled={isLoading}
              className="w-full relative"
              style={{ height: '44px' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </AdminButton>
          </div>
        </form>
      </div>

      {/* Setup hint — below the card */}
      {showSetupHint && (
        <div
          className="login-hint animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          Run <code>npm run setup-auth</code> to configure credentials
        </div>
      )}
    </div>
  );
}
