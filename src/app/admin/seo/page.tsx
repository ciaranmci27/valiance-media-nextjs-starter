'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SEOConfigEditor = dynamic(() => import('@/components/admin/seo/SEOConfigEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading configuration...</p>
      </div>
    </div>
  )
});

const RedirectsManager = dynamic(() => import('@/components/admin/seo/RedirectsManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading redirects...</p>
      </div>
    </div>
  )
});

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

interface SEOStats {
  totalPages: number;
  pagesWithMeta: number;
  pagesWithOG: number;
  sitemapPages: number;
  indexedPages: number;
}

export default function SEODashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('config');
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [stats, setStats] = useState<SEOStats>({
    totalPages: 0,
    pagesWithMeta: 0,
    pagesWithOG: 0,
    sitemapPages: 0,
    indexedPages: 0,
  });
  const [robotsTxt, setRobotsTxt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [schemas, setSchemas] = useState<any>({});
  const [seoConfig, setSeoConfig] = useState<any>(null);
  const [sitemapData, setSitemapData] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Fetch SEO data on component mount
  useEffect(() => {
    const fetchSEOData = async () => {
      setIsLoading(true);
      try {
        // Fetch pages
        const pagesRes = await fetch('/api/admin/seo?type=pages');
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          setPages(pagesData.pages);
        }

        // Fetch stats
        const statsRes = await fetch('/api/admin/seo?type=stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        // Fetch robots.txt
        const robotsRes = await fetch('/api/admin/seo?type=robots');
        if (robotsRes.ok) {
          const robotsData = await robotsRes.json();
          setRobotsTxt(robotsData.content);
        }

        // Fetch schema markup
        const schemaRes = await fetch('/api/admin/seo?type=schema');
        if (schemaRes.ok) {
          const schemaData = await schemaRes.json();
          setSchemas(schemaData.schemas);
        }

        // Fetch general SEO config
        const configRes = await fetch('/api/admin/seo');
        if (configRes.ok) {
          const configData = await configRes.json();
          setSeoConfig(configData.config);
        }

        // Fetch sitemap data
        const sitemapRes = await fetch('/api/admin/seo/sitemap');
        if (sitemapRes.ok) {
          const sitemapInfo = await sitemapRes.json();
          setSitemapData(sitemapInfo);
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSEOData();
  }, []);


  const handleRobotsUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'robots',
          data: { content: robotsTxt }
        })
      });
      
      if (res.ok) {
        // Show success message
        setTimeout(() => setIsSaving(false), 1000);
      }
    } catch (error) {
      console.error('Error updating robots.txt:', error);
      setIsSaving(false);
    }
  };

  const generateSitemap = () => {
    const siteUrl = seoConfig?.siteUrl || 'https://valiancemedia.com';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${siteUrl}${page.path}</loc>
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

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading SEO data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'config', label: 'Configuration', icon: '⚙️' },
    { id: 'redirects', label: 'Redirects', icon: '↪️' },
    { id: 'pages', label: 'Page SEO', icon: '📄' },
    { id: 'schema', label: 'Schema Markup', icon: '🏷️' },
    { id: 'overview', label: 'SEO Health', icon: '🏥' },
    { id: 'robots', label: 'Robots.txt', icon: '🤖' },
    { id: 'sitemap', label: 'Sitemap', icon: '🗺️' },
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
                subtitle={stats.totalPages > 0 ? `${Math.round((stats.pagesWithMeta / stats.totalPages) * 100)}% coverage` : '0% coverage'}
                color={stats.pagesWithMeta === stats.totalPages ? "var(--color-success)" : "var(--color-warning)"}
              />
              <StatCard 
                title="Open Graph" 
                value={`${stats.pagesWithOG}/${stats.totalPages}`}
                subtitle={stats.totalPages > 0 ? `${Math.round((stats.pagesWithOG / stats.totalPages) * 100)}% coverage` : '0% coverage'}
                color={stats.pagesWithOG === stats.totalPages ? "var(--color-success)" : "var(--color-warning)"}
              />
              <StatCard 
                title="In Sitemap" 
                value={stats.sitemapPages}
                color="var(--color-text-primary)"
              />
              <StatCard 
                title="Indexed (Est.)" 
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
          <div className="space-y-6">
            {/* Page SEO Overview */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                    Static Page SEO
                  </h2>
                  <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Manage SEO settings for static pages only. Blog post and category SEO is managed in their respective sections.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-info">
                    {pages.length} Pages
                  </span>
                  <span className="badge badge-success">
                    {pages.filter(p => p.isInSitemap).length} In Sitemap
                  </span>
                </div>
              </div>

              {/* Page Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pages.map(page => (
                  <div key={page.path} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                            {page.path === '/' ? 'Homepage' : page.title}
                          </h3>
                          {page.hasCustomMeta && (
                            <span className="badge badge-sm badge-purple">Custom Meta</span>
                          )}
                        </div>
                        <code className="text-xs text-gray-500 dark:text-gray-400">
                          {page.path}
                        </code>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/seo/edit?page=${encodeURIComponent(page.path)}`)}
                        className="btn btn-sm btn-primary"
                      >
                        Edit SEO
                      </button>
                    </div>

                    {/* SEO Status Indicators */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {page.isIndexed ? (
                        <span className="badge badge-sm badge-success">✓ Indexed</span>
                      ) : (
                        <span className="badge badge-sm badge-warning">✗ Not Indexed</span>
                      )}
                      {page.isInSitemap ? (
                        <span className="badge badge-sm badge-success">✓ In Sitemap</span>
                      ) : (
                        <span className="badge badge-sm badge-gray">✗ Not in Sitemap</span>
                      )}
                      <span className="badge badge-sm badge-info">
                        Priority: {page.priority}
                      </span>
                      <span className="badge badge-sm badge-gray">
                        {page.changefreq}
                      </span>
                    </div>

                    {/* Meta Preview */}
                    <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title ({page.title.length}/60)</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                          {page.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description ({page.description.length}/160)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                      {page.keywords && page.keywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Keywords</p>
                          <div className="flex flex-wrap gap-1">
                            {page.keywords.slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                            {page.keywords.length > 3 && (
                              <span className="text-xs text-gray-500">+{page.keywords.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <a 
                        href={page.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Page →
                      </a>
                      <span className="text-xs text-gray-500">
                        Modified: {page.lastModified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Tips */}
            <div className="card p-6">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Page SEO Best Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Title Tags</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Keep under 60 characters</li>
                    <li>• Include primary keyword</li>
                    <li>• Make it compelling and unique</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Meta Descriptions</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Keep under 160 characters</li>
                    <li>• Include call-to-action</li>
                    <li>• Summarize page content</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Open Graph</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Use 1200x630px images</li>
                    <li>• Set custom OG titles</li>
                    <li>• Test with social previews</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Indexing</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Set canonical URLs</li>
                    <li>• Configure robots meta</li>
                    <li>• Submit to Search Console</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            {/* Sitemap Index */}
            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                    Sitemap Index
                  </h2>
                  <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Main sitemap index that references all sub-sitemaps
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300">
{`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-blog-posts.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-blog-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`}
                </pre>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-success">Active</span>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Live Sitemap Index →
                </a>
              </div>
            </div>

            {/* Individual Sitemaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pages Sitemap */}
              <div className="card p-6">
                <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Pages Sitemap
                </h3>
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Contains {sitemapData?.sitemaps?.pages?.count || 0} static pages
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {sitemapData?.sitemaps?.pages?.entries?.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {sitemapData.sitemaps.pages.entries.map((entry: any) => {
                        const path = entry.url.replace(seoConfig?.siteUrl || '', '');
                        const displayName = path === '' || path === '/' ? 'home' : path;
                        return (
                          <li key={entry.url} className="text-gray-700 dark:text-gray-300">
                            <code>{displayName}</code>
                            <span className="text-xs text-gray-500 ml-2">
                              (priority: {entry.priority})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No static pages in sitemap</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <a 
                    href="/sitemap-pages.xml" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View sitemap-pages.xml →
                  </a>
                </div>
              </div>

              {/* Blog Posts Sitemap */}
              <div className="card p-6">
                <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Blog Posts Sitemap
                </h3>
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {sitemapData?.sitemaps?.blogPosts?.message || `Contains ${sitemapData?.sitemaps?.blogPosts?.count || 0} blog posts`}
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {sitemapData?.sitemaps?.blogPosts?.entries?.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {sitemapData.sitemaps.blogPosts.entries.slice(0, 10).map((entry: any) => (
                        <li key={entry.url} className="text-gray-700 dark:text-gray-300">
                          <code>{entry.url.replace(seoConfig?.siteUrl || '', '')}</code>
                        </li>
                      ))}
                      {sitemapData.sitemaps.blogPosts.entries.length > 10 && (
                        <li className="text-gray-500 dark:text-gray-400 italic">
                          ... and {sitemapData.sitemaps.blogPosts.entries.length - 10} more
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      {sitemapData?.sitemaps?.blogPosts?.message || 'No blog posts in sitemap'}
                    </p>
                  )}
                </div>
                
                {sitemapData?.sitemaps?.blogPosts?.count > 0 && (
                  <div className="mt-4">
                    <a 
                      href="/sitemap-blog-posts.xml" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View sitemap-blog-posts.xml →
                    </a>
                  </div>
                )}
              </div>

              {/* Blog Categories Sitemap */}
              <div className="card p-6">
                <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Blog Categories Sitemap
                </h3>
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {sitemapData?.sitemaps?.categories?.message || `Contains ${sitemapData?.sitemaps?.categories?.count || 0} category pages`}
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {sitemapData?.sitemaps?.categories?.entries?.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {sitemapData.sitemaps.categories.entries.map((entry: any) => (
                        <li key={entry.url} className="text-gray-700 dark:text-gray-300">
                          <code>{entry.url.replace(seoConfig?.siteUrl || '', '')}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      {sitemapData?.sitemaps?.categories?.message || 'No category pages in sitemap'}
                    </p>
                  )}
                </div>
                
                {sitemapData?.sitemaps?.categories?.count > 0 && (
                  <div className="mt-4">
                    <a 
                      href="/sitemap-blog-categories.xml" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View sitemap-blog-categories.xml →
                    </a>
                  </div>
                )}
              </div>

              {/* Sitemap Info */}
              <div className="card p-6">
                <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Sitemap Structure
                </h3>
                <div className="space-y-3 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="flex items-start gap-2">
                    <span>📁</span>
                    <span>
                      <strong>sitemap.xml</strong> - Main index file
                    </span>
                  </p>
                  <p className="flex items-start gap-2 ml-4">
                    <span>├</span>
                    <span>
                      <strong>sitemap-pages.xml</strong> - Static pages
                    </span>
                  </p>
                  <p className="flex items-start gap-2 ml-4">
                    <span>├</span>
                    <span>
                      <strong>sitemap-blog-posts.xml</strong> - Blog articles
                    </span>
                  </p>
                  <p className="flex items-start gap-2 ml-4">
                    <span>└</span>
                    <span>
                      <strong>sitemap-blog-categories.xml</strong> - Category pages
                    </span>
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✅ Following SEO best practices with separate sitemaps for better crawling
                  </p>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="card p-6">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Download Options
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-blog-posts.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${seoConfig?.siteUrl || 'https://valiancemedia.com'}/sitemap-blog-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
                    const blob = new Blob([sitemapIndex], { type: 'text/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sitemap.xml';
                    a.click();
                  }}
                  className="btn btn-primary"
                >
                  Download Sitemap Index
                </button>
                
                <button
                  onClick={async () => {
                    // Fetch actual sitemap XML for pages
                    const res = await fetch('/api/admin/seo/sitemap?type=pages');
                    if (res.ok) {
                      const data = await res.json();
                      const blob = new Blob([data.xml], { type: 'text/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sitemap-pages.xml';
                      a.click();
                    }
                  }}
                  className="btn btn-secondary"
                >
                  Download Pages Sitemap
                </button>
              </div>
            </div>

            {/* Help Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-body-sm flex items-start gap-2">
                <span>💡</span>
                <span>
                  Your sitemaps are automatically generated and served at their respective URLs. 
                  The main sitemap index at{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    /sitemap.xml
                  </code>{' '}
                  references all sub-sitemaps, following SEO best practices similar to Yoast SEO.
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
                  onClick={handleRobotsUpdate}
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
{schemas?.organization ? JSON.stringify(schemas.organization, null, 2) : 'Loading...'}
                </pre>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium mb-2">Article Schema</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                  {schemas?.article ? 'Configured for blog posts' : 'Recommended for blog posts'}
                </p>
                <button className="btn btn-secondary">
                  {schemas?.article ? 'Edit Article Schema' : 'Configure Article Schema'}
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Product Schema</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                  {schemas?.product ? 'Configured for products' : 'For e-commerce products (not configured)'}
                </p>
                <button className="btn btn-secondary">
                  {schemas?.product ? 'Edit Product Schema' : 'Add Product Schema'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && <SEOConfigEditor />}
        
        {activeTab === 'redirects' && <RedirectsManager />}
      </div>
    </div>
  );
}