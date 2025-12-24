'use client';

import { useState, useEffect } from 'react';

interface AppSettings {
  admin: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
    clarityId: string;
  };
  analyticsExclusions: {
    enabled: boolean;
    excludedIPs: string[];
    excludeLocalhost: boolean;
    excludeBots: boolean;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [settings, setSettings] = useState<AppSettings>({
    admin: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },
    analytics: {
      googleAnalyticsId: '',
      facebookPixelId: '',
      hotjarId: '',
      clarityId: '',
    },
    analyticsExclusions: {
      enabled: true,
      excludedIPs: [],
      excludeLocalhost: true,
      excludeBots: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [excludedIPsText, setExcludedIPsText] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch general settings
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            admin: data.settings.admin || prev.admin,
          }));
        }
      }

      // Fetch analytics settings from seo.config.ts
      const analyticsRes = await fetch('/api/admin/settings/analytics');
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        if (data.analytics) {
          setSettings(prev => ({
            ...prev,
            analytics: data.analytics,
          }));
        }
      }

      // Fetch analytics exclusions settings
      const exclusionsRes = await fetch('/api/admin/settings/analytics-exclusions');
      if (exclusionsRes.ok) {
        const data = await exclusionsRes.json();
        if (data.analyticsExclusions) {
          setSettings(prev => ({
            ...prev,
            analyticsExclusions: data.analyticsExclusions,
          }));
          // Set the text area value
          setExcludedIPsText(data.analyticsExclusions.excludedIPs?.join('\n') || '');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (activeTab === 'analytics') {
        // Save analytics IDs
        const res = await fetch('/api/admin/settings/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analytics: settings.analytics })
        });

        // Parse excluded IPs from text area
        const excludedIPs = excludedIPsText
          .split(/[\n,]/)
          .map(ip => ip.trim())
          .filter(ip => ip.length > 0);

        // Save analytics exclusions
        const exclusionsRes = await fetch('/api/admin/settings/analytics-exclusions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analyticsExclusions: {
              ...settings.analyticsExclusions,
              excludedIPs,
            }
          })
        });

        if (res.ok && exclusionsRes.ok) {
          const data = await res.json();
          // Clear the analytics cache so changes take effect immediately
          sessionStorage.removeItem('analytics_exclusion_cache');
          setSaveMessage(data.message || 'Analytics configuration saved successfully!');
          if (data.warning) {
            setSaveMessage(data.message + ' Warning: ' + data.warning);
          }
        } else {
          // Check which request failed and show appropriate error
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            setSaveMessage(errorData.error || 'Error saving analytics IDs.');
          } else if (!exclusionsRes.ok) {
            const errorData = await exclusionsRes.json().catch(() => ({}));
            setSaveMessage(errorData.error || 'Error saving exclusion settings.');
          }
        }
      } else {
        // For admin settings, use the general endpoint
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin: settings.admin
          })
        });

        if (res.ok) {
          setSaveMessage('Settings saved successfully!');
        } else {
          setSaveMessage('Error saving settings. Please try again.');
        }
      }

      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AppSettings],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'admin', label: 'Admin & Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            Application Settings
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Configure your application's core functionality and integrations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Analytics Configuration
                </h2>
                <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Configure analytics and tracking services for your website
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.analytics.googleAnalyticsId}
                    onChange={(e) => handleInputChange('analytics', 'googleAnalyticsId', e.target.value)}
                    className="input-field"
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Google Analytics 4 measurement ID or Universal Analytics tracking ID
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.analytics.facebookPixelId}
                    onChange={(e) => handleInputChange('analytics', 'facebookPixelId', e.target.value)}
                    className="input-field"
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Track conversions and build audiences for Facebook ads
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Hotjar ID
                  </label>
                  <input
                    type="text"
                    value={settings.analytics.hotjarId}
                    onChange={(e) => handleInputChange('analytics', 'hotjarId', e.target.value)}
                    className="input-field"
                    placeholder="XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Heatmaps and behavior analytics tracking
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Microsoft Clarity ID
                  </label>
                  <input
                    type="text"
                    value={settings.analytics.clarityId}
                    onChange={(e) => handleInputChange('analytics', 'clarityId', e.target.value)}
                    className="input-field"
                    placeholder="XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Free heatmaps and session recordings from Microsoft
                  </p>
                </div>
              </div>

              {/* IP Exclusions Section */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <h3 className="text-h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Analytics Exclusions
                  </h3>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Exclude specific IPs, localhost, or bots from being tracked by analytics
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                        Enable Analytics Exclusions
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Master switch to enable/disable all exclusion rules
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.analyticsExclusions.enabled}
                        onChange={(e) => handleInputChange('analyticsExclusions', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Localhost Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                        Exclude Localhost
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Don't track analytics from localhost/development environments (127.0.0.1, ::1)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.analyticsExclusions.excludeLocalhost}
                        onChange={(e) => handleInputChange('analyticsExclusions', 'excludeLocalhost', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.analyticsExclusions.enabled}
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary ${!settings.analyticsExclusions.enabled ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>

                  {/* Bot Exclusion Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                        Exclude Bots & Crawlers
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Don't track analytics from search engine bots, social media crawlers, and known scrapers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.analyticsExclusions.excludeBots}
                        onChange={(e) => handleInputChange('analyticsExclusions', 'excludeBots', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.analyticsExclusions.enabled}
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary ${!settings.analyticsExclusions.enabled ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>

                  {/* Excluded IPs */}
                  <div>
                    <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Excluded IP Addresses
                    </label>
                    <textarea
                      value={excludedIPsText}
                      onChange={(e) => setExcludedIPsText(e.target.value)}
                      className="input-field min-h-[100px]"
                      placeholder="Enter IP addresses (one per line or comma-separated)&#10;Example:&#10;192.168.1.1&#10;10.0.0.5"
                      disabled={!settings.analyticsExclusions.enabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Analytics will not be tracked for these IP addresses. Useful for excluding office/team IPs.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Admin & Security Settings
                </h2>
                <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Configure admin panel access and security features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Session Timeout
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.admin.sessionTimeout || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleInputChange('admin', 'sessionTimeout', isNaN(val) ? 60 : val);
                      }}
                      className="input-field w-32"
                      min="5"
                      max="1440"
                    />
                    <span className="text-body" style={{ color: 'var(--color-text-secondary)' }}>minutes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically log out users after this period of inactivity (min: 5, max: 1440 minutes)
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.admin.maxLoginAttempts || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleInputChange('admin', 'maxLoginAttempts', isNaN(val) ? 5 : val);
                    }}
                    className="input-field w-32"
                    min="3"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lock account after this many failed login attempts (min: 3, max: 10 attempts)
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Lockout Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.admin.lockoutDuration || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleInputChange('admin', 'lockoutDuration', isNaN(val) ? 15 : val);
                      }}
                      className="input-field w-32"
                      min="5"
                      max="120"
                    />
                    <span className="text-body" style={{ color: 'var(--color-text-secondary)' }}>minutes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    How long to lock the account after max failed attempts (min: 5, max: 120 minutes)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-body-sm flex items-start gap-2">
                  <span>💡</span>
                  <span>
                    Authentication is handled through encrypted credentials set in environment variables.
                    Use the setup script to generate credentials: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">npm run setup-auth</code>
                  </span>
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
                <p className="text-body-sm flex items-start gap-2">
                  <span>🔒</span>
                  <span>
                    <strong>Single Account System:</strong> This admin panel uses a single-account authentication system.
                    Set your credentials using <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">ADMIN_USERNAME</code> and
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs ml-1">ADMIN_PASSWORD_HASH</code> environment variables.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {saveMessage && (
                <p className={`text-body-sm ${
                  saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Important Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                🔒 Security Best Practices
              </p>
              <ul className="text-body-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                <li>• Never commit API keys or tokens to your repository</li>
                <li>• Use environment variables for all sensitive data</li>
                <li>• Rotate API keys regularly</li>
                <li>• Use app-specific passwords when available</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                📝 Content Management
              </p>
              <ul className="text-body-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                <li>• Blog content is saved to local files</li>
                <li>• Use your IDE or git client to commit changes</li>
                <li>• Changes persist across deployments when committed</li>
                <li>• Run locally to preview changes before deploying</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
