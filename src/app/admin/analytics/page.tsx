'use client';

import { useState, useEffect } from 'react';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import { TextInput, Toggle, Textarea, TagInput } from '@/components/ui/inputs';

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
  { key: 'googleAnalyticsId' as const, label: 'Google Analytics ID', shortLabel: 'GA4', placeholder: 'G-XXXXXXXXXX or UA-XXXXXXXXX-X', description: 'GA4 or Universal Analytics ID' },
  { key: 'facebookPixelId' as const, label: 'Facebook Pixel ID', shortLabel: 'FB Pixel', placeholder: 'XXXXXXXXXXXXXXX', description: 'Track conversions for Facebook ads' },
  { key: 'hotjarId' as const, label: 'Hotjar ID', shortLabel: 'Hotjar', placeholder: 'XXXXXXX', description: 'Heatmaps and behavior tracking' },
  { key: 'clarityId' as const, label: 'Microsoft Clarity ID', shortLabel: 'Clarity', placeholder: 'XXXXXXXXXX', description: 'Session recordings from Microsoft' },
];

function AnalyticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden lg:block">
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
      <div className="hidden lg:block">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <TextInput
              key={service.key}
              label={service.label}
              description={service.description}
              value={analytics[service.key]}
              onChange={(val) => setAnalytics(prev => ({ ...prev, [service.key]: val }))}
              placeholder={service.placeholder}
              disabled={isProduction}
            />
          ))}
        </div>
      </div>

      {/* Exclusion Rules card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '360ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Exclusion Rules</h2>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Enable Exclusions</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Master switch for all exclusion rules</p>
              </div>
              <Toggle
                checked={exclusions.enabled}
                onChange={(checked) => setExclusions(prev => ({ ...prev, enabled: checked }))}
                disabled={isProduction}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Exclude Localhost</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Skip tracking from 127.0.0.1 and ::1</p>
              </div>
              <Toggle
                checked={exclusions.excludeLocalhost}
                onChange={(checked) => setExclusions(prev => ({ ...prev, excludeLocalhost: checked }))}
                disabled={isProduction || !exclusions.enabled}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: 'var(--color-border-light)' }}>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Exclude Bots & Crawlers</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Skip bots, crawlers, and known scrapers</p>
              </div>
              <Toggle
                checked={exclusions.excludeBots}
                onChange={(checked) => setExclusions(prev => ({ ...prev, excludeBots: checked }))}
                disabled={isProduction || !exclusions.enabled}
              />
            </div>
          </div>

          <TagInput
            label="Excluded IP Addresses"
            description="Exclude office or team IPs from tracking"
            value={excludedIPsText.split(/[\n,]/).map(ip => ip.trim()).filter(Boolean)}
            onChange={(val) => setExcludedIPsText(val.join('\n'))}
            placeholder="Type an IP address and press Enter"
            disabled={isProduction || !exclusions.enabled}
          />
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
