'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Map admin routes to display titles
const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/pages': 'Pages',
  '/admin/pages/new': 'New Page',
  '/admin/blog': 'Posts',
  '/admin/blog/categories': 'Categories',
  '/admin/blog/categories/new': 'New Category',
  '/admin/blog-post': 'New Post',
  '/admin/seo': 'SEO',
  '/admin/seo/edit': 'SEO Editor',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
  '/admin/settings/auth': 'Auth Settings',
  '/admin/settings/storage': 'Storage Settings',
  '/admin/settings/email': 'Email Settings',
};

interface AdminHeaderProps {
  onMobileMenuClick?: () => void;
}

export function AdminHeader({ onMobileMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { mode, toggleTheme } = useTheme();

  const pageTitle = useMemo(() => {
    // Check exact match first
    if (pageTitles[pathname]) return pageTitles[pathname];

    // Handle dynamic routes
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 3) {
      // /admin/pages/[slug]/edit
      if (segments[1] === 'pages' && segments[3] === 'edit') return 'Edit Page';
      // /admin/blog-post/[slug]
      if (segments[1] === 'blog-post') return 'Edit Post';
      // /admin/blog/categories/[slug]/edit
      if (segments[1] === 'blog' && segments[2] === 'categories' && segments[3]) return 'Edit Category';
    }

    return 'Admin';
  }, [pathname]);

  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden flex items-center justify-center rounded-lg"
          style={{
            width: '40px',
            height: '40px',
            color: 'var(--color-text-primary)',
          }}
          aria-label="Open menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle — visible on mobile (desktop has it in sidebar) */}
        <button
          onClick={toggleTheme}
          className="md:hidden flex items-center justify-center rounded-lg"
          style={{
            width: '40px',
            height: '40px',
            color: 'var(--color-text-secondary)',
          }}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Image
            src={mode === 'dark' ? '/images/light.png' : '/images/dark.png'}
            alt=""
            width={20}
            height={20}
            style={{ width: '20px', height: '20px' }}
          />
        </button>
      </div>
    </header>
  );
}
