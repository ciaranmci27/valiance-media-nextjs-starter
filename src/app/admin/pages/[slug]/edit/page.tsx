'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageEditor from '@/components/admin/editors/PageEditor';
import { Page } from '@/lib/pages/page-types';

function EditPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '160px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '240px', height: '18px' }} />
      </div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '80px', height: '36px', borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl, 16px)' }} />
      <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

export default function EditPagePage() {
  const params = useParams();
  const encodedSlug = params.slug as string;
  const slug = decodeURIComponent(encodedSlug);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data.page);
      } else {
        setError('Page not found');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <EditPageSkeleton />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="dash-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="dash-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Page not found</p>
        </div>
      </div>
    );
  }

  return <PageEditor initialPage={page} isNew={false} />;
}
