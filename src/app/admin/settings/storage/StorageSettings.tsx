'use client';

import { useState, useEffect } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  TableCellsIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';

const SUPABASE_GREEN = '#3ECF8E';

function getSupabaseRef(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '\u2026';
}

interface StorageSettingsProps {
  supabaseConfigured: boolean;
  supabaseUrl: string;
}

export default function StorageSettings({ supabaseConfigured, supabaseUrl }: StorageSettingsProps) {
  if (supabaseConfigured) {
    return <SupabaseStorageView supabaseUrl={supabaseUrl} />;
  }
  return <LocalStorageView />;
}

// ─── Supabase Storage View ───────────────────────────────────────────────────

interface SupabaseTable {
  table_name: string;
  table_oid: number;
  row_estimate: number;
  has_rls: boolean;
}

interface SupabaseBucket {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
}

function StorageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="skeleton" style={{ width: '80px', height: '20px' }} />
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '140px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '18px' }} />
      </div>
      <div className="skeleton" style={{ height: '64px', borderRadius: 'var(--radius-xl, 16px)' }} />
      <div className="skeleton" style={{ width: '120px', height: '22px' }} />
      <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-xl, 16px)' }} />
      <div className="skeleton" style={{ width: '150px', height: '22px' }} />
      <div className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

function SupabaseStorageView({ supabaseUrl }: { supabaseUrl: string }) {
  const ref = getSupabaseRef(supabaseUrl);
  const dashboardUrl = ref
    ? `https://supabase.com/dashboard/project/${ref}/editor`
    : 'https://supabase.com/dashboard';

  const [tables, setTables] = useState<SupabaseTable[]>([]);
  const [buckets, setBuckets] = useState<SupabaseBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState<string | null>(null);

  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    try {
      const res = await fetch('/api/admin/storage/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables ?? []);
        setBuckets(data.buckets ?? []);
        if (data.rpcError) {
          setRpcError(data.rpcError);
        }
      }
    } catch (error) {
      console.error('Error fetching storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <StorageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block animate-fade-up">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Storage
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Connected to Supabase
        </p>
      </div>

      {/* Connection banner */}
      <AdminBanner variant="success">
        <p className="flex items-start gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: SUPABASE_GREEN,
              display: 'inline-block',
              marginTop: '6px',
              flexShrink: 0,
            }}
          />
          <span>
            Your app is connected to Supabase project{' '}
            <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>
              {ref || 'unknown'}
            </code>.
            Tables and storage buckets are managed through the Supabase dashboard.
          </span>
        </p>
      </AdminBanner>

      {/* RPC setup hint */}
      {rpcError && (
        <AdminBanner variant="warning">
          <p className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" style={{ marginTop: '2px' }} />
            <span>
              The <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>list_public_tables()</code> function
              is not available yet. Run the SQL from{' '}
              <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>supabase/schema.sql</code> in
              your Supabase SQL editor to enable table listing.
            </span>
          </p>
        </AdminBanner>
      )}

      {/* Tables heading */}
      <h2 className="animate-fade-up" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, animationDelay: '60ms' } as React.CSSProperties}>
        Database Tables
      </h2>

      {/* Tables card */}
      <div className="dash-card animate-fade-up" style={{ padding: 0, marginTop: '-8px', animationDelay: '80ms' } as React.CSSProperties}>
        <div className="pages-list-header">
          <span>Table</span>
          <span>Details</span>
        </div>

        {tables.length === 0 && !rpcError ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <CircleStackIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              No tables in the public schema
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Create tables in the Supabase dashboard or run the schema SQL
            </p>
          </div>
        ) : rpcError ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <CircleStackIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              Unable to list tables
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Run the schema SQL to enable table introspection
            </p>
          </div>
        ) : (
          <div className="pages-list">
            {tables.map((table, i) => (
              <div
                key={table.table_name}
                className="pages-row animate-fade-up"
                role="link"
                tabIndex={0}
                onClick={() => {
                  const tableUrl = ref && table.table_oid
                    ? `https://supabase.com/dashboard/project/${ref}/editor/${table.table_oid}?schema=public`
                    : dashboardUrl;
                  window.open(tableUrl, '_blank');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tableUrl = ref && table.table_oid
                      ? `https://supabase.com/dashboard/project/${ref}/editor/${table.table_oid}?schema=public`
                      : dashboardUrl;
                    window.open(tableUrl, '_blank');
                  }
                }}
                style={{ animationDelay: `${120 + i * 40}ms`, cursor: 'pointer' } as React.CSSProperties}
              >
                {/* Left: table info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TableCellsIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
                    <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                      {table.table_name}
                    </h4>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', paddingLeft: '24px' }}>
                    <code className="pages-path-code">public.{table.table_name}</code>
                    <span style={{ opacity: 0.3 }}>&middot;</span>
                    <span className="posts-tag">
                      ~{table.row_estimate.toLocaleString()} {table.row_estimate === 1 ? 'row' : 'rows'}
                    </span>
                    <span style={{ opacity: 0.3 }}>&middot;</span>
                    {table.has_rls ? (
                      <span className="flex items-center gap-1" style={{ color: SUPABASE_GREEN }}>
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        RLS enabled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                        RLS disabled
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Buckets heading */}
      <h2 className="animate-fade-up" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, animationDelay: '200ms' } as React.CSSProperties}>
        Storage Buckets
      </h2>

      {/* Buckets card */}
      <div className="dash-card animate-fade-up" style={{ padding: 0, marginTop: '-8px', animationDelay: '220ms' } as React.CSSProperties}>
        <div className="pages-list-header">
          <span>Bucket</span>
          <span>Details</span>
        </div>

        {buckets.length === 0 ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <ArchiveBoxIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              No storage buckets
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: 0 }}>
              Create buckets in the Supabase dashboard to store files
            </p>
          </div>
        ) : (
          <div className="pages-list">
            {buckets.map((bucket, i) => {
              const bucketUrl = ref
                ? `https://supabase.com/dashboard/project/${ref}/storage/buckets/${bucket.id}`
                : dashboardUrl;
              return (
                <div
                  key={bucket.id}
                  className="pages-row animate-fade-up"
                  role="link"
                  tabIndex={0}
                  onClick={() => window.open(bucketUrl, '_blank')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.open(bucketUrl, '_blank');
                    }
                  }}
                  style={{ animationDelay: `${260 + i * 40}ms`, cursor: 'pointer' } as React.CSSProperties}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ArchiveBoxIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
                      <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                        {bucket.name}
                      </h4>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', paddingLeft: '24px' }}>
                      <code className="pages-path-code">{bucket.id}</code>
                      <span style={{ opacity: 0.3 }}>&middot;</span>
                      {bucket.is_public ? (
                        <span className="flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                          <GlobeAltIcon className="w-3.5 h-3.5" />
                          Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1" style={{ color: SUPABASE_GREEN }}>
                          <LockClosedIcon className="w-3.5 h-3.5" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dashboard link */}
      <div className="animate-fade-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
        <AdminButton onClick={() => window.open(dashboardUrl, '_blank')}>
          <span className="flex items-center gap-2">
            Open Supabase Dashboard
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </span>
        </AdminButton>
      </div>
    </div>
  );
}

// ─── Local Storage View ──────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3"
      style={{ borderBottom: '1px solid var(--color-border-light)' }}
    >
      <span className="text-label shrink-0" style={{ color: 'var(--color-text-secondary)', minWidth: '180px' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
        {children}
      </span>
    </div>
  );
}

function LocalStorageView() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block animate-fade-up">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Storage
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Local file system storage
        </p>
      </div>

      {/* Config card */}
      <div className="dash-card animate-fade-up" style={{ animationDelay: '80ms' } as React.CSSProperties}>
        <div className="dash-card-header">
          <h2 className="dash-card-title">Configuration</h2>
        </div>
        <div className="flex flex-col gap-4">
          <InfoRow label="Storage Type">
            Local File System
          </InfoRow>
          <InfoRow label="Blog Content">
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              public/blog-content/
            </span>
          </InfoRow>
          <InfoRow label="Pages Config">
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              content/pages-config.json
            </span>
          </InfoRow>
          <InfoRow label="Media">
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              public/ directory
            </span>
          </InfoRow>
          <InfoRow label="Settings">
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              settings.json
            </span>
          </InfoRow>
        </div>

        <div className="space-y-4 mt-5">
          <AdminBanner variant="info">
            <p className="flex items-start gap-2">
              <span>&#9432;</span>
              <span>
                All content and data is stored on the local file system. Blog posts are JSON files
                in <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>public/blog-content/</code>,
                page configuration lives in <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>content/pages-config.json</code>,
                and settings are persisted to <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>settings.json</code>.
              </span>
            </p>
          </AdminBanner>

          <AdminBanner variant="success">
            <p className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" style={{ marginTop: '2px' }}>
                <path d="M63.708 110.284C60.727 114.083 54.87 112.147 54.694 107.26L53.098 59.218H99.14C108.123 59.218 113.172 69.618 107.56 76.659L63.708 110.284Z" fill="#249361" />
                <path d="M45.317 2.071C48.298 -1.728 54.155 0.209 54.331 5.096L55.202 53.137H10.088C1.105 53.137 -3.944 42.737 1.668 35.696L45.317 2.071Z" fill="#3ECF8E" />
              </svg>
              <span>
                <strong>Connect Supabase for cloud storage</strong> — get a PostgreSQL database, file storage buckets, and real-time capabilities.
                Set <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="dash-card-link" style={{ fontWeight: 600 }}>get started</a>.
              </span>
            </p>
          </AdminBanner>
        </div>
      </div>
    </div>
  );
}
