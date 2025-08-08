'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new blog categories management page
    router.replace('/admin/blog/categories');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to blog categories...</p>
    </div>
  );
}