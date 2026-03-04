'use client';

import {
  DocumentTextIcon,
  GlobeAltIcon,
  FolderIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import AdminBanner from '@/components/admin/ui/AdminBanner';

interface SEOStats {
  totalPages: number;
  pagesWithMeta: number;
  pagesWithOG: number;
  sitemapPages: number;
  indexedPages: number;
}

interface HealthTabProps {
  stats: SEOStats;
  seoConfig: any;
  robotsTxt: string;
  onNavigate: (tab: string) => void;
}

export default function HealthTab({ stats, seoConfig, robotsTxt, onNavigate }: HealthTabProps) {
  const metaCoverage = stats.totalPages > 0 ? Math.round((stats.pagesWithMeta / stats.totalPages) * 100) : 0;
  const ogCoverage = stats.totalPages > 0 ? Math.round((stats.pagesWithOG / stats.totalPages) * 100) : 0;
  const hasRobots = robotsTxt.trim().length > 0;
  const hasSitemap = robotsTxt.toLowerCase().includes('sitemap:');
  const schemaCount = seoConfig?.schema?.activeTypes ? Object.values(seoConfig.schema.activeTypes).filter(Boolean).length : 0;
  const hasSchemas = schemaCount > 0;

  const checks = [
    {
      label: 'Meta Tags',
      desc: metaCoverage === 100 ? 'All pages have title & description' : `${stats.pagesWithMeta}/${stats.totalPages} pages have meta tags`,
      ok: metaCoverage === 100,
      warn: metaCoverage > 0 && metaCoverage < 100,
      action: { label: 'Configure', tab: 'config' },
      icon: DocumentTextIcon,
    },
    {
      label: 'Open Graph',
      desc: ogCoverage === 100 ? 'All pages have social sharing tags' : `${stats.pagesWithOG}/${stats.totalPages} pages have OG tags`,
      ok: ogCoverage === 100,
      warn: ogCoverage > 0 && ogCoverage < 100,
      action: { label: 'Configure', tab: 'config' },
      icon: GlobeAltIcon,
    },
    {
      label: 'Sitemap',
      desc: stats.sitemapPages > 0 ? `${stats.sitemapPages} URLs indexed across all sitemaps` : 'No URLs in sitemap',
      ok: stats.sitemapPages > 0,
      warn: false,
      action: { label: 'View Sitemap', tab: 'sitemap' },
      icon: FolderIcon,
    },
    {
      label: 'Robots.txt',
      desc: hasRobots
        ? hasSitemap ? 'Configured with sitemap reference' : 'Configured but missing sitemap reference'
        : 'Not configured',
      ok: hasRobots && hasSitemap,
      warn: hasRobots && !hasSitemap,
      action: { label: 'Edit Robots', tab: 'robots' },
      icon: DocumentTextIcon,
    },
    {
      label: 'Schema Markup',
      desc: hasSchemas ? `${schemaCount} active schema ${schemaCount === 1 ? 'type' : 'types'}` : 'No structured data configured',
      ok: schemaCount >= 2,
      warn: schemaCount === 1,
      action: { label: 'View Schema', tab: 'schema' },
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
          <p className="text-body-sm mt-2 mb-0" style={{ color: 'var(--color-text-tertiary)' }}>
            {passCount === checks.length ? 'All checks passing' : `${warnCount + failCount} need${warnCount + failCount === 1 ? 's' : ''} attention`}
          </p>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Meta Coverage
          </p>
          <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{metaCoverage}%</p>
          <p className="text-body-sm mt-2 mb-0" style={{ color: metaCoverage === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {stats.pagesWithMeta}/{stats.totalPages} pages
          </p>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Open Graph
          </p>
          <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{ogCoverage}%</p>
          <p className="text-body-sm mt-2 mb-0" style={{ color: ogCoverage === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {stats.pagesWithOG}/{stats.totalPages} pages
          </p>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Sitemap URLs
          </p>
          <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>{stats.sitemapPages}</p>
          <p className="text-body-sm mt-2 mb-0" style={{ color: 'var(--color-text-tertiary)' }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2">
          {checks.map((check, i) => {
            const Icon = check.icon;
            const statusColor = check.ok ? 'var(--color-success)' : check.warn ? 'var(--color-warning)' : 'var(--color-error)';
            const isLeftCol = i % 2 === 0;
            return (
              <div key={check.label} className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)', borderRight: isLeftCol ? '1px solid var(--color-border-light)' : undefined }}>
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
                  onClick={() => onNavigate(check.action.tab)}
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
}
