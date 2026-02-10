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
  emailConfigured: boolean;
  analyticsEnabled: boolean;
  seoOptimized: boolean;
  sitemapGenerated: boolean;
  totalPages: number;
}

function StatCard({ title, value, icon, color, link, delay }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link?: string;
  delay?: number;
}) {
  const router = useRouter();
  return (
    <div
      className="admin-stat-card cursor-pointer animate-fade-up"
      role={link ? 'link' : undefined}
      tabIndex={link ? 0 : undefined}
      onClick={() => link && router.push(link)}
      onKeyDown={(e) => { if (link && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); router.push(link); } }}
      style={{ '--stat-accent': color, animationDelay: `${delay || 0}ms` } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            {title}
          </p>
          <p className="text-h2" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
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
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="skeleton" style={{ width: '220px', height: '36px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '340px', height: '20px' }} />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
          </div>
          <div className="space-y-6">
            <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
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
      const analyticsResponse = await fetch('/api/admin/settings/analytics');
      const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : {};

      const pagesResponse = await fetch('/api/admin/pages');
      const pagesData = pagesResponse.ok ? await pagesResponse.json() : { pages: [] };

      setSystemStatus({
        emailConfigured: false,
        analyticsEnabled: !!(analyticsData.googleAnalyticsId || analyticsData.facebookPixelId),
        seoOptimized: true,
        sitemapGenerated: true,
        totalPages: pagesData.pages?.length || 0
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const quickActions = [
    {
      label: 'New Post',
      href: '/admin/blog-post',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    },
    {
      label: 'New Page',
      href: '/admin/pages/new',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      gradient: 'var(--color-primary)',
    },
    {
      label: 'Categories',
      href: '/admin/blog/categories',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      gradient: 'var(--color-secondary)',
    },
    {
      label: 'SEO Settings',
      href: '/admin/seo',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      ),
      gradient: 'var(--color-warning)',
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      gradient: 'var(--color-info)',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Your site at a glance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
          {['overview', 'content', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-body font-medium transition-all capitalize"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                marginBottom: '-1px',
                cursor: 'pointer',
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {quickActions.map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="admin-action-card animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    margin: '0 auto 10px',
                    borderRadius: 'var(--radius-full)',
                    background: action.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {action.icon}
                  </div>
                  <span className="text-body-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Posts"
                value={stats.totalPosts}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                }
                color="var(--color-primary)"
                link="/admin/blog?filter=all"
                delay={0}
              />
              <StatCard
                title="Published"
                value={stats.publishedPosts}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
                color="var(--color-success)"
                link="/admin/blog?filter=published"
                delay={60}
              />
              <StatCard
                title="Drafts"
                value={stats.draftPosts}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                }
                color="var(--color-warning)"
                link="/admin/blog?filter=drafts"
                delay={120}
              />
              <StatCard
                title="Total Pages"
                value={systemStatus.totalPages}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                }
                color="var(--color-info)"
                link="/admin/pages"
                delay={180}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Posts */}
              <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-h4" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
                      Recent Posts
                    </h2>
                    <Link
                      href="/admin/blog"
                      className="text-body-sm font-medium"
                      style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      View All &rarr;
                    </Link>
                  </div>

                  {stats.recentPosts.length === 0 ? (
                    <div style={{
                      padding: 'var(--spacing-xl)',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--color-border-light)',
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <p className="text-body" style={{ color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                        No posts yet
                      </p>
                      <Link
                        href="/admin/blog-post"
                        className="text-body-sm font-medium"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Create your first post &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentPosts.slice(0, 5).map((post) => (
                        <div
                          key={post.slug}
                          className="admin-list-row flex items-start justify-between gap-4"
                          onClick={() => router.push(`/admin/blog-post/${post.slug}`)}
                          style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border-light)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-md)',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-body font-semibold truncate" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
                                {post.title}
                              </h4>
                              {post.draft && (
                                <span className="badge badge-warning" style={{ flexShrink: 0 }}>Draft</span>
                              )}
                              {post.featured && (
                                <span className="badge badge-premium" style={{ flexShrink: 0 }}>Featured</span>
                              )}
                            </div>
                            <p className="text-body-sm truncate" style={{ color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
                              {post.excerpt.substring(0, 80)}...
                            </p>
                            <div className="flex items-center gap-3 text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                              <span>{post.author?.name || 'Unknown'}</span>
                              <span style={{ opacity: 0.4 }}>&bull;</span>
                              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                              {post.readingTime && (
                                <>
                                  <span style={{ opacity: 0.4 }}>&bull;</span>
                                  <span>{post.readingTime} min</span>
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
                            style={{ padding: '4px 12px', fontSize: '13px', flexShrink: 0 }}
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
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
                {/* System Status */}
                <div className="card p-6">
                  <h3 className="text-h5" style={{ color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
                    System Status
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Storage', value: 'Local Files', ok: true },
                      { label: 'Analytics', value: systemStatus.analyticsEnabled ? 'Active' : 'Inactive', ok: systemStatus.analyticsEnabled },
                      { label: 'SEO', value: systemStatus.seoOptimized ? 'Optimized' : 'Needs Work', ok: systemStatus.seoOptimized },
                      { label: 'Sitemap', value: systemStatus.sitemapGenerated ? 'Generated' : 'Missing', ok: systemStatus.sitemapGenerated },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                        <span className={`badge ${item.ok ? 'badge-success' : 'badge-warning'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="card p-6">
                  <h3 className="text-h5" style={{ color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
                    Categories
                  </h3>
                  {Object.keys(stats.categories).length === 0 ? (
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                      No categories yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(stats.categories).slice(0, 5).map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => router.push('/admin/blog/categories')}
                          style={{ border: '1px solid transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-surface-elevated)';
                            e.currentTarget.style.borderColor = 'var(--color-border-light)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                        >
                          <span className="text-body-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {category}
                          </span>
                          <span className="badge badge-info">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Publishing Rate */}
                <div className="card p-6">
                  <h3 className="text-h5" style={{ color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
                    Publishing Rate
                  </h3>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Published vs Total
                      </span>
                      <span className="text-body-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'var(--color-border-light)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${stats.totalPosts > 0 ? (stats.publishedPosts / stats.totalPosts) * 100 : 0}%`,
                        background: 'var(--color-success)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
            {/* Blog Management */}
            <div className="card p-6">
              <h3 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Blog Management
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/admin/blog', title: 'All Posts', desc: 'Manage all blog posts' },
                  { href: '/admin/blog-post', title: 'Create New Post', desc: 'Write a new blog post' },
                  { href: '/admin/blog/categories', title: 'Categories', desc: 'Manage blog categories' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-list-row block"
                    style={{ textDecoration: 'none', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}
                  >
                    <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Page Management */}
            <div className="card p-6">
              <h3 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Page Management
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/admin/pages', title: 'All Pages', desc: 'View and edit static pages' },
                  { href: '/admin/pages/new', title: 'Create New Page', desc: 'Add a new static page' },
                  { href: '/admin/seo?tab=redirects', title: 'Redirects', desc: 'Manage URL redirects' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-list-row block"
                    style={{ textDecoration: 'none', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}
                  >
                    <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
            <div className="card p-6">
              <h3 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Configuration
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/admin/settings', title: 'All Settings', desc: 'Analytics & Admin Configuration' },
                  { href: '/admin/seo', title: 'SEO Settings', desc: 'Search engine optimization' },
                  { href: '/admin/seo/edit', title: 'Advanced SEO Editor', desc: 'Edit SEO configuration file' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-list-row block"
                    style={{ textDecoration: 'none', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}
                  >
                    <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Quick Access
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/admin/settings', title: 'Analytics Setup', desc: 'Google Analytics, Hotjar, etc.' },
                  { href: '/admin/settings', title: 'Admin Settings', desc: 'Security & session configuration' },
                  { href: '/admin/seo', title: 'SEO Configuration', desc: 'Meta tags, OpenGraph, etc.' },
                ].map((item) => (
                  <Link
                    key={`${item.href}-${item.title}`}
                    href={item.href}
                    className="admin-list-row block"
                    style={{ textDecoration: 'none', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}
                  >
                    <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h4>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Site Files
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/sitemap.xml', title: 'View Sitemap', desc: 'Check generated sitemap', external: true },
                  { href: '/robots.txt', title: 'View Robots.txt', desc: 'Check crawler rules', external: true },
                  { href: '/', title: 'View Live Site', desc: 'Open site in new tab', external: true },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-list-row block"
                    style={{ textDecoration: 'none', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}
                  >
                    <h4 className="text-body font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {item.title}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </h4>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
