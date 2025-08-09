'use client';

import { AdminHeader } from './AdminHeader';
import ConfigWarningBanner from './ConfigWarningBanner';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <ConfigWarningBanner />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}