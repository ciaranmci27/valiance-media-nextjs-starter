'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  contactEmail: string;
  socialMedia: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    github: string;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
    clarityId: string;
  };
  siteVerification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Valiance Media',
    siteUrl: 'https://valiancemedia.com',
    siteDescription: 'Creating innovative in-house software solutions and e-commerce brands',
    contactEmail: 'contact@valiancemedia.com',
    socialMedia: {
      twitter: 'https://twitter.com/valiancemedia',
      facebook: 'https://facebook.com/valiancemedia',
      instagram: 'https://instagram.com/valiancemedia',
      linkedin: 'https://linkedin.com/company/valiancemedia',
      youtube: 'https://youtube.com/@valiancemedia',
      github: 'https://github.com/valiancemedia',
    },
    analytics: {
      googleAnalyticsId: '',
      facebookPixelId: '',
      hotjarId: '',
      clarityId: '',
    },
    siteVerification: {
      google: '',
      bing: '',
      yandex: '',
      pinterest: '',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save to localStorage for now (in production, this would be an API call)
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === 'general') {
      setSettings(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSettings(prev => {
        const sectionKey = section as keyof SiteSettings;
        const currentSection = prev[sectionKey];
        
        if (typeof currentSection === 'object' && currentSection !== null) {
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [field]: value,
            },
          };
        }
        return prev;
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'social', label: 'Social Media', icon: '🔗' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'verification', label: 'Site Verification', icon: '✓' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            Site Settings
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Configure your website settings and integrations
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
                  ? 'bg-blue-600 text-white'
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                General Settings
              </h2>
              
              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  className="input-field"
                  placeholder="Your site name"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                  className="input-field"
                  placeholder="https://yoursite.com"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of your site"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="input-field"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                Social Media Links
              </h2>
              
              {Object.entries(settings.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="text-label block mb-2 capitalize" style={{ color: 'var(--color-text-primary)' }}>
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleInputChange('socialMedia', platform, e.target.value)}
                    className="input-field"
                    placeholder={`https://${platform}.com/yourhandle`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                Analytics Integration
              </h2>
              
              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={settings.analytics.googleAnalyticsId}
                  onChange={(e) => handleInputChange('analytics', 'googleAnalyticsId', e.target.value)}
                  className="input-field"
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Your Google Analytics measurement ID
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
                  placeholder="XXXXXXXXXXXXXXXXX"
                />
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
                  placeholder="XXXXXXXXX"
                />
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
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                Site Verification
              </h2>
              
              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Google Site Verification
                </label>
                <input
                  type="text"
                  value={settings.siteVerification.google}
                  onChange={(e) => handleInputChange('siteVerification', 'google', e.target.value)}
                  className="input-field"
                  placeholder="google-site-verification code"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Bing Site Verification
                </label>
                <input
                  type="text"
                  value={settings.siteVerification.bing}
                  onChange={(e) => handleInputChange('siteVerification', 'bing', e.target.value)}
                  className="input-field"
                  placeholder="msvalidate.01 code"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Yandex Site Verification
                </label>
                <input
                  type="text"
                  value={settings.siteVerification.yandex}
                  onChange={(e) => handleInputChange('siteVerification', 'yandex', e.target.value)}
                  className="input-field"
                  placeholder="yandex-verification code"
                />
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Pinterest Site Verification
                </label>
                <input
                  type="text"
                  value={settings.siteVerification.pinterest}
                  onChange={(e) => handleInputChange('siteVerification', 'pinterest', e.target.value)}
                  className="input-field"
                  placeholder="p:domain_verify code"
                />
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
      </div>
    </div>
  );
}