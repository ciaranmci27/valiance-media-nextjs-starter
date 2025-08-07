'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/Toast';
import SocialMediaPreview from './SocialMediaPreview';

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
  twitter: {
    handle: string;
    site: string;
    cardType: string;
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
}

export default function SEOConfigEditor() {
  const [config, setConfig] = useState<SEOConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [showOGPreview, setShowOGPreview] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

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
    { id: 'basic', label: 'Basic Information', icon: '🏢' },
    { id: 'company', label: 'Company Details', icon: '📍' },
    { id: 'defaults', label: 'Default SEO', icon: '📝' },
    { id: 'opengraph', label: 'Open Graph', icon: '🔗' },
    { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'robots', label: 'Robots & Crawling', icon: '🤖' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'sitemap', label: 'Sitemap Settings', icon: '🗺️' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                      ? 'bg-blue-600 text-white'
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
            {/* Basic Information */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Basic Information</h3>
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
                      onChange={(e) => setConfig({...config, siteUrl: e.target.value})}
                      className="input-field"
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Full URL including protocol (https://)</p>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Title Template</label>
                    <input
                      type="text"
                      value={config.titleTemplate}
                      onChange={(e) => setConfig({...config, titleTemplate: e.target.value})}
                      className="input-field"
                      placeholder="%s | My Company"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use %s as placeholder for page title</p>
                  </div>
                </div>
              </div>
            )}

            {/* Company Details */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2">Company Name</label>
                    <input
                      type="text"
                      value={config.company.name}
                      onChange={(e) => setConfig({...config, company: {...config.company, name: e.target.value}})}
                      className="input-field"
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-label block mb-2">Legal Name</label>
                    <input
                      type="text"
                      value={config.company.legalName}
                      onChange={(e) => setConfig({...config, company: {...config.company, legalName: e.target.value}})}
                      className="input-field"
                      placeholder="Company Name LLC"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Email</label>
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

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Address (Optional)</h4>
                  <p className="text-xs text-gray-500 mb-3">Leave blank if you don't want to include address in schema</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-label block mb-2">Street Address</label>
                      <input
                        type="text"
                        value={config.company.address.streetAddress}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, streetAddress: e.target.value}}})}
                        className="input-field"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div>
                      <label className="text-label block mb-2">City</label>
                      <input
                        type="text"
                        value={config.company.address.addressLocality}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressLocality: e.target.value}}})}
                        className="input-field"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">State/Region</label>
                      <input
                        type="text"
                        value={config.company.address.addressRegion}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, addressRegion: e.target.value}}})}
                        className="input-field"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={config.company.address.postalCode}
                        onChange={(e) => setConfig({...config, company: {...config.company, address: {...config.company.address, postalCode: e.target.value}}})}
                        className="input-field"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label className="text-label block mb-2">Country Code</label>
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
            {activeSection === 'defaults' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Default SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-label block mb-2">Default Title</label>
                    <input
                      type="text"
                      value={config.defaultTitle}
                      onChange={(e) => setConfig({...config, defaultTitle: e.target.value})}
                      className="input-field"
                      placeholder="Welcome to My Company - Your Solution Provider"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {config.defaultTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Default Description</label>
                    <textarea
                      value={config.defaultDescription}
                      onChange={(e) => setConfig({...config, defaultDescription: e.target.value})}
                      className="input-field"
                      rows={3}
                      placeholder="We provide innovative solutions and exceptional service to help your business grow."
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {config.defaultDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-label block mb-2">Default Keywords</label>
                    <input
                      type="text"
                      value={config.defaultKeywords.join(', ')}
                      onChange={(e) => setConfig({...config, defaultKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)})}
                      className="input-field"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
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
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                      imageUrl={config.openGraph.defaultImage.startsWith('http') 
                        ? config.openGraph.defaultImage 
                        : config.openGraph.defaultImage 
                          ? `${config.siteUrl}${config.openGraph.defaultImage}` 
                          : ''}
                      url={config.siteUrl}
                      siteName={config.siteName}
                      twitterCard={config.twitter.cardType as any}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Twitter/X */}
            {activeSection === 'twitter' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Twitter/X Configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-label block mb-2">Handle (Optional)</label>
                    <input
                      type="text"
                      value={config.twitter.handle}
                      onChange={(e) => setConfig({...config, twitter: {...config.twitter, handle: e.target.value}})}
                      className="input-field"
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Site (Optional)</label>
                    <input
                      type="text"
                      value={config.twitter.site}
                      onChange={(e) => setConfig({...config, twitter: {...config.twitter, site: e.target.value}})}
                      className="input-field"
                      placeholder="@yoursite"
                    />
                  </div>

                  <div>
                    <label className="text-label block mb-2">Card Type</label>
                    <select
                      value={config.twitter.cardType}
                      onChange={(e) => setConfig({...config, twitter: {...config.twitter, cardType: e.target.value}})}
                      className="input-field"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>
                </div>
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
                  {Object.entries(config.social).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="text-label block mb-2 capitalize">{platform}</label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setConfig({...config, social: {...config.social, [platform]: e.target.value}})}
                        className="input-field"
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Robots & Crawling */}
            {activeSection === 'robots' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Robots & Crawling Settings</h3>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Default Robot Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.index}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, index: e.target.checked}})}
                        className="checkbox"
                      />
                      <span>Index</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.follow}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, follow: e.target.checked}})}
                        className="checkbox"
                      />
                      <span>Follow</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.nocache}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, nocache: e.target.checked}})}
                        className="checkbox"
                      />
                      <span>No Cache</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">GoogleBot Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.googleBot.index}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, index: e.target.checked}}})}
                        className="checkbox"
                      />
                      <span>Index</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.googleBot.follow}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, follow: e.target.checked}}})}
                        className="checkbox"
                      />
                      <span>Follow</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.robots.googleBot.noimageindex}
                        onChange={(e) => setConfig({...config, robots: {...config.robots, googleBot: {...config.robots.googleBot, noimageindex: e.target.checked}}})}
                        className="checkbox"
                      />
                      <span>No Image Index</span>
                    </label>

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
                      <div key={lang} className="flex gap-2">
                        <input
                          type="text"
                          value={lang}
                          className="input-field w-32"
                          placeholder="en-US"
                          readOnly
                        />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newLanguages = {...config.alternates.languages};
                            newLanguages[lang] = e.target.value;
                            setConfig({...config, alternates: {...config.alternates, languages: newLanguages}});
                          }}
                          className="input-field flex-1"
                          placeholder="https://example.com"
                        />
                        <button
                          onClick={() => {
                            const newLanguages = {...config.alternates.languages};
                            delete newLanguages[lang];
                            setConfig({...config, alternates: {...config.alternates, languages: newLanguages}});
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

            {/* Sitemap Settings */}
            {activeSection === 'sitemap' && (
              <div className="space-y-6">
                <h3 className="text-h3 mb-4">Sitemap Settings</h3>
                
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