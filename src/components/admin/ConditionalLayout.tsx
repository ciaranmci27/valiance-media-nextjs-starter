'use client';

import { usePathname } from 'next/navigation';
import { Header } from '../Header';
import { AdminHeader } from './AdminHeader';
import { Footer } from '../Footer';

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
    // Admin pages: admin header, no regular footer (admin footer handled in admin layout)
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <AdminHeader />
        <main className="flex-1 pt-20 w-full relative z-10">
          {children}
        </main>
      </div>
    );
  }

  // Regular pages: with header/footer
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1 pt-20 w-full relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}