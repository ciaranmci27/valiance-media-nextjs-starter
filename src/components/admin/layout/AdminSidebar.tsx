'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { seoConfig } from '@/seo/seo.config';
import { Tooltip } from '@/components/admin/ui/Tooltip';
import {
  HomeIcon,
  DocumentTextIcon,
  NewspaperIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: HomeIcon },
  { label: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
  { label: 'Posts', href: '/admin/blog', icon: NewspaperIcon },
  { label: 'Categories', href: '/admin/blog/categories', icon: FolderIcon },
  { label: 'SEO', href: '/admin/seo', icon: MagnifyingGlassIcon },
  { label: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function AdminSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useTheme();

  const isActive = useCallback(
    (href: string) => {
      // Dashboard: exact match only
      if (href === '/admin') return pathname === '/admin';

      // Blog post editor routes belong to Posts
      if (href === '/admin/blog' && pathname.startsWith('/admin/blog-post')) return true;

      const isMatch = pathname === href || pathname.startsWith(href + '/');
      if (!isMatch) return false;

      // Check for more specific match
      const allItems = [...navItems, ...bottomNavItems];
      const hasMoreSpecific = allItems.some((item) => {
        if (item.href === href || item.href === '/admin') return false;
        const itemMatches = pathname === item.href || pathname.startsWith(item.href + '/');
        return itemMatches && item.href.length > href.length;
      });

      return !hasMoreSpecific;
    },
    [pathname]
  );

  const handleNavClick = () => {
    if (mobileOpen) onMobileOpenChange(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderNavItem = (item: NavItem, showTooltip: boolean) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const isCollapsed = collapsed && !mobileOpen;

    const link = (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavClick}
        className={`admin-nav-item ${active ? 'active' : ''}`}
      >
        <Icon className="shrink-0 w-5 h-5" />
        <span className="admin-nav-label">
          {item.label}
        </span>
      </Link>
    );

    if (showTooltip && isCollapsed) {
      return (
        <Tooltip key={item.href} content={item.label} position="right" delay={100}>
          {link}
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop md:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      )}

      <div className="admin-sidebar-group">
        {/* Desktop collapse toggle — appears on hover */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="admin-sidebar-toggle"
          style={{ left: collapsed ? '64px' : '256px' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>

        <aside
          className="admin-sidebar admin-glass"
          style={{
            width: collapsed ? '64px' : '256px',
          }}
          data-mobile-open={mobileOpen}
        >
          {/* Logo area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '64px',
              padding: '0 16px',
              borderBottom: '1px solid var(--color-border-light)',
              flexShrink: 0,
            }}
          >
            {/* Desktop: Logo — both rendered, crossfade via opacity */}
            <div className="hidden md:flex items-center" style={{ position: 'relative', height: '32px', flexShrink: 0 }}>
              {/* Horizontal logo — absolutely positioned so it never compresses */}
              <Link
                href="/admin"
                onClick={handleNavClick}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  opacity: collapsed ? 0 : 1,
                  transition: 'opacity 200ms ease',
                }}
                aria-hidden={collapsed}
                tabIndex={collapsed ? -1 : 0}
              >
                <Image
                  src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
                  alt={seoConfig.siteName || 'Admin'}
                  width={140}
                  height={32}
                  className="h-8 w-auto"
                  style={{ maxWidth: 'none' }}
                  priority
                />
              </Link>
              {/* Favicon — in normal flow, sizes the container */}
              <Link
                href="/admin"
                onClick={handleNavClick}
                style={{
                  opacity: collapsed ? 1 : 0,
                  transition: 'opacity 200ms ease',
                }}
                aria-hidden={!collapsed}
                tabIndex={!collapsed ? -1 : 0}
              >
                <Image
                  src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
                  alt={seoConfig.siteName || 'Admin'}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Mobile: Full logo + close button */}
            <Link href="/admin" className="md:hidden flex items-center" onClick={handleNavClick}>
              <Image
                src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
                alt={seoConfig.siteName || 'Admin'}
                width={140}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            <button
              onClick={() => onMobileOpenChange(false)}
              className="md:hidden flex items-center justify-center rounded-lg"
              style={{
                width: '32px',
                height: '32px',
                color: 'var(--color-text-tertiary)',
              }}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Main navigation */}
          <nav
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '12px',
              gap: '4px',
            }}
          >
            {navItems.map((item) => renderNavItem(item, true))}

            {/* Mobile: show bottom items inline */}
            <div className="md:hidden" style={{ marginTop: '8px', borderTop: '1px solid var(--color-border-light)', paddingTop: '8px' }}>
              {bottomNavItems.map((item) => renderNavItem(item, false))}

              <button
                onClick={handleLogout}
                className="admin-nav-item sign-out w-full"
              >
                <ArrowRightStartOnRectangleIcon className="shrink-0 w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>

          {/* Bottom section — desktop only */}
          <div
            className="hidden md:flex md:flex-col"
            style={{
              borderTop: '1px solid var(--color-border-light)',
              padding: '12px',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            {bottomNavItems.map((item) => renderNavItem(item, true))}

            {/* Sign Out */}
            <Tooltip content="Sign Out" position="right" delay={100} disabled={!collapsed}>
              <button
                onClick={handleLogout}
                className="admin-nav-item sign-out w-full"
              >
                <ArrowRightStartOnRectangleIcon className="shrink-0 w-5 h-5" />
                <span className="admin-nav-label">Sign Out</span>
              </button>
            </Tooltip>
          </div>
        </aside>
      </div>
    </>
  );
}
