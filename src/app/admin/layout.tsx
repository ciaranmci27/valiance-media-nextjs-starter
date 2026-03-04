import { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for content management',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}