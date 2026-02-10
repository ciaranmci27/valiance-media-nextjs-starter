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
        <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: 'var(--spacing-lg)' }} />
        <div className="skeleton" style={{ height: '44px', marginBottom: 'var(--spacing-lg)' }} />
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  );
}
