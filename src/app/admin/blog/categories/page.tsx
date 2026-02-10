'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export default function BlogCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories/list');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/blog/categories/${categoryToDelete.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-start mb-8">
            <div className="skeleton" style={{ width: '200px', height: '36px' }} />
            <div className="skeleton" style={{ width: '200px', height: '48px', borderRadius: 'var(--radius-md)' }} />
          </div>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '1px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section with 2-column layout */}
        <div className="admin-page-header">
          {/* Left Column: Title */}
          <div style={{ flex: 1 }}>
            <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
              Blog Categories
            </h1>
          </div>

          {/* Right Column: Action Button */}
          <div className="admin-page-header-actions">
            <button
              onClick={() => router.push('/admin/blog/categories/new')}
              style={{
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '48px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Category
            </button>
          </div>
        </div>

        <div className="admin-table-wrap" style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-light)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Name
                </th>
                <th className="mobile-hidden" style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Slug
                </th>
                <th className="mobile-hidden" style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Description
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Posts
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ 
                    padding: 'var(--spacing-xl)', 
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)'
                  }}>
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.slug} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    {/* Name — card headline on mobile */}
                    <td className="cell-title" style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: '500'
                      }}>
                        {category.name}
                      </div>
                    </td>
                    {/* Slug — desktop only */}
                    <td className="mobile-hidden" style={{ padding: 'var(--spacing-md)' }}>
                      <code style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: 'var(--color-primary)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {category.slug}
                      </code>
                    </td>
                    {/* Description — desktop only */}
                    <td className="mobile-hidden" style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      {category.description || 'No description'}
                    </td>
                    {/* Post count — metadata chip on mobile */}
                    <td className="cell-meta" style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="cell-actions" style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/admin/blog/categories/${category.slug}/edit`)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (category.postCount > 0) {
                              alert(`Cannot delete category "${category.name}" because it contains ${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}. Please delete or reassign the posts first.`);
                              return;
                            }
                            setCategoryToDelete(category);
                            setDeleteModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: category.postCount > 0 ? 'var(--color-text-disabled)' : 'var(--color-error, #DC2626)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            cursor: category.postCount > 0 ? 'not-allowed' : 'pointer',
                            opacity: category.postCount > 0 ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                          }}
                          title={category.postCount > 0 ? `Cannot delete - contains ${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}` : 'Delete category'}
                          onMouseEnter={(e) => {
                            if (category.postCount === 0) e.currentTarget.style.opacity = '0.85';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = category.postCount > 0 ? '0.6' : '1';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>

    {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card max-w-md w-full mx-4 p-6" style={{ background: 'var(--color-surface)' }}>
            <h3 className="text-h5" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
              Delete Category
            </h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Are you sure you want to delete the category &ldquo;{categoryToDelete.name}&rdquo;?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-error, #DC2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}