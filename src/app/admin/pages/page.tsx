'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageListItem } from '@/lib/pages/page-types';
import SearchInput from '@/components/admin/ui/SearchInput';
import {
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  BoltIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

function PagesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '120px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '260px', height: '18px' }} />
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '80px', height: '36px', borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-full)' }} />
      <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

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
    switch (filterType) {
      case 'static': return pages.filter(page => !page.isClientComponent).length;
      case 'dynamic': return pages.filter(page => page.isClientComponent).length;
      case 'featured': return pages.filter(page => page.featured).length;
      case 'all':
      default: return pages.length;
    }
  };

  const applyFilter = () => {
    let filtered = [...pages];

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

  const groupPages = useMemo(() => {
    const grouped: Record<string, PageListItem[]> = {};
    const topLevel: PageListItem[] = [];

    if (filter !== 'all') {
      filteredPages.forEach(page => {
        const parts = page.slug.split('/');
        if (parts.length >= 3) {
          const parentPath = parts.slice(0, 2).join('/');
          const parentInResults = filteredPages.some(p => p.slug === parentPath);
          if (parentInResults) {
            if (!grouped[parentPath]) grouped[parentPath] = [];
            grouped[parentPath].push(page);
          } else {
            topLevel.push(page);
          }
        } else {
          topLevel.push(page);
        }
      });
    } else {
      filteredPages.forEach(page => {
        const parts = page.slug.split('/');
        if (parts.length >= 3) {
          const parentPath = parts.slice(0, 2).join('/');
          if (!grouped[parentPath]) grouped[parentPath] = [];
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
      if (newSet.has(groupKey)) newSet.delete(groupKey);
      else newSet.add(groupKey);
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

  if (loading) return <PagesSkeleton />;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'static', label: 'Static' },
    { key: 'dynamic', label: 'Dynamic' },
    { key: 'featured', label: 'Featured' },
  ];

  const renderPageRow = (page: PageListItem, isChild = false) => {
    const isParentOfGroup = Object.keys(groupPages.grouped).some(key => key === page.slug);
    const groupedChildren = isParentOfGroup ? groupPages.grouped[page.slug] : [];
    const isExpanded = expandedGroups.has(page.slug);

    return (
      <React.Fragment key={page.slug}>
        <div
          className={`pages-row animate-fade-up ${isChild ? 'pages-row-child' : ''}`}
          onClick={isParentOfGroup ? () => toggleGroup(page.slug) : undefined}
          style={isParentOfGroup ? { cursor: 'pointer' } : undefined}
        >
          {/* Left: Page info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isChild && (
                <span style={{ color: 'var(--color-text-disabled)', fontSize: '14px', fontFamily: 'monospace', flexShrink: 0 }}>
                  └
                </span>
              )}
              <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                {page.title}
              </h4>
              {isParentOfGroup && (
                <button
                  className="pages-group-toggle"
                  onClick={(e) => { e.stopPropagation(); toggleGroup(page.slug); }}
                >
                  <ChevronRightIcon
                    className="w-3 h-3"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }}
                  />
                  <span>{groupedChildren.length + 1}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              <code className="pages-path-code">{page.path}</code>
              <span style={{ opacity: 0.3 }}>&middot;</span>
              <span className={`pages-type-badge ${page.isClientComponent ? 'dynamic' : 'static'}`}>
                {page.isClientComponent ? (
                  <><BoltIcon className="w-3 h-3" /> Dynamic</>
                ) : (
                  <><DocumentTextIcon className="w-3 h-3" /> Static</>
                )}
              </span>
              {page.category && (
                <>
                  <span style={{ opacity: 0.3 }}>&middot;</span>
                  <span className="posts-tag">{page.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="pages-row-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="pages-action-btn"
              onClick={() => router.push(`/admin/pages/${encodeURIComponent(page.slug)}/edit`)}
              disabled={isProduction}
              title={isProduction ? 'Editing disabled in production' : 'Edit page'}
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span className="pages-action-label">Edit</span>
            </button>
            {!page.isDynamicRoute && (
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="pages-action-btn"
                title="View page"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span className="pages-action-label">View</span>
              </a>
            )}
            {!page.isHomePage && (
              <button
                className="pages-action-btn danger"
                onClick={() => deletePage(page.slug)}
                disabled={isProduction}
                title={isProduction ? 'Deletion disabled in production' : 'Delete page'}
              >
                <TrashIcon className="w-4 h-4" />
                <span className="pages-action-label">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Grouped children */}
        {isParentOfGroup && isExpanded && groupedChildren.map((child) => (
          <React.Fragment key={child.slug}>
            {renderPageRow(child, true)}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header — hidden on mobile */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Pages
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Manage your site pages and routes
        </p>
      </div>

      {/* Production Warning */}
      {isProduction && (
        <div className="pages-production-warning animate-fade-up">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
          <div>
            <p style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>
              Production Environment
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Page editing is not available in production. Edit locally and redeploy.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar: Actions + Search */}
      <div className="pages-toolbar animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="flex gap-2">
          <button
            className="dash-quick-action"
            onClick={() => router.push('/admin/pages/new')}
            disabled={isProduction}
            style={isProduction ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New</span>
          </button>
          <button
            className="dash-quick-action"
            onClick={rescanPages}
            disabled={isRefreshing}
            style={isRefreshing ? { opacity: 0.5 } : undefined}
          >
            <ArrowPathIcon
              className="w-4 h-4"
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            />
            <span>Rescan</span>
          </button>
        </div>
        <SearchInput
          placeholder="Search pages..."
          onSearch={handleSearch}
          className="pages-search"
        />
      </div>

      {/* Filter pills */}
      <div className="pages-filter-bar animate-fade-up" style={{ animationDelay: '120ms' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            className={`pages-filter-pill ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => handleFilterChange(f.key)}
          >
            {f.label}
            <span className="pages-filter-count">{getFilteredCount(f.key)}</span>
          </button>
        ))}
      </div>

      {/* Page list */}
      <div className="dash-card animate-fade-up" style={{ padding: 0, animationDelay: '180ms' }}>
        {/* Desktop column headers */}
        <div className="pages-list-header">
          <span>Page</span>
          <span>Actions</span>
        </div>

        {filteredPages.length === 0 ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <GlobeAltIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              {searchQuery ? 'No pages match your search' : 'No pages found'}
            </p>
            {!searchQuery && (
              <button
                className="dash-card-link"
                style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => router.push('/admin/pages/new')}
              >
                Create your first page
              </button>
            )}
          </div>
        ) : (
          <div className="pages-list">
            {groupPages.topLevel.map((page) => renderPageRow(page))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function PagesPage() {
  return (
    <Suspense fallback={<PagesSkeleton />}>
      <PagesListContent />
    </Suspense>
  );
}
