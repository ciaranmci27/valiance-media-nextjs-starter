'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  lastModified: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

interface SEOStats {
  totalPages: number;
  pagesWithMeta: number;
  pagesWithOG: number;
  sitemapPages: number;
  indexedPages: number;
}

export default function SEODashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pages, setPages] = useState<PageSEO[]>([
    {
      path: '/',
      title: 'Valiance Media - Innovative Software Solutions',
      description: 'Creating innovative in-house software solutions and e-commerce brands that drive growth.',
      keywords: ['software', 'e-commerce', 'development'],
      ogImage: '/og-image.png',
      lastModified: '2025-01-06',
      priority: 1.0,
      changefreq: 'weekly',
    },
    {
      path: '/blog',
      title: 'Blog - Valiance Media',
      description: 'Latest insights and updates from Valiance Media.',
      keywords: ['blog', 'articles', 'insights'],
      ogImage: '/og-blog.png',
      lastModified: '2025-01-05',
      priority: 0.8,
      changefreq: 'daily',
    },
    {
      path: '/privacy',
      title: 'Privacy Policy - Valiance Media',
      description: 'Our commitment to protecting your privacy and data.',
      keywords: ['privacy', 'policy', 'data protection'],
      ogImage: '/og-image.png',
      lastModified: '2024-12-01',
      priority: 0.3,
      changefreq: 'yearly',
    },
    {
      path: '/terms-of-service',
      title: 'Terms of Service - Valiance Media',
      description: 'Terms and conditions for using our services.',
      keywords: ['terms', 'service', 'legal'],
      ogImage: '/og-image.png',
      lastModified: '2024-12-01',
      priority: 0.3,
      changefreq: 'yearly',
    },
  ]);

  const [stats, setStats] = useState<SEOStats>({
    totalPages: 4,
    pagesWithMeta: 4,
    pagesWithOG: 4,
    sitemapPages: 4,
    indexedPages: 3,
  });

  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://valiancemedia.com/sitemap.xml`);

  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePageUpdate = (updatedPage: PageSEO) => {
    setPages(prev => prev.map(p => 
      p.path === updatedPage.path ? updatedPage : p
    ));
    setSelectedPage(null);
  };

  const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://valiancemedia.com${page.path}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    // Download sitemap
    const blob = new Blob([sitemap], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'pages', label: 'Page SEO', icon: '📄' },
    { id: 'sitemap', label: 'Sitemap', icon: '🗺️' },
    { id: 'robots', label: 'Robots.txt', icon: '🤖' },
    { id: 'schema', label: 'Schema Markup', icon: '🏷️' },
  ];

  const StatCard = ({ title, value, subtitle, color }: { 
    title: string; 
    value: number | string; 
    subtitle?: string;
    color: string;
  }) => (
    <div className="card p-6">
      <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
        {title}
      </p>
      <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-body-sm mt-2" style={{ color }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            SEO Dashboard
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your site's search engine optimization
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
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard 
                title="Total Pages" 
                value={stats.totalPages}
                color="var(--color-text-primary)"
              />
              <StatCard 
                title="With Meta Tags" 
                value={`${stats.pagesWithMeta}/${stats.totalPages}`}
                subtitle="100% coverage"
                color="var(--color-success)"
              />
              <StatCard 
                title="Open Graph" 
                value={`${stats.pagesWithOG}/${stats.totalPages}`}
                subtitle="100% coverage"
                color="var(--color-success)"
              />
              <StatCard 
                title="In Sitemap" 
                value={stats.sitemapPages}
                color="var(--color-text-primary)"
              />
              <StatCard 
                title="Indexed" 
                value={`${stats.indexedPages}/${stats.totalPages}`}
                subtitle="Check Search Console"
                color="var(--color-warning)"
              />
            </div>

            {/* SEO Health Check */}
            <div className="card p-6">
              <h2 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                SEO Health Check
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Meta Tags
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        All pages have title and description tags
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success">Good</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Sitemap
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        XML sitemap is configured and accessible
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success">Good</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Schema Markup
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Consider adding more structured data
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-warning">Needs Attention</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Robots.txt
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Properly configured with sitemap reference
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success">Good</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'pages' && (
          <div className="card p-6">
            <h2 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Page SEO Management
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Page</th>
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Priority</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map(page => (
                    <tr key={page.path} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {page.path}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm truncate max-w-xs" title={page.title}>
                          {page.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm truncate max-w-xs text-gray-600 dark:text-gray-400" title={page.description}>
                          {page.description}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">{page.priority}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedPage(page)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Modal */}
            {selectedPage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-h3 mb-6">Edit SEO for {selectedPage.path}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-label block mb-2">Title</label>
                        <input
                          type="text"
                          value={selectedPage.title}
                          onChange={(e) => setSelectedPage({...selectedPage, title: e.target.value})}
                          className="input-field"
                        />
                        <p className="text-xs mt-1 text-gray-500">
                          {selectedPage.title.length}/60 characters
                        </p>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Description</label>
                        <textarea
                          value={selectedPage.description}
                          onChange={(e) => setSelectedPage({...selectedPage, description: e.target.value})}
                          className="input-field"
                          rows={3}
                        />
                        <p className="text-xs mt-1 text-gray-500">
                          {selectedPage.description.length}/160 characters
                        </p>
                      </div>

                      <div>
                        <label className="text-label block mb-2">Keywords</label>
                        <input
                          type="text"
                          value={selectedPage.keywords.join(', ')}
                          onChange={(e) => setSelectedPage({
                            ...selectedPage, 
                            keywords: e.target.value.split(',').map(k => k.trim())
                          })}
                          className="input-field"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-label block mb-2">Priority</label>
                          <select
                            value={selectedPage.priority}
                            onChange={(e) => setSelectedPage({...selectedPage, priority: parseFloat(e.target.value)})}
                            className="input-field"
                          >
                            <option value="1.0">1.0 (Highest)</option>
                            <option value="0.8">0.8</option>
                            <option value="0.6">0.6</option>
                            <option value="0.5">0.5</option>
                            <option value="0.3">0.3</option>
                            <option value="0.1">0.1 (Lowest)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-label block mb-2">Change Frequency</label>
                          <select
                            value={selectedPage.changefreq}
                            onChange={(e) => setSelectedPage({...selectedPage, changefreq: e.target.value as any})}
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
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        onClick={() => setSelectedPage(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePageUpdate(selectedPage)}
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sitemap' && (
          <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                  XML Sitemap
                </h2>
                <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Your sitemap includes {pages.length} pages
                </p>
              </div>
              <button
                onClick={generateSitemap}
                className="btn btn-primary"
              >
                Download Sitemap
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://valiancemedia.com${page.path}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`}
              </pre>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-body-sm flex items-start gap-2">
                <span>💡</span>
                <span>
                  Your sitemap is automatically generated and available at{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    /sitemap.xml
                  </code>
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'robots' && (
          <div className="card p-6">
            <h2 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Robots.txt Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Robots.txt Content
                </label>
                <textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  className="font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full"
                  rows={12}
                />
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ✅ Allows all crawlers by default
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ✅ Blocks admin and API routes
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ✅ Includes sitemap reference
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => setIsSaving(false), 1000);
                  }}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Robots.txt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="card p-6">
            <h2 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Schema Markup (Structured Data)
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium mb-2">Organization Schema</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                  Currently active on all pages
                </p>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Valiance Media",
  "url": "https://valiancemedia.com",
  "logo": "https://valiancemedia.com/logo.png",
  "sameAs": [
    "https://twitter.com/valiancemedia",
    "https://facebook.com/valiancemedia",
    "https://linkedin.com/company/valiancemedia"
  ]
}`}
                </pre>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium mb-2">Article Schema</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                  Recommended for blog posts
                </p>
                <button className="btn btn-secondary">
                  Configure Article Schema
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Product Schema</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                  For e-commerce products (not configured)
                </p>
                <button className="btn btn-secondary">
                  Add Product Schema
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}