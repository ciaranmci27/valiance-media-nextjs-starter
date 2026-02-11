'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/admin/ui/SearchInput';
import {
  PlusIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  FolderIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

interface Category {
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

function CategoriesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="hidden md:block">
        <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '18px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-full)' }} />
      <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-xl, 16px)' }} />
    </div>
  );
}

function CategoriesContent() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = [...categories];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
      );
    }
    setFilteredCategories(filtered);
  }, [categories, searchQuery]);

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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

  const formatName = (name: string) => {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) return <CategoriesSkeleton />;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header — hidden on mobile */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Categories
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Organize your blog posts into categories
        </p>
      </div>

      {/* Toolbar */}
      <div className="pages-toolbar animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="flex gap-2">
          <button
            className="dash-quick-action"
            onClick={() => router.push('/admin/blog')}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Posts</span>
          </button>
          <button
            className="dash-quick-action"
            onClick={() => router.push('/admin/blog/categories/new')}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
        <SearchInput
          placeholder="Search categories..."
          onSearch={handleSearch}
          className="pages-search"
        />
      </div>

      {/* Category list */}
      <div className="dash-card categories-card-wrap animate-fade-up" style={{ padding: 0, animationDelay: '120ms' }}>
        {/* Desktop column headers */}
        <div className="pages-list-header">
          <span>Category</span>
          <span>Actions</span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="dash-empty-state" style={{ padding: '48px 16px' }}>
            <FolderIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
              {searchQuery
                ? `No categories match "${searchQuery}"`
                : 'No categories yet'
              }
            </p>
            {!searchQuery && (
              <button
                className="dash-card-link"
                style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => router.push('/admin/blog/categories/new')}
              >
                Create your first category
              </button>
            )}
          </div>
        ) : (
          <div className="pages-list categories-list">
            {filteredCategories.map((category) => (
              <div key={category.slug} className="pages-row">
                {/* Left: Category info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                      {formatName(category.name)}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                    <code className="pages-path-code">/{category.slug}</code>
                    <span style={{ opacity: 0.3 }}>&middot;</span>
                    <span className="posts-tag">
                      {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                    </span>
                    {category.description && (
                      <>
                        <span style={{ opacity: 0.3 }}>&middot;</span>
                        <span className="truncate" style={{ maxWidth: '300px' }}>{category.description}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="pages-row-actions">
                  <button
                    className="pages-action-btn"
                    onClick={() => router.push(`/admin/blog?category=${category.slug}`)}
                    title="View posts"
                  >
                    <NewspaperIcon className="w-4 h-4" />
                    <span className="pages-action-label">Posts</span>
                  </button>
                  <button
                    className="pages-action-btn"
                    onClick={() => router.push(`/admin/blog/categories/${category.slug}/edit`)}
                    title="Edit category"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span className="pages-action-label">Edit</span>
                  </button>
                  <button
                    className="pages-action-btn danger"
                    onClick={() => {
                      if (category.postCount > 0) {
                        alert(`Cannot delete "${formatName(category.name)}" because it contains ${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}. Please delete or reassign the posts first.`);
                        return;
                      }
                      setCategoryToDelete(category);
                      setDeleteModalOpen(true);
                    }}
                    title={category.postCount > 0 ? `Cannot delete — contains ${category.postCount} posts` : 'Delete category'}
                    disabled={category.postCount > 0}
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="pages-action-label">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="dash-card max-w-md w-full mx-4"
            style={{ padding: '24px' }}
          >
            <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
              Delete Category
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to delete &ldquo;{formatName(categoryToDelete.name)}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="pages-action-btn"
                onClick={() => { setDeleteModalOpen(false); setCategoryToDelete(null); }}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                className="pages-action-btn danger"
                onClick={handleDelete}
                style={{ padding: '8px 16px' }}
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogCategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
