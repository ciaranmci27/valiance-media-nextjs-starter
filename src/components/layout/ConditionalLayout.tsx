'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      <main id="main-content" className="flex-1 pt-20 w-full relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}