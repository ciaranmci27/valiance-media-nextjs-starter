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
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Add Redirect Form */}
      {showAddForm && (
        <form onSubmit={handleAddRedirect} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {redirects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No redirects configured yet.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Redirects will be automatically created when you change blog post slugs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {redirects.map((redirect) => (
                  <tr key={redirect.from} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono text-primary dark:text-primary-light">
                        {redirect.from}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono text-green-600 dark:text-green-400">
                        {redirect.to}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        redirect.permanent
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {redirect.permanent ? '308 Permanent' : '307 Temporary'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(redirect.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteRedirect(redirect.from)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
      <div className="bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-primary-900 dark:text-primary-400 mb-2">
          About Redirects
        </h4>
        <ul className="text-sm text-primary-800 dark:text-primary-400 space-y-1">
          <li>• Redirects are automatically created when you change a published blog post's slug</li>
          <li>• Use permanent redirects (308) for content that has permanently moved</li>
          <li>• Use temporary redirects (307) for maintenance or temporary changes</li>
          <li>• Redirects help preserve SEO rankings and prevent broken links</li>
        </ul>
      </div>
    </div>
  );
}