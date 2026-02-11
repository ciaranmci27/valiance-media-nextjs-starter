'use client';

import { useState, useEffect } from 'react';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';

const isProduction = process.env.NODE_ENV === 'production';

interface AnalyticsSettings {
  googleAnalyticsId: string;
  facebookPixelId: string;
  hotjarId: string;
  clarityId: string;
}

interface AnalyticsExclusions {
  enabled: boolean;
  excludedIPs: string[];
  excludeLocalhost: boolean;
  excludeBots: boolean;
}

const services = [
  { key: 'googleAnalyticsId' as const, label: 'Google Analytics', shortLabel: 'GA4' },
  { key: 'facebookPixelId' as const, label: 'Facebook Pixel', shortLabel: 'FB Pixel' },
  { key: 'hotjarId' as const, label: 'Hotjar', shortLabel: 'Hotjar' },
  { key: 'clarityId' as const, label: 'Microsoft Clarity', shortLabel: 'Clarity' },
];

function AnalyticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '160px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '320px', height: '18px' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '108px', borderRadius: 'var(--radius-xl, 16px)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '340px', borderRadius: 'var(--radius-xl, 16px)' }} />
      <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSettings>({
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
    clarityId: '',
  });
  const [exclusions, setExclusions] = useState<AnalyticsExclusions>({
    enabled: true,
    excludedIPs: [],
    excludeLocalhost: true,
    excludeBots: true,
  });
  const [excludedIPsText, setExcludedIPsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, exclusionsRes] = await Promise.all([
        fetch('/api/admin/settings/analytics'),
        fetch('/api/admin/settings/analytics-exclusions'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        if (data.analytics) setAnalytics(data.analytics);
      }

      if (exclusionsRes.ok) {
        const data = await exclusionsRes.json();
        if (data.analyticsExclusions) {
          setExclusions(data.analyticsExclusions);
          setExcludedIPsText(data.analyticsExclusions.excludedIPs?.join('\n') || '');
        }
      }
    } catch (error) {
      console.error('Error fetching analytics settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const excludedIPs = excludedIPsText
        .split(/[\n,]/)
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0);

      const [res, exclusionsRes] = await Promise.all([
        fetch('/api/admin/settings/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analytics }),
        }),
        fetch('/api/admin/settings/analytics-exclusions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analyticsExclusions: { ...exclusions, excludedIPs },
          }),
        }),
      ]);

      if (res.ok && exclusionsRes.ok) {
        const data = await res.json();
        sessionStorage.removeItem('analytics_exclusion_cache');
        setSaveMessage(data.message || 'Analytics configuration saved successfully!');
        if (data.warning) {
          setSaveMessage(data.message + ' Warning: ' + data.warning);
        }
      } else {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setSaveMessage(errorData.error || 'Error saving analytics IDs.');
        } else {
          const errorData = await exclusionsRes.json().catch(() => ({}));
          setSaveMessage(errorData.error || 'Error saving exclusion settings.');
        }
      }

      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          Analytics
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Manage tracking services and exclusion rules
        </p>
      </div>

      {/* Production warning */}
      {isProduction && (
        <AdminBanner variant="warning">
          <p className="flex items-start gap-2">
            <span>&#9888;</span>
            <span>
              <strong>Read-Only in Production:</strong> Settings cannot be modified in production. To change these settings, edit <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)' }}>seo.config.ts</code> locally and redeploy.
            </span>
          </p>
        </AdminBanner>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, i) => {
          const isConfigured = !!analytics[service.key];
          return (
            <div
              key={service.key}
              className="dash-stat-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="dash-status-dot"
                  style={{
                    background: isConfigured ? 'var(--color-success)' : 'var(--color-text-disabled)',
                    width: '8px',
                    height: '8px',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  {service.shortLabel}
                </span>
              </div>
              <div className="dash-stat-value" style={{ fontSize: '16px' }}>
                {isConfigured ? 'Configured' : 'Not Set'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Services card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '240ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Tracking Services</h2>
        </div>
        <div className="space-y-4">
          {services.map((service, i) => (
            <div
              key={service.key}
              className="animate-fade-up"
              style={{ animationDelay: `${300 + i * 60}ms` } as React.CSSProperties}
            >
              <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {service.label} ID
              </label>
              <input
                type="text"
                value={analytics[service.key]}
                onChange={(e) => setAnalytics(prev => ({ ...prev, [service.key]: e.target.value }))}
                className="input-field"
                placeholder={
                  service.key === 'googleAnalyticsId' ? 'G-XXXXXXXXXX or UA-XXXXXXXXX-X' :
                  service.key === 'facebookPixelId' ? 'XXXXXXXXXXXXXXX' :
                  service.key === 'hotjarId' ? 'XXXXXXX' :
                  'XXXXXXXXXX'
                }
                disabled={isProduction}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                {service.key === 'googleAnalyticsId' && 'Your Google Analytics 4 measurement ID or Universal Analytics tracking ID'}
                {service.key === 'facebookPixelId' && 'Track conversions and build audiences for Facebook ads'}
                {service.key === 'hotjarId' && 'Heatmaps and behavior analytics tracking'}
                {service.key === 'clarityId' && 'Free heatmaps and session recordings from Microsoft'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exclusion Rules card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '540ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Exclusion Rules</h2>
        </div>
        <div className="space-y-4">
          {/* Master Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg animate-fade-up"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', animationDelay: '600ms' } as React.CSSProperties}
          >
            <div>
              <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                Enable Analytics Exclusions
              </label>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Master switch to enable/disable all exclusion rules
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exclusions.enabled}
                onChange={(e) => setExclusions(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
                disabled={isProduction}
              />
              <div className={`admin-toggle-track w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${isProduction ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </label>
          </div>

          {/* Localhost Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg animate-fade-up"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', animationDelay: '660ms' } as React.CSSProperties}
          >
            <div>
              <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                Exclude Localhost
              </label>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Don&apos;t track analytics from localhost/development environments (127.0.0.1, ::1)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exclusions.excludeLocalhost}
                onChange={(e) => setExclusions(prev => ({ ...prev, excludeLocalhost: e.target.checked }))}
                className="sr-only peer"
                disabled={isProduction || !exclusions.enabled}
              />
              <div className={`admin-toggle-track w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${isProduction || !exclusions.enabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </label>
          </div>

          {/* Bot Exclusion Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg animate-fade-up"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', animationDelay: '720ms' } as React.CSSProperties}
          >
            <div>
              <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                Exclude Bots & Crawlers
              </label>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Don&apos;t track analytics from search engine bots, social media crawlers, and known scrapers
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exclusions.excludeBots}
                onChange={(e) => setExclusions(prev => ({ ...prev, excludeBots: e.target.checked }))}
                className="sr-only peer"
                disabled={isProduction || !exclusions.enabled}
              />
              <div className={`admin-toggle-track w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${isProduction || !exclusions.enabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </label>
          </div>

          {/* Excluded IPs */}
          <div className="animate-fade-up" style={{ animationDelay: '780ms' } as React.CSSProperties}>
            <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Excluded IP Addresses
            </label>
            <textarea
              value={excludedIPsText}
              onChange={(e) => setExcludedIPsText(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder={"Enter IP addresses (one per line or comma-separated)\nExample:\n192.168.1.1\n10.0.0.5"}
              disabled={isProduction || !exclusions.enabled}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Analytics will not be tracked for these IP addresses. Useful for excluding office/team IPs.
            </p>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between pt-4 pb-2" style={{ borderTop: '1px solid var(--color-border-light)' }}>
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
          {isSaving ? 'Saving...' : 'Save Analytics'}
        </AdminButton>
      </div>
    </div>
  );
}
