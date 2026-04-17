'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      const id = window.location.hash.slice(1);
      if (id && !document.getElementById(id)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  if (isAdminLogin) {
    // Login page: no header/footer
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {children}
      </div>
    );
  }

  if (isAdminPage) {
    // Admin pages: sidebar shell layout
    return <AdminShell>{children}</AdminShell>;
  }

  // Regular pages: with header/footer
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 w-full relative z-10" style={{ paddingTop: 'var(--header-height)' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}