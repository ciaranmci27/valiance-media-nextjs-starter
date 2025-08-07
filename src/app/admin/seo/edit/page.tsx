'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';

interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
  lastModified: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isIndexed?: boolean;
  isInSitemap?: boolean;
  hasCustomMeta?: boolean;
  canonicalUrl?: string;
  robots?: string;
}

export default function EditPageSEO() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = searchParams.get('page') || '/';
  
  const [page, setPage] = useState<PageSEO | null>(null);
  const [seoConfig, setSeoConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [showOGPreview, setShowOGPreview] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        // Fetch page SEO data
        const pagesRes = await fetch('/api/admin/seo?type=pages');
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          const foundPage = pagesData.pages.find((p: PageSEO) => p.path === pagePath);
          if (foundPage) {
            setPage(foundPage);
          } else {
            // Page not found, redirect back
            router.push('/admin/seo?tab=pages');
          }
        }

        // Fetch SEO config
        const configRes = await fetch('/api/admin/seo');
        if (configRes.ok) {
          const configData = await configRes.json();
          setSeoConfig(configData.config);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [pagePath, router]);

  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    if (!page) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const res = await fetch('/api/admin/seo/page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: page
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.warning) {
          setSaveMessage(`✅ ${data.message}. ⚠️ ${data.warning}`);
        } else {
          setSaveMessage(`✅ ${data.message}`);
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin/seo?tab=pages');
        }, 2000);
      } else {
        const errorData = await res.json();
        setSaveMessage(`❌ ${errorData.error || 'Failed to save SEO settings'}`);
      }
    } catch (error) {
      console.error('Error updating page SEO:', error);
      setSaveMessage('❌ Error saving SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading page data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
            <Link href="/admin/seo?tab=pages" className="btn btn-primary mt-4">
              Back to SEO Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pageDisplayName = page.path === '/' ? 'Homepage' : page.title;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link 
              href="/admin/seo?tab=pages" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to SEO Dashboard
            </Link>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
                Edit SEO: {pageDisplayName}
              </h1>
              <p className="text-body-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                  {page.path}
                </code>
              </p>
            </div>
            <div className="flex gap-2">
              <a 
                href={page.path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View Page →
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-6">
            {[
              { id: 'basic', label: 'Basic SEO' },
              { id: 'opengraph', label: 'Open Graph & Social' },
              { id: 'advanced', label: 'Advanced' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="text-label block mb-2">Page Title</label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({...page, title: e.target.value})}
                  className="input-field"
                  maxLength={60}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Displayed in search results and browser tabs
                  </p>
                  <p className={`text-xs ${page.title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {page.title.length}/60
                  </p>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Meta Description</label>
                <textarea
                  value={page.description}
                  onChange={(e) => setPage({...page, description: e.target.value})}
                  className="input-field"
                  rows={4}
                  maxLength={160}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Summary shown in search results
                  </p>
                  <p className={`text-xs ${page.description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                    {page.description.length}/160
                  </p>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Keywords</label>
                <input
                  type="text"
                  value={page.keywords.join(', ')}
                  onChange={(e) => setPage({
                    ...page, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  })}
                  className="input-field"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs mt-1 text-gray-500">
                  Separate keywords with commas
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">Canonical URL</label>
                <input
                  type="text"
                  value={page.canonicalUrl || `${seoConfig?.siteUrl}${page.path}`}
                  onChange={(e) => setPage({...page, canonicalUrl: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/page"
                />
                <p className="text-xs mt-1 text-gray-500">
                  The preferred URL for this page
                </p>
              </div>

              {/* Search Result Preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium text-lg mb-4">Search Result Preview</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
                    {page.title || 'Page Title'}
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                    {seoConfig?.siteUrl}{page.path}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {page.description || 'Page description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opengraph' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                <p className="text-sm">
                  <strong>ℹ️ Note:</strong> Open Graph tags are used by Facebook, LinkedIn, Twitter/X, and most social media platforms. 
                  You don't need separate Twitter Card settings.
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Title</label>
                <input
                  type="text"
                  value={page.ogTitle || ''}
                  onChange={(e) => setPage({...page, ogTitle: e.target.value})}
                  className="input-field"
                  placeholder={page.title}
                />
                <p className="text-xs mt-1 text-gray-500">
                  Leave empty to use page title. Used by all social platforms.
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Description</label>
                <textarea
                  value={page.ogDescription || ''}
                  onChange={(e) => setPage({...page, ogDescription: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder={page.description}
                />
                <p className="text-xs mt-1 text-gray-500">
                  Leave empty to use meta description. Shown on social media shares.
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Image URL</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={page.ogImage}
                    onChange={(e) => setPage({...page, ogImage: e.target.value})}
                    className="input-field"
                    placeholder="/images/og-image.jpg or https://example.com/image.jpg"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Recommended: 1200x630px. Works for all social platforms.</p>
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

              {/* Enhanced Social Media Preview - Only show when checkbox is checked */}
              {showOGPreview && page.ogImage && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-medium text-lg mb-4">Social Media Preview</h3>
                  <SocialMediaPreview
                    title={page.ogTitle || page.title}
                    description={page.ogDescription || page.description}
                    imageUrl={page.ogImage && (page.ogImage.startsWith('http') 
                      ? page.ogImage 
                      : `${seoConfig?.siteUrl || ''}${page.ogImage}`)}
                    url={`${seoConfig?.siteUrl || ''}${page.path}`}
                    siteName={seoConfig?.siteName || ''}
                    twitterCard={'summary_large_image'}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-label block mb-2">Priority</label>
                  <select
                    value={page.priority}
                    onChange={(e) => setPage({...page, priority: parseFloat(e.target.value)})}
                    className="input-field"
                  >
                    <option value="1.0">1.0 (Highest)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8</option>
                    <option value="0.7">0.7</option>
                    <option value="0.6">0.6</option>
                    <option value="0.5">0.5 (Default)</option>
                    <option value="0.4">0.4</option>
                    <option value="0.3">0.3</option>
                    <option value="0.2">0.2</option>
                    <option value="0.1">0.1 (Lowest)</option>
                  </select>
                  <p className="text-xs mt-1 text-gray-500">
                    Sitemap priority hint for search engines
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2">Change Frequency</label>
                  <select
                    value={page.changefreq}
                    onChange={(e) => setPage({...page, changefreq: e.target.value as any})}
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
                  <p className="text-xs mt-1 text-gray-500">
                    How often the page content changes
                  </p>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Robots Meta Tag</label>
                <select
                  value={page.robots || 'index, follow'}
                  onChange={(e) => setPage({...page, robots: e.target.value})}
                  className="input-field"
                >
                  <option value="index, follow">Index, Follow (Default)</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
                <p className="text-xs mt-1 text-gray-500">
                  Controls how search engines crawl and index this page
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Current Status</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Indexed:</span>{' '}
                    {page.isIndexed ? '✅ Yes' : '❌ No'}
                  </p>
                  <p>
                    <span className="font-medium">In Sitemap:</span>{' '}
                    {page.isInSitemap ? '✅ Yes' : '❌ No'}
                  </p>
                  <p>
                    <span className="font-medium">Has Custom Meta:</span>{' '}
                    {page.hasCustomMeta ? '✅ Yes' : '❌ No'}
                  </p>
                  <p>
                    <span className="font-medium">Last Modified:</span>{' '}
                    {page.lastModified}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-6 p-4 rounded-lg ${
            saveMessage.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
            saveMessage.includes('⚠️') ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
            'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            <p className="text-sm font-medium">{saveMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Link 
            href="/admin/seo?tab=pages" 
            className="btn btn-secondary"
          >
            Cancel
          </Link>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save SEO Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}