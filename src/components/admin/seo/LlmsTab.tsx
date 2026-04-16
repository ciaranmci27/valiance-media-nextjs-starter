'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';
import { Switch } from '@/components/admin/ui/Switch';

interface LlmsSettingsState {
  enabled: boolean;
  aiCrawlers: Record<string, boolean>;
}

interface LlmsStats {
  indexedPages: number;
  indexedPosts: number;
}

const CRAWLER_LABELS: Record<string, string> = {
  'GPTBot': 'OpenAI / ChatGPT',
  'ChatGPT-User': 'ChatGPT browse-on-demand',
  'PerplexityBot': 'Perplexity',
  'ClaudeBot': 'Anthropic Claude',
  'anthropic-ai': 'Anthropic (legacy)',
  'Google-Extended': 'Google Gemini + AI Overviews',
};

export default function LlmsTab() {
  const [settings, setSettings] = useState<LlmsSettingsState | null>(null);
  const [original, setOriginal] = useState<LlmsSettingsState | null>(null);
  const [stats, setStats] = useState<LlmsStats>({ indexedPages: 0, indexedPosts: 0 });
  const [knownCrawlers, setKnownCrawlers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/seo/llms');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (cancelled) return;
        setSettings(data.settings);
        setOriginal(data.settings);
        setStats(data.stats || { indexedPages: 0, indexedPosts: 0 });
        setKnownCrawlers(data.knownCrawlers || []);
      } catch (err) {
        console.error('Error loading AI Search settings:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const isDirty = useMemo(() => {
    if (!settings || !original) return false;
    if (settings.enabled !== original.enabled) return true;
    for (const name of Object.keys(settings.aiCrawlers)) {
      if (settings.aiCrawlers[name] !== original.aiCrawlers[name]) return true;
    }
    return false;
  }, [settings, original]);

  const handleToggleEnabled = (next: boolean) => {
    setSettings((prev) => (prev ? { ...prev, enabled: next } : prev));
  };

  const handleToggleCrawler = (name: string, next: boolean) => {
    setSettings((prev) => (
      prev ? { ...prev, aiCrawlers: { ...prev.aiCrawlers, [name]: next } } : prev
    ));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/llms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setSettings(data.settings);
      setOriginal(data.settings);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error('Error saving AI Search settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const enabledCrawlerCount = knownCrawlers.filter((c) => settings.aiCrawlers[c]).length;

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Status
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: settings.enabled ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {settings.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Indexed for AI
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: (stats.indexedPages + stats.indexedPosts) > 0 ? 'var(--color-success)' : 'var(--color-warning)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {stats.indexedPages} {stats.indexedPages === 1 ? 'page' : 'pages'}, {stats.indexedPosts} {stats.indexedPosts === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>
        <div className="dash-card">
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            AI Crawlers Allowed
          </p>
          <div className="flex items-center gap-2">
            <span className="dash-status-dot" style={{ background: enabledCrawlerCount > 0 ? 'var(--color-success)' : 'var(--color-warning)' }} />
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {enabledCrawlerCount} / {knownCrawlers.length} enabled
            </span>
          </div>
        </div>
      </div>

      {/* Master toggle */}
      <div className="dash-card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)' }}>
          <h2 className="dash-card-title" style={{ margin: 0 }}>AI Search (llms.txt)</h2>
        </div>
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
          >
            <div style={{ maxWidth: '80%' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Enable AI Search discoverability
              </span>
              <p className="text-xs mt-1 mb-0" style={{ color: 'var(--color-text-secondary)' }}>
                Serves <code className="pages-path-code">/llms.txt</code> and a markdown
                (<code className="pages-path-code">.md</code>) copy of every published blog post so AI answer engines
                (ChatGPT, Claude, Perplexity, Gemini) can cite your content. When off, both surfaces 404 and AI crawlers
                stop receiving dedicated rules in robots.txt.
              </p>
            </div>
            <Switch checked={settings.enabled} onChange={handleToggleEnabled} />
          </div>
        </div>
      </div>

      {/* AI crawler allowlist */}
      <div className="dash-card" style={{ padding: 0, opacity: settings.enabled ? 1 : 0.6 }}>
        <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 className="dash-card-title" style={{ margin: 0 }}>AI Crawler Allowlist</h2>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '4px 0 0' }}>
              A crawler that can&apos;t reach your site can&apos;t cite it. Each entry here becomes a dedicated rule block in robots.txt.
            </p>
          </div>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="dash-card-link"
            style={{ fontSize: '13px' }}
          >
            View Live robots.txt
          </a>
        </div>
        <div>
          {knownCrawlers.map((name, idx) => (
            <div
              key={name}
              className="flex items-center justify-between"
              style={{
                padding: '14px 20px',
                borderBottom: idx < knownCrawlers.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="pages-path-code" style={{ fontSize: '13px' }}>{name}</code>
                </div>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '2px 0 0' }}>
                  {CRAWLER_LABELS[name] || name}
                </p>
              </div>
              <Switch
                checked={!!settings.aiCrawlers[name]}
                onChange={(next) => handleToggleCrawler(name, next)}
                disabled={!settings.enabled}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
          {justSaved ? 'Saved.' : isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => setSettings(original)}
            disabled={!isDirty || saving}
          >
            Discard
          </AdminButton>
          <AdminButton
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </AdminButton>
        </div>
      </div>

      <AdminBanner>
        <p>
          Per-page exclusion: set <code className="pages-path-code">&quot;llms&quot;: &#123; &quot;exclude&quot;: true &#125;</code> in a page&apos;s
          <code className="pages-path-code">seo-config.json</code> (or flip the toggle in its Page editor) to keep it out of <code className="pages-path-code">/llms.txt</code>.
          Blog posts marked as drafts or excluded from search are already skipped automatically.
        </p>
      </AdminBanner>
    </div>
  );
}
