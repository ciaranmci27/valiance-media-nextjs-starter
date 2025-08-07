'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import TagInput from '@/components/TagInput';
import KeywordsInput from '@/components/KeywordsInput';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';
import { getCMSConfig } from '@/lib/cms-config';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    image: string;
    bio: string;
  };
  category: string;
  tags: string[];
  image: string;
  imageAlt: string;
  featured: boolean;
  draft: boolean;
  excludeFromSearch: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    image: string;
  };
}

interface BlogPostEditorProps {
  initialData?: BlogFormData;
  slug?: string;
  mode: 'create' | 'edit';
}

export default function BlogPostEditor({ initialData, slug, mode }: BlogPostEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFeaturedPreview, setShowFeaturedPreview] = useState(false);
  const [showSEOPreview, setShowSEOPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const [formData, setFormData] = useState<BlogFormData>(initialData || {
    title: '',
    excerpt: '',
    content: '',
    author: {
      name: '',
      image: '/logos/square-logo.png',
      bio: ''
    },
    category: '',
    tags: [],
    image: '/logos/horizontal-logo.png',
    imageAlt: '',
    featured: false,
    draft: false,
    excludeFromSearch: false,
    seo: {
      title: '',
      description: '',
      keywords: [],
      image: '/logos/horizontal-logo.png'
    }
  });

  // Tab configuration
  const tabs = [
    { 
      id: 'content', 
      label: 'Content', 
      icon: '📝',
      description: 'Main content and excerpt'
    },
    { 
      id: 'media', 
      label: 'Media & Images', 
      icon: '🖼️',
      description: 'Featured image and media'
    },
    { 
      id: 'seo', 
      label: 'SEO & Social', 
      icon: '🔍',
      description: 'Search and social optimization'
    },
    { 
      id: 'metadata', 
      label: 'Metadata', 
      icon: '🏷️',
      description: 'Categories, tags, and author'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      description: 'Post visibility and options'
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleKeywordsChange = (keywords: string[]) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords
      }
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find the first tab with an error and switch to it
      if (errors.title || errors.excerpt || errors.content) {
        setActiveTab('content');
      }
      return;
    }

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const endpoint = mode === 'create' 
        ? '/api/admin/blog-post'
        : `/api/admin/blog-post?slug=${slug}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const postSlug = mode === 'create' ? generateSlug(formData.title) : slug;
      const publishedAt = new Date().toISOString();
      
      const postData = {
        ...formData,
        slug: postSlug,
        publishedAt,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200)
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => {
          router.push('/admin/blog');
        }, 1500);
      } else {
        setSaveStatus('error');
        const error = await response.json();
        console.error('Error saving post:', error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, draft: true }));
    await handleSubmit(new Event('submit') as any);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    
    // Required fields
    if (formData.title) completed++;
    total++;
    
    if (formData.excerpt) completed++;
    total++;
    
    if (formData.content) completed++;
    total++;
    
    // Optional but recommended
    if (formData.image && formData.image !== '/logos/horizontal-logo.png') completed++;
    total++;
    
    if (formData.category) completed++;
    total++;
    
    if (formData.tags.length > 0) completed++;
    total++;
    
    if (formData.seo.description || formData.excerpt) completed++;
    total++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
                {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="text-body-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {mode === 'create' 
                  ? 'Write and publish a new blog post'
                  : `Editing: ${formData.title || 'Untitled Post'}`}
              </p>
            </div>
            
            {/* Completion Indicator */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {completionPercentage}% Complete
              </div>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className={`p-3 rounded-lg mb-4 ${
              saveStatus === 'saving' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
              saveStatus === 'saved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
              'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {saveStatus === 'saving' && '⏳ Saving...'}
              {saveStatus === 'saved' && '✅ Post saved successfully! Redirecting...'}
              {saveStatus === 'error' && '❌ Error saving post. Please try again.'}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tab.icon}</span>
                    <span className={`font-medium ${
                      activeTab === tab.id 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="text-label block mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Enter a compelling title for your blog post"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Slug will be: {formData.title ? generateSlug(formData.title) : 'enter-title-to-see-slug'}
                  </p>
                </div>

                <div>
                  <label htmlFor="excerpt" className="text-label block mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className={`input-field ${errors.excerpt ? 'border-red-500' : ''}`}
                    placeholder="Write a brief summary that will appear in blog listings"
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.excerpt.length}/200 characters recommended
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2">
                    Content *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog post content..."
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated reading time: {Math.ceil(formData.content.split(/\s+/).length / 200)} min
                  </p>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Featured Image</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="image" className="text-label block mb-2">
                        Image URL
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="/images/featured.jpg or https://example.com/image.jpg"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Recommended: 1200x630px</p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showFeaturedPreview}
                              onChange={(e) => setShowFeaturedPreview(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="imageAlt" className="text-label block mb-2">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        id="imageAlt"
                        name="imageAlt"
                        value={formData.imageAlt}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Describe the image for accessibility"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Important for SEO and accessibility
                      </p>
                    </div>
                  </div>

                  {showFeaturedPreview && formData.image && (
                    <div className="mt-6">
                      <h4 className="font-medium text-lg mb-4">Featured Image Preview</h4>
                      <div className="max-w-2xl mx-auto">
                        <img 
                          src={formData.image} 
                          alt={formData.imageAlt || 'Featured image preview'}
                          className="w-full rounded-lg shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/logos/horizontal-logo.png';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Tip:</strong> Use high-quality images that relate to your content. 
                    The featured image appears in blog listings and social media shares.
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Search Engine Optimization</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="seo.title" className="text-label block mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        id="seo.title"
                        name="seo.title"
                        value={formData.seo.title}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder={formData.title || "Leave empty to use post title"}
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(formData.seo.title || formData.title).length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label htmlFor="seo.description" className="text-label block mb-2">
                        SEO Description
                      </label>
                      <textarea
                        id="seo.description"
                        name="seo.description"
                        value={formData.seo.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field"
                        placeholder={formData.excerpt || "Leave empty to use excerpt"}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(formData.seo.description || formData.excerpt).length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="text-label block mb-2">
                        SEO Keywords
                      </label>
                      {typeof window !== 'undefined' && (
                        <KeywordsInput
                          keywords={formData.seo.keywords}
                          onChange={handleKeywordsChange}
                          placeholder="Add SEO keywords..."
                        />
                      )}
                    </div>

                    <div>
                      <label htmlFor="seo.image" className="text-label block mb-2">
                        Social Media Image
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          id="seo.image"
                          name="seo.image"
                          value={formData.seo.image}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Leave empty to use featured image"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Recommended: 1200x630px for best results</p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showSEOPreview}
                              onChange={(e) => setShowSEOPreview(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {showSEOPreview && (formData.seo.image || formData.image) && (
                  <div className="mt-6">
                    <SocialMediaPreview
                      title={formData.seo.title || formData.title}
                      description={formData.seo.description || formData.excerpt}
                      imageUrl={formData.seo.image || formData.image}
                      url={`https://example.com/blog/${slug || generateSlug(formData.title)}`}
                      siteName="Your Site Name"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Organization & Author</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="text-label block mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-label block mb-2">
                        Tags
                      </label>
                      <TagInput
                        tags={formData.tags}
                        onChange={handleTagsChange}
                        placeholder="Add tags..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-h3 mb-4">Author Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="author.name" className="text-label block mb-2">
                        Author Name
                      </label>
                      <input
                        type="text"
                        id="author.name"
                        name="author.name"
                        value={formData.author.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="author.image" className="text-label block mb-2">
                        Author Image URL
                      </label>
                      <input
                        type="text"
                        id="author.image"
                        name="author.image"
                        value={formData.author.image}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="/images/author.jpg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="author.bio" className="text-label block mb-2">
                        Author Bio
                      </label>
                      <textarea
                        id="author.bio"
                        name="author.bio"
                        value={formData.author.bio}
                        onChange={handleInputChange}
                        rows={2}
                        className="input-field"
                        placeholder="Brief author biography..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Post Settings</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">Featured Post</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Display this post prominently on the homepage
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="draft"
                        checked={formData.draft}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <div>
                        <p className="font-medium">Save as Draft</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Post will not be published publicly
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="excludeFromSearch"
                        checked={formData.excludeFromSearch}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div>
                        <p className="font-medium">Exclude from Search</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Hide this post from search engines
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium mb-2">Publishing Notes</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Draft posts are only visible to administrators</li>
                    <li>• Featured posts appear at the top of blog listings</li>
                    <li>• Excluded posts won't appear in search engine results</li>
                    <li>• All changes are saved when you publish or save as draft</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : (mode === 'create' ? 'Publish Post' : 'Update Post')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Sidebar */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium mb-2">Quick Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Required fields are marked with an asterisk (*)</li>
            <li>• Your progress is shown at the top of the page</li>
            <li>• SEO settings help your post rank better in search results</li>
            <li>• Use tags to help readers find related content</li>
            <li>• Preview your social media cards before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}