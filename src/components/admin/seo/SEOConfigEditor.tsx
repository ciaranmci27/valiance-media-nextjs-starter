'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/feedback';
import SocialMediaPreview from './SocialMediaPreview';
import { Switch } from '@/components/admin/ui/Switch';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';
import { TextInput, Textarea, NumberInput, Toggle, TimeInput, Select, MultiSelect, TagInput } from '@/components/ui/inputs';

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


  useEffect(() => {
    fetchConfig();
  }, []);
  
  // Update active section when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  


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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextInput
                      label="Site Name"
                      value={config.siteName}
                      onChange={(val) => setConfig({...config, siteName: val})}
                      placeholder="My Company"
                    />
                    <p className="form-hint">Used in titles and meta tags</p>
                  </div>

                  <div>
                    <TextInput
                      label="Site URL"
                      type="url"
                      value={config.siteUrl}
                      onChange={(val) => setConfig({...config, siteUrl: val})}
                      placeholder="https://example.com"
                    />
                    <p className="form-hint">Full URL including protocol (https://)</p>
                  </div>

                </div>
                </div>

                <TextInput
                  label="Canonical URL"
                  description="Optional"
                  type="url"
                  value={config.alternates.canonical}
                  onChange={(val) => setConfig({...config, alternates: {...config.alternates, canonical: val}})}
                  placeholder="https://yoursite.com"
                />
              </div>
            )}

            {/* Organization */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 mb-3">Company Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Company Name (Optional)"
                    value={config.company.name}
                    onChange={(val) => setConfig({...config, company: {...config.company, name: val}})}
                    placeholder="Company Name"
                  />

                  <TextInput
                    label="Legal Name (Optional)"
                    value={config.company.legalName}
                    onChange={(val) => setConfig({...config, company: {...config.company, legalName: val}})}
                    placeholder="Company Name LLC"
                  />

                  <TextInput
                    label="Email (Optional)"
                    type="email"
                    value={config.company.email}
                    onChange={(val) => setConfig({...config, company: {...config.company, email: val}})}
                    placeholder="info@example.com"
                  />

                  <TextInput
                    label="Phone (Optional)"
                    type="tel"
                    value={config.company.phone}
                    onChange={(val) => setConfig({...config, company: {...config.company, phone: val}})}
                    placeholder="+1-555-0000"
                  />

                  <TextInput
                    label="Founding Date (Optional)"
                    value={config.company.foundingDate}
                    onChange={(val) => setConfig({...config, company: {...config.company, foundingDate: val}})}
                    placeholder="YYYY"
                  />
                </div>

                </div>

                <div>
                  <h4 className="text-h4 mb-3">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <TextInput
                        label="Street Address (Optional)"
                        value={config.company.address.streetAddress}
                        onChange={(val) => setConfig({...config, company: {...config.company, address: {...config.company.address, streetAddress: val}}})}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <TextInput
                      label="City (Optional)"
                      value={config.company.address.addressLocality}
                      onChange={(val) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressLocality: val}}})}
                      placeholder="New York"
                    />

                    <TextInput
                      label="State/Region (Optional)"
                      value={config.company.address.addressRegion}
                      onChange={(val) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressRegion: val}}})}
                      placeholder="NY"
                    />

                    <TextInput
                      label="Postal Code (Optional)"
                      value={config.company.address.postalCode}
                      onChange={(val) => setConfig({...config, company: {...config.company, address: {...config.company.address, postalCode: val}}})}
                      placeholder="10001"
                    />

                    <TextInput
                      label="Country Code (Optional)"
                      value={config.company.address.addressCountry}
                      onChange={(val) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressCountry: val}}})}
                      placeholder="US"
                    />
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
                      <TextInput
                        label="Title Template"
                        value={config.titleTemplate}
                        onChange={(val) => setConfig({...config, titleTemplate: val})}
                        placeholder="{pageName} | {siteName}"
                        maxLength={60}
                        description={`${config.titleTemplate.length}/60`}
                      />
                      <Textarea
                        label="Description Template"
                        value={config.defaultDescription}
                        onChange={(val) => setConfig({...config, defaultDescription: val})}
                        rows={2}
                        placeholder="Learn about {pageName} at {siteName}. {siteTagline}"
                        maxLength={160}
                      />
                      <TextInput
                        label="Keywords Template"
                        value={config.defaultKeywords.join(', ')}
                        onChange={(val) => setConfig({...config, defaultKeywords: val.split(',').map(k => k.trim()).filter(Boolean)})}
                        placeholder="{pageName}, {siteName}, your service, your industry"
                      />
                    </div>
                  </div>

                  {/* Blog Posts Template */}
                  <div>
                    <h4 className="text-h4 mb-3">Blog Post SEO</h4>
                    <div className="space-y-3">
                      <TextInput
                        label="Title Template"
                        value={config.titleTemplate}
                        onChange={(val) => setConfig({...config, titleTemplate: val})}
                        placeholder="{pageName} | Blog | {siteName}"
                        maxLength={60}
                        description={`${config.titleTemplate.length}/60`}
                      />
                      <Textarea
                        label="Description Template"
                        value={config.defaultDescription}
                        onChange={(val) => setConfig({...config, defaultDescription: val})}
                        rows={2}
                        placeholder="Read our latest article about {pageName}. Expert insights from {siteName}."
                        maxLength={160}
                      />
                      <TextInput
                        label="Keywords Template"
                        value={config.defaultKeywords.join(', ')}
                        onChange={(val) => setConfig({...config, defaultKeywords: val.split(',').map(k => k.trim()).filter(Boolean)})}
                        placeholder="{pageName}, blog, article, {siteName}"
                      />
                    </div>
                  </div>

                  {/* Blog Categories Template */}
                  <div>
                    <h4 className="text-h4 mb-3">Blog Category SEO</h4>
                    <div className="space-y-3">
                      <TextInput
                        label="Title Template"
                        value={config.titleTemplate}
                        onChange={(val) => setConfig({...config, titleTemplate: val})}
                        placeholder="{pageName} Articles | {siteName} Blog"
                        maxLength={60}
                        description={`${config.titleTemplate.length}/60`}
                      />
                      <Textarea
                        label="Description Template"
                        value={config.defaultDescription}
                        onChange={(val) => setConfig({...config, defaultDescription: val})}
                        rows={2}
                        placeholder="Browse all {pageName} articles and resources from {siteName}."
                        maxLength={160}
                      />
                      <TextInput
                        label="Keywords Template"
                        value={config.defaultKeywords.join(', ')}
                        onChange={(val) => setConfig({...config, defaultKeywords: val.split(',').map(k => k.trim()).filter(Boolean)})}
                        placeholder="{pageName}, category, articles, {siteName} blog"
                      />
                    </div>
                  </div>

                <AdminBanner>
                  <p>
                    <strong>Variables:</strong> {'{pageName}'} = current page/post/category name | {'{siteName}'} = your site name | {'{siteTagline}'} = your tagline
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
                      { value: 'book', label: 'Book' },
                      { value: 'video.other', label: 'Video' },
                      { value: 'music.song', label: 'Music' },
                    ]}
                  />

                  <Select
                    label="Locale"
                    value={config.openGraph.locale}
                    onChange={(val) => setConfig({...config, openGraph: {...config.openGraph, locale: val}})}
                    options={[
                      { value: 'en_US', label: 'English (US)' },
                      { value: 'en_GB', label: 'English (UK)' },
                      { value: 'en_AU', label: 'English (AU)' },
                      { value: 'en_CA', label: 'English (CA)' },
                      { value: 'es_ES', label: 'Spanish (Spain)' },
                      { value: 'es_MX', label: 'Spanish (Mexico)' },
                      { value: 'fr_FR', label: 'French (France)' },
                      { value: 'fr_CA', label: 'French (Canada)' },
                      { value: 'de_DE', label: 'German' },
                      { value: 'it_IT', label: 'Italian' },
                      { value: 'pt_BR', label: 'Portuguese (Brazil)' },
                      { value: 'pt_PT', label: 'Portuguese (Portugal)' },
                      { value: 'nl_NL', label: 'Dutch' },
                      { value: 'ja_JP', label: 'Japanese' },
                      { value: 'ko_KR', label: 'Korean' },
                      { value: 'zh_CN', label: 'Chinese (Simplified)' },
                      { value: 'zh_TW', label: 'Chinese (Traditional)' },
                      { value: 'ar_SA', label: 'Arabic' },
                      { value: 'hi_IN', label: 'Hindi' },
                      { value: 'ru_RU', label: 'Russian' },
                      { value: 'pl_PL', label: 'Polish' },
                      { value: 'sv_SE', label: 'Swedish' },
                      { value: 'da_DK', label: 'Danish' },
                      { value: 'nb_NO', label: 'Norwegian' },
                      { value: 'fi_FI', label: 'Finnish' },
                      { value: 'tr_TR', label: 'Turkish' },
                      { value: 'th_TH', label: 'Thai' },
                      { value: 'vi_VN', label: 'Vietnamese' },
                      { value: 'id_ID', label: 'Indonesian' },
                    ]}
                  />

                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      <TextInput
                        label="Default Image URL"
                        value={config.openGraph.defaultImage}
                        onChange={(val) => setConfig({...config, openGraph: {...config.openGraph, defaultImage: val}})}
                        placeholder="/images/og-image.jpg or https://example.com/image.jpg"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="form-hint m-0">Recommended: 1200x630px for best results across all platforms</p>
                        <Toggle
                          checked={showOGPreview}
                          onChange={(checked) => setShowOGPreview(checked)}
                          label="Show preview"
                          size="sm"
                        />
                      </div>
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <TextInput
                        key={platform}
                        label={label}
                        type="url"
                        value={url}
                        onChange={(val) => setConfig({...config, social: {...config.social, [platform]: val}})}
                        placeholder={`https://${platform === 'twitter' ? 'x' : platform}.com/yourprofile`}
                      />
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

                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Organization */}
                      <div className="flex items-center justify-between px-4 py-3.5 border-b md:border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Organization</span>
                            <span className="badge badge-primary text-xs">Recommended</span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Company or brand identity</p>
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
                      <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>LocalBusiness</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Physical location details</p>
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
                      <div className="flex items-center justify-between px-4 py-3.5 border-b md:border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Person</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Individual or author profile</p>
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

                      {/* Contact Point */}
                      <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Contact Point</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Support and contact info</p>
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
                      <div className="flex items-center justify-between px-4 py-3.5 md:border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Breadcrumbs</span>
                            <span className="badge badge-primary text-xs">Recommended</span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Page navigation trail</p>
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
                      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>WebSite</span>
                            <span className="badge badge-primary text-xs">Recommended</span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Site search and identity</p>
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

                        <TextInput
                          label="Logo URL for Schema (600x600px)"
                          value={config.schema?.organization?.logo?.url || ''}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                        ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                logo: { ...(config.schema?.organization?.logo || {}), url: val }
                              }
                            }
                          })}
                          placeholder="/logos/logo.png or https://..."
                        />
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
                        <TextInput
                          label="Support Phone"
                          type="tel"
                          value={config.schema?.organization?.contactPoint?.telephone || ''}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  telephone: val
                                }
                              }
                            }
                          })}
                          placeholder="+1-800-SUPPORT"
                        />
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

                      <Select
                        label="Area Served"
                        value={config.schema?.organization?.contactPoint?.areaServed || 'US'}
                        onChange={(value) => setConfig({
                          ...config,
                          schema: {
                            ...getDefaultSchema(),
                        ...(config.schema || {}),
                            organization: {
                              ...(config.schema?.organization || {}),
                              contactPoint: {
                                ...(config.schema?.organization?.contactPoint || {}),
                                areaServed: value
                              }
                            }
                          }
                        })}
                        options={[
                          { value: 'US', label: 'United States' },
                          { value: 'CA', label: 'Canada' },
                          { value: 'GB', label: 'United Kingdom' },
                          { value: 'AU', label: 'Australia' },
                          { value: 'DE', label: 'Germany' },
                          { value: 'FR', label: 'France' },
                          { value: 'ES', label: 'Spain' },
                          { value: 'IT', label: 'Italy' },
                          { value: 'NL', label: 'Netherlands' },
                          { value: 'BR', label: 'Brazil' },
                          { value: 'MX', label: 'Mexico' },
                          { value: 'IN', label: 'India' },
                          { value: 'JP', label: 'Japan' },
                          { value: 'KR', label: 'South Korea' },
                          { value: 'CN', label: 'China' },
                          { value: 'NA', label: 'North America' },
                          { value: 'EU', label: 'Europe' },
                          { value: 'AS', label: 'Asia' },
                          { value: 'GLOBAL', label: 'Global' },
                        ]}
                      />

                      <div className="md:col-span-2">
                        <MultiSelect
                          label="Available Languages"
                          value={config.schema?.organization?.contactPoint?.availableLanguage || ['English']}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              organization: {
                                ...(config.schema?.organization || {}),
                                contactPoint: {
                                  ...(config.schema?.organization?.contactPoint || {}),
                                  availableLanguage: val
                                }
                              }
                            }
                          })}
                          placeholder="Select languages"
                          searchable
                          options={[
                            { value: 'English', label: 'English' },
                            { value: 'Spanish', label: 'Spanish' },
                            { value: 'French', label: 'French' },
                            { value: 'German', label: 'German' },
                            { value: 'Italian', label: 'Italian' },
                            { value: 'Portuguese', label: 'Portuguese' },
                            { value: 'Dutch', label: 'Dutch' },
                            { value: 'Russian', label: 'Russian' },
                            { value: 'Japanese', label: 'Japanese' },
                            { value: 'Korean', label: 'Korean' },
                            { value: 'Mandarin', label: 'Mandarin' },
                            { value: 'Cantonese', label: 'Cantonese' },
                            { value: 'Arabic', label: 'Arabic' },
                            { value: 'Hindi', label: 'Hindi' },
                            { value: 'Bengali', label: 'Bengali' },
                            { value: 'Turkish', label: 'Turkish' },
                            { value: 'Vietnamese', label: 'Vietnamese' },
                            { value: 'Thai', label: 'Thai' },
                            { value: 'Polish', label: 'Polish' },
                            { value: 'Swedish', label: 'Swedish' },
                            { value: 'Norwegian', label: 'Norwegian' },
                            { value: 'Danish', label: 'Danish' },
                            { value: 'Finnish', label: 'Finnish' },
                            { value: 'Greek', label: 'Greek' },
                            { value: 'Hebrew', label: 'Hebrew' },
                            { value: 'Indonesian', label: 'Indonesian' },
                            { value: 'Malay', label: 'Malay' },
                            { value: 'Romanian', label: 'Romanian' },
                            { value: 'Czech', label: 'Czech' },
                            { value: 'Ukrainian', label: 'Ukrainian' },
                          ]}
                        />
                      </div>

                      {/* Business Hours if not 24/7 */}
                      {config.schema?.organization?.contactPoint?.hoursAvailable?.dayOfWeek?.length !== 0 && (
                        <>
                          <TimeInput
                            label="Opening Time"
                            value={config.schema?.organization?.contactPoint?.hoursAvailable?.opens || '09:00'}
                            onChange={(val) => setConfig({
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
                                      opens: val
                                    }
                                  }
                                }
                              }
                            })}
                            use24Hour
                          />

                          <TimeInput
                            label="Closing Time"
                            value={config.schema?.organization?.contactPoint?.hoursAvailable?.closes || '17:00'}
                            onChange={(val) => setConfig({
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
                                      closes: val
                                    }
                                  }
                                }
                              }
                            })}
                            use24Hour
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Website Schema */}
                {config.schema?.activeTypes?.website && (
                  <div>
                    <h4 className="text-h4 mb-3">WebSite Schema</h4>
                    <div>
                      <TextInput
                        label="Site Search URL Template"
                        value={config.schema?.website?.potentialAction?.searchUrlTemplate || ''}
                        onChange={(val) => setConfig({
                          ...config,
                          schema: {
                            ...getDefaultSchema(),
                        ...(config.schema || {}),
                            website: {
                              ...(config.schema?.website || {}),
                              potentialAction: {
                                ...(config.schema?.website?.potentialAction || {}),
                                searchUrlTemplate: val
                              }
                            }
                          }
                        })}
                        placeholder="https://example.com/search?q={search_term_string}"
                      />
                      <p className="form-hint">
                        Use {'{search_term_string}'} as the query placeholder.
                      </p>
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

                      </div>

                      {/* Geo Coordinates */}
                      <div>
                        <h5 className="font-medium mb-3">Location Coordinates</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInput
                            label="Latitude"
                            value={config.schema?.localBusiness?.geo?.latitude || ''}
                            onChange={(val) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                        ...(config.schema || {}),
                                localBusiness: {
                                  ...(config.schema?.localBusiness || {}),
                                  geo: { ...(config.schema?.localBusiness?.geo || {}), latitude: val }
                                }
                              }
                            })}
                            placeholder="40.7128"
                          />

                          <TextInput
                            label="Longitude"
                            value={config.schema?.localBusiness?.geo?.longitude || ''}
                            onChange={(val) => setConfig({
                              ...config,
                              schema: {
                                ...getDefaultSchema(),
                        ...(config.schema || {}),
                                localBusiness: {
                                  ...(config.schema?.localBusiness || {}),
                                  geo: { ...(config.schema?.localBusiness?.geo || {}), longitude: val }
                                }
                              }
                            })}
                            placeholder="-74.0060"
                          />
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
                        <TextInput
                          label="Full Name"
                          value={config.schema?.person?.name || ''}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                        ...(config.schema || {}),
                              person: { ...(config.schema?.person || {}), name: val }
                            }
                          })}
                          placeholder="John Doe"
                        />

                        <TextInput
                          label="Job Title"
                          value={config.schema?.person?.jobTitle || ''}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                        ...(config.schema || {}),
                              person: { ...(config.schema?.person || {}), jobTitle: val }
                            }
                          })}
                          placeholder="CEO & Founder"
                        />
                      </div>

                      <div>
                        <TextInput
                          label="Expertise/Knowledge Areas"
                          value={config.schema?.person?.knowsAbout?.join(', ') || ''}
                          onChange={(val) => setConfig({
                            ...config,
                            schema: {
                              ...getDefaultSchema(),
                          ...(config.schema || {}),
                              person: {
                                ...(config.schema?.person || {}),
                                knowsAbout: val.split(',').map(s => s.trim()).filter(Boolean)
                              }
                            }
                          })}
                          placeholder="Web Development, SEO, Marketing, Business Strategy"
                        />
                        <p className="form-hint">Comma-separated list of expertise areas</p>
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
                  <h4 className="text-h4 mb-3">Robot Settings</h4>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="flex items-center justify-between px-4 py-3.5 border-b md:border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Index</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Allow search engines to index pages</p>
                        </div>
                        <Switch
                          checked={config.robots.index}
                          onChange={(checked) => setConfig({...config, robots: {...config.robots, index: checked, googleBot: {...config.robots.googleBot, index: checked}}})}
                        />
                      </div>

                      <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Follow</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Allow search engines to follow links</p>
                        </div>
                        <Switch
                          checked={config.robots.follow}
                          onChange={(checked) => setConfig({...config, robots: {...config.robots, follow: checked, googleBot: {...config.robots.googleBot, follow: checked}}})}
                        />
                      </div>

                      <div className="flex items-center justify-between px-4 py-3.5 border-b md:border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No Cache</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Prevent cached page versions</p>
                        </div>
                        <Switch
                          checked={config.robots.nocache}
                          onChange={(checked) => setConfig({...config, robots: {...config.robots, nocache: checked}})}
                        />
                      </div>

                      <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No Image Index</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Prevent image indexing</p>
                        </div>
                        <Switch
                          checked={config.robots.googleBot.noimageindex}
                          onChange={(checked) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, noimageindex: checked}}})}
                        />
                      </div>
                    </div>

                    <div className="px-4 py-3.5">
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
            )}

            {/* Sitemap */}
            {activeSection === 'sitemap' && (
              <div className="space-y-6">
                <TagInput
                  label="Excluded Pages"
                  value={config.sitemap.excludedPages.filter(Boolean)}
                  onChange={(val) => setConfig({...config, sitemap: {...config.sitemap, excludedPages: val}})}
                  placeholder="Type a path and press Enter, e.g. /admin"
                />

                <TagInput
                  label="Excluded Blog Patterns"
                  value={config.sitemap.excludedBlogPatterns.filter(Boolean)}
                  onChange={(val) => setConfig({...config, sitemap: {...config.sitemap, excludedBlogPatterns: val}})}
                  placeholder="Type a pattern and press Enter, e.g. draft"
                />

                <div>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Page Type</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Frequency</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Priority</span>
                    </div>
                    {Object.entries(config.sitemap.changeFrequency).map(([key], index, arr) => {
                      const labelMap: Record<string, string> = { homepage: 'Homepage', pages: 'Pages', blog: 'Blog', categories: 'Categories', mainPages: 'Pages' };
                      const displayLabel = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
                      const priorityKey = key === 'pages' ? 'mainPages' : key;
                      const isLast = index === arr.length - 1;
                      return (
                        <div key={key} className={`grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-4 py-3${!isLast ? ' border-b' : ''}`} style={{ borderColor: 'var(--color-border-light)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{displayLabel}</span>
                          <Select
                            value={config.sitemap.changeFrequency[key as keyof typeof config.sitemap.changeFrequency]}
                            onChange={(val) => setConfig({
                              ...config,
                              sitemap: {
                                ...config.sitemap,
                                changeFrequency: { ...config.sitemap.changeFrequency, [key]: val }
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
                          <NumberInput
                            min={0}
                            max={1}
                            step={0.1}
                            value={config.sitemap.priority[priorityKey as keyof typeof config.sitemap.priority]}
                            onChange={(val) => setConfig({
                              ...config,
                              sitemap: {
                                ...config.sitemap,
                                priority: { ...config.sitemap.priority, [priorityKey]: typeof val === 'number' ? val : 0 }
                              }
                            })}
                          />
                        </div>
                      );
                    })}
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