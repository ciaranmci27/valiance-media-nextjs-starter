'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageListItem } from '@/lib/page-types';

function PagesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [filteredPages, setFilteredPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production
    checkEnvironment();
    fetchPages();
  }, []);
  
  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/admin/environment');
      const data = await response.json();
      setIsProduction(data.isProduction);
    } catch (error) {
      console.error('Error checking environment:', error);
    }
  };
  
  useEffect(() => {
    applyFilter();
  }, [pages, filter]);
  
  useEffect(() => {
    setActiveFilter(filter);
  }, [filter]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredCount = (filterType: string) => {
    switch (filterType) {
      case 'all':
        return pages.length;
      case 'published':
        return pages.filter(p => !p.draft).length;
      case 'drafts':
        return pages.filter(p => p.draft === true).length;
      case 'featured':
        return pages.filter(p => p.featured === true).length;
      default:
        return 0;
    }
  };
  
  const applyFilter = () => {
    let filtered = [...pages];
    
    switch (filter) {
      case 'published':
        filtered = pages.filter(page => !page.draft);
        break;
      case 'drafts':
        filtered = pages.filter(page => page.draft === true);
        break;
      case 'featured':
        filtered = pages.filter(page => page.featured === true);
        break;
      case 'all':
      default:
        break;
    }
    
    setFilteredPages(filtered);
  };
  
  const handleFilterChange = (newFilter: string) => {
    router.push(`/admin/pages?filter=${newFilter}`);
  };

  const deletePage = async (slug: string) => {
    if (slug === 'home') {
      alert('Cannot delete the home page');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the "${slug}" page? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/pages/${slug}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPages();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('An error occurred while deleting the page');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            Pages
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            {isProduction 
              ? 'View your website pages. Editing is disabled in production.'
              : 'Manage your website pages. Create, edit, and organize your content.'}
          </p>
          
          {isProduction && (
            <div style={{
              padding: '16px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(251, 191, 36)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <p style={{ color: 'rgb(251, 191, 36)', fontWeight: '600', marginBottom: '4px' }}>
                    Production Environment
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                    Page editing is not available in production. To modify pages, please edit them locally and redeploy your application. 
                    This is a security best practice as production filesystems are typically read-only.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/admin/pages/new')}
              disabled={isProduction}
              style={{
                padding: '12px 24px',
                background: isProduction ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isProduction ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isProduction ? 0.5 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Page
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '16px', 
          marginBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border-light)',
          paddingBottom: '2px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => handleFilterChange('all')}
              style={{
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeFilter === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '-2px'
              }}
            >
              All Pages ({getFilteredCount('all')})
            </button>
            <button
              onClick={() => handleFilterChange('featured')}
              style={{
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeFilter === 'featured' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeFilter === 'featured' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '-2px'
              }}
            >
              Quick Access ({getFilteredCount('featured')})
            </button>
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-light)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Title
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  URL Path
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Category
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ 
                    padding: 'var(--spacing-xl)', 
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {filter === 'all' 
                      ? 'No pages found.' 
                      : `No ${filter} pages found.`}
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.slug} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div>
                        <div style={{ 
                          color: 'var(--color-text-primary)', 
                          fontWeight: '500', 
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {page.title}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      <code style={{ 
                        fontSize: '13px', 
                        fontFamily: 'monospace',
                        color: 'var(--color-primary)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {page.path}
                      </code>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      {page.category || 'general'}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/admin/pages/${page.slug}/edit`)}
                          disabled={isProduction}
                          style={{
                            padding: '6px 12px',
                            background: isProduction ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            cursor: isProduction ? 'not-allowed' : 'pointer',
                            opacity: isProduction ? 0.5 : 1
                          }}
                          title={isProduction ? 'Editing disabled in production' : 'Edit page'}
                        >
                          Edit
                        </button>
                        <a
                          href={page.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--color-info)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          View
                        </a>
                        {!page.isHomePage && (
                          <button
                            onClick={() => deletePage(page.slug)}
                            disabled={isProduction}
                            style={{
                              padding: '6px 12px',
                              background: isProduction ? 'var(--color-text-tertiary)' : 'var(--color-danger)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '14px',
                              cursor: isProduction ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s',
                              opacity: isProduction ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => !isProduction && (e.currentTarget.style.background = '#B91C1C')}
                            onMouseLeave={(e) => !isProduction && (e.currentTarget.style.background = 'var(--color-danger)')}
                            title={isProduction ? 'Deletion disabled in production' : 'Delete page'}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPagesList() {
  return (
    <Suspense 
      fallback={
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading pages...</p>
        </div>
      }
    >
      <PagesListContent />
    </Suspense>
  );
}