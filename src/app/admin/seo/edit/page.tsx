'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditPageSEO() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = searchParams.get('page') || '/';
  
  // Extract the slug from the path for redirect
  const pageSlug = pagePath === '/' ? 'home' : pagePath.replace(/^\//, '');

  useEffect(() => {
    // Redirect to the PageEditor with the SEO tab active
    router.push(`/admin/pages/${pageSlug}/edit?tab=seo`);
  }, [pageSlug, router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Redirecting to page editor...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
