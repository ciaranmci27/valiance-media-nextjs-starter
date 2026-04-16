'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import HealthTab from '@/components/admin/seo/HealthTab';
import RobotsTab from '@/components/admin/seo/RobotsTab';
import SitemapTab from '@/components/admin/seo/SitemapTab';
import SchemaTab from '@/components/admin/seo/SchemaTab';
import LlmsTab from '@/components/admin/seo/LlmsTab';

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

type TabId = 'health' | 'config' | 'redirects' | 'robots' | 'sitemap' | 'schema' | 'llms';

const TABS: { id: TabId; label: string }[] = [
  { id: 'config',    label: 'Configuration' },
  { id: 'redirects', label: 'Redirects' },
  { id: 'robots',    label: 'Robots.txt' },
  { id: 'sitemap',   label: 'Sitemap' },
  { id: 'schema',    label: 'Schema' },
  { id: 'llms',      label: 'AI Search' },
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

  /* sync URL -> state */
  useEffect(() => {
    const t = searchParams.get('tab') as TabId | null;
    if (t && TAB_IDS.includes(t)) setActiveTab(t);
  }, [searchParams]);

  /* push state -> URL */
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

  /* Skeleton loader */
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

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          SEO Dashboard
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your site&apos;s search engine optimization
        </p>
      </div>

      {/* Tab bar */}
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

      {/* Tab content */}
      {activeTab === 'health' && (
        <HealthTab stats={stats} seoConfig={seoConfig} robotsTxt={robotsTxt} onNavigate={(tab) => navigate(tab as TabId)} />
      )}

      <div style={{ display: activeTab === 'config' ? 'block' : 'none' }}>
        <SEOConfigEditor initialSection={configInitialSection} />
      </div>

      {activeTab === 'redirects' && <RedirectsManager />}

      {activeTab === 'robots' && (
        <RobotsTab
          robotsTxt={robotsTxt}
          onRobotsTxtChange={setRobotsTxt}
          seoConfig={seoConfig}
          isSaving={isSaving}
          onSave={handleRobotsUpdate}
        />
      )}

      {activeTab === 'sitemap' && (
        <SitemapTab sitemapData={sitemapData} seoConfig={seoConfig} />
      )}

      {activeTab === 'schema' && (
        <SchemaTab
          seoConfig={seoConfig}
          schemas={schemas}
          onNavigate={(tab) => navigate(tab as TabId)}
          onConfigSection={setConfigInitialSection}
        />
      )}

      {activeTab === 'llms' && <LlmsTab />}
    </div>
  );
}
