'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchInput from '@/components/admin/ui/SearchInput';
import {
  PlusIcon,
  FolderIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  NewspaperIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  publishedAt: string;
  draft?: boolean;
  featured?: boolean;
  author?: { name: string };
  readingTime?: number;
  tags?: string[];
}

function PostsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '160px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '240px', height: '18px' }} />
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '80px', height: '36px', borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-full)' }} />
      <div className="skeleton" style={{ height: '420px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const categoryFilter = searchParams.get('category');
  const tagFilter = searchParams.get('tag');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [posts, filter, categoryFilter, tagFilter, searchQuery]);

  useEffect(() => {
    setActiveFilter(filter);
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCount = (filterType: string) => {
    let filtered = [...posts];
    if (categoryFilter) filtered = filtered.filter(post => post.category === categoryFilter);
    if (tagFilter) filtered = filtered.filter(post => post.tags && post.tags.includes(tagFilter));

    switch (filterType) {
      case 'all': return filtered.length;
      case 'published': return filtered.filter(p => !p.draft).length;
      case 'drafts': return filtered.filter(p => p.draft === true).length;
      case 'featured': return filtered.filter(p => p.featured === true).length;
      default: return 0;
    }
  };

  const applyFilter = () => {
    let filtered = [...posts];

    switch (filter) {
      case 'published': filtered = posts.filter(post => !post.draft); break;
      case 'drafts': filtered = posts.filter(post => post.draft === true); break;
      case 'featured': filtered = posts.filter(post => post.featured === true); break;
      case 'all': default: break;
    }

    if (categoryFilter) filtered = filtered.filter(post => post.category === categoryFilter);
    if (tagFilter) filtered = filtered.filter(post => post.tags && post.tags.includes(tagFilter));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query)) ||
        (post.author?.name && post.author.name.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = (newFilter: string) => {
    router.push(`/admin/blog?filter=${newFilter}`);
  };

  const deletePost = async (slug: string, category?: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, category })
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCategory = (cat?: string) => {
    if (!cat) return null;
    return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) return <PostsSkeleton />;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'featured', label: 'Featured' },
  ];

  const removeFilterParam = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    router.push(`/admin/blog${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header — hidden on mobile */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Blog Posts
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Create and manage your blog content
        </p>
      </div>

      {/* Toolbar: Actions + Search */}
      <div className="pages-toolbar animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="flex gap-2">
          <button
            className="dash-quick-action"
            onClick={() => router.push('/admin/blog-post')}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New</span>
          </button>
          <button
            className="dash-quick-action"
            onClick={() => router.push('/admin/blog/categories')}
          >
            <FolderIcon className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>
        <SearchInput
          placeholder="Search posts..."
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

      {/* Active sub-filters (category/tag) */}
      {(categoryFilter || tagFilter) && (
        <div className="flex gap-2 items-center flex-wrap animate-fade-up">
          {categoryFilter && (
            <span className="posts-active-filter">
              {categoryFilter.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              <button onClick={() => removeFilterParam('category')} className="posts-active-filter-close">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {tagFilter && (
            <span className="posts-active-filter tag">
              {tagFilter}
              <button onClick={() => removeFilterParam('tag')} className="posts-active-filter-close">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => router.push('/admin/blog')}
            className="posts-clear-filters"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Post list */}
      <div className="dash-card posts-card-wrap animate-fade-up" style={{ padding: 0, animationDelay: '180ms' }}>
        {/* Desktop column headers */}
        <div className="pages-list-header">
          <span>Post</span>
          <span>Actions</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <NewspaperIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              {searchQuery
                ? `No posts match "${searchQuery}"`
                : filter === 'all'
                  ? 'No blog posts yet'
                  : `No ${filter === 'drafts' ? 'draft' : filter} posts`
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                className="dash-card-link"
                style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => router.push('/admin/blog-post')}
              >
                Create your first post
              </button>
            )}
          </div>
        ) : (
          <div className="pages-list posts-list">
            {filteredPosts.map((post) => (
              <div key={`${post.category}-${post.slug}`} className="pages-row">
                {/* Left: Post info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="dash-status-dot"
                      style={{ background: post.draft ? 'var(--color-warning)' : 'var(--color-success)' }}
                    />
                    <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                      {post.title}
                    </h4>
                    {post.featured && <span className="dash-badge-featured">Featured</span>}
                    {post.draft && (
                      <span className="posts-draft-badge">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', paddingLeft: '14px' }}>
                    {formatCategory(post.category) && (
                      <>
                        <span>{formatCategory(post.category)}</span>
                        <span style={{ opacity: 0.3 }}>&middot;</span>
                      </>
                    )}
                    <span>{formatDate(post.publishedAt)}</span>
                    {post.readingTime && (
                      <>
                        <span style={{ opacity: 0.3 }}>&middot;</span>
                        <span>{post.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap" style={{ paddingLeft: '14px', marginTop: '6px' }}>
                      {post.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="posts-tag">{tag}</span>
                      ))}
                      {post.tags.length > 4 && (
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                          +{post.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="pages-row-actions">
                  <button
                    className="pages-action-btn"
                    onClick={() => router.push(`/admin/blog-post/${post.slug}`)}
                    title="Edit post"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span className="pages-action-label">Edit</span>
                  </button>
                  <a
                    href={`/blog/${post.category ? post.category + '/' : ''}${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pages-action-btn"
                    title="View post"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    <span className="pages-action-label">View</span>
                  </a>
                  <button
                    className="pages-action-btn danger"
                    onClick={() => deletePost(post.slug, post.category)}
                    title="Delete post"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="pages-action-label">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBlogList() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <BlogListContent />
    </Suspense>
  );
}
