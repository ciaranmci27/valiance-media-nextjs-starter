'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  DocumentIcon,
  ArrowTrendingUpIcon,
  ServerStackIcon,
  ChartBarIcon,
  GlobeAltIcon,
  MapIcon,
  ArrowUpRightIcon,
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

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '108px', borderRadius: 'var(--radius-xl, 16px)' }} />
        ))}
      </div>
      {/* Quick actions skeleton */}
      <div className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-lg)' }} />
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-xl, 16px)' }} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl, 16px)' }} />
          <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl, 16px)' }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    emailConfigured: false,
    analyticsEnabled: false,
    seoOptimized: false,
    sitemapGenerated: false,
    totalPages: 0,
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    featuredPosts: 0,
    categories: {},
    recentPosts: [],
    popularTags: [],
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
        totalPages: pagesData.pages?.length || 0,
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
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const publishRate = stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0;

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: DocumentTextIcon,
      href: '/admin/blog?filter=all',
    },
    {
      label: 'Published',
      value: stats.publishedPosts,
      icon: CheckCircleIcon,
      href: '/admin/blog?filter=published',
    },
    {
      label: 'Drafts',
      value: stats.draftPosts,
      icon: PencilSquareIcon,
      href: '/admin/blog?filter=drafts',
    },
    {
      label: 'Pages',
      value: systemStatus.totalPages,
      icon: DocumentIcon,
      href: '/admin/pages',
    },
  ];

  const quickActions = [
    { label: 'New Post', href: '/admin/blog-post', icon: PlusIcon },
    { label: 'New Page', href: '/admin/pages/new', icon: DocumentPlusIcon },
    { label: 'Categories', href: '/admin/blog/categories', icon: FolderPlusIcon },
    { label: 'SEO', href: '/admin/seo', icon: MagnifyingGlassIcon },
    { label: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const systemItems = [
    { label: 'Storage', value: 'Local Files', ok: true, icon: ServerStackIcon },
    { label: 'Analytics', value: systemStatus.analyticsEnabled ? 'Active' : 'Inactive', ok: systemStatus.analyticsEnabled, icon: ChartBarIcon },
    { label: 'SEO', value: systemStatus.seoOptimized ? 'Optimized' : 'Needs Work', ok: systemStatus.seoOptimized, icon: GlobeAltIcon },
    { label: 'Sitemap', value: systemStatus.sitemapGenerated ? 'Generated' : 'Missing', ok: systemStatus.sitemapGenerated, icon: MapIcon },
  ];

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

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header — hidden on mobile, top bar shows title */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Dashboard
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Overview of your site content and activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="dash-stat-card animate-fade-up"
              role="link"
              tabIndex={0}
              onClick={() => router.push(stat.href)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(stat.href); } }}
              style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
            >
              <div className="dash-stat-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div className="dash-stat-value">{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions — inline toolbar style */}
      <div
        className="dash-quick-actions animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="dash-quick-action"
            >
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Posts — 3 cols */}
        <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: '260ms' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Recent Posts</h2>
              <Link href="/admin/blog" className="dash-card-link">
                View All
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentPosts.length === 0 ? (
              <div className="dash-empty-state">
                <DocumentTextIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                  No posts yet
                </p>
                <Link
                  href="/admin/blog-post"
                  className="dash-card-link"
                  style={{ fontSize: '13px' }}
                >
                  Create your first post
                  <ArrowUpRightIcon className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="dash-post-list">
                {stats.recentPosts.slice(0, 5).map((post) => (
                  <div
                    key={post.slug}
                    className="dash-post-row"
                    onClick={() => router.push(`/admin/blog-post/${post.slug}`)}
                  >
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
                      </div>
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', paddingLeft: '14px' }}>
                        {post.category && <span>{post.category}</span>}
                        {post.category && <span style={{ opacity: 0.3 }}>&middot;</span>}
                        <span>{formatDate(post.publishedAt)}</span>
                        {post.readingTime && (
                          <>
                            <span style={{ opacity: 0.3 }}>&middot;</span>
                            <span>{post.readingTime} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowUpRightIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* System Status */}
          <div className="dash-card animate-fade-up" style={{ animationDelay: '320ms' }}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">System</h2>
            </div>
            <div className="dash-system-grid">
              {systemItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="dash-system-item">
                    <div className="dash-system-icon" data-ok={item.ok}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 500 }}>
                        {item.label}
                      </div>
                      <div style={{ color: item.ok ? 'var(--color-success)' : 'var(--color-warning)', fontSize: '11px', fontWeight: 500 }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Overview */}
          <div className="dash-card animate-fade-up" style={{ animationDelay: '380ms' }}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Content</h2>
            </div>

            {/* Publishing Rate */}
            <div style={{ marginBottom: '20px' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  Publish Rate
                </span>
                <span style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 600 }}>
                  {publishRate}%
                </span>
              </div>
              <div className="dash-progress-track">
                <div className="dash-progress-fill" style={{ width: `${publishRate}%` }} />
              </div>
              {stats.totalPosts > 0 && (
                <div className="flex items-center gap-1 mt-2" style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  <span>{stats.publishedPosts} of {stats.totalPosts} published</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {Object.keys(stats.categories).length > 0 && (
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.categories).slice(0, 6).map(([category, count]) => (
                    <Link
                      key={category}
                      href="/admin/blog/categories"
                      className="dash-category-chip"
                    >
                      {category}
                      <span className="dash-category-count">{count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
