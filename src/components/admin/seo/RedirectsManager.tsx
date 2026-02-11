'use client';

import { useState, useEffect } from 'react';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import AdminButton from '@/components/admin/ui/AdminButton';
import { Select } from '@/components/admin/ui/Select';

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
      <div className="flex flex-col gap-4">
        <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl, 16px)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
          {redirects.length} {redirects.length === 1 ? 'redirect' : 'redirects'}
        </span>
        <AdminButton
          size="sm"
          onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess(''); }}
        >
          {showAddForm ? 'Cancel' : '+ Add Redirect'}
        </AdminButton>
      </div>

      {/* Status Messages */}
      {error && <AdminBanner variant="error">{error}</AdminBanner>}
      {success && <AdminBanner variant="success">{success}</AdminBanner>}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddRedirect} className="dash-card" style={{ padding: '16px 20px' }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-label block mb-1">From</label>
                <input
                  type="text"
                  value={newRedirect.from || ''}
                  onChange={(e) => setNewRedirect({ ...newRedirect, from: e.target.value })}
                  className="input-field"
                  placeholder="/old-page"
                  required
                  autoFocus
                />
              </div>
              <div
                className="hidden sm:flex items-end pb-2"
                style={{ color: 'var(--color-text-disabled)', fontSize: '16px' }}
              >
                &rarr;
              </div>
              <div className="flex-1">
                <label className="text-label block mb-1">To</label>
                <input
                  type="text"
                  value={newRedirect.to || ''}
                  onChange={(e) => setNewRedirect({ ...newRedirect, to: e.target.value })}
                  className="input-field"
                  placeholder="/new-page"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
              <div style={{ width: '200px' }}>
                <Select
                  label="Type"
                  value={newRedirect.permanent ? 'permanent' : 'temporary'}
                  onChange={(value) => setNewRedirect({ ...newRedirect, permanent: value === 'permanent' })}
                  size="sm"
                  options={[
                    { value: 'permanent', label: '308 Permanent' },
                    { value: 'temporary', label: '307 Temporary' },
                  ]}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  className="flex-1 sm:flex-initial"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewRedirect({ from: '', to: '', permanent: true });
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton size="sm" type="submit" className="flex-1 sm:flex-initial">
                  Add
                </AdminButton>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Redirects List */}
      {redirects.length === 0 ? (
        <div className="dash-card" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <svg
            className="mx-auto mb-2"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            <path d="M13 5H1v14h12M17 9l4 4-4 4M7 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
            No redirects configured
          </p>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
            Redirects are auto-created when you change a post slug
          </p>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: 0 }}>
          {redirects.map((redirect, i) => (
            <div
              key={redirect.from}
              className="redirects-row"
              style={{
                borderBottom: i < redirects.length - 1 ? '1px solid var(--color-border-light)' : undefined,
              }}
            >
              {/* URL pair */}
              <div className="flex-1 min-w-0">
                <div className="redirects-urls">
                  <div className="redirects-url-row">
                    <span className="redirects-label">From</span>
                    <code className="redirects-from">{redirect.from}</code>
                  </div>
                  <div className="redirects-url-row">
                    <span className="redirects-label">To</span>
                    <code className="redirects-to">{redirect.to}</code>
                  </div>
                </div>
                <div className="redirects-meta">
                  <span className={`pages-type-badge ${redirect.permanent ? 'static' : 'dynamic'}`}>
                    {redirect.permanent ? '308' : '307'}
                  </span>
                  <span style={{ opacity: 0.3 }}>&middot;</span>
                  <span>{new Date(redirect.createdAt).toLocaleDateString()}</span>
                  {redirect.reason && (
                    <>
                      <span style={{ opacity: 0.3 }}>&middot;</span>
                      <span>{redirect.reason}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                className="pages-action-btn danger"
                onClick={() => handleDeleteRedirect(redirect.from)}
                title="Delete redirect"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {redirects.length > 0 && (
        <AdminBanner>
          <p>
            Redirects are auto-created when you change a published post&apos;s slug.
            Use permanent (308) for moved content, temporary (307) for maintenance.
          </p>
        </AdminBanner>
      )}
    </div>
  );
}
