'use client';

import { useState, useCallback, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import ConfigWarningBanner from '@/components/admin/ConfigWarningBanner';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCollapsedChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
  }, []);

  // Determine margin based on sidebar state
  // On mobile (< md), no margin — sidebar is an overlay
  // On desktop, margin matches sidebar width
  const contentMarginLeft = sidebarCollapsed ? '64px' : '256px';

  return (
    <div className="min-h-screen" style={{ minHeight: '100dvh' }}>
      {/* Config warning banner */}
      <ConfigWarningBanner />

      <AdminSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={handleCollapsedChange}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Main content area — shifts right on desktop */}
      <div
        className="relative z-10 transition-all duration-300 flex flex-col"
        style={{
          minHeight: '100dvh',
          // Only apply margin on desktop — mobile sidebar is overlay
          // Use CSS for the responsive behavior
        }}
      >
        {/* Desktop margin via inline style + CSS class for responsive */}
        <style>{`
          .admin-content-area {
            margin-left: 0;
          }
          @media (min-width: 768px) {
            .admin-content-area {
              margin-left: ${contentMarginLeft};
            }
          }
          /* Suppress transitions on initial load to prevent flash */
          ${!mounted ? `
            .admin-sidebar,
            .admin-content-area {
              transition: none !important;
            }
          ` : ''}
          /* Sidebar responsive transform */
          @media (max-width: 767.98px) {
            .admin-sidebar {
              width: 264px !important;
            }
            .admin-sidebar[data-mobile-open="false"] {
              transform: translateX(-100%);
            }
            .admin-sidebar[data-mobile-open="true"] {
              transform: translateX(0);
            }
          }
        `}</style>

        <div className="admin-content-area flex flex-col flex-1 transition-all duration-300">
          <div className="md:hidden">
            <AdminHeader onMobileMenuClick={() => setMobileOpen(true)} />
          </div>

          <main className="flex-1 px-4 md:px-6 pb-6 pt-6">
            {children}
          </main>

          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
