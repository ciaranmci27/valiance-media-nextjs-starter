'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [countdown, setCountdown] = useState(5);
  const [redirectUrl, setRedirectUrl] = useState<string>('/');
  const [redirectTitle, setRedirectTitle] = useState<string>('Home');

  useEffect(() => {
    // Handle case where pathname might be null
    if (!pathname) return;
    
    const currentPath = pathname.toLowerCase();
    
    // Determine redirect URL based on current path
    if (currentPath.startsWith('/blog/')) {
      const pathParts = currentPath.split('/').filter(Boolean);
      
      if (pathParts.length >= 3) {
        // /blog/category/something -> redirect to /blog/category
        const category = pathParts[1];
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        setRedirectUrl(`/blog/${category}`);
        setRedirectTitle(`"${categoryName}" Blog Category`);
      } else {
        // /blog/something -> redirect to /blog
        setRedirectUrl('/blog');
        setRedirectTitle('Blog');
      }
    } else {
      setRedirectUrl('/');
      setRedirectTitle('Home');
    }
  }, [pathname]);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(redirectUrl);
    }
  }, [countdown, router, redirectUrl]);

  const isBlogUrl = pathname?.toLowerCase().startsWith('/blog/') || false;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 dark:text-gray-700">
            404
          </h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the page {pathname ? `"${pathname}"` : 'you were looking for'}.
          </p>

          {/* Auto-redirect notice */}
          {countdown > 0 && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Redirecting to {redirectTitle} in {countdown} seconds...
            </p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            
            {/* Only show blog button for blog URLs */}
            {isBlogUrl && (
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Visit Blog
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}