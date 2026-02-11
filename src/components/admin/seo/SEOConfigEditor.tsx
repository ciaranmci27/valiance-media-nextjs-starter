'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/admin/ui/Toast';
import SocialMediaPreview from './SocialMediaPreview';
import { Switch } from '@/components/admin/ui/Switch';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';
import { Select } from '@/components/admin/ui/Select';

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
    { id: 'basic', label: 'Site Information' },
    { id: 'company', label: 'Organization' },
    { id: 'schema', label: 'Schema Data' },
    { id: 'templates', label: 'Meta Templates' },
    { id: 'opengraph', label: 'Open Graph' },
    { id: 'social', label: 'Social Media' },
    { id: 'robots', label: 'Robots' },
    { id: 'sitemap', label: 'Sitemap' },
    { id: 'languages', label: 'Languages' },
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
    <div className="seo-editor-layout">
      {/* Content Area */}
      <div className="flex-1">
        <div className="dash-card">
            {/* Site Information */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Site Information</h4>
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
                    <p className="form-hint">Used in titles and meta tags</p>
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
                      className="input-field"
                      style={urlWarnings.length > 0 ? { borderColor: 'var(--color-warning)' } : undefined}
                      placeholder="https://example.com"
                    />
                    <p className="form-hint">Full URL including protocol (https://)</p>
                    {urlWarnings.length > 0 && (
                      <AdminBanner variant="warning">
                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>URL Warnings:</p>
                        <ul className="space-y-1">
                          {urlWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </AdminBanner>
                    )}
                  </div>

                </div>
                </div>
              </div>
            )}

            {/* Organization */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Company Details</h4>
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

                </div>

                <div>
                  <h4 className="text-h4 mb-3">Address</h4>
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
                  {/* Pages Template */}
                  <div>
                    <h4 className="text-h4 mb-3">Page SEO</h4>
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
                        <p className="form-hint">Example: About Us | {config.siteName}</p>
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
                        <p className="form-hint">{config.defaultDescription.length}/160 characters</p>
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
                        <p className="form-hint">Comma-separated, can use variables</p>
                      </div>
                    </div>
                  </div>

                  {/* Blog Posts Template */}
                  <div>
                    <h4 className="text-h4 mb-3">Blog Post SEO</h4>
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
                        <p className="form-hint">Example: How to Start a Business | Blog | {config.siteName}</p>
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
                        <p className="form-hint">Will use post excerpt if available</p>
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
                        <p className="form-hint">Will combine with post tags if available</p>
                      </div>
                    </div>
                  </div>

                  {/* Blog Categories Template */}
                  <div>
                    <h4 className="text-h4 mb-3">Blog Category SEO</h4>
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
                        <p className="form-hint">Example: Technology Articles | {config.siteName} Blog</p>
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
                        <p className="form-hint">Applied to category archive pages</p>
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
                        <p className="form-hint">Category-specific keywords</p>
                      </div>
                    </div>
                  </div>

                <AdminBanner>
                  <p style={{ marginBottom: '4px' }}>
                    Default SEO templates that automatically apply to new content when custom SEO is not provided.
                  </p>
                  <p>
                    <strong>Available variables:</strong> {'{pageName}'} = current page/post/category name | {'{siteName}'} = your site name | {'{siteTagline}'} = your tagline
                  </p>
                </AdminBanner>
              </div>
            )}

            {/* Open Graph */}
            {activeSection === 'opengraph' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Open Graph Default</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    value={config.openGraph.type}
                    onChange={(value) => setConfig({...config, openGraph: {...config.openGraph, type: value}})}
                    options={[
                      { value: 'website', label: 'Website' },
                      { value: 'article', label: 'Article' },
                      { value: 'product', label: 'Product' },
                      { value: 'profile', label: 'Profile' },
                    ]}
                  />

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
                        <p className="form-hint">Recommended: 1200x630px for best results across all platforms</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showOGPreview}
                            onChange={(e) => setShowOGPreview(e.target.checked)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="form-hint" style={{ marginTop: 0 }}>Show preview</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Image Width</label>
                    <input
                      type="number"
                      value={config.openGraph.imageWidth}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, imageWidth: parseInt(e.target.value) || 0}})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Image Height</label>
                    <input
                      type="number"
                      value={config.openGraph.imageHeight}
                      onChange={(e) => setConfig({...config, openGraph: {...config.openGraph, imageHeight: parseInt(e.target.value) || 0}})}
                      className="input-field"
                    />
                  </div>
                </div>
                </div>

                {/* Social Media Preview - Only show when checkbox is checked */}
                {showOGPreview && config.openGraph.defaultImage && (
                  <div>
                    <h4 className="text-h4 mb-3">Social Media Preview</h4>
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
                <div>
                  <h4 className="text-h4 mb-3">Social Media Links</h4>
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
              </div>
            )}

            {/* Schema Data */}
            {activeSection === 'schema' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Active Schema Types</h4>

                  {/* Schema Type Selection - 2 columns x 3 rows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Organization */}
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Organization</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="form-hint">Company info, logo, social profiles</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.organization || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium">LocalBusiness</span>
                      <p className="form-hint">Physical location, hours, local SEO</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.localBusiness || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium">Person</span>
                      <p className="form-hint">Personal brand, author profiles</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.person || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Contact Point</span>
                      </div>
                      <p className="form-hint">Customer service & support info</p>
                    </div>
                    <Switch
                      checked={!!(config.schema?.activeTypes?.organization && config.schema?.organization?.contactPoint?.enabled !== false)}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Breadcrumbs</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="form-hint">Navigation path in search results</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.breadcrumbs || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                  <div className="dash-card flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">WebSite</span>
                        <span className="badge badge-primary text-xs">Recommended</span>
                      </div>
                      <p className="form-hint">Site search box in Google results</p>
                    </div>
                    <Switch
                      checked={config.schema?.activeTypes?.website || false}
                      onChange={(checked) => setConfig({
                        ...config,
                        schema: {
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
                </div>

                {/* Organization Schema */}
                {config.schema?.activeTypes?.organization && (
                  <div>
                    <h4 className="text-h4 mb-3">Organization Schema</h4>
                    
                    <div className="space-y-4">
                      {/* Schema-specific fields only */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Organization Type"
                          value={config.schema?.organization?.type || 'Organization'}
                          onChange={(value) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                              ...(config.schema || {}),
                              organization: { ...(config.schema?.organization || {}), type: value }
                            }
                          })}
                          options={[
                            { value: 'Organization', label: 'Organization' },
                            { value: 'Corporation', label: 'Corporation' },
                            { value: 'EducationalOrganization', label: 'Educational Organization' },
                            { value: 'GovernmentOrganization', label: 'Government Organization' },
                            { value: 'NGO', label: 'NGO' },
                            { value: 'SportsOrganization', label: 'Sports Organization' },
                          ]}
                        />

                        <div>
                          <label className="text-label block mb-2">Logo URL for Schema <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400, marginLeft: '8px' }}>(600x600px)</span></label>
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
                        <p className="form-hint">
                          Social media URLs from the <strong>Social Media</strong> tab are included automatically.
                          Add additional profiles here (Wikipedia, Crunchbase, etc.)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Point Schema - Separate from Organization */}
                {config.schema?.activeTypes?.organization && config.schema?.organization?.contactPoint?.enabled !== false && (
                  <div>
                    <h4 className="text-h4 mb-3">Contact Point</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Contact Type"
                        value={config.schema?.organization?.contactPoint?.contactType || 'customer service'}
                        onChange={(value) => setConfig({
                          ...config,
                          schema: {
                            ...getDefaultSchema(),
                            ...(config.schema || {}),
                            organization: {
                              ...(config.schema?.organization || {}),
                              contactPoint: {
                                ...(config.schema?.organization?.contactPoint || {}),
                                contactType: value
                              }
                            }
                          }
                        })}
                        options={[
                          { value: 'customer service', label: 'Customer Service' },
                          { value: 'technical support', label: 'Technical Support' },
                          { value: 'sales', label: 'Sales' },
                          { value: 'billing support', label: 'Billing Support' },
                          { value: 'emergency', label: 'Emergency' },
                          { value: 'reservations', label: 'Reservations' },
                          { value: 'credit card support', label: 'Credit Card Support' },
                        ]}
                      />

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
                        <p className="form-hint">Dedicated support line (if different from main phone)</p>
                      </div>

                      <Select
                        label="Service Hours"
                        value={config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length === 7 ? 'everyday' :
                               config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length === 0 ? '24/7' : 'weekdays'}
                        onChange={(value) => {
                          let dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                          if (value === 'everyday') {
                            dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                          } else if (value === '24/7') {
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
                        options={[
                          { value: 'weekdays', label: 'Weekdays Only' },
                          { value: 'everyday', label: 'Every Day' },
                          { value: '24/7', label: '24/7 Support' },
                        ]}
                      />

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
                        <p className="form-hint">Comma-separated list of supported languages</p>
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
                  <div>
                    <h4 className="text-h4 mb-3">WebSite Schema</h4>
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
                        <p className="form-hint">
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
                  <div>
                    <h4 className="text-h4 mb-3">LocalBusiness Schema</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Business Type"
                          value={config.schema?.localBusiness?.type || 'LocalBusiness'}
                          onChange={(value) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                              ...(config.schema || {}),
                              localBusiness: { ...(config.schema?.localBusiness || {}), type: value }
                            }
                          })}
                          options={[
                            { value: 'LocalBusiness', label: 'Local Business (General)' },
                            { value: 'Restaurant', label: 'Restaurant' },
                            { value: 'Store', label: 'Store' },
                            { value: 'Hotel', label: 'Hotel' },
                            { value: 'ProfessionalService', label: 'Professional Service' },
                            { value: 'MedicalBusiness', label: 'Medical Business' },
                            { value: 'AutomotiveBusiness', label: 'Automotive Business' },
                            { value: 'FinancialService', label: 'Financial Service' },
                          ]}
                        />

                        <Select
                          label="Price Range"
                          value={config.schema?.localBusiness?.priceRange || '$$'}
                          onChange={(value) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                              ...(config.schema || {}),
                              localBusiness: { ...(config.schema?.localBusiness || {}), priceRange: value }
                            }
                          })}
                          options={[
                            { value: '$', label: '$ - Inexpensive' },
                            { value: '$$', label: '$$ - Moderate' },
                            { value: '$$$', label: '$$$ - Expensive' },
                            { value: '$$$$', label: '$$$$ - Very Expensive' },
                          ]}
                        />
                      </div>

                      {/* Geo Coordinates */}
                      <div>
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
                        <p className="form-hint">
                          Get coordinates from Google Maps by right-clicking on your location
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Person Schema */}
                {config.schema?.activeTypes?.person && (
                  <div>
                    <h4 className="text-h4 mb-3">Person Schema</h4>
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
                        <p className="form-hint">Comma-separated list of expertise areas</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Breadcrumbs Configuration */}
                {config.schema?.activeTypes?.breadcrumbs && (
                  <div>
                    <h4 className="text-h4 mb-3">Breadcrumbs Configuration</h4>
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

                        <Select
                          label="Separator"
                          value={config.schema?.breadcrumbs?.separator || '›'}
                          onChange={(value) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                              ...(config.schema || {}),
                              breadcrumbs: { ...(config.schema?.breadcrumbs || {}), separator: value }
                            }
                          })}
                          options={[
                            { value: '›', label: '› (Chevron)' },
                            { value: '/', label: '/ (Slash)' },
                            { value: '>', label: '> (Greater Than)' },
                            { value: '→', label: '→ (Arrow)' },
                            { value: '|', label: '| (Pipe)' },
                          ]}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.schema?.breadcrumbs?.showCurrent ?? true}
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

                <AdminBanner>
                  <p>
                    <strong>Tip:</strong> After configuring schema, validate your structured data using Google&apos;s{' '}
                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rich Results Test
                    </a>{' '}
                    and the{' '}
                    <a
                      href="https://validator.schema.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schema.org Validator
                    </a>.
                  </p>
                </AdminBanner>
              </div>
            )}

            {/* Robots */}
            {activeSection === 'robots' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Default Robot Settings</h4>
                  <div>
                    <div className="robots-toggle-row">
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Index</span>
                        <p className="form-hint">Allow search engines to index this site</p>
                      </div>
                      <Switch
                        checked={config.robots.index}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, index: checked}})}
                      />
                    </div>

                    <div className="robots-toggle-row">
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Follow</span>
                        <p className="form-hint">Allow search engines to follow links</p>
                      </div>
                      <Switch
                        checked={config.robots.follow}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, follow: checked}})}
                      />
                    </div>

                    <div className="robots-toggle-row" style={{ borderBottom: 'none' }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No Cache</span>
                        <p className="form-hint">Prevent search engines from caching</p>
                      </div>
                      <Switch
                        checked={config.robots.nocache}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, nocache: checked}})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-h4 mb-3">GoogleBot Settings</h4>
                  <div>
                    <div className="robots-toggle-row">
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Index</span>
                        <p className="form-hint">Allow GoogleBot to index pages</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.index}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, index: checked}}})}
                      />
                    </div>

                    <div className="robots-toggle-row">
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Follow</span>
                        <p className="form-hint">Allow GoogleBot to follow links</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.follow}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, follow: checked}}})}
                      />
                    </div>

                    <div className="robots-toggle-row">
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No Image Index</span>
                        <p className="form-hint">Prevent GoogleBot from indexing images</p>
                      </div>
                      <Switch
                        checked={config.robots.googleBot.noimageindex}
                        onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, noimageindex: checked}}})}
                      />
                    </div>

                    <div className="robots-toggle-row" style={{ borderBottom: 'none' }}>
                      <div className="flex-1" style={{ maxWidth: '280px' }}>
                        <Select
                          label="Max Image Preview"
                          value={config.robots.googleBot['max-image-preview']}
                          onChange={(value) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, 'max-image-preview': value}}})}
                          options={[
                            { value: 'none', label: 'None' },
                            { value: 'standard', label: 'Standard' },
                            { value: 'large', label: 'Large' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {activeSection === 'languages' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Canonical URL</h4>
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
                </div>

                <div>
                  <h4 className="text-h4 mb-3">Language Versions</h4>
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
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const newLanguages = { ...config.alternates.languages };
                            delete newLanguages[lang];
                            setConfig({ ...config, alternates: { ...config.alternates, languages: newLanguages } });
                          }}
                        >
                          Remove
                        </AdminButton>
                      </div>
                    ))}
                    
                    <AdminButton
                      variant="secondary"
                      size="sm"
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
                    >
                      + Add Language
                    </AdminButton>
                  </div>
                </div>
              </div>
            )}

            {/* Sitemap */}
            {activeSection === 'sitemap' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Excluded Pages</h4>
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
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const newPages = config.sitemap.excludedPages.filter((_, i) => i !== index);
                            setConfig({...config, sitemap: {...config.sitemap, excludedPages: newPages}});
                          }}
                        >
                          Remove
                        </AdminButton>
                      </div>
                    ))}
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setConfig({
                          ...config,
                          sitemap: {
                            ...config.sitemap,
                            excludedPages: [...config.sitemap.excludedPages, '']
                          }
                        });
                      }}
                    >
                      + Add Excluded Page
                    </AdminButton>
                  </div>
                </div>

                <div>
                  <h4 className="text-h4 mb-3">Excluded Blog Patterns</h4>
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
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const newPatterns = config.sitemap.excludedBlogPatterns.filter((_, i) => i !== index);
                            setConfig({...config, sitemap: {...config.sitemap, excludedBlogPatterns: newPatterns}});
                          }}
                        >
                          Remove
                        </AdminButton>
                      </div>
                    ))}
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setConfig({
                          ...config,
                          sitemap: {
                            ...config.sitemap,
                            excludedBlogPatterns: [...config.sitemap.excludedBlogPatterns, '']
                          }
                        });
                      }}
                    >
                      + Add Pattern
                    </AdminButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-h4 mb-3">Change Frequency</h4>
                    <div className="space-y-3">
                      {Object.entries(config.sitemap.changeFrequency).map(([key, value]) => (
                        <Select
                          key={key}
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={value}
                          onChange={(val) => setConfig({
                            ...config,
                            sitemap: {
                              ...config.sitemap,
                              changeFrequency: {
                                ...config.sitemap.changeFrequency,
                                [key]: val
                              }
                            }
                          })}
                          options={[
                            { value: 'always', label: 'Always' },
                            { value: 'hourly', label: 'Hourly' },
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'monthly', label: 'Monthly' },
                            { value: 'yearly', label: 'Yearly' },
                            { value: 'never', label: 'Never' },
                          ]}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-h4 mb-3">Priority</h4>
                    <div className="space-y-3">
                      {Object.entries(config.sitemap.priority).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-label block mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
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
                                  [key]: parseFloat(e.target.value) || 0
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

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <AdminButton
              variant="secondary"
              onClick={fetchConfig}
              disabled={isSaving}
            >
              Reset Changes
            </AdminButton>
            <AdminButton
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation (desktop) / Tab Bar (mobile) */}
      <div className="seo-editor-sidebar">
        <div className="seo-editor-sidebar-inner">
          <nav className="seo-editor-nav">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="seo-sidebar-btn"
                data-active={activeSection === section.id}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}