'use client';

import { useState, useEffect } from 'react';

interface Redirect {
  from: string;
  to: string;
  permanent: boolean;
  createdAt: string;
  reason?: string;
}

export default function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRedirect, setNewRedirect] = useState<Partial<Redirect>>({
    from: '',
    to: '',
    permanent: true
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/redirects');
      if (response.ok) {
        const data = await response.json();
        setRedirects(data.redirects || []);
      }
    } catch (error) {
      console.error('Error fetching redirects:', error);
      setError('Failed to load redirects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newRedirect.from || !newRedirect.to) {
      setError('Both "From" and "To" URLs are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRedirect,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSuccess('Redirect added successfully');
        setNewRedirect({ from: '', to: '', permanent: true });
        setShowAddForm(false);
        fetchRedirects();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add redirect');
      }
    } catch (error) {
      console.error('Error adding redirect:', error);
      setError('Failed to add redirect');
    }
  };

  const handleDeleteRedirect = async (from: string) => {
    if (!confirm(`Are you sure you want to delete the redirect from "${from}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/redirects?from=${encodeURIComponent(from)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Redirect deleted successfully');
        fetchRedirects();
      } else {
        setError('Failed to delete redirect');
      }
    } catch (error) {
      console.error('Error deleting redirect:', error);
      setError('Failed to delete redirect');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Loading redirects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
            URL Redirects
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage URL redirects for changed or moved content
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Redirect'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Add Redirect Form */}
      {showAddForm && (
        <form onSubmit={handleAddRedirect} className="p-4 rounded-lg space-y-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-label block mb-2">From URL *</label>
              <input
                type="text"
                value={newRedirect.from || ''}
                onChange={(e) => setNewRedirect({ ...newRedirect, from: e.target.value })}
                className="input-field"
                placeholder="/old-url"
                required
              />
            </div>
            <div>
              <label className="text-label block mb-2">To URL *</label>
              <input
                type="text"
                value={newRedirect.to || ''}
                onChange={(e) => setNewRedirect({ ...newRedirect, to: e.target.value })}
                className="input-field"
                placeholder="/new-url"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-label block mb-2">Redirect Type</label>
            <select
              value={newRedirect.permanent ? 'permanent' : 'temporary'}
              onChange={(e) => setNewRedirect({ ...newRedirect, permanent: e.target.value === 'permanent' })}
              className="input-field"
              style={{ maxWidth: '300px' }}
            >
              <option value="permanent">Permanent (308)</option>
              <option value="temporary">Temporary (307)</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewRedirect({ from: '', to: '', permanent: true });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Redirect
            </button>
          </div>
        </form>
      )}

      {/* Redirects Table */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-light)',
        overflow: 'hidden'
      }}>
        {redirects.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No redirects configured yet.
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', marginTop: '8px' }}>
              Redirects will be automatically created when you change blog post slugs.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    From
                  </th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    To
                  </th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Type
                  </th>
                  <th className="mobile-hidden" style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Created
                  </th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((redirect) => (
                  <tr key={redirect.from} className="hover-row" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    {/* From path — card headline on mobile */}
                    <td className="cell-title" style={{ padding: 'var(--spacing-md)' }}>
                      <code style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: 'var(--color-primary)',
                        background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {redirect.from}
                      </code>
                    </td>
                    {/* To path — metadata on mobile */}
                    <td className="cell-meta" style={{ padding: 'var(--spacing-md)' }}>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', marginRight: '4px' }}>→</span>
                      <code style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: 'var(--color-success)',
                        background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {redirect.to}
                      </code>
                    </td>
                    {/* Type badge — metadata on mobile */}
                    <td className="cell-meta" style={{ padding: 'var(--spacing-md)' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                        background: redirect.permanent
                          ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                          : 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
                        color: redirect.permanent
                          ? 'var(--color-primary)'
                          : 'var(--color-warning)'
                      }}>
                        {redirect.permanent ? '308 Permanent' : '307 Temporary'}
                      </span>
                    </td>
                    {/* Created date — desktop only */}
                    <td className="mobile-hidden" style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                      {new Date(redirect.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td className="cell-actions" style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteRedirect(redirect.from)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--color-error, #DC2626)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div style={{
        background: 'color-mix(in srgb, var(--color-info) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-info) 20%, transparent)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)'
      }}>
        <h4 style={{ fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          About Redirects
        </h4>
        <ul style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>• Redirects are automatically created when you change a published blog post&apos;s slug</li>
          <li>• Use permanent redirects (308) for content that has permanently moved</li>
          <li>• Use temporary redirects (307) for maintenance or temporary changes</li>
          <li>• Redirects help preserve SEO rankings and prevent broken links</li>
        </ul>
      </div>
    </div>
  );
}