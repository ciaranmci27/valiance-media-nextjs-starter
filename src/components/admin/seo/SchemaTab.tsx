'use client';

import {
  BuildingOffice2Icon,
  MapPinIcon,
  UserIcon,
  GlobeAltIcon,
  PhoneIcon,
  QueueListIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

interface SchemaTabProps {
  seoConfig: any;
  schemas: any;
  onNavigate: (tab: string) => void;
  onConfigSection: (section: string) => void;
}

export default function SchemaTab({ seoConfig, schemas, onNavigate, onConfigSection }: SchemaTabProps) {
  return (
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
            onConfigSection('schema');
            onNavigate('config');
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
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Dynamically generated for each page based on URL structure.
              </p>
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
  );
}

/* Schema block helper */
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
