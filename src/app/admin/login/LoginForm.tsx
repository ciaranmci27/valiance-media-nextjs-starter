'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { seoConfig } from '@/seo/seo.config';
import { Logo } from '@/components/layout/Logo';

export default function LoginForm({ showSetupHint }: { showSetupHint: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const fromParam = new URLSearchParams(window.location.search).get('from');
        let redirectTo = '/admin';
        if (fromParam) {
          const isValidRedirect = fromParam.startsWith('/') &&
                                  !fromParam.startsWith('//') &&
                                  !fromParam.includes(':');
          if (isValidRedirect) {
            redirectTo = fromParam;
          }
        }
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] login-panel-bg relative overflow-hidden">
        <div className="login-dots absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Logo */}
          <div>
            <Logo
              width={160}
              height={40}
              className="h-8 w-auto"
              alt={`${seoConfig.siteName} Logo`}
              inverted
            />
          </div>

          {/* Center: Message */}
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Manage your site with confidence.
            </h2>
            <p className="text-primary-200 text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Content, SEO, analytics, and pages — all from one streamlined dashboard.
            </p>
          </div>

          {/* Bottom: Footer */}
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {seoConfig.siteName || 'Valiance Media'} Admin
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo
              width={160}
              height={40}
              className="h-8 w-auto"
              alt={`${seoConfig.siteName} Logo`}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-base" style={{ color: 'var(--color-text-tertiary)' }}>
              Sign in to access your admin panel
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-lg text-sm flex items-start gap-3"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--color-error, #EF4444)',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingRight: '44px' }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full relative"
              style={{ marginTop: '28px', height: '44px' }}
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
            </button>
          </form>

          {/* Setup hint - only shown when auth is not configured */}
          {showSetupHint && (
            <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Run <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>npm run setup-auth</code> to configure credentials
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
