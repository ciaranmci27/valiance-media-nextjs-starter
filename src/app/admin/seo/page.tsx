'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SEOConfigEditor = dynamic(() => import('@/components/admin/seo/SEOConfigEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'config');
  const [configInitialSection, setConfigInitialSection] = useState<string | undefined>(undefined);
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

  // Keep the desired initial section when navigating from other tabs
  // Do not auto-reset; the child component will read the prop once on mount

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
                  className="text-primary hover:text-primary-dark text-sm font-medium"
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
                    className="text-primary hover:text-primary-dark text-sm font-medium"
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
                      className="text-primary hover:text-primary-dark text-sm font-medium"
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
                      className="text-primary hover:text-primary-dark text-sm font-medium"
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
            <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
              <p className="text-body-sm flex items-start gap-2">
                <span>💡</span>
                <span>
                  Your sitemaps are automatically generated and served at their respective URLs. 
                  The main sitemap index at{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    /sitemap.xml
                  </code>{' '}
                  references all sub-sitemaps, following SEO best practices.
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
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                    Global Schema Markup
                  </h2>
                  <p className="text-body-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    View all structured data schemas currently active on your website
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setConfigInitialSection('schema');
                    setActiveTab('config');
                  }}
                  className="btn btn-primary"
                >
                  Configure Schemas
                </button>
              </div>

              {/* Schema Status Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.activeTypes?.organization ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="text-xs font-medium">Organization</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.activeTypes?.organization ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.activeTypes?.organization ? '✓ Active' : 'Inactive'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.activeTypes?.localBusiness ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-xs font-medium">LocalBusiness</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.activeTypes?.localBusiness ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.activeTypes?.localBusiness ? '✓ Active' : 'Inactive'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.activeTypes?.person ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">👤</div>
                  <div className="text-xs font-medium">Person</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.activeTypes?.person ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.activeTypes?.person ? '✓ Active' : 'Inactive'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.organization?.contactPoint?.enabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">📞</div>
                  <div className="text-xs font-medium">Contact Point</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.organization?.contactPoint?.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.organization?.contactPoint?.enabled ? '✓ Active' : 'Inactive'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.activeTypes?.breadcrumbs ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">🍞</div>
                  <div className="text-xs font-medium">Breadcrumbs</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.activeTypes?.breadcrumbs ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.activeTypes?.breadcrumbs ? '✓ Active' : 'Inactive'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${seoConfig?.schema?.activeTypes?.website ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="text-2xl mb-1">🌐</div>
                  <div className="text-xs font-medium">WebSite</div>
                  <div className={`text-xs mt-1 ${seoConfig?.schema?.activeTypes?.website ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {seoConfig?.schema?.activeTypes?.website ? '✓ Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Active Schemas Details */}
              <div className="space-y-4">
                {/* Organization Schema */}
                {seoConfig?.schema?.activeTypes?.organization && schemas?.organization && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏢</span>
                          <h3 className="font-semibold">Organization Schema</h3>
                          <span className="badge badge-success text-xs">Active</span>
                        </div>
                        <button 
                          onClick={() => {
                            const schemaEl = document.getElementById('org-schema-code');
                            if (schemaEl) {
                              navigator.clipboard.writeText(schemaEl.textContent || '');
                              // You could add a toast notification here
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Copy JSON-LD
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre id="org-schema-code" className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(schemas.organization, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* LocalBusiness Schema */}
                {seoConfig?.schema?.activeTypes?.localBusiness && schemas?.localBusiness && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <h3 className="font-semibold">LocalBusiness Schema</h3>
                          <span className="badge badge-success text-xs">Active</span>
                        </div>
                        <button 
                          onClick={() => {
                            const schemaEl = document.getElementById('local-schema-code');
                            if (schemaEl) {
                              navigator.clipboard.writeText(schemaEl.textContent || '');
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Copy JSON-LD
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre id="local-schema-code" className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(schemas.localBusiness, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Person Schema */}
                {seoConfig?.schema?.activeTypes?.person && schemas?.person && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <h3 className="font-semibold">Person Schema</h3>
                          <span className="badge badge-success text-xs">Active</span>
                        </div>
                        <button 
                          onClick={() => {
                            const schemaEl = document.getElementById('person-schema-code');
                            if (schemaEl) {
                              navigator.clipboard.writeText(schemaEl.textContent || '');
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Copy JSON-LD
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre id="person-schema-code" className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(schemas.person, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Contact Point Schema */}
                {seoConfig?.schema?.organization?.contactPoint?.enabled && schemas?.organization?.contactPoint && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📞</span>
                          <h3 className="font-semibold">Contact Point Schema</h3>
                          <span className="badge badge-success text-xs">Active</span>
                        </div>
                        <button 
                          onClick={() => {
                            const schemaEl = document.getElementById('contact-schema-code');
                            if (schemaEl) {
                              navigator.clipboard.writeText(schemaEl.textContent || '');
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Copy JSON-LD
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre id="contact-schema-code" className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(schemas.organization?.contactPoint, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Breadcrumbs Schema Info */}
                {seoConfig?.schema?.activeTypes?.breadcrumbs && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍞</span>
                        <h3 className="font-semibold">Breadcrumbs Schema</h3>
                        <span className="badge badge-success text-xs">Active</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Breadcrumbs are dynamically generated for each page based on the URL structure.
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                        <p className="text-xs font-medium mb-2">Configuration:</p>
                        <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Home Label: <span className="font-mono">{seoConfig?.schema?.breadcrumbs?.homeLabel || 'Home'}</span></li>
                          <li>• Separator: <span className="font-mono">{seoConfig?.schema?.breadcrumbs?.separator || '›'}</span></li>
                          <li>• Show Current: <span className="font-mono">{seoConfig?.schema?.breadcrumbs?.showCurrent ? 'Yes' : 'No'}</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website Schema */}
                {seoConfig?.schema?.activeTypes?.website && schemas?.website && (
                  <div className="rounded-lg">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌐</span>
                          <h3 className="font-semibold">WebSite Schema</h3>
                          <span className="badge badge-success text-xs">Active</span>
                          {schemas.website?.potentialAction && (
                            <span className="badge badge-primary text-xs">Search Box Enabled</span>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            const schemaEl = document.getElementById('website-schema-code');
                            if (schemaEl) {
                              navigator.clipboard.writeText(schemaEl.textContent || '');
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Copy JSON-LD
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre id="website-schema-code" className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(schemas.website, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* No Active Schemas Message */}
                {!seoConfig?.schema?.activeTypes?.organization && 
                 !seoConfig?.schema?.activeTypes?.website && 
                 !seoConfig?.schema?.activeTypes?.localBusiness && 
                 !seoConfig?.schema?.activeTypes?.person && 
                 !seoConfig?.schema?.activeTypes?.breadcrumbs && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium mb-2">No Active Schemas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable structured data schemas to enhance your search appearance
                    </p>
                  </div>
                )}
              </div>

              {/* Schema Validation Tools */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium mb-3">🔍 Validation Tools</h4>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://search.google.com/test/rich-results" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Google Rich Results Test →
                  </a>
                  <a 
                    href="https://validator.schema.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Schema.org Validator →
                  </a>
                  <a 
                    href="https://developers.facebook.com/tools/debug/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Facebook Debugger →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && <SEOConfigEditor initialSection={configInitialSection} />}
        
        {activeTab === 'redirects' && <RedirectsManager />}
      </div>
    </div>
  );
}