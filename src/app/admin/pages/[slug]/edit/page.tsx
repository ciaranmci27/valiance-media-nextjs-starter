'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageEditor from '@/components/admin/PageEditor';
import { Page } from '@/lib/page-types';

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
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading page...</p>
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