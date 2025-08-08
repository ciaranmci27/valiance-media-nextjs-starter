import { Metadata } from 'next';
import { AdminFooter } from '@/components/admin/AdminFooter';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for content management',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <AdminFooter />
    </div>
  );
}