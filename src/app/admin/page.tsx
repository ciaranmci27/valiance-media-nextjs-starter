'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  categories: { [key: string]: number };
  recentPosts: BlogPost[];
  popularTags: { tag: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    featuredPosts: 0,
    categories: {},
    recentPosts: [],
    popularTags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      
      // Check if user is authenticated
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Redirect to login on auth errors
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    link?: string;
  }) => (
    <div 
      className="card p-6 hover-lift cursor-pointer" 
      onClick={() => link && router.push(link)}
      style={{ transition: 'transform var(--transition-base), box-shadow var(--transition-base)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            {title}
          </p>
          <p className="text-h2" style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </p>
        </div>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: 'var(--radius-md)',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              Content Management Dashboard
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Welcome back! Here's an overview of your content.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/blog-post/new" className="quick-action-card">
            <div className="card p-6 text-center hover-lift">
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto var(--spacing-md)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                New Post
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Create a new blog post
              </p>
            </div>
          </Link>

          <Link href="/admin/blog" className="quick-action-card">
            <div className="card p-6 text-center hover-lift">
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto var(--spacing-md)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Manage Posts
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                View and edit all posts
              </p>
            </div>
          </Link>

          <Link href="/admin/categories" className="quick-action-card">
            <div className="card p-6 text-center hover-lift">
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto var(--spacing-md)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Categories
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Manage categories
              </p>
            </div>
          </Link>

          <Link href="/admin/seo" className="quick-action-card">
            <div className="card p-6 text-center hover-lift">
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto var(--spacing-md)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                SEO
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Optimize for search
              </p>
            </div>
          </Link>

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Posts" 
            value={stats.totalPosts}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            }
            color="var(--color-primary)"
            link="/admin/blog?filter=all"
          />
          <StatCard 
            title="Published" 
            value={stats.publishedPosts}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            }
            color="var(--color-success)"
            link="/admin/blog?filter=published"
          />
          <StatCard 
            title="Drafts" 
            value={stats.draftPosts}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            }
            color="var(--color-warning)"
            link="/admin/blog?filter=drafts"
          />
          <StatCard 
            title="Featured" 
            value={stats.featuredPosts}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            }
            color="var(--color-premium)"
            link="/admin/blog?filter=featured"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
                  Recent Posts
                </h2>
                <Link href="/admin/blog" className="text-body-sm" style={{ color: 'var(--color-primary)' }}>
                  View All →
                </Link>
              </div>
              
              {stats.recentPosts.length === 0 ? (
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  No posts yet. Create your first post to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentPosts.slice(0, 5).map((post) => (
                    <div 
                      key={post.slug}
                      className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/blog-post/${post.slug}`)}
                      style={{ 
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border-light)'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-body" style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {post.title}
                          </h4>
                          {post.draft && (
                            <span className="badge badge-warning">Draft</span>
                          )}
                          {post.featured && (
                            <span className="badge badge-premium">Featured</span>
                          )}
                        </div>
                        <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                          {post.excerpt.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-4 text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span>{post.author?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          {post.readingTime && (
                            <>
                              <span>•</span>
                              <span>{post.readingTime} min read</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/blog-post/${post.slug}`);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '14px' }}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="card p-6">
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Categories
              </h3>
              {Object.keys(stats.categories).length === 0 ? (
                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No categories yet
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div 
                      key={category} 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        // Find the category slug from the category name
                        const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
                        router.push(`/admin/blog?category=${categorySlug}`);
                      }}
                    >
                      <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                        {category}
                      </span>
                      <span className="text-body-sm" style={{ 
                        color: 'var(--color-text-primary)',
                        background: 'var(--color-blue-100)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '600',
                        fontSize: '12px',
                        minWidth: '24px',
                        textAlign: 'center',
                        border: '1px solid var(--color-blue-200)'
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Tags */}
            <div className="card p-6">
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Popular Tags
              </h3>
              {stats.popularTags.length === 0 ? (
                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No tags yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats.popularTags.slice(0, 10).map((tag) => (
                    <span 
                      key={tag.tag}
                      className="text-body-sm cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => router.push(`/admin/blog?tag=${encodeURIComponent(tag.tag)}`)}
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'inline-block'
                      }}
                    >
                      {tag.tag} ({tag.count})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Content Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Publishing Rate
                    </span>
                    <span className="text-body-sm" style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                      {stats.publishedPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: 'var(--color-border-light)', 
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${stats.publishedPosts > 0 ? (stats.publishedPosts / stats.totalPosts) * 100 : 0}%`,
                      background: 'var(--color-success)',
                      transition: 'width var(--transition-base)'
                    }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Featured Rate
                    </span>
                    <span className="text-body-sm" style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                      {stats.featuredPosts > 0 ? Math.round((stats.featuredPosts / stats.totalPosts) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: 'var(--color-border-light)', 
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${stats.featuredPosts > 0 ? (stats.featuredPosts / stats.totalPosts) * 100 : 0}%`,
                      background: 'var(--color-premium)',
                      transition: 'width var(--transition-base)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px var(--shadow-medium);
        }

        .quick-action-card {
          text-decoration: none;
          display: block;
          transition: all var(--transition-base);
        }

        [data-theme="dark"] .hover\\:bg-gray-50:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        [data-theme="dark"] .text-body-sm[style*="background: var(--color-blue-50)"] {
          background: rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  );
}