'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageEditor from '@/components/admin/editors/PageEditor';
import { Page } from '@/lib/pages/page-types';

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

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: 'var(--spacing-lg)' }} />
          <div className="skeleton" style={{ height: '44px', marginBottom: 'var(--spacing-lg)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
      </div>
    );
  }

  return <PageEditor initialPage={page} isNew={false} />;
}