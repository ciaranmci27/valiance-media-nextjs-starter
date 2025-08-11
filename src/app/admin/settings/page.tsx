'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AppSettings {
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'postmark' | 'resend';
    fromEmail: string;
    fromName: string;
    replyTo: string;
  };
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
  verification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('github');
  const [settings, setSettings] = useState<AppSettings>({
    email: {
      provider: 'smtp',
      fromEmail: '',
      fromName: '',
      replyTo: '',
    },
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
    verification: {
      google: '',
      bing: '',
      yandex: '',
      pinterest: '',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoadingEnv, setIsLoadingEnv] = useState(true);

  // GitHub env vars status
  const [githubEnvStatus, setGithubEnvStatus] = useState({
    token: false,
    owner: false,
    repo: false,
  });

  // Email env vars status
  const [emailEnvStatus, setEmailEnvStatus] = useState({
    configured: false,
    provider: '',
  });

  useEffect(() => {
    // Load settings from API
    fetchSettings();
    
    // Check environment variables status
    checkEnvVariables();
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
            email: data.settings.email || prev.email,
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
      
      // Fetch verification settings from seo.config.ts
      const verificationRes = await fetch('/api/admin/settings/verification');
      if (verificationRes.ok) {
        const data = await verificationRes.json();
        if (data.verification) {
          setSettings(prev => ({
            ...prev,
            verification: data.verification,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const checkEnvVariables = async () => {
    try {
      setIsLoadingEnv(true);
      const res = await fetch('/api/admin/settings/env-status');
      if (res.ok) {
        const data = await res.json();
        setGithubEnvStatus(data.github || { token: false, owner: false, repo: false });
        setEmailEnvStatus(data.email || { configured: false, provider: '' });
      }
    } catch (error) {
      console.error('Error checking env variables:', error);
    } finally {
      setIsLoadingEnv(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // If saving analytics, use the analytics endpoint
      if (activeTab === 'analytics') {
        const res = await fetch('/api/admin/settings/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analytics: settings.analytics })
        });
        
        if (res.ok) {
          const data = await res.json();
          setSaveMessage(data.message || 'Analytics configuration saved successfully!');
          if (data.warning) {
            setSaveMessage(data.message + ' Warning: ' + data.warning);
          }
        } else {
          const errorData = await res.json();
          setSaveMessage(errorData.error || 'Error saving analytics configuration.');
        }
      } else if (activeTab === 'verification') {
        // If saving verification, use the verification endpoint
        const res = await fetch('/api/admin/settings/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verification: settings.verification })
        });
        
        if (res.ok) {
          const data = await res.json();
          setSaveMessage(data.message || 'Verification settings saved successfully!');
          if (data.warning) {
            setSaveMessage(data.message + ' Warning: ' + data.warning);
          }
        } else {
          const errorData = await res.json();
          setSaveMessage(errorData.error || 'Error saving verification settings.');
        }
      } else {
        // For other settings, use the general endpoint
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: settings.email,
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
    { id: 'github', label: 'GitHub Settings', icon: '🔗' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'verification', label: 'Verification', icon: '✅' },
    { id: 'admin', label: 'Admin & Security', icon: '🔒' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

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
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  GitHub Integration
                </h2>
                <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Connect your GitHub repository for blog content management
                </p>
              </div>

              {/* Status Overview */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold mb-3">Configuration Status</h3>
                {isLoadingEnv ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-gray-600 dark:text-gray-400">Checking configuration...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={githubEnvStatus.token ? 'text-green-600' : 'text-red-600'}>
                        {githubEnvStatus.token ? '✓' : '✗'}
                      </span>
                      <span>GitHub Token: {githubEnvStatus.token ? 'Configured' : 'Not configured'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={githubEnvStatus.owner ? 'text-green-600' : 'text-red-600'}>
                        {githubEnvStatus.owner ? '✓' : '✗'}
                      </span>
                      <span>Repository Owner: {githubEnvStatus.owner ? 'Configured' : 'Not configured'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={githubEnvStatus.repo ? 'text-green-600' : 'text-red-600'}>
                        {githubEnvStatus.repo ? '✓' : '✗'}
                      </span>
                      <span>Repository Name: {githubEnvStatus.repo ? 'Configured' : 'Not configured'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Setup Instructions */}
              <div className="space-y-4">
                <h3 className="font-semibold">Setup Instructions</h3>
                
                <div className="space-y-3">
                  <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                    To enable GitHub integration for blog content, add these environment variables to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code> file:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>
                          <span className="text-gray-500"># GitHub Personal Access Token</span><br />
                          GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
                        </span>
                        <button
                          onClick={() => copyToClipboard('GITHUB_TOKEN=')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>
                          <span className="text-gray-500"># GitHub Repository Owner (username or org)</span><br />
                          GITHUB_OWNER=your-username
                        </span>
                        <button
                          onClick={() => copyToClipboard('GITHUB_OWNER=')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>
                          <span className="text-gray-500"># GitHub Repository Name</span><br />
                          GITHUB_REPO=your-blog-content
                        </span>
                        <button
                          onClick={() => copyToClipboard('GITHUB_REPO=')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>
                          <span className="text-gray-500"># Optional: Branch name (defaults to main)</span><br />
                          GITHUB_BRANCH=main
                        </span>
                        <button
                          onClick={() => copyToClipboard('GITHUB_BRANCH=main')}
                          className="text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">How to get a GitHub Personal Access Token:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-body" style={{ color: 'var(--color-text-secondary)' }}>
                    <li>Go to GitHub → Settings → Developer settings → Personal access tokens</li>
                    <li>Click "Generate new token" (classic)</li>
                    <li>Give it a descriptive name like "Blog CMS"</li>
                    <li>Select scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">repo</code> (full control of private repositories)</li>
                    <li>Click "Generate token" and copy it immediately</li>
                  </ol>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-body-sm flex items-start gap-2">
                    <span>⚠️</span>
                    <span>
                      <strong>Security Note:</strong> Never commit environment variables to your repository. 
                      Always use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">.env.local</code> which is gitignored by default.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Email Configuration
                </h2>
                <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Configure email sending for contact forms and notifications
                </p>
              </div>

              {/* Email Status */}
              {emailEnvStatus.configured && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-green-700 dark:text-green-300">
                    ✓ Email provider configured: <strong>{emailEnvStatus.provider}</strong>
                  </p>
                </div>
              )}

              {/* Email Settings Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Email Provider
                  </label>
                  <select
                    value={settings.email.provider}
                    onChange={(e) => handleInputChange('email', 'provider', e.target.value)}
                    className="input-field"
                  >
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="postmark">Postmark</option>
                    <option value="resend">Resend</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      className="input-field"
                      placeholder="noreply@yoursite.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default sender email address</p>
                  </div>

                  <div>
                    <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                      className="input-field"
                      placeholder="Your Site Name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Display name for emails</p>
                  </div>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={settings.email.replyTo}
                    onChange={(e) => handleInputChange('email', 'replyTo', e.target.value)}
                    className="input-field"
                    placeholder="support@yoursite.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Where replies should be sent</p>
                </div>
              </div>

              {/* Provider-specific Instructions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Provider Configuration</h3>
                
                {settings.email.provider === 'smtp' && (
                  <div className="space-y-3">
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Add these environment variables to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                      <div>SMTP_HOST=smtp.gmail.com</div>
                      <div>SMTP_PORT=587</div>
                      <div>SMTP_USER=your-email@gmail.com</div>
                      <div>SMTP_PASSWORD=your-app-password</div>
                      <div>SMTP_SECURE=false <span className="text-gray-500"># true for port 465</span></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      For Gmail, use an App Password instead of your regular password. 
                      Enable 2FA and generate an app password at myaccount.google.com/apppasswords
                    </p>
                  </div>
                )}

                {settings.email.provider === 'sendgrid' && (
                  <div className="space-y-3">
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Add this environment variable to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                      SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
                    </div>
                    <p className="text-xs text-gray-500">
                      Get your API key from SendGrid Dashboard → Settings → API Keys
                    </p>
                  </div>
                )}

                {settings.email.provider === 'mailgun' && (
                  <div className="space-y-3">
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Add these environment variables to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                      <div>MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx</div>
                      <div>MAILGUN_DOMAIN=mg.yoursite.com</div>
                      <div>MAILGUN_REGION=US <span className="text-gray-500"># or EU</span></div>
                    </div>
                  </div>
                )}

                {settings.email.provider === 'postmark' && (
                  <div className="space-y-3">
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Add this environment variable to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                      POSTMARK_API_KEY=xxxxxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                )}

                {settings.email.provider === 'resend' && (
                  <div className="space-y-3">
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Add this environment variable to your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                      RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
                    </div>
                    <p className="text-xs text-gray-500">
                      Get your API key from resend.com/api-keys
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
                <p className="text-body-sm">
                  <strong>Note:</strong> After adding environment variables, restart your development server for changes to take effect.
                </p>
              </div>
            </div>
          )}

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

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-body-sm flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong>Domain Restrictions:</strong> Remember to add your production domain to each analytics 
                    platform's allowed domains list to prevent unauthorized tracking on other sites.
                  </span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Site Verification
                </h2>
                <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Verify your site ownership with search engines and other services
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Google Search Console
                  </label>
                  <input
                    type="text"
                    value={settings.verification.google}
                    onChange={(e) => handleInputChange('verification', 'google', e.target.value)}
                    className="input-field"
                    placeholder="google-site-verification=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verification code from Google Search Console (content value only)
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Bing Webmaster Tools
                  </label>
                  <input
                    type="text"
                    value={settings.verification.bing}
                    onChange={(e) => handleInputChange('verification', 'bing', e.target.value)}
                    className="input-field"
                    placeholder="Bing verification code"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verification code from Bing Webmaster Tools
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Yandex Webmaster
                  </label>
                  <input
                    type="text"
                    value={settings.verification.yandex}
                    onChange={(e) => handleInputChange('verification', 'yandex', e.target.value)}
                    className="input-field"
                    placeholder="Yandex verification code"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verification code from Yandex Webmaster
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Pinterest
                  </label>
                  <input
                    type="text"
                    value={settings.verification.pinterest}
                    onChange={(e) => handleInputChange('verification', 'pinterest', e.target.value)}
                    className="input-field"
                    placeholder="Pinterest verification code"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verification code from Pinterest for Business
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
                <p className="text-body-sm">
                  <strong>How to get verification codes:</strong>
                </p>
                <ul className="text-body-sm mt-2 space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li>• <strong>Google:</strong> Search Console → Settings → Ownership verification → HTML tag</li>
                  <li>• <strong>Bing:</strong> Webmaster Tools → Add your site → HTML Meta Tag</li>
                  <li>• <strong>Yandex:</strong> Webmaster → Add site → Meta tag</li>
                  <li>• <strong>Pinterest:</strong> Business account → Settings → Claim → Website → HTML tag</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-body-sm flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong>Important:</strong> Only enter the content value, not the entire meta tag. 
                    For example, if Google gives you <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">&lt;meta name="google-site-verification" content="abc123" /&gt;</code>, 
                    only enter <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">abc123</code>
                  </span>
                </p>
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

          {/* Save Button - Only show for Email, Analytics, Verification, and Admin tabs */}
          {(activeTab === 'email' || activeTab === 'analytics' || activeTab === 'verification' || activeTab === 'admin') && (
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
          )}
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
                🚀 Deployment Notes
              </p>
              <ul className="text-body-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                <li>• Add environment variables to your hosting platform</li>
                <li>• Restart your application after adding env vars</li>
                <li>• Test email sending in production environment</li>
                <li>• Monitor login attempts and session activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}