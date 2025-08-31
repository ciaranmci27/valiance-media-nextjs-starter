'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchInput from '@/components/admin/SearchInput';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  publishedAt: string;
  draft?: boolean;
  featured?: boolean;
  author?: {
    name: string;
  };
  readingTime?: number;
  tags?: string[];
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
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // Apply filter when posts or filters change
    applyFilter();
  }, [posts, filter, categoryFilter, tagFilter, searchQuery]);
  
  useEffect(() => {
    // Update active filter when URL changes
    setActiveFilter(filter);
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts');
      const data = await response.json();
      setPosts(data.posts || []);
      
      // Extract unique tags from posts
      const allTags = new Set<string>();
      data.posts?.forEach((post: BlogPost) => {
        post.tags?.forEach(tag => allTags.add(tag));
      });
      setTags(Array.from(allTags).sort());
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories/list');
      const data = await response.json();
      setCategories(data.categories?.map((cat: any) => cat.slug) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Helper function to get filtered counts
  const getFilteredCount = (filterType: string) => {
    let filtered = [...posts];
    
    // Apply category filter if active
    if (categoryFilter) {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }
    
    // Apply tag filter if active
    if (tagFilter) {
      filtered = filtered.filter(post => post.tags && post.tags.includes(tagFilter));
    }
    
    // Apply status filter
    switch (filterType) {
      case 'all':
        return filtered.length;
      case 'published':
        return filtered.filter(p => !p.draft).length;
      case 'drafts':
        return filtered.filter(p => p.draft === true).length;
      case 'featured':
        return filtered.filter(p => p.featured === true).length;
      default:
        return 0;
    }
  };
  
  const applyFilter = () => {
    let filtered = [...posts];
    
    // Apply status filter
    switch (filter) {
      case 'published':
        filtered = posts.filter(post => !post.draft);
        break;
      case 'drafts':
        filtered = posts.filter(post => post.draft === true);
        break;
      case 'featured':
        filtered = posts.filter(post => post.featured === true);
        break;
      case 'all':
      default:
        // Show all posts
        break;
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(post => 
        post.category === categoryFilter
      );
    }
    
    // Apply tag filter
    if (tagFilter) {
      filtered = filtered.filter(post => 
        post.tags && post.tags.includes(tagFilter)
      );
    }
    
    // Apply search query
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
        headers: {
          'Content-Type': 'application/json'
        },
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

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading blog posts...</p>
      </div>
    );
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
              Blog Posts
            </h1>
          </div>
          
          {/* Right Column: Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <button
              onClick={() => router.push('/admin/blog-post')}
              style={{
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                height: '48px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Post
            </button>
            <button
              onClick={() => router.push('/admin/blog/categories')}
              style={{
                padding: '10px 22px',
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                height: '48px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Categories
            </button>
          </div>
        </div>

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
        {/* Left side: Status Filter Tabs */}
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
            All Posts ({getFilteredCount('all')})
          </button>
          <button
            onClick={() => handleFilterChange('published')}
            style={{
              padding: '8px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeFilter === 'published' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeFilter === 'published' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '-2px'
            }}
          >
            Published ({getFilteredCount('published')})
          </button>
          <button
            onClick={() => handleFilterChange('drafts')}
            style={{
              padding: '8px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeFilter === 'drafts' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeFilter === 'drafts' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '-2px'
            }}
          >
            Drafts ({getFilteredCount('drafts')})
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
            Featured ({getFilteredCount('featured')})
          </button>
        </div>
        
        {/* Right side: Search bar */}
        <div style={{ maxWidth: '320px' }}>
          <SearchInput 
            placeholder="Search posts..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Active Filters Pills - keeping these separate below the main bar */}
      {(categoryFilter || tagFilter) && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center', 
          marginBottom: 'var(--spacing-md)',
          flexWrap: 'wrap'
        }}>
          {categoryFilter && (
            <span style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {categoryFilter.replace(/-/g, ' ')}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('category');
                  router.push(`/admin/blog${params.toString() ? '?' + params.toString() : ''}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          
          {tagFilter && (
            <span style={{
              background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
              color: 'var(--color-success)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {tagFilter}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('tag');
                  router.push(`/admin/blog${params.toString() ? '?' + params.toString() : ''}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          
          <button
            onClick={() => router.push('/admin/blog')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              padding: '2px 4px',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear All
          </button>
        </div>
      )}

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
                Slug
              </th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Category
              </th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Status
              </th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Published
              </th>
              <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ 
                  padding: 'var(--spacing-xl)', 
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  {searchQuery ? (
                    <>
                      <p style={{ marginBottom: 'var(--spacing-sm)' }}>No posts found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear Search
                      </button>
                    </>
                  ) : filter === 'all' ? (
                    'No blog posts found. Create your first post to get started.'
                  ) : (
                    `No ${filter === 'drafts' ? 'draft' : filter} posts found.`
                  )}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={`${post.category}-${post.slug}`} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '4px' }}>
                        {post.title}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        {post.excerpt.substring(0, 80)}...
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {post.tags.map(tag => (
                            <span 
                              key={tag}
                              style={{
                                padding: '2px 6px',
                                background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                                color: 'var(--color-success)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
                      {post.slug}
                    </code>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                    {post.category ? post.category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 'No category'}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    {post.featured && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'var(--color-warning)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Featured
                      </span>
                    )}
                    {post.draft && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'var(--color-text-disabled)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Draft
                      </span>
                    )}
                    {!post.draft && !post.featured && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'var(--color-success)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Published
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => router.push(`/admin/blog-post/${post.slug}`)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <a
                        href={`/blog/${post.category ? post.category + '/' : ''}${post.slug}`}
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
                      <button
                        onClick={() => deletePost(post.slug, post.category)}
                        style={{
                          padding: '6px 12px',
                          background: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
                      >
                        Delete
                      </button>
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

export default function AdminBlogList() {
  return (
    <Suspense 
      fallback={
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading blog posts...</p>
        </div>
      }
    >
      <BlogListContent />
    </Suspense>
  );
}