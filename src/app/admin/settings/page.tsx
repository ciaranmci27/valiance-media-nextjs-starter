'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';

const isProduction = process.env.NODE_ENV === 'production';

interface AdminSettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

function SettingsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '140px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '18px' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '108px', borderRadius: 'var(--radius-xl, 16px)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl, 16px)' }} />
      <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

export default function SettingsPage() {
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
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  const statCards = [
    {
      label: 'Session Timeout',
      value: `${settings.sessionTimeout}m`,
      icon: ClockIcon,
    },
    {
      label: 'Max Attempts',
      value: settings.maxLoginAttempts,
      icon: ShieldExclamationIcon,
    },
    {
      label: 'Lockout Duration',
      value: `${settings.lockoutDuration}m`,
      icon: LockClosedIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Settings
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Configure admin and security settings
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
          <AdminBanner variant="warning">
            <p className="flex items-start gap-2">
              <span>&#128161;</span>
              <span>
                Authentication is handled through encrypted credentials set in environment variables.
                Use the setup script to generate credentials: <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>npm run setup-auth</code>
              </span>
            </p>
          </AdminBanner>

          <AdminBanner>
            <p className="flex items-start gap-2">
              <span>&#128274;</span>
              <span>
                <strong>Single Account System:</strong> This admin panel uses a single-account authentication system.
                Set your credentials using <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>ADMIN_USERNAME</code> and
                <code className="px-1 rounded text-xs ml-1" style={{ background: 'var(--color-surface-elevated)' }}>ADMIN_PASSWORD_HASH</code> environment variables.
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
