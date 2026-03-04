'use client';

import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';
import { Textarea } from '@/components/ui/inputs';

interface RobotsTabProps {
  robotsTxt: string;
  onRobotsTxtChange: (val: string) => void;
  seoConfig: any;
  isSaving: boolean;
  onSave: () => void;
}

export default function RobotsTab({ robotsTxt, onRobotsTxtChange, seoConfig, isSaving, onSave }: RobotsTabProps) {
  return (
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
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: robotsTxt.split('\n').some(line => line.trim() === 'Disallow: /') ? 'var(--color-warning)' : 'var(--color-success)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {robotsTxt.split('\n').some(line => line.trim() === 'Disallow: /') ? 'Restricted' : 'Allowed'}
            </span>
          </div>
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
              onClick={() => onRobotsTxtChange(`User-agent: *\nAllow: /\n\n# Block admin and API routes\nDisallow: /admin\nDisallow: /api\n\n# Sitemap\nSitemap: ${seoConfig?.siteUrl || 'https://yoursite.com'}/sitemap.xml`)}
            >
              Reset to Default
            </AdminButton>
            <AdminButton size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </AdminButton>
          </div>
        </div>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <Textarea
            value={robotsTxt}
            onChange={(val) => onRobotsTxtChange(val)}
            rows={14}
            inputClassName="font-mono text-[13px] leading-[1.7]"
            resizable
          />
        </div>
      </div>

      <AdminBanner>
        <p>
          The <code className="pages-path-code">robots.txt</code> file tells search engine crawlers which pages they can or cannot access.
          Always include a <strong>Sitemap</strong> reference for better discoverability. Block sensitive routes like <code className="pages-path-code">/admin</code> and <code className="pages-path-code">/api</code>.
        </p>
      </AdminBanner>
    </div>
  );
}
