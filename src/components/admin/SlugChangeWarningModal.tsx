'use client';

import { useState } from 'react';

interface SlugChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (createRedirect: boolean) => void;
  oldSlug: string;
  newSlug: string;
  category?: string;
  isCircularRedirect?: boolean;
}

export default function SlugChangeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  oldSlug,
  newSlug,
  category,
  isCircularRedirect = false
}: SlugChangeWarningModalProps) {
  const [isCreatingRedirect, setIsCreatingRedirect] = useState(false);

  if (!isOpen) return null;

  const handleCreateRedirect = async () => {
    setIsCreatingRedirect(true);
    onConfirm(true);
  };

  const handleNoRedirect = () => {
    onConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {isCircularRedirect ? 'Circular Redirect Detected' : 'URL Change Warning'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {isCircularRedirect 
                  ? 'An existing redirect will be removed'
                  : category ? 'This action will change your category\'s URL' : 'This action will change your post\'s URL'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {isCircularRedirect 
              ? `You're changing the slug back to its original value. Since a redirect already exists from the new URL to the old URL, clicking "Remove Circular Redirect" will delete that existing redirect instead of creating a new one. This keeps your redirects clean and organized.`
              : category 
                ? `You're about to change the slug, which will modify the URL of this category and all its posts. This can impact SEO and break existing links.`
                : `You're about to change the slug, which will modify the URL of this published blog post. This can impact SEO and break existing links.`}
          </p>
          
          {/* URL Comparison */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current URL</p>
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                  {category ? `/blog/${category}/${oldSlug}` : `/blog/${oldSlug}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New URL</p>
                <p className="text-sm font-mono text-green-600 dark:text-green-400 break-all">
                  {category ? `/blog/${category}/${newSlug}` : `/blog/${newSlug}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* SEO Impact Notice or Circular Redirect Notice */}
          <div className={`border rounded-lg p-4 ${
            isCircularRedirect 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-primary-50 dark:bg-primary-50 border-primary-200 dark:border-gray-700'
          }`}>
            <div className="flex gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isCircularRedirect 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-primary-600 dark:text-primary-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={isCircularRedirect 
                  ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  : "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                } clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isCircularRedirect 
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-primary-900 dark:text-primary-100'
                }`}>
                  {isCircularRedirect ? 'Smart Redirect Management' : 'SEO Impact'}
                </p>
                <p className={`text-xs leading-relaxed ${
                  isCircularRedirect 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-primary-800 dark:text-primary-100'
                }`}>
                  {isCircularRedirect 
                    ? 'A redirect from the new URL to the old URL already exists. Removing it will restore the original URL without creating circular redirects, keeping your redirect configuration clean.'
                    : category
                      ? 'Changing category URLs can affect search rankings and break bookmarks. A 308 permanent redirect will preserve most SEO value and automatically redirect visitors and posts to the new URL.'
                      : 'Changing URLs can affect search rankings and break bookmarks. A 308 permanent redirect will preserve most SEO value and automatically send visitors to the new URL.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={handleNoRedirect}
            disabled={isCreatingRedirect}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isCircularRedirect ? 'Keep Existing Redirect' : 'Skip Redirect'}
          </button>
          
          <button
            type="button"
            onClick={handleCreateRedirect}
            disabled={isCreatingRedirect}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingRedirect ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isCircularRedirect ? 'Removing Redirect...' : 'Creating Redirect...'}
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isCircularRedirect ? 'Remove Circular Redirect' : 'Create Redirect'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}