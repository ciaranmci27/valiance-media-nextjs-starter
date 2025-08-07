'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // Apply filter when posts or filters change
    applyFilter();
  }, [posts, filter, categoryFilter, tagFilter]);
  
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
      const response = await fetch('/api/admin/categories/list');
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
    
    setFilteredPosts(filtered);
  };
  
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
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
          Blog Posts
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Manage your blog content. Create, edit, and organize your posts.
        </p>
        
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
            gap: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Post
        </button>
      </div>

      {/* Combined Filter Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '16px', 
        marginBottom: 'var(--spacing-md)',
        borderBottom: '1px solid var(--color-border-light)',
        paddingBottom: '2px',
        flexWrap: 'wrap'
      }}>
        {/* Status Filter Tabs */}
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
        
        {/* Divider */}
        <div style={{ 
          width: '1px', 
          height: '24px', 
          background: 'var(--color-border-light)',
          marginBottom: '-2px'
        }} />
        
        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '-2px' }}>
          {/* Category Dropdown */}
          <select
            value={categoryFilter || ''}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('category', e.target.value);
              } else {
                params.delete('category');
              }
              router.push(`/admin/blog${params.toString() ? '?' + params.toString() : ''}`);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              background: categoryFilter ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-surface)',
              color: categoryFilter ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace(/-/g, ' ').charAt(0).toUpperCase() + cat.replace(/-/g, ' ').slice(1)}
              </option>
            ))}
          </select>
          
          {/* Tag Dropdown */}
          <select
            value={tagFilter || ''}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('tag', e.target.value);
              } else {
                params.delete('tag');
              }
              router.push(`/admin/blog${params.toString() ? '?' + params.toString() : ''}`);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              background: tagFilter ? 'rgba(34, 197, 94, 0.1)' : 'var(--color-surface)',
              color: tagFilter ? 'var(--color-success)' : 'var(--color-text-secondary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        {/* Active Filters Pills */}
        {(categoryFilter || tagFilter) && (
          <>
            <div style={{ 
              width: '1px', 
              height: '24px', 
              background: 'var(--color-border-light)',
              marginBottom: '-2px'
            }} />
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '-2px' }}>
              {categoryFilter && (
                <span style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--color-primary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
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
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--color-success)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
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
                Clear
              </button>
            </div>
          </>
        )}
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
                <td colSpan={5} style={{ 
                  padding: 'var(--spacing-xl)', 
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  {filter === 'all' 
                    ? 'No blog posts found. Create your first post to get started.' 
                    : `No ${filter === 'drafts' ? 'draft' : filter} posts found.`}
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
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                    {post.category || 'No category'}
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
                          background: 'var(--color-danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-danger)'}
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