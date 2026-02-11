'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  UserIcon,
  GlobeAltIcon,
  PhoneIcon,
  QueueListIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';

const SEOConfigEditor = dynamic(() => import('@/components/admin/seo/SEOConfigEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg) 0' }}>
      <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
    </div>
  )
});

const RedirectsManager = dynamic(() => import('@/components/admin/seo/RedirectsManager'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg) 0' }}>
      <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
    </div>
  )
});

interface SEOStats {
  totalPages: number;
  pagesWithMeta: number;
  pagesWithOG: number;
  sitemapPages: number;
  indexedPages: number;
}

type TabId = 'health' | 'config' | 'redirects' | 'robots' | 'sitemap' | 'schema';

const TABS: { id: TabId; label: string }[] = [
  { id: 'config',    label: 'Configuration' },
  { id: 'redirects', label: 'Redirects' },
  { id: 'robots',    label: 'Robots.txt' },
  { id: 'sitemap',   label: 'Sitemap' },
  { id: 'schema',    label: 'Schema' },
  { id: 'health',    label: 'Health' },
];

const TAB_IDS = TABS.map(t => t.id);

export default function SEODashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TAB_IDS.includes(tabParam) ? tabParam : 'config'
  );
  const [configInitialSection, setConfigInitialSection] = useState<string | undefined>(undefined);

  /* data */
  const [stats, setStats] = useState<SEOStats>({
    totalPages: 0, pagesWithMeta: 0, pagesWithOG: 0, sitemapPages: 0, indexedPages: 0,
  });
  const [robotsTxt, setRobotsTxt] = useState('');
  const [schemas, setSchemas] = useState<any>({});
  const [seoConfig, setSeoConfig] = useState<any>(null);
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /* sync URL → state */
  useEffect(() => {
    const t = searchParams.get('tab') as TabId | null;
    if (t && TAB_IDS.includes(t)) setActiveTab(t);
  }, [searchParams]);

  /* push state → URL */
  const navigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
  }, [router]);

  /* fetch all SEO data */
  useEffect(() => {
    const fetchSEOData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, robotsRes, schemaRes, configRes, sitemapRes] = await Promise.all([
          fetch('/api/admin/seo?type=stats'),
          fetch('/api/admin/seo?type=robots'),
          fetch('/api/admin/seo?type=schema'),
          fetch('/api/admin/seo'),
          fetch('/api/admin/seo/sitemap'),
        ]);

        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.stats); }
        if (robotsRes.ok) { const d = await robotsRes.json(); setRobotsTxt(d.content); }
        if (schemaRes.ok) { const d = await schemaRes.json(); setSchemas(d.schemas); }
        if (configRes.ok) { const d = await configRes.json(); setSeoConfig(d.config); }
        if (sitemapRes.ok) { const d = await sitemapRes.json(); setSitemapData(d); }
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
        body: JSON.stringify({ type: 'robots', data: { content: robotsTxt } })
      });
      setTimeout(() => setIsSaving(false), res.ok ? 1000 : 0);
    } catch (error) {
      console.error('Error updating robots.txt:', error);
      setIsSaving(false);
    }
  };

  /* ── Skeleton loader ──────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-up">
        <div className="hidden md:block">
          <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '340px', height: '20px' }} />
        </div>
        <div className="skeleton" style={{ height: '44px' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  /* ── Stat Card helper ─────────────────────────────────────── */

  const StatCard = ({ title, value, subtitle, color }: {
    title: string; value: number | string; subtitle?: string; color: string;
  }) => (
    <div className="dash-card">
      <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
        {title}
      </p>
      <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
      {subtitle && (
        <p className="text-body-sm mt-2" style={{ color }}>{subtitle}</p>
      )}
    </div>
  );

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-up">
      {/* Header — hidden on mobile, top bar shows title */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          SEO Dashboard
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your site&apos;s search engine optimization
        </p>
      </div>

      {/* Single pill row */}
      <div className="pages-filter-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`pages-filter-pill${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => navigate(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── HEALTH ──────────────────────────────────────────── */}
      {activeTab === 'health' && (() => {
        const metaCoverage = stats.totalPages > 0 ? Math.round((stats.pagesWithMeta / stats.totalPages) * 100) : 0;
        const ogCoverage = stats.totalPages > 0 ? Math.round((stats.pagesWithOG / stats.totalPages) * 100) : 0;
        const hasRobots = robotsTxt.trim().length > 0;
        const hasSitemap = robotsTxt.toLowerCase().includes('sitemap:');
        const hasSchemas = seoConfig?.schema?.activeTypes && Object.values(seoConfig.schema.activeTypes).some(Boolean);
        const schemaCount = seoConfig?.schema?.activeTypes ? Object.values(seoConfig.schema.activeTypes).filter(Boolean).length : 0;

        const checks = [
          {
            label: 'Meta Tags',
            desc: metaCoverage === 100 ? 'All pages have title & description' : `${stats.pagesWithMeta}/${stats.totalPages} pages have meta tags`,
            ok: metaCoverage === 100,
            warn: metaCoverage > 0 && metaCoverage < 100,
            action: { label: 'Configure', tab: 'config' as TabId },
            icon: DocumentTextIcon,
          },
          {
            label: 'Open Graph',
            desc: ogCoverage === 100 ? 'All pages have social sharing tags' : `${stats.pagesWithOG}/${stats.totalPages} pages have OG tags`,
            ok: ogCoverage === 100,
            warn: ogCoverage > 0 && ogCoverage < 100,
            action: { label: 'Configure', tab: 'config' as TabId },
            icon: GlobeAltIcon,
          },
          {
            label: 'Sitemap',
            desc: stats.sitemapPages > 0 ? `${stats.sitemapPages} URLs indexed across all sitemaps` : 'No URLs in sitemap',
            ok: stats.sitemapPages > 0,
            warn: false,
            action: { label: 'View Sitemap', tab: 'sitemap' as TabId },
            icon: FolderIcon,
          },
          {
            label: 'Robots.txt',
            desc: hasRobots
              ? hasSitemap ? 'Configured with sitemap reference' : 'Configured but missing sitemap reference'
              : 'Not configured',
            ok: hasRobots && hasSitemap,
            warn: hasRobots && !hasSitemap,
            action: { label: 'Edit Robots', tab: 'robots' as TabId },
            icon: DocumentTextIcon,
          },
          {
            label: 'Schema Markup',
            desc: hasSchemas ? `${schemaCount} active schema ${schemaCount === 1 ? 'type' : 'types'}` : 'No structured data configured',
            ok: schemaCount >= 2,
            warn: schemaCount === 1,
            action: { label: 'View Schema', tab: 'schema' as TabId },
            icon: CodeBracketIcon,
          },
        ];

        const passCount = checks.filter(c => c.ok).length;
        const warnCount = checks.filter(c => c.warn).length;
        const failCount = checks.filter(c => !c.ok && !c.warn).length;

        return (
        <div className="space-y-6">
          {/* Status cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Health Score
              </p>
              <p className="text-h2" style={{ color: passCount === checks.length ? 'var(--color-success)' : failCount > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
                {passCount}/{checks.length}
              </p>
              <p className="text-body-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {passCount === checks.length ? 'All checks passing' : `${warnCount + failCount} need${warnCount + failCount === 1 ? 's' : ''} attention`}
              </p>
            </div>
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Meta Coverage
              </p>
              <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{metaCoverage}%</p>
              <p className="text-body-sm mt-2" style={{ color: metaCoverage === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {stats.pagesWithMeta}/{stats.totalPages} pages
              </p>
            </div>
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Open Graph
              </p>
              <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{ogCoverage}%</p>
              <p className="text-body-sm mt-2" style={{ color: ogCoverage === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {stats.pagesWithOG}/{stats.totalPages} pages
              </p>
            </div>
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Sitemap URLs
              </p>
              <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{stats.sitemapPages}</p>
              <p className="text-body-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Across all sitemaps
              </p>
            </div>
          </div>

          {/* Health checks list */}
          <div className="dash-card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div className="flex items-center gap-2">
                <h2 className="dash-card-title" style={{ margin: 0 }}>Health Checks</h2>
                {passCount === checks.length ? (
                  <span className="badge badge-success">All Passing</span>
                ) : (
                  <span className="badge" style={{ background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)', color: 'var(--color-warning)' }}>
                    {warnCount + failCount} Issue{warnCount + failCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div>
              {checks.map((check) => {
                const Icon = check.icon;
                const statusColor = check.ok ? 'var(--color-success)' : check.warn ? 'var(--color-warning)' : 'var(--color-error)';
                return (
                  <div key={check.label} className="pages-row" style={{ gap: '12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', flexShrink: 0,
                      background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
                      color: statusColor,
                    }}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {check.label}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '16px', height: '16px', borderRadius: 'var(--radius-full)',
                          fontSize: '10px', fontWeight: 700,
                          background: `color-mix(in srgb, ${statusColor} 14%, transparent)`,
                          color: statusColor,
                        }}>
                          {check.ok ? '\u2713' : check.warn ? '!' : '\u2717'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                        {check.desc}
                      </p>
                    </div>
                    <button
                      className="pages-action-btn"
                      onClick={() => navigate(check.action.tab)}
                      title={check.action.label}
                    >
                      <span className="pages-action-label">{check.action.label}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <AdminBanner>
            <p>
              These checks reflect the current state of your SEO configuration.
              Address warnings to improve search engine visibility and ensure all pages are properly indexed.
            </p>
          </AdminBanner>
        </div>
        );
      })()}

      {/* ── CONFIGURATION — keep mounted for form state ────── */}
      <div style={{ display: activeTab === 'config' ? 'block' : 'none' }}>
        <SEOConfigEditor initialSection={configInitialSection} />
      </div>

      {/* ── REDIRECTS ───────────────────────────────────────── */}
      {activeTab === 'redirects' && <RedirectsManager />}

      {/* ── ROBOTS.TXT ──────────────────────────────────────── */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          {/* Status cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className="dash-status-dot" style={{ background: robotsTxt.trim() ? 'var(--color-success)' : 'var(--color-warning)' }} />
                <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
                  {robotsTxt.trim() ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Crawling
              </p>
              <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
                {robotsTxt.split('\n').some(line => line.trim() === 'Disallow: /') ? 'Restricted' : 'Allowed'}
              </span>
            </div>
            <div className="dash-card">
              <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Sitemap Reference
              </p>
              <div className="flex items-center gap-2">
                <span className="dash-status-dot" style={{ background: robotsTxt.toLowerCase().includes('sitemap:') ? 'var(--color-success)' : 'var(--color-warning)' }} />
                <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
                  {robotsTxt.toLowerCase().includes('sitemap:') ? 'Included' : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="dash-card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div className="flex items-center gap-2">
                <h2 className="dash-card-title" style={{ margin: 0 }}>Robots.txt Editor</h2>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-card-link"
                  style={{ fontSize: '13px' }}
                >
                  View Live File
                </a>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setRobotsTxt(`User-agent: *\nAllow: /\n\n# Block admin and API routes\nDisallow: /admin\nDisallow: /api\n\n# Sitemap\nSitemap: ${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap.xml`)}
                >
                  Reset to Default
                </AdminButton>
                <AdminButton size="sm" onClick={handleRobotsUpdate} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </AdminButton>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
              <textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="input-field w-full input-field-mono"
                style={{ fontSize: '13px', resize: 'vertical', lineHeight: 1.7 }}
                rows={14}
              />
            </div>
          </div>

          {/* Detected rules summary */}
          <div className="dash-card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)' }}>
              <h3 className="dash-card-title" style={{ margin: 0 }}>Detected Rules</h3>
            </div>
            <div>
              {robotsTxt.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('#');
              }).map((line, i) => {
                const trimmed = line.trim();
                const isAllow = trimmed.startsWith('Allow:');
                const isDisallow = trimmed.startsWith('Disallow:');
                const isSitemapLine = trimmed.toLowerCase().startsWith('sitemap:');
                const isUserAgent = trimmed.toLowerCase().startsWith('user-agent:');
                return (
                  <div
                    key={i}
                    className="pages-row"
                    style={{ padding: '10px 20px', gap: '8px' }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      background: isAllow ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
                        : isDisallow ? 'color-mix(in srgb, var(--color-error) 12%, transparent)'
                        : isSitemapLine ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                        : 'color-mix(in srgb, var(--color-text-tertiary) 12%, transparent)',
                      color: isAllow ? 'var(--color-success)'
                        : isDisallow ? 'var(--color-error)'
                        : isSitemapLine ? 'var(--color-primary)'
                        : 'var(--color-text-tertiary)',
                    }}>
                      {isAllow ? '\u2713' : isDisallow ? '\u2717' : isSitemapLine ? '\u2691' : isUserAgent ? '\u2022' : '\u2022'}
                    </span>
                    <code style={{
                      fontSize: '13px',
                      fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                      color: 'var(--color-text-primary)',
                    }}>
                      {trimmed}
                    </code>
                  </div>
                );
              })}
              {robotsTxt.split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).length === 0 && (
                <div className="dash-empty-state" style={{ padding: '32px 16px' }}>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                    No rules detected. Add directives in the editor above.
                  </p>
                </div>
              )}
            </div>
          </div>

          <AdminBanner>
            <p>
              The <code className="pages-path-code">robots.txt</code> file tells search engine crawlers which pages they can or cannot access.
              Always include a <strong>Sitemap</strong> reference for better discoverability. Block sensitive routes like <code className="pages-path-code">/admin</code> and <code className="pages-path-code">/api</code>.
            </p>
          </AdminBanner>
        </div>
      )}

      {/* ── SITEMAP ─────────────────────────────────────────── */}
      {activeTab === 'sitemap' && (() => {
        const pagesCount = sitemapData?.sitemaps?.pages?.count || 0;
        const postsCount = sitemapData?.sitemaps?.blogPosts?.count || 0;
        const categoriesCount = sitemapData?.sitemaps?.categories?.count || 0;
        const totalUrls = pagesCount + postsCount + categoriesCount;

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
                  onClick={() => {
                    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-pages.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-blog-posts.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap-blog-categories.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n</sitemapindex>`;
                    const blob = new Blob([sitemapIndex], { type: 'text/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sitemap.xml';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Index
                </AdminButton>
              </div>
            </div>
            <div>
              {/* Sitemap Index */}
              <div className="pages-row" style={{ gap: '12px' }}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Pages sitemap */}
              <div className="pages-row" style={{ gap: '12px' }}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Blog posts sitemap */}
              <div className="pages-row" style={{ gap: '12px' }}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Categories sitemap */}
              <div className="pages-row" style={{ gap: '12px' }}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
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
                  <div style={{ padding: '8px 20px', background: 'color-mix(in srgb, var(--color-text-primary) 3%, transparent)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
                      Pages
                    </span>
                  </div>
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
                  <div style={{ padding: '8px 20px', background: 'color-mix(in srgb, var(--color-text-primary) 3%, transparent)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
                      Blog Posts
                    </span>
                  </div>
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
                  <div style={{ padding: '8px 20px', background: 'color-mix(in srgb, var(--color-text-primary) 3%, transparent)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>
                      Categories
                    </span>
                  </div>
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
      })()}

      {/* ── SCHEMA ──────────────────────────────────────────── */}
      {activeTab === 'schema' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h2 className="dash-card-title">Global Schema Markup</h2>
              <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                View all structured data schemas currently active on your website
              </p>
            </div>
            <button
              onClick={() => {
                setConfigInitialSection('schema');
                navigate('config');
              }}
              className="admin-btn admin-btn-primary"
            >
              Configure Schemas
            </button>
          </div>

          {/* Schema Status Summary */}
          <div className="dash-system-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {([
              { key: 'organization', label: 'Organization', icon: BuildingOffice2Icon },
              { key: 'localBusiness', label: 'LocalBusiness', icon: MapPinIcon },
              { key: 'person', label: 'Person', icon: UserIcon },
              { key: 'breadcrumbs', label: 'Breadcrumbs', icon: QueueListIcon },
              { key: 'website', label: 'WebSite', icon: GlobeAltIcon },
            ] as const).map(t => {
              const active = seoConfig?.schema?.activeTypes?.[t.key];
              const Icon = t.icon;
              return (
                <div key={t.key} className="dash-system-item">
                  <div className="dash-system-icon" data-ok={!!active}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>
                      {t.label}
                    </div>
                    <div style={{ color: active ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 500 }}>
                      {active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              );
            })}
            {(() => {
              const active = seoConfig?.schema?.organization?.contactPoint?.enabled;
              return (
                <div className="dash-system-item">
                  <div className="dash-system-icon" data-ok={!!active}>
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>
                      Contact Point
                    </div>
                    <div style={{ color: active ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 500 }}>
                      {active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Active Schemas Details */}
          <div className="space-y-4">
            {seoConfig?.schema?.activeTypes?.organization && schemas?.organization && (
              <SchemaBlock id="org" label="Organization Schema" json={schemas.organization} />
            )}
            {seoConfig?.schema?.activeTypes?.localBusiness && schemas?.localBusiness && (
              <SchemaBlock id="local" label="LocalBusiness Schema" json={schemas.localBusiness} />
            )}
            {seoConfig?.schema?.activeTypes?.person && schemas?.person && (
              <SchemaBlock id="person" label="Person Schema" json={schemas.person} />
            )}
            {seoConfig?.schema?.organization?.contactPoint?.enabled && schemas?.organization?.contactPoint && (
              <SchemaBlock id="contact" label="Contact Point Schema" json={schemas.organization.contactPoint} />
            )}
            {seoConfig?.schema?.activeTypes?.breadcrumbs && (
              <div className="dash-card" style={{ padding: 0 }}>
                <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center gap-2">
                    <h3 style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>Breadcrumbs Schema</h3>
                    <span className="badge badge-success">Active</span>
                  </div>
                </div>
                <div style={{ padding: 'var(--spacing-md)' }}>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Dynamically generated for each page based on URL structure.
                  </p>
                  <div className="dash-system-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="dash-system-item">
                      <div>
                        <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 500 }}>Home Label</div>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>{seoConfig?.schema?.breadcrumbs?.homeLabel || 'Home'}</div>
                      </div>
                    </div>
                    <div className="dash-system-item">
                      <div>
                        <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 500 }}>Separator</div>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>{seoConfig?.schema?.breadcrumbs?.separator || '›'}</div>
                      </div>
                    </div>
                    <div className="dash-system-item">
                      <div>
                        <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: 500 }}>Show Current</div>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>{seoConfig?.schema?.breadcrumbs?.showCurrent ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {seoConfig?.schema?.activeTypes?.website && schemas?.website && (
              <SchemaBlock id="website" label="WebSite Schema" json={schemas.website}>
                {schemas.website?.potentialAction && (
                  <span className="badge badge-primary">Search Box</span>
                )}
              </SchemaBlock>
            )}

            {!seoConfig?.schema?.activeTypes?.organization &&
             !seoConfig?.schema?.activeTypes?.website &&
             !seoConfig?.schema?.activeTypes?.localBusiness &&
             !seoConfig?.schema?.activeTypes?.person &&
             !seoConfig?.schema?.activeTypes?.breadcrumbs && (
              <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
                <CodeBracketIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                  No active schemas
                </p>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                  Enable structured data to enhance search appearance
                </p>
              </div>
            )}
          </div>

          {/* Validation Tools */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', fontWeight: 500 }}>Validate:</span>
            <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary admin-btn-sm">
              Rich Results Test
            </a>
            <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary admin-btn-sm">
              Schema.org Validator
            </a>
            <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary admin-btn-sm">
              Facebook Debugger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Schema block helper ─────────────────────────────────────── */

function SchemaBlock({ id, label, json, children }: {
  id: string; label: string; json: any; children?: React.ReactNode;
}) {
  return (
    <div className="dash-card" style={{ padding: 0 }}>
      <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div className="flex items-center gap-2">
          <h3 style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>{label}</h3>
          <span className="badge badge-success">Active</span>
          {children}
        </div>
        <button
          onClick={() => {
            const el = document.getElementById(`${id}-schema-code`);
            if (el) navigator.clipboard.writeText(el.textContent || '');
          }}
          className="pages-action-btn"
          title="Copy JSON-LD"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
          <span className="pages-action-label">Copy</span>
        </button>
      </div>
      <div style={{ padding: 'var(--spacing-md)' }}>
        <pre
          id={`${id}-schema-code`}
          className="text-xs overflow-x-auto max-h-64 overflow-y-auto"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            margin: 0,
            fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
          }}
        >
          {JSON.stringify(json, null, 2)}
        </pre>
      </div>
    </div>
  );
}
