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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setIsRefreshing(false);
    }
  };
  
  const rescanPages = async () => {
    setIsRefreshing(true);
    try {
      // First regenerate the pages config file
      const rescanResponse = await fetch('/api/admin/rescan-pages', {
        method: 'POST'
      });
      
      if (!rescanResponse.ok) {
        throw new Error('Failed to rescan pages');
      }
      
      // Then fetch the updated pages list
      await fetchPages();
    } catch (error) {
      console.error('Error rescanning pages:', error);
      setIsRefreshing(false);
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
      case 'static':
        return pages.filter(p => !p.isClientComponent).length;
      case 'dynamic':
        return pages.filter(p => p.isClientComponent === true).length;
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
      case 'static':
        filtered = pages.filter(page => !page.isClientComponent);
        break;
      case 'dynamic':
        filtered = pages.filter(page => page.isClientComponent === true);
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
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(slug)}`, {
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
            
            <button
              onClick={rescanPages}
              disabled={isRefreshing}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isRefreshing ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              title="Rescan pages to find newly added pages"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/>
              </svg>
              {isRefreshing ? 'Scanning...' : 'Rescan Pages'}
            </button>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

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
            <button
              onClick={() => handleFilterChange('static')}
              style={{
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeFilter === 'static' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeFilter === 'static' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '-2px'
              }}
            >
              Static ({getFilteredCount('static')})
            </button>
            <button
              onClick={() => handleFilterChange('dynamic')}
              style={{
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeFilter === 'dynamic' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeFilter === 'dynamic' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '-2px'
              }}
            >
              Dynamic ({getFilteredCount('dynamic')})
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
                  Type
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
                  <td colSpan={5} style={{ 
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
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: page.isClientComponent 
                          ? 'rgba(251, 146, 60, 0.1)' 
                          : 'rgba(34, 197, 94, 0.1)',
                        color: page.isClientComponent 
                          ? 'rgb(234, 88, 12)' 
                          : 'rgb(22, 163, 74)'
                      }}>
                        {page.isClientComponent ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                            Dynamic
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Static
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      {page.category || 'general'}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/admin/pages/${encodeURIComponent(page.slug)}/edit`)}
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
                              background: isProduction ? '#94A3B8' : '#DC2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: isProduction ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s',
                              opacity: isProduction ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => !isProduction && (e.currentTarget.style.background = '#B91C1C')}
                            onMouseLeave={(e) => !isProduction && (e.currentTarget.style.background = '#DC2626')}
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