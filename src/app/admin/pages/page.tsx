'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageListItem } from '@/lib/page-types';
import SearchInput from '@/components/admin/SearchInput';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
  }, [pages, filter, searchQuery]);
  
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

  const rescanPages = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/pages/rescan', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
        alert(`Pages rescanned successfully. Found ${data.pages?.length || 0} pages.`);
      } else {
        alert('Failed to rescan pages');
      }
    } catch (error) {
      console.error('Error rescanning pages:', error);
      alert('Failed to rescan pages');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const getFilteredCount = (filterType: string) => {
    let count = 0;
    switch (filterType) {
      case 'static':
        count = pages.filter(page => !page.isClientComponent).length;
        break;
      case 'dynamic':
        count = pages.filter(page => page.isClientComponent).length;
        break;
      case 'featured':
        count = pages.filter(page => page.featured).length;
        break;
      case 'all':
      default:
        count = pages.length;
        break;
    }
    return count;
  };
  
  const applyFilter = () => {
    let filtered = [...pages];
    
    // Apply filter first
    switch (filter) {
      case 'static':
        filtered = pages.filter(page => !page.isClientComponent);
        break;
      case 'dynamic':
        filtered = pages.filter(page => page.isClientComponent);
        break;
      case 'featured':
        filtered = pages.filter(page => page.featured);
        break;
      case 'legal':
        filtered = pages.filter(page => page.category === 'legal');
        break;
      case 'homepage':
        filtered = pages.filter(page => page.isHomePage);
        break;
      case 'all':
      default:
        break;
    }
    
    // Then apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query) ||
        page.path.toLowerCase().includes(query) ||
        (page.category && page.category.toLowerCase().includes(query))
      );
    }
    
    setFilteredPages(filtered);
  };
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleFilterChange = (newFilter: string) => {
    router.push(`/admin/pages?filter=${newFilter}`);
  };
  
  // Group pages by their parent path (for pages with 2+ levels of nesting)
  const groupPages = useMemo(() => {
    const grouped: Record<string, PageListItem[]> = {};
    const topLevel: PageListItem[] = [];
    
    // When filtering (not 'all'), show a flat list unless parent/children both match
    if (filter !== 'all') {
      // For filtered views, only group if the parent also matches the filter
      filteredPages.forEach(page => {
        const parts = page.slug.split('/');
        
        // Check if this is a nested page (3+ parts)
        if (parts.length >= 3) {
          const parentPath = parts.slice(0, 2).join('/');
          // Check if the parent is also in the filtered results
          const parentInResults = filteredPages.some(p => p.slug === parentPath);
          
          if (parentInResults) {
            // Parent matches filter too, so group them
            if (!grouped[parentPath]) {
              grouped[parentPath] = [];
            }
            grouped[parentPath].push(page);
          } else {
            // Parent doesn't match filter, show child as top-level
            topLevel.push(page);
          }
        } else {
          // Top level or single nested pages
          topLevel.push(page);
        }
      });
    } else {
      // For 'all' view, always group nested pages under their parents
      filteredPages.forEach(page => {
        const parts = page.slug.split('/');
        
        if (parts.length >= 3) {
          const parentPath = parts.slice(0, 2).join('/');
          if (!grouped[parentPath]) {
            grouped[parentPath] = [];
          }
          grouped[parentPath].push(page);
        } else {
          topLevel.push(page);
        }
      });
    }
    
    return { grouped, topLevel };
  }, [filteredPages, filter]);
  
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const deletePage = async (slug: string) => {
    if (slug === 'home') {
      alert('Cannot delete the home page');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the page "${slug}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted page from the state
        setPages(pages.filter(p => p.slug !== slug));
        alert('Page deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete page: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section with 2-column layout */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--spacing-xl)',
          gap: 'var(--spacing-lg)'
        }}>
          {/* Left Column: Title */}
          <div style={{ flex: 1 }}>
            <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
              Pages
            </h1>
          </div>
          
          {/* Right Column: Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
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
                opacity: isProduction ? 0.5 : 1,
                whiteSpace: 'nowrap',
                height: '48px'
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
                padding: '10px 22px',
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isRefreshing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isRefreshing ? 0.5 : 1,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                height: '48px'
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
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              Rescan Pages
            </button>
          </div>
        </div>
        
        {/* Production Warning */}
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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
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
        
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Filter Bar with Search */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px', 
          marginBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border-light)',
          paddingBottom: '2px'
        }}>
          {/* Left side: Filter tabs */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => handleFilterChange('all')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: activeFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeFilter === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              All ({getFilteredCount('all')})
            </button>
            <button
              onClick={() => handleFilterChange('static')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: activeFilter === 'static' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeFilter === 'static' ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              Static ({getFilteredCount('static')})
            </button>
            <button
              onClick={() => handleFilterChange('dynamic')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: activeFilter === 'dynamic' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeFilter === 'dynamic' ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              Dynamic ({getFilteredCount('dynamic')})
            </button>
            <button
              onClick={() => handleFilterChange('featured')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: activeFilter === 'featured' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeFilter === 'featured' ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              Featured ({getFilteredCount('featured')})
            </button>
          </div>
          
          {/* Right side: Search bar */}
          <div style={{ maxWidth: '320px' }}>
            <SearchInput 
              placeholder="Search pages..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-secondary)' }}>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Title
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Path
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Type
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Category
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No pages found
                  </td>
                </tr>
              ) : (
                <>
                  {/* Render top-level pages and parent pages */}
                  {groupPages.topLevel.map((page) => {
                    // Check if this page is a parent of grouped pages
                    const isParentOfGroup = Object.keys(groupPages.grouped).some(key => key === page.slug);
                    const groupedChildren = isParentOfGroup ? groupPages.grouped[page.slug] : [];
                    const isExpanded = expandedGroups.has(page.slug);
                    
                    return (
                      <React.Fragment key={page.slug}>
                        <tr 
                          style={{ 
                            borderBottom: '1px solid var(--color-border-light)',
                            cursor: isParentOfGroup ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                            background: isParentOfGroup && isExpanded ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)' : 'transparent'
                          }}
                          onClick={isParentOfGroup ? () => toggleGroup(page.slug) : undefined}
                          onMouseEnter={(e) => {
                            if (isParentOfGroup) {
                              e.currentTarget.style.background = isExpanded ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--color-surface-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isParentOfGroup) {
                              e.currentTarget.style.background = isExpanded ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)' : 'transparent';
                            }
                          }}
                        >
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
                                {isParentOfGroup && (
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                    color: 'var(--color-primary)'
                                  }}>
                                    <svg 
                                      width="12" 
                                      height="12" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2.5"
                                      style={{
                                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                                        transition: 'transform 0.2s'
                                      }}
                                    >
                                      <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                    <span>{groupedChildren.length} pages</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                            <code style={{ 
                              fontSize: '13px', 
                              fontFamily: 'monospace',
                              color: 'var(--color-primary)',
                              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
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
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
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
                        
                        {/* Render grouped children if expanded */}
                        {isParentOfGroup && isExpanded && groupedChildren.map((childPage, index) => (
                          <tr key={childPage.slug} style={{ 
                            borderBottom: index === groupedChildren.length - 1 
                              ? '1px solid var(--color-border-light)' 
                              : '1px solid var(--color-border-lighter)',
                            background: 'color-mix(in srgb, var(--color-primary) 3%, transparent)',
                            animation: 'slideDown 0.2s ease-out'
                          }}>
                            <td style={{ padding: 'var(--spacing-md)', paddingLeft: 'calc(var(--spacing-md) + 24px)' }}>
                              <div>
                                <div style={{ 
                                  color: 'var(--color-text-primary)', 
                                  fontWeight: '500', 
                                  marginBottom: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{
                                    color: 'var(--color-text-tertiary)',
                                    fontSize: '16px',
                                    marginRight: '4px',
                                    fontFamily: 'monospace'
                                  }}>└</span>
                                  {childPage.title}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                              <code style={{ 
                                fontSize: '13px', 
                                fontFamily: 'monospace',
                                color: 'var(--color-primary)',
                                background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                {childPage.path}
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
                                background: childPage.isClientComponent 
                                  ? 'rgba(251, 146, 60, 0.1)' 
                                  : 'rgba(34, 197, 94, 0.1)',
                                color: childPage.isClientComponent 
                                  ? 'rgb(234, 88, 12)' 
                                  : 'rgb(22, 163, 74)'
                              }}>
                                {childPage.isClientComponent ? (
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
                              {childPage.category || 'general'}
                            </td>
                            <td style={{ padding: 'var(--spacing-md)' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => router.push(`/admin/pages/${encodeURIComponent(childPage.slug)}/edit`)}
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
                                  href={childPage.path}
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
                                {!childPage.isHomePage && (
                                  <button
                                    onClick={() => deletePage(childPage.slug)}
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
                        ))}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <PagesListContent />
    </Suspense>
  );
}