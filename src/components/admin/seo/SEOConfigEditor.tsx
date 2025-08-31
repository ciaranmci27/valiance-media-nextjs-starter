'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/admin/ui/Toast';
import SocialMediaPreview from './SocialMediaPreview';
import { Switch } from '@/components/admin/ui/Switch';

interface SEOConfigData {
  siteName: string;
  siteUrl: string;
  company: {
    name: string;
    legalName: string;
    foundingDate: string;
    email: string;
    phone: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  openGraph: {
    type: string;
    locale: string;
    siteName: string;
    defaultImage: string;
    imageWidth: number;
    imageHeight: number;
  };
  social: {
    twitter: string;
    linkedin: string;
    github: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
  verification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
    clarityId: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
    nocache: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      noimageindex: boolean;
      'max-video-preview': number;
      'max-image-preview': string;
      'max-snippet': number;
    };
  };
  alternates: {
    canonical: string;
    languages: Record<string, string>;
  };
  sitemap: {
    excludedPages: string[];
    excludedBlogPatterns: string[];
    changeFrequency: {
      homepage: string;
      pages: string;
      blog: string;
      categories: string;
    };
    priority: {
      homepage: number;
      mainPages: number;
      blog: number;
      categories: number;
    };
  };
  schema?: {
    activeTypes: {
      organization: boolean;
      website: boolean;
      localBusiness: boolean;
      person: boolean;
      breadcrumbs: boolean;
    };
    organization: any;
    website: any;
    localBusiness: any;
    person: any;
    breadcrumbs: any;
  };
}

interface SEOConfigEditorProps {
  initialSection?: string;
}

const getDefaultSchema = () => ({
  activeTypes: {
    organization: false,
    website: false,
    localBusiness: false,
    person: false,
    breadcrumbs: false
  },
  organization: {},
  website: {},
  localBusiness: {},
  person: {},
  breadcrumbs: {}
});

export default function SEOConfigEditor({ initialSection = 'basic' }: SEOConfigEditorProps = {}) {
  const [config, setConfig] = useState<SEOConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [showOGPreview, setShowOGPreview] = useState(false);
  const [urlWarnings, setUrlWarnings] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);
  
  // Update active section when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  
  // Validate URL on initial load
  useEffect(() => {
    if (config?.siteUrl) {
      setUrlWarnings(validateUrl(config.siteUrl));
    }
  }, [config?.siteUrl]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seo/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      } else {
        toast.error('Failed to load SEO configuration');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error loading configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate URL and provide warnings
  const validateUrl = (url: string): string[] => {
    const warnings: string[] = [];
    
    if (!url) {
      warnings.push('Site URL is required for proper SEO functionality');
      return warnings;
    }
    
    // Check for common issues
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      warnings.push('URL should start with http:// or https://');
    } else if (url.startsWith('http://') && url !== 'http://localhost:3000') {
      warnings.push('Consider using HTTPS for better SEO and security');
    }
    
    if (url.endsWith('/')) {
      warnings.push('URL should not end with a trailing slash');
    }
    
    if (!url.includes('.') && !url.includes('localhost')) {
      warnings.push('URL appears to be missing a domain extension (e.g., .com, .org)');
    }
    
    // Always provide WWW guidance for production URLs
    if (url.includes('://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      if (url.includes('www.')) {
        warnings.push('Using WWW version - ensure all links and redirects consistently use www.yourdomain.com');
      } else {
        warnings.push('Using non-WWW version - ensure all links and redirects consistently use yourdomain.com (without www)');
      }
    }
    
    if (url === 'https://example.com' || url === 'http://example.com') {
      warnings.push('Please update the example URL to your actual website URL');
    }
    
    // Check for spaces or invalid characters
    if (url.includes(' ')) {
      warnings.push('URL should not contain spaces');
    }
    
    try {
      new URL(url);
    } catch {
      warnings.push('Invalid URL format');
    }
    
    return warnings;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/seo/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.warning) {
          toast.warning(`${data.message}. ${data.warning}`);
        } else {
          toast.success(data.message || 'SEO configuration saved successfully');
        }
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    // Global Site Configuration
    { id: 'basic', label: 'Site Information', icon: '🌐' },
    { id: 'company', label: 'Organization', icon: '🏢' },
    { id: 'schema', label: 'Schema Data', icon: '🏷️' },
    { id: 'templates', label: 'Default SEO', icon: '📝' },
    { id: 'opengraph', label: 'Open Graph', icon: '🔗' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    
    // Technical SEO
    { id: 'robots', label: 'Robots & Crawling', icon: '🤖' },
    { id: 'sitemap', label: 'Sitemap', icon: '🗺️' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>No configuration found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0">
          <div className="sticky top-4">
            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="card p-6">
            {/* Site Information */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Site Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Global site settings that apply across your entire website.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-label block mb-2">Site Name</label>
                    <input
                      type="text"
                      value={config.siteName}
                      onChange={(e) => setConfig({...config, siteName: e.target.value})}
                      className="input-field"
                      placeholder="My Company"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in titles and meta tags</p>
                  </div>
                  
                  <div>
                    <label className="text-label block mb-2">Site URL</label>
                    <input
                      type="url"
                      value={config.siteUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setConfig({...config, siteUrl: newUrl});
                        setUrlWarnings(validateUrl(newUrl));
                      }}
                      className={`input-field ${urlWarnings.length > 0 ? 'border-yellow-500' : ''}`}
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Full URL including protocol (https://)</p>
                    {urlWarnings.length > 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">URL Warnings:</p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                          {urlWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>⚠️</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Organization */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Organization Schema</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Optional structured data about your organization for search engines. Leave empty for personal sites.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={config.company.name}
                      onChange={(e) => setConfig({...config, company: {...config.company, name: e.target.value}})}
                      className="input-field"
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-label block mb-2">Legal Name (Optional)</label>
                    <input
                      type="text"
                      value={config.company.legalName}
                      onChange={(e) => setConfig({...config, company: {...config.company, legalName: e.target.value}})}
                      className="input-field"
                      placeholder="Company Name LLC"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={config.company.email}
                      onChange={(e) => setConfig({...config, company: {...config.company, email: e.target.value}})}
                      className="input-field"
                      placeholder="info@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={config.company.phone}
                      onChange={(e) => setConfig({...config, company: {...config.company, phone: e.target.value}})}
                      className="input-field"
                      placeholder="+1-555-0000"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Founding Date (Optional)</label>
                    <input
                      type="text"
                      value={config.company.foundingDate}
                      onChange={(e) => setConfig({...config, company: {...config.company, foundingDate: e.target.value}})}
                      className="input-field"
                      placeholder="YYYY"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Address</h4>
                  <p className="text-xs text-gray-500 mb-3">Leave blank if you don't want to include address in schema</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-label block mb-2">Street Address (Optional)</label>
                      <input
                        type="text"
                        value={config.company.address.streetAddress}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, streetAddress: e.target.value}}})}
                        className="input-field"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div>
                      <label className="text-label block mb-2">City (Optional)</label>
                      <input
                        type="text"
                        value={config.company.address.addressLocality}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressLocality: e.target.value}}})}
                        className="input-field"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">State/Region (Optional)</label>
                      <input
                        type="text"
                        value={config.company.address.addressRegion}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressRegion: e.target.value}}})}
                        className="input-field"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">Postal Code (Optional)</label>
                      <input
                        type="text"
                        value={config.company.address.postalCode}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, postalCode: e.target.value}}})}
                        className="input-field"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">Country Code (Optional)</label>
                      <input
                        type="text"
                        value={config.company.address.addressCountry}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressCountry: e.target.value}}})}
                        className="input-field"
                        placeholder="US"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default SEO */}
            {activeSection === 'templates' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Default SEO Templates</h3>
                <div className="bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-primary-800 dark:text-primary-400 mb-2">
                    Default SEO templates that automatically apply to new content when custom SEO is not provided.
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-400">
                    <strong>Available variables:</strong> {'{pageName}'} = current page/post/category name | {'{siteName}'} = your site name | {'{siteTagline}'} = your tagline
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Pages Template */}
                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border-medium)' }}>
                    <h4 className="font-semibold mb-3">📄 Page SEO</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-label block mb-2">Title Template</label>
                        <input
                          type="text"
                          value={config.titleTemplate}
                          onChange={(e) => setConfig({...config, titleTemplate: e.target.value})}
                          className="input-field"
                          placeholder="{pageName} | {siteName}"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: About Us | Your Company</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Description Template</label>
                        <textarea
                          value={config.defaultDescription}
                          onChange={(e) => setConfig({...config, defaultDescription: e.target.value})}
                          className="input-field"
                          rows={2}
                          placeholder="Learn about {pageName} at {siteName}. {siteTagline}"
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">{config.defaultDescription.length}/160 characters</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Keywords Template</label>
                        <input
                          type="text"
                          value={config.defaultKeywords.join(', ')}
                          onChange={(e) => setConfig({...config, defaultKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)})}
                          className="input-field"
                          placeholder="{pageName}, {siteName}, your service, your industry"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated, can use variables</p>
                      </div>
                    </div>
                  </div>

                  {/* Blog Posts Template */}
                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border-medium)' }}>
                    <h4 className="font-semibold mb-3">📝 Blog Post SEO</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-label block mb-2">Title Template</label>
                        <input
                          type="text"
                          value={config.titleTemplate}
                          onChange={(e) => setConfig({...config, titleTemplate: e.target.value})}
                          className="input-field"
                          placeholder="{pageName} | Blog | {siteName}"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: How to Start a Business | Blog | Your Company</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Description Template</label>
                        <textarea
                          value={config.defaultDescription}
                          onChange={(e) => setConfig({...config, defaultDescription: e.target.value})}
                          className="input-field"
                          rows={2}
                          placeholder="Read our latest article about {pageName}. Expert insights from {siteName}."
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">Will use post excerpt if available</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Keywords Template</label>
                        <input
                          type="text"
                          value={config.defaultKeywords.join(', ')}
                          onChange={(e) => setConfig({...config, defaultKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)})}
                          className="input-field"
                          placeholder="{pageName}, blog, article, {siteName}"
                        />
                        <p className="text-xs text-gray-500 mt-1">Will combine with post tags if available</p>
                      </div>
                    </div>
                  </div>

                  {/* Blog Categories Template */}
                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-border-medium)' }}>
                    <h4 className="font-semibold mb-3">📁 Blog Category SEO</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-label block mb-2">Title Template</label>
                        <input
                          type="text"
                          value={config.titleTemplate}
                          onChange={(e) => setConfig({...config, titleTemplate: e.target.value})}
                          className="input-field"
                          placeholder="{pageName} Articles | {siteName} Blog"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: Technology Articles | Your Company Blog</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Description Template</label>
                        <textarea
                          value={config.defaultDescription}
                          onChange={(e) => setConfig({...config, defaultDescription: e.target.value})}
                          className="input-field"
                          rows={2}
                          placeholder="Browse all {pageName} articles and resources from {siteName}."
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">Applied to category archive pages</p>
                      </div>
                      <div>
                        <label className="text-label block mb-2">Keywords Template</label>
                        <input
                          type="text"
                          value={config.defaultKeywords.join(', ')}
                          onChange={(e) => setConfig({...config, defaultKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)})}
                          className="input-field"
                          placeholder="{pageName}, category, articles, {siteName} blog"
                        />
                        <p className="text-xs text-gray-500 mt-1">Category-specific keywords</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Open Graph */}
            {activeSection === 'opengraph' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Open Graph Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2">Type</label>
                    <select
                      value={config.openGraph.type}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, type: e.target.value}})}
                      className="input-field"
                    >
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                      <option value="profile">Profile</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Locale</label>
                    <input
                      type="text"
                      value={config.openGraph.locale}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, locale: e.target.value}})}
                      className="input-field"
                      placeholder="en_US"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-label block mb-2">Default Image URL</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={config.openGraph.defaultImage}
                        onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, defaultImage: e.target.value}})}
                        className="input-field"
                        placeholder="/images/og-image.jpg or https://example.com/image.jpg"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Recommended: 1200x630px for best results across all platforms</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showOGPreview}
                            onChange={(e) => setShowOGPreview(e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary/50 dark:focus:ring-primary/50 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Image Width</label>
                    <input
                      type="number"
                      value={config.openGraph.imageWidth}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, imageWidth: parseInt(e.target.value)}})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Image Height</label>
                    <input
                      type="number"
                      value={config.openGraph.imageHeight}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, imageHeight: parseInt(e.target.value)}})}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Social Media Preview - Only show when checkbox is checked */}
                {showOGPreview && config.openGraph.defaultImage && (
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-semibold mb-4">Social Media Preview</h4>
                    <SocialMediaPreview
                      title={config.defaultTitle || config.siteName}
                      description={config.defaultDescription}
                      imageUrl={(() => {
                        if (!config.openGraph.defaultImage) return '';
                        if (config.openGraph.defaultImage.startsWith('http')) {
                          return config.openGraph.defaultImage;
                        }
                        const currentOrigin = typeof window !== 'undefined' 
                          ? window.location.origin 
                          : config.siteUrl;
                        return `${currentOrigin}${config.openGraph.defaultImage}`;
                      })()}
                      url={config.siteUrl}
                      siteName={config.siteName}
                      twitterCard={'summary_large_image' as any}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Social Media */}
            {activeSection === 'social' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Social Media Links</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Optional: Add links to your social media profiles. Leave empty if not applicable.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(config.social).map(([platform, url]) => {
                    // Format platform names for display
                    const platformLabels: Record<string, string> = {
                      twitter: 'X (Twitter)',
                      linkedin: 'LinkedIn',
                      github: 'GitHub',
                      instagram: 'Instagram',
                      facebook: 'Facebook',
                      youtube: 'YouTube'
                    };
                    const label = platformLabels[platform] || platform;
                    
                    return (
                      <div key={platform}>
                        <label className="text-label block mb-2">{label}</label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setConfig({...config, social: {...config.social, [platform]: e.target.value}})}
                          className="input-field"
                          placeholder={`https://${platform === 'twitter' ? 'x' : platform}.com/yourprofile`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schema Data */}
            {activeSection === 'schema' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Schema Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Configure structured data to enhance your search appearance with rich snippets, knowledge panels, and other SERP features.
                </p>

                {/* Schema Type Selection - 2 columns x 3 rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Organization */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Organization</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Company info, logo, social profiles</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.organization || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          activeTypes: { 
                            ...getDefaultSchema().activeTypes,
                            ...(config.schema?.activeTypes || {}), 
                            organization: checked 
                          }
                        }
                      })}
                    />
                  </div>

                  {/* LocalBusiness */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium">LocalBusiness</span>
                      <p className="text-xs text-gray-500 mt-1">Physical location, hours, local SEO</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.localBusiness || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          activeTypes: { 
                            ...getDefaultSchema().activeTypes,
                            ...(config.schema?.activeTypes || {}), 
                            localBusiness: checked 
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Person */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium">Person</span>
                      <p className="text-xs text-gray-500 mt-1">Personal brand, author profiles</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.person || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          activeTypes: { 
                            ...getDefaultSchema().activeTypes,
                            ...(config.schema?.activeTypes || {}), 
                            person: checked 
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Contact Point - Separated from Organization */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Contact Point</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Customer service & support info</p>
                    </div>
                    <Switch
                      checked={!!(config.schema?.activeTypes?.organization && config.schema?.organization?.contactPoint?.enabled !== false)}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          organization: {
                            ...(config.schema?.organization || {}),
                            contactPoint: {
                              ...(config.schema?.organization?.contactPoint || {}),
                              enabled: checked
                            }
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Breadcrumbs */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Breadcrumbs</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Navigation path in search results</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.breadcrumbs || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          activeTypes: { 
                            ...getDefaultSchema().activeTypes,
                            ...(config.schema?.activeTypes || {}), 
                            breadcrumbs: checked 
                          }
                        }
                      })}
                    />
                  </div>

                  {/* WebSite */}
                  <div className="card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">WebSite</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Site search box in Google results</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.website || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
                          ...getDefaultSchema(),
                          ...getDefaultSchema(),
                          ...(config.schema || {}),
                          activeTypes: { 
                            ...getDefaultSchema().activeTypes,
                            ...(config.schema?.activeTypes || {}), 
                            website: checked 
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Organization Schema */}
                {config.schema?.activeTypes?.organization && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">🏢 Organization Schema</h4>
                    
                    {/* Info box about auto-population */}
                    <div className="bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-800 dark:text-blue-400">
                        ℹ️ Basic organization info (name, address, phone, email) is automatically pulled from the <strong>Organization</strong> tab.
                        Configure additional schema-specific settings below.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Schema-specific fields only */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-label block mb-2">Organization Type</label>
                          <select
                            value={config.schema?.organization?.type || 'Organization'}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                organization: { ...(config.schema?.organization || {}), type: e.target.value }
                              }
                            })}
                            className="input-field"
                          >
                            <option value="Organization">Organization</option>
                            <option value="Corporation">Corporation</option>
                            <option value="EducationalOrganization">Educational Organization</option>
                            <option value="GovernmentOrganization">Government Organization</option>
                            <option value="NGO">NGO</option>
                            <option value="SportsOrganization">Sports Organization</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-label block mb-2">Logo URL for Schema</label>
                          <input
                            type="text"
                            value={config.schema?.organization?.logo?.url || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                organization: {
                                  ...(config.schema?.organization || {}),
                                  logo: { ...(config.schema?.organization?.logo || {}), url: e.target.value }
                                }
                              }
                            })}
                            className="input-field"
                            placeholder="/logos/logo.png or https://..."
                          />
                          <p className="text-xs text-gray-500 mt-1">Square logo recommended (600x600px)</p>
                        </div>
                      </div>

                      {/* SameAs URLs */}
                      <div>
                        <label className="text-label block mb-2">Additional Profile URLs (SameAs)</label>
                        <textarea
                          value={config.schema?.organization?.sameAs?.join('\n') || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                sameAs: e.target.value.split('\n').filter(Boolean)
                              }
                            }
                          })}
                          className="input-field"
                          rows={3}
                          placeholder="https://wikipedia.org/wiki/YourCompany
https://crunchbase.com/organization/yourcompany
https://www.wikidata.org/wiki/Q12345"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Social media URLs from the <strong>Social Media</strong> tab are included automatically. 
                          Add additional profiles here (Wikipedia, Crunchbase, etc.)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Point Schema - Separate from Organization */}
                {config.schema?.activeTypes?.organization && config.schema?.organization?.contactPoint?.enabled !== false && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">☎️ Contact Point</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Define customer service contact information for search results and knowledge panels.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-label block mb-2">Contact Type</label>
                        <select
                          value={config.schema?.organization?.contactPoint?.contactType || 'customer service'}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  contactType: e.target.value
                                }
                              }
                            }
                          })}
                          className="input-field"
                        >
                          <option value="customer service">Customer Service</option>
                          <option value="technical support">Technical Support</option>
                          <option value="sales">Sales</option>
                          <option value="billing support">Billing Support</option>
                          <option value="emergency">Emergency</option>
                          <option value="reservations">Reservations</option>
                          <option value="credit card support">Credit Card Support</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Support Phone</label>
                        <input
                          type="tel"
                          value={config.schema?.organization?.contactPoint?.telephone || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  telephone: e.target.value
                                }
                              }
                            }
                          })}
                          className="input-field"
                          placeholder="+1-800-SUPPORT"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dedicated support line (if different from main phone)</p>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Service Hours</label>
                        <select
                          value={config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length === 7 ? 'everyday' : 
                                 config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length === 0 ? '24/7' : 'weekdays'}
                          onChange={(e) => {
                            let dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                            if (e.target.value === 'everyday') {
                              dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                            } else if (e.target.value === '24/7') {
                              dayOfWeek = [];
                            }
                            setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                organization: {
                                  ...(config.schema?.organization || {}),
                                  contactPoint: {
                                    ...(config.schema?.organization?.contactPoint || {}),
                                    hoursAvailable: {
                                      ...(config.schema?.organization?.contactPoint?.hoursAvailable || {}),
                                      dayOfWeek
                                    }
                                  }
                                }
                              }
                            });
                          }}
                          className="input-field"
                        >
                          <option value="weekdays">Weekdays Only</option>
                          <option value="everyday">Every Day</option>
                          <option value="24/7">24/7 Support</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Area Served</label>
                        <input
                          type="text"
                          value={config.schema?.organization?.contactPoint?.areaServed || 'US'}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  areaServed: e.target.value
                                }
                              }
                            }
                          })}
                          className="input-field"
                          placeholder="US, Global, EU, etc."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-label block mb-2">Available Languages</label>
                        <input
                          type="text"
                          value={config.schema?.organization?.contactPoint?.availableLanguage?.join(', ') || 'English'}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  availableLanguage: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                }
                              }
                            }
                          })}
                          className="input-field"
                          placeholder="English, Spanish, French, Mandarin"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list of supported languages</p>
                      </div>

                      {/* Business Hours if not 24/7 */}
                      {config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length !== 0 && (
                        <>
                          <div>
                            <label className="text-label block mb-2">Opening Time</label>
                            <input
                              type="time"
                              value={config.schema?.organization?.contactPoint?.hoursAvailable?.opens || '09:00'}
                              onChange={(e) => setConfig({
                                ...config,
                                schema: {
                                  ...getDefaultSchema(),
                          ...(config.schema || {}),
                                  organization: {
                                    ...(config.schema?.organization || {}),
                                    contactPoint: {
                                      ...(config.schema?.organization?.contactPoint || {}),
                                      hoursAvailable: {
                                        ...(config.schema?.organization?.contactPoint?.hoursAvailable || {}),
                                        opens: e.target.value
                                      }
                                    }
                                  }
                                }
                              })}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="text-label block mb-2">Closing Time</label>
                            <input
                              type="time"
                              value={config.schema?.organization?.contactPoint?.hoursAvailable?.closes || '17:00'}
                              onChange={(e) => setConfig({
                                ...config,
                                schema: {
                                  ...getDefaultSchema(),
                          ...(config.schema || {}),
                                  organization: {
                                    ...(config.schema?.organization || {}),
                                    contactPoint: {
                                      ...(config.schema?.organization?.contactPoint || {}),
                                      hoursAvailable: {
                                        ...(config.schema?.organization?.contactPoint?.hoursAvailable || {}),
                                        closes: e.target.value
                                      }
                                    }
                                  }
                                }
                              })}
                              className="input-field"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Website Schema */}
                {config.schema?.activeTypes?.website && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">🌐 WebSite Schema</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-label block mb-2">Site Search URL Template</label>
                        <input
                          type="text"
                          value={config.schema?.website?.potentialAction?.searchUrlTemplate || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              website: {
                                ...(config.schema?.website || {}),
                                potentialAction: {
                                  ...(config.schema?.website?.potentialAction || {}),
                                  searchUrlTemplate: e.target.value
                                }
                              }
                            }
                          })}
                          className="input-field"
                          placeholder="https://example.com/search?q={search_term_string}"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This enables the Google Sitelinks search box. Use {'{search_term_string}'} as the query placeholder.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.schema?.website?.potentialAction?.enabled || false}
                          onChange={(checked) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              website: {
                                ...(config.schema?.website || {}),
                                potentialAction: {
                                  ...(config.schema?.website?.potentialAction || {}),
                                  enabled: checked
                                }
                              }
                            }
                          })}
                        />
                        <span className="text-sm">Enable site search box in Google results</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* LocalBusiness Schema */}
                {config.schema?.activeTypes?.localBusiness && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">📍 LocalBusiness Schema</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-label block mb-2">Business Type</label>
                          <select
                            value={config.schema?.localBusiness?.type || 'LocalBusiness'}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                localBusiness: { ...(config.schema?.localBusiness || {}), type: e.target.value }
                              }
                            })}
                            className="input-field"
                          >
                            <option value="LocalBusiness">Local Business (General)</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Store">Store</option>
                            <option value="Hotel">Hotel</option>
                            <option value="ProfessionalService">Professional Service</option>
                            <option value="MedicalBusiness">Medical Business</option>
                            <option value="AutomotiveBusiness">Automotive Business</option>
                            <option value="FinancialService">Financial Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-label block mb-2">Price Range</label>
                          <select
                            value={config.schema?.localBusiness?.priceRange || '$$'}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                localBusiness: { ...(config.schema?.localBusiness || {}), priceRange: e.target.value }
                              }
                            })}
                            className="input-field"
                          >
                            <option value="$">$ - Inexpensive</option>
                            <option value="$$">$$ - Moderate</option>
                            <option value="$$$">$$$ - Expensive</option>
                            <option value="$$$$">$$$$ - Very Expensive</option>
                          </select>
                        </div>
                      </div>

                      {/* Geo Coordinates */}
                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">Location Coordinates</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-label block mb-2">Latitude</label>
                            <input
                              type="text"
                              value={config.schema?.localBusiness?.geo?.latitude || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                schema: {
                                  ...getDefaultSchema(),
                          ...(config.schema || {}),
                                  localBusiness: {
                                    ...(config.schema?.localBusiness || {}),
                                    geo: { ...(config.schema?.localBusiness?.geo || {}), latitude: e.target.value }
                                  }
                                }
                              })}
                              className="input-field"
                              placeholder="40.7128"
                            />
                          </div>

                          <div>
                            <label className="text-label block mb-2">Longitude</label>
                            <input
                              type="text"
                              value={config.schema?.localBusiness?.geo?.longitude || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                schema: {
                                  ...getDefaultSchema(),
                          ...(config.schema || {}),
                                  localBusiness: {
                                    ...(config.schema?.localBusiness || {}),
                                    geo: { ...(config.schema?.localBusiness?.geo || {}), longitude: e.target.value }
                                  }
                                }
                              })}
                              className="input-field"
                              placeholder="-74.0060"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Get coordinates from Google Maps by right-clicking on your location
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Person Schema */}
                {config.schema?.activeTypes?.person && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">👤 Person Schema</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-label block mb-2">Full Name</label>
                          <input
                            type="text"
                            value={config.schema?.person?.name || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                person: { ...(config.schema?.person || {}), name: e.target.value }
                              }
                            })}
                            className="input-field"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="text-label block mb-2">Job Title</label>
                          <input
                            type="text"
                            value={config.schema?.person?.jobTitle || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                person: { ...(config.schema?.person || {}), jobTitle: e.target.value }
                              }
                            })}
                            className="input-field"
                            placeholder="CEO & Founder"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Expertise/Knowledge Areas</label>
                        <input
                          type="text"
                          value={config.schema?.person?.knowsAbout?.join(', ') || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              person: {
                                ...(config.schema?.person || {}),
                                knowsAbout: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            }
                          })}
                          className="input-field"
                          placeholder="Web Development, SEO, Marketing, Business Strategy"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list of expertise areas</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Breadcrumbs Configuration */}
                {config.schema?.activeTypes?.breadcrumbs && (
                  <div className="card p-6">
                    <h4 className="text-h4 mb-4">🍞 Breadcrumbs Configuration</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-label block mb-2">Home Label</label>
                          <input
                            type="text"
                            value={config.schema?.breadcrumbs?.homeLabel || 'Home'}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                breadcrumbs: { ...(config.schema?.breadcrumbs || {}), homeLabel: e.target.value }
                              }
                            })}
                            className="input-field"
                            placeholder="Home"
                          />
                        </div>

                        <div>
                          <label className="text-label block mb-2">Separator</label>
                          <select
                            value={config.schema?.breadcrumbs?.separator || '›'}
                            onChange={(e) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                          ...(config.schema || {}),
                                breadcrumbs: { ...(config.schema?.breadcrumbs || {}), separator: e.target.value }
                              }
                            })}
                            className="input-field"
                          >
                            <option value="›">› (Chevron)</option>
                            <option value="/">/  (Slash)</option>
                            <option value=">">{'>'} (Greater Than)</option>
                            <option value="→">→ (Arrow)</option>
                            <option value="|">| (Pipe)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.schema?.breadcrumbs?.showCurrent || true}
                          onChange={(checked) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              breadcrumbs: { ...(config.schema?.breadcrumbs || {}), showCurrent: checked }
                            }
                          })}
                        />
                        <span className="text-sm">Show current page in breadcrumbs</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Information */}
                <div className="p-4 bg-primary-50 dark:bg-primary-50 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    💡 <strong>Tip:</strong> After configuring schema, validate your structured data using Google's{' '}
                    <a 
                      href="https://search.google.com/test/rich-results" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Rich Results Test
                    </a>{' '}
                    and the{' '}
                    <a 
                      href="https://validator.schema.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Schema.org Validator
                    </a>.
                  </p>
                </div>
              </div>
            )}

            {/* Robots & Crawling */}
            {activeSection === 'robots' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Robots & Crawling Settings</h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4">Default Robot Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium">Index</span>
                        <p className="text-xs text-gray-500 mt-1">Allow search engines to index this site</p>
                      </div>
                      <Switch
                        checked={config.robots.index}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, index: checked}})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                      <div>
                        <span className="text-sm font-medium">Follow</span>
                        <p className="text-xs text-gray-500 mt-1">Allow search engines to follow links</p>
                      </div>
                      <Switch
                        checked={config.robots.follow}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, follow: checked}})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                      <div>
                        <span className="text-sm font-medium">No Cache</span>
                        <p className="text-xs text-gray-500 mt-1">Prevent search engines from caching</p>
                      </div>
                      <Switch
                        checked={config.robots.nocache}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, nocache: checked}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4">GoogleBot Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium">Index</span>
                        <p className="text-xs text-gray-500 mt-1">Allow GoogleBot to index pages</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.index}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, index: checked}}})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                      <div>
                        <span className="text-sm font-medium">Follow</span>
                        <p className="text-xs text-gray-500 mt-1">Allow GoogleBot to follow links</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.follow}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, follow: checked}}})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                      <div>
                        <span className="text-sm font-medium">No Image Index</span>
                        <p className="text-xs text-gray-500 mt-1">Prevent GoogleBot from indexing images</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.noimageindex}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, noimageindex: checked}}})}
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">Max Image Preview</label>
                      <select
                        value={config.robots.googleBot['max-image-preview']}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, 'max-image-preview': e.target.value}}})}
                        className="input-field"
                      >
                        <option value="none">None</option>
                        <option value="standard">Standard</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {activeSection === 'languages' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Language & Region Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Optional: Configure for multi-language sites. Leave empty for single-language sites.
                </p>
                
                <div>
                  <label className="text-label block mb-2">Canonical URL (Optional)</label>
                  <input
                    type="url"
                    value={config.alternates.canonical}
                    onChange={(e) => setConfig({...config, alternates: {...config.alternates, canonical: e.target.value}})}
                    className="input-field"
                    placeholder="https://yoursite.com"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Language Versions</h4>
                  <div className="space-y-3">
                    {Object.entries(config.alternates.languages).map(([lang, url]) => (
                      <div key={lang} className="flex gap-2 items-start">
                        <div className="w-32 shrink-0">
                          <input
                            type="text"
                            value={lang}
                            className="input-field w-full"
                            placeholder="en-US"
                            readOnly
                          />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newLanguages = { ...config.alternates.languages };
                            newLanguages[lang] = e.target.value;
                            setConfig({ ...config, alternates: { ...config.alternates, languages: newLanguages } });
                          }}
                          className="input-field flex-1"
                          placeholder="https://example.com"
                        />
                        <button
                          onClick={() => {
                            const newLanguages = { ...config.alternates.languages };
                            delete newLanguages[lang];
                            setConfig({ ...config, alternates: { ...config.alternates, languages: newLanguages } });
                          }}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        const langCode = prompt('Enter language code (e.g., es-ES):');
                        if (langCode) {
                          setConfig({
                            ...config,
                            alternates: {
                              ...config.alternates,
                              languages: {
                                ...config.alternates.languages,
                                [langCode]: ''
                              }
                            }
                          });
                        }
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      + Add Language
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sitemap */}
            {activeSection === 'sitemap' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Sitemap Configuration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Control how your sitemap.xml is generated and what content is included.
                </p>
                
                <div>
                  <h4 className="font-semibold mb-3">Excluded Pages</h4>
                  <div className="space-y-2">
                    {config.sitemap.excludedPages.map((page, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={page}
                          onChange={(e) => {
                            const newPages = [...config.sitemap.excludedPages];
                            newPages[index] = e.target.value;
                            setConfig({...config, sitemap: {...config.sitemap, excludedPages: newPages}});
                          }}
                          className="input-field flex-1"
                          placeholder="/path/to/page"
                        />
                        <button
                          onClick={() => {
                            const newPages = config.sitemap.excludedPages.filter((_, i) => i !== index);
                            setConfig({...config, sitemap: {...config.sitemap, excludedPages: newPages}});
                          }}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setConfig({
                          ...config,
                          sitemap: {
                            ...config.sitemap,
                            excludedPages: [...config.sitemap.excludedPages, '']
                          }
                        });
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      + Add Excluded Page
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Excluded Blog Patterns</h4>
                  <div className="space-y-2">
                    {config.sitemap.excludedBlogPatterns.map((pattern, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={pattern}
                          onChange={(e) => {
                            const newPatterns = [...config.sitemap.excludedBlogPatterns];
                            newPatterns[index] = e.target.value;
                            setConfig({...config, sitemap: {...config.sitemap, excludedBlogPatterns: newPatterns}});
                          }}
                          className="input-field flex-1"
                          placeholder="example"
                        />
                        <button
                          onClick={() => {
                            const newPatterns = config.sitemap.excludedBlogPatterns.filter((_, i) => i !== index);
                            setConfig({...config, sitemap: {...config.sitemap, excludedBlogPatterns: newPatterns}});
                          }}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setConfig({
                          ...config,
                          sitemap: {
                            ...config.sitemap,
                            excludedBlogPatterns: [...config.sitemap.excludedBlogPatterns, '']
                          }
                        });
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      + Add Pattern
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Change Frequency</h4>
                    <div className="space-y-3">
                      {Object.entries(config.sitemap.changeFrequency).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-label block mb-1 capitalize">{key}</label>
                          <select
                            value={value}
                            onChange={(e) => setConfig({
                              ...config,
                              sitemap: {
                                ...config.sitemap,
                                changeFrequency: {
                                  ...config.sitemap.changeFrequency,
                                  [key]: e.target.value
                                }
                              }
                            })}
                            className="input-field"
                          >
                            <option value="always">Always</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="never">Never</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Priority</h4>
                    <div className="space-y-3">
                      {Object.entries(config.sitemap.priority).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-label block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={value}
                            onChange={(e) => setConfig({
                              ...config,
                              sitemap: {
                                ...config.sitemap,
                                priority: {
                                  ...config.sitemap.priority,
                                  [key]: parseFloat(e.target.value)
                                }
                              }
                            })}
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={fetchConfig}
              className="btn btn-secondary"
              disabled={isSaving}
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}