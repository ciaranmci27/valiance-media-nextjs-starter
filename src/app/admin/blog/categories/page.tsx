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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--spacing-xl)',
          gap: 'var(--spacing-lg)'
        }}>
          {/* Left Column: Title */}
          <div style={{ flex: 1 }}>
            <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
              Blog Categories
            </h1>
          </div>
          
          {/* Right Column: Action Button */}
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
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

        <div style={{
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
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Slug
                </th>
                <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
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
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ 
                        color: 'var(--color-text-primary)', 
                        fontWeight: '500'
                      }}>
                        {category.name}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
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
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      {category.description || 'No description'}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                      {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
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
                            background: category.postCount > 0 ? '#6B7280' : '#DC2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: category.postCount > 0 ? 'not-allowed' : 'pointer',
                            opacity: category.postCount > 0 ? 0.6 : 1,
                            transition: 'background 0.2s',
                            position: 'relative'
                          }}
                          title={category.postCount > 0 ? `Cannot delete - contains ${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}` : 'Delete category'}
                          onMouseEnter={(e) => {
                            if (category.postCount === 0) {
                              e.currentTarget.style.background = '#B91C1C';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (category.postCount === 0) {
                              e.currentTarget.style.background = '#DC2626';
                            } else {
                              e.currentTarget.style.background = '#6B7280';
                            }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
            <p className="mb-6">
              Are you sure you want to delete the category "{categoryToDelete.name}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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