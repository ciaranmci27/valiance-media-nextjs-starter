'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import type { AuthProvider } from '@/lib/admin/auth-provider';

const isProduction = process.env.NODE_ENV === 'production';
const SUPABASE_GREEN = '#3ECF8E';

interface AdminSettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

function AuthSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="skeleton" style={{ width: '80px', height: '20px' }} />
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '180px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '320px', height: '18px' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '108px', borderRadius: 'var(--radius-xl, 16px)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

function getSupabaseRef(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '…';
}

interface AuthSettingsProps {
  authProvider: AuthProvider;
  supabaseUrl: string;
  allowedEmails: string;
}

export default function AuthSettings({ authProvider, supabaseUrl, allowedEmails }: AuthSettingsProps) {
  if (authProvider === 'supabase') {
    return <SupabaseAuthView supabaseUrl={supabaseUrl} allowedEmails={allowedEmails} />;
  }
  return <SimpleAuthForm />;
}

// ─── Supabase Auth View ──────────────────────────────────────────────────────

function SupabaseAuthView({ supabaseUrl, allowedEmails }: { supabaseUrl: string; allowedEmails: string }) {
  const ref = getSupabaseRef(supabaseUrl);
  const dashboardUrl = ref
    ? `https://supabase.com/dashboard/project/${ref}/auth/users`
    : 'https://supabase.com/dashboard';

  const emailList = allowedEmails
    ? allowedEmails.split(',').map(e => e.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block animate-fade-up">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Authentication
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Managed by Supabase Auth
        </p>
      </div>

      {/* Connection banner */}
      <AdminBanner variant="success">
        <p className="flex items-start gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: SUPABASE_GREEN,
              display: 'inline-block',
              marginTop: '6px',
              flexShrink: 0,
            }}
          />
          <span>
            Authentication is managed by Supabase project{' '}
            <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>
              {ref || 'unknown'}
            </code>.
            Session handling, login security, and user management are configured through the Supabase dashboard.
          </span>
        </p>
      </AdminBanner>

      {/* Config card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '80ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Configuration</h2>
        </div>
        <div className="flex flex-col gap-4">
          <InfoRow label="Auth Provider">
            <span className="flex items-center gap-2">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: SUPABASE_GREEN,
                  display: 'inline-block',
                }}
              />
              Supabase
            </span>
          </InfoRow>
          <InfoRow label="Project URL">
            <span title={supabaseUrl} style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              {truncateUrl(supabaseUrl)}
            </span>
          </InfoRow>
          <InfoRow label="Allowed Admin Emails">
            {emailList.length > 0 ? (
              <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                {emailList.join(', ')}
              </span>
            ) : (
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                All authenticated users (profiles table enforced)
              </span>
            )}
          </InfoRow>
          <InfoRow label="Admin Role">
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Set via profiles table in Supabase
            </span>
          </InfoRow>
        </div>
      </div>

      {/* Dashboard link */}
      <div className="animate-fade-up" style={{ animationDelay: '160ms' } as React.CSSProperties}>
        <AdminButton onClick={() => window.open(dashboardUrl, '_blank')}>
          <span className="flex items-center gap-2">
            Open Supabase Dashboard
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </span>
        </AdminButton>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3"
      style={{ borderBottom: '1px solid var(--color-border-light)' }}
    >
      <span className="text-label shrink-0" style={{ color: 'var(--color-text-secondary)', minWidth: '180px' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
        {children}
      </span>
    </div>
  );
}

// ─── Simple Auth Form ────────────────────────────────────────────────────────

function SimpleAuthForm() {
  const [settings, setSettings] = useState<AdminSettings>({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.admin) {
          setSettings(data.settings.admin);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin: settings }),
      });

      if (res.ok) {
        setSaveMessage('Settings saved successfully!');
      } else {
        setSaveMessage('Error saving settings. Please try again.');
      }

      setTimeout(() => setSaveMessage(''), 5000);
    } catch {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AuthSkeleton />;

  const statCards = [
    { label: 'Session Timeout', value: `${settings.sessionTimeout}m`, icon: ClockIcon },
    { label: 'Max Attempts', value: settings.maxLoginAttempts, icon: ShieldExclamationIcon },
    { label: 'Lockout Duration', value: `${settings.lockoutDuration}m`, icon: LockClosedIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Authentication
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Configure session and login security
        </p>
      </div>

      {/* Production warning */}
      {isProduction && (
        <div className="pages-production-warning animate-fade-up">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
          <div>
            <p style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '14px', margin: 0 }}>
              Production Environment
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
              Settings cannot be modified in production. Edit <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)' }}>settings.json</code> locally and redeploy.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="dash-stat-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
            >
              <div className="dash-stat-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div className="dash-stat-value">{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Security Settings card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '180ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Security Configuration</h2>
        </div>
        <div className="space-y-5">
          <div className="animate-fade-up" style={{ animationDelay: '240ms' } as React.CSSProperties}>
            <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Session Timeout
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.sessionTimeout || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSettings(prev => ({ ...prev, sessionTimeout: isNaN(val) ? 60 : val }));
                }}
                className="input-field w-32"
                min="5"
                max="1440"
                disabled={isProduction}
              />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>minutes</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Automatically log out users after this period of inactivity (5 &ndash; 1440 minutes)
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
            <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSettings(prev => ({ ...prev, maxLoginAttempts: isNaN(val) ? 5 : val }));
              }}
              className="input-field w-32"
              min="3"
              max="10"
              disabled={isProduction}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Lock account after this many failed login attempts (3 &ndash; 10 attempts)
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '360ms' } as React.CSSProperties}>
            <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Lockout Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.lockoutDuration || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSettings(prev => ({ ...prev, lockoutDuration: isNaN(val) ? 15 : val }));
                }}
                className="input-field w-32"
                min="5"
                max="120"
                disabled={isProduction}
              />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>minutes</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              How long to lock the account after max failed attempts (5 &ndash; 120 minutes)
            </p>
          </div>

          <AdminBanner>
            <p className="flex items-start gap-2">
              <span>&#128274;</span>
              <span>
                <strong>Single Account System:</strong> This admin panel uses a single-account authentication system.
                Set your credentials using <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>SIMPLE_ADMIN_USERNAME</code> and
                <code className="px-1 rounded text-xs ml-1" style={{ background: 'var(--color-surface-elevated)' }}>SIMPLE_ADMIN_PASSWORD_HASH</code> environment variables.
              </span>
            </p>
          </AdminBanner>

          {/* Supabase upsell */}
          <AdminBanner variant="success">
            <p className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ marginTop: '2px' }}>
                <path d="M63.708 110.284C60.727 114.083 54.87 112.147 54.694 107.26L53.098 59.218H99.14C108.123 59.218 113.172 69.618 107.56 76.659L63.708 110.284Z" fill="#249361" />
                <path d="M45.317 2.071C48.298 -1.728 54.155 0.209 54.331 5.096L55.202 53.137H10.088C1.105 53.137 -3.944 42.737 1.668 35.696L45.317 2.071Z" fill="#3ECF8E" />
              </svg>
              <span>
                <strong>Upgrade to Supabase Auth.</strong> Get OAuth providers, magic links, multi-user support, and managed session handling.
                Set <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>ADMIN_AUTH_PROVIDER=supabase</code> in your environment to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="dash-card-link" style={{ fontWeight: 600 }}>get started</a>.
              </span>
            </p>
          </AdminBanner>
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <div>
            {saveMessage && (
              <p className={`text-body-sm ${
                saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage}
              </p>
            )}
          </div>
          <AdminButton
            onClick={handleSave}
            disabled={isSaving || isProduction}
            title={isProduction ? 'Settings cannot be modified in production' : undefined}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
