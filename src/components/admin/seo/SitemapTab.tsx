'use client';

import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';

interface SitemapTabProps {
  sitemapData: any;
  seoConfig: any;
}

export default function SitemapTab({ sitemapData, seoConfig }: SitemapTabProps) {
  const pagesCount = sitemapData?.sitemaps?.pages?.count || 0;
  const postsCount = sitemapData?.sitemaps?.blogPosts?.count || 0;
  const categoriesCount = sitemapData?.sitemaps?.categories?.count || 0;
  const totalUrls = pagesCount + postsCount + categoriesCount;

  const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );

  const handleDownloadIndex = () => {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-pages.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-blog-posts.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-blog-categories.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n</sitemapindex>`;
    const blob = new Blob([sitemapIndex], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Total URLs
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: totalUrls > 0 ? 'var(--color-success)' : 'var(--color-warning)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {totalUrls} {totalUrls === 1 ? 'URL' : 'URLs'} indexed
            </span>
          </div>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Pages
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: pagesCount > 0 ? 'var(--color-success)' : 'var(--color-warning)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {pagesCount} {pagesCount === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Blog Posts
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: postsCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {postsCount} {postsCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Categories
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: categoriesCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {categoriesCount} {categoriesCount === 1 ? 'category' : 'categories'}
            </span>
          </div>
        </div>
      </div>

      {/* Sitemap files list */}
      <div className="dash-card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div className="flex items-center gap-2">
            <h2 className="dash-card-title" style={{ margin: 0 }}>Sitemap Files</h2>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="dash-card-link"
              style={{ fontSize: '13px' }}
            >
              View Live Index
            </a>
            <AdminButton
              size="sm"
              variant="secondary"
              onClick={handleDownloadIndex}
            >
              Download Index
            </AdminButton>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Sitemap Index */}
          <div className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: 'var(--radius-full)', flexShrink: 0,
              background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700,
            }}>&#9776;</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code style={{ fontSize: '13px', fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace", color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  sitemap.xml
                </code>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>index</span>
              </div>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                3 sub-sitemaps &middot; {totalUrls} total URLs
              </p>
            </div>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="pages-action-btn" title="View">
              <ExternalLinkIcon />
            </a>
          </div>

          {/* Pages sitemap */}
          <div className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: 'var(--radius-full)', flexShrink: 0,
              background: pagesCount > 0 ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-text-tertiary) 12%, transparent)',
              color: pagesCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 700,
            }}>{pagesCount > 0 ? '\u2713' : '\u2022'}</span>
            <div className="flex-1 min-w-0">
              <code style={{ fontSize: '13px', fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace", color: 'var(--color-text-primary)' }}>
                sitemap-pages.xml
              </code>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                {pagesCount} static {pagesCount === 1 ? 'page' : 'pages'}
              </p>
            </div>
            <a href="/sitemap-pages.xml" target="_blank" rel="noopener noreferrer" className="pages-action-btn" title="View">
              <ExternalLinkIcon />
            </a>
          </div>

          {/* Blog posts sitemap */}
          <div className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: 'var(--radius-full)', flexShrink: 0,
              background: postsCount > 0 ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-text-tertiary) 12%, transparent)',
              color: postsCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 700,
            }}>{postsCount > 0 ? '\u2713' : '\u2022'}</span>
            <div className="flex-1 min-w-0">
              <code style={{ fontSize: '13px', fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace", color: 'var(--color-text-primary)' }}>
                sitemap-blog-posts.xml
              </code>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                {postsCount} blog {postsCount === 1 ? 'post' : 'posts'}
              </p>
            </div>
            <a href="/sitemap-blog-posts.xml" target="_blank" rel="noopener noreferrer" className="pages-action-btn" title="View">
              <ExternalLinkIcon />
            </a>
          </div>

          {/* Categories sitemap */}
          <div className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: 'var(--radius-full)', flexShrink: 0,
              background: categoriesCount > 0 ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-text-tertiary) 12%, transparent)',
              color: categoriesCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 700,
            }}>{categoriesCount > 0 ? '\u2713' : '\u2022'}</span>
            <div className="flex-1 min-w-0">
              <code style={{ fontSize: '13px', fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace", color: 'var(--color-text-primary)' }}>
                sitemap-blog-categories.xml
              </code>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                {categoriesCount} {categoriesCount === 1 ? 'category' : 'categories'}
              </p>
            </div>
            <a href="/sitemap-blog-categories.xml" target="_blank" rel="noopener noreferrer" className="pages-action-btn" title="View">
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>

      {/* URL entries */}
      <div className="dash-card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 className="dash-card-title" style={{ margin: 0 }}>Indexed URLs</h3>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {/* Pages entries */}
          {sitemapData?.sitemaps?.pages?.entries?.length > 0 && (
            <>
              {sitemapData.sitemaps.pages.entries.map((entry: any) => {
                const path = entry.url.replace(seoConfig?.siteUrl || '', '');
                const displayName = path === '' || path === '/' ? '/' : path;
                return (
                  <div key={entry.url} className="pages-row" style={{ padding: '8px 20px', gap: '8px' }}>
                    <code className="pages-path-code">{displayName}</code>
                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', marginLeft: 'auto' }}>
                      priority: {entry.priority}
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {/* Blog post entries */}
          {sitemapData?.sitemaps?.blogPosts?.entries?.length > 0 && (
            <>
              {sitemapData.sitemaps.blogPosts.entries.map((entry: any) => (
                <div key={entry.url} className="pages-row" style={{ padding: '8px 20px', gap: '8px' }}>
                  <code className="pages-path-code">{entry.url.replace(seoConfig?.siteUrl || '', '')}</code>
                </div>
              ))}
            </>
          )}

          {/* Category entries */}
          {sitemapData?.sitemaps?.categories?.entries?.length > 0 && (
            <>
              {sitemapData.sitemaps.categories.entries.map((entry: any) => (
                <div key={entry.url} className="pages-row" style={{ padding: '8px 20px', gap: '8px' }}>
                  <code className="pages-path-code">{entry.url.replace(seoConfig?.siteUrl || '', '')}</code>
                </div>
              ))}
            </>
          )}

          {totalUrls === 0 && (
            <div className="dash-empty-state" style={{ padding: '32px 16px' }}>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                No URLs in sitemap yet. Add pages and blog posts to populate.
              </p>
            </div>
          )}
        </div>
      </div>

      <AdminBanner>
        <p>
          Sitemaps are automatically generated and served at their respective URLs.
          The main index at <code className="pages-path-code">/sitemap.xml</code> references all sub-sitemaps.
          Configure exclusions and priorities in the <strong>Configuration</strong> tab under <strong>Sitemap</strong>.
        </p>
      </AdminBanner>
    </div>
  );
}
