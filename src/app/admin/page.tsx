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

interface SystemStatus {
  githubConnected: boolean;
  emailConfigured: boolean;
  analyticsEnabled: boolean;
  seoOptimized: boolean;
  sitemapGenerated: boolean;
  totalPages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    githubConnected: false,
    emailConfigured: false,
    analyticsEnabled: false,
    seoOptimized: false,
    sitemapGenerated: false,
    totalPages: 0
  });
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
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check environment status from API
      const envResponse = await fetch('/api/admin/settings/env-status');
      const envData = envResponse.ok ? await envResponse.json() : { github: {}, email: {} };
      
      // Check analytics from SEO config
      const analyticsResponse = await fetch('/api/admin/settings/analytics');
      const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : {};
      
      // Check pages
      const pagesResponse = await fetch('/api/admin/pages');
      const pagesData = pagesResponse.ok ? await pagesResponse.json() : { pages: [] };
      
      setSystemStatus({
        githubConnected: !!(envData.github?.token && envData.github?.owner && envData.github?.repo),
        emailConfigured: envData.email?.configured || false,
        analyticsEnabled: !!(analyticsData.googleAnalyticsId || analyticsData.facebookPixelId),
        seoOptimized: true,
        sitemapGenerated: true,
        totalPages: pagesData.pages?.length || 0  // Correctly access pages array and use 0 as fallback
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              Admin Dashboard
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Complete control center for your marketing website
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          {['overview', 'content', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-body font-medium transition-all capitalize ${
                activeTab === tab 
                  ? 'border-b-2' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={{ 
                borderColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                marginBottom: '-1px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Link href="/admin/blog-post" className="quick-action-card">
                <div className="card p-6 text-center hover-lift">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto var(--spacing-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    New Post
                  </h3>
                </div>
              </Link>

              <Link href="/admin/pages/new" className="quick-action-card">
                <div className="card p-6 text-center hover-lift">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto var(--spacing-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    New Page
                  </h3>
                </div>
              </Link>

              <Link href="/admin/blog/categories" className="quick-action-card">
                <div className="card p-6 text-center hover-lift">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto var(--spacing-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Categories
                  </h3>
                </div>
              </Link>

              <Link href="/admin/seo" className="quick-action-card">
                <div className="card p-6 text-center hover-lift">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto var(--spacing-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    SEO Settings
                  </h3>
                </div>
              </Link>

              <Link href="/admin/settings" className="quick-action-card">
                <div className="card p-6 text-center hover-lift">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto var(--spacing-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Settings
                  </h3>
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
                title="Total Pages" 
                value={systemStatus.totalPages}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2l6 6"/>
                  </svg>
                }
                color="var(--color-info)"
                link="/admin/pages"
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
                {/* System Status */}
                <div className="card p-6">
                  <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>GitHub</span>
                      <span className={`badge ${systemStatus.githubConnected ? 'badge-success' : 'badge-error'}`}>
                        {systemStatus.githubConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
                      <span className={`badge ${systemStatus.emailConfigured ? 'badge-success' : 'badge-warning'}`}>
                        {systemStatus.emailConfigured ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Analytics</span>
                      <span className={`badge ${systemStatus.analyticsEnabled ? 'badge-success' : 'badge-warning'}`}>
                        {systemStatus.analyticsEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>SEO</span>
                      <span className={`badge ${systemStatus.seoOptimized ? 'badge-success' : 'badge-warning'}`}>
                        {systemStatus.seoOptimized ? 'Optimized' : 'Needs Work'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Sitemap</span>
                      <span className={`badge ${systemStatus.sitemapGenerated ? 'badge-success' : 'badge-error'}`}>
                        {systemStatus.sitemapGenerated ? 'Generated' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>

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
                      {Object.entries(stats.categories).slice(0, 5).map(([category, count]) => (
                        <div 
                          key={category} 
                          className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                          onClick={() => router.push(`/admin/blog/categories`)}
                        >
                          <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                            {category}
                          </span>
                          <span className="badge badge-info">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="card p-6">
                  <h3 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                    Performance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Publishing Rate
                        </span>
                        <span className="text-body-sm" style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                          {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
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
                          width: `${stats.totalPosts > 0 ? (stats.publishedPosts / stats.totalPosts) * 100 : 0}%`,
                          background: 'var(--color-success)',
                          transition: 'width var(--transition-base)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Blog Management
              </h3>
              <div className="space-y-4">
                <Link href="/admin/blog" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>All Posts</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage all blog posts</p>
                </Link>
                <Link href="/admin/blog-post" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Create New Post</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Write a new blog post</p>
                </Link>
                <Link href="/admin/blog/categories" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Categories</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage blog categories</p>
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Page Management
              </h3>
              <div className="space-y-4">
                <Link href="/admin/pages" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>All Pages</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>View and edit static pages</p>
                </Link>
                <Link href="/admin/pages/new" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Create New Page</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Add a new static page</p>
                </Link>
                <Link href="/admin/seo?tab=redirects" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Redirects</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage URL redirects</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Configuration
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => { router.push('/admin/settings'); setActiveTab('system'); }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left" 
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>All Settings</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>GitHub, Email, Analytics & Verification</p>
                </button>
                <Link href="/admin/seo" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>SEO Settings</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Search engine optimization</p>
                </Link>
                <Link href="/admin/seo/edit" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Advanced SEO Editor</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Edit SEO configuration file</p>
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Quick Access
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => { router.push('/admin/settings'); setTimeout(() => setActiveTab('github'), 100); }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left" 
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>GitHub Integration</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Content version control</p>
                </button>
                <button 
                  onClick={() => { router.push('/admin/settings'); setTimeout(() => setActiveTab('analytics'), 100); }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left" 
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Analytics Setup</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Google Analytics, Hotjar, etc.</p>
                </button>
                <button 
                  onClick={() => { router.push('/admin/settings'); setTimeout(() => setActiveTab('verification'), 100); }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left" 
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Site Verification</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Search console verification</p>
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Site Files
              </h3>
              <div className="space-y-4">
                <Link href="/sitemap.xml" target="_blank" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>View Sitemap</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Check generated sitemap</p>
                </Link>
                <Link href="/robots.txt" target="_blank" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>View Robots.txt</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Check crawler rules</p>
                </Link>
                <Link href="/" target="_blank" className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: 'var(--color-border-light)' }}>
                  <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>View Live Site</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Open site in new tab</p>
                </Link>
              </div>
            </div>
          </div>
        )}

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