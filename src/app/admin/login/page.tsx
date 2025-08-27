'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { seoConfig } from '@/seo/seo.config';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        // Redirect to admin dashboard or previous page
        const redirectTo = new URLSearchParams(window.location.search).get('from') || '/admin';
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="mb-2 flex justify-center">
              <Image
                src="/logos/horizontal-logo.png"
                alt={`${seoConfig.siteName} Logo`}
                width={160}
                height={50}
                priority
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                }}
              />
            </div>
            <h1 className="text-h2" style={{ color: 'var(--color-text-primary)' }}>Admin Login</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
              Sign in to access the admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="text-label" 
                style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}
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
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="text-label" 
                style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}