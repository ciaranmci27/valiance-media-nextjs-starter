'use client';

import { useState } from 'react';
import { seoConfig } from '@/seo/seo.config';

interface SocialMediaPreviewProps {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  className?: string;
}

export default function SocialMediaPreview({
  title,
  description,
  imageUrl,
  url,
  siteName = '',
  twitterCard = 'summary_large_image',
  className = ''
}: SocialMediaPreviewProps) {
  const [activePreview, setActivePreview] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const domain = url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : 'example.com';

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  const previewTabs = [
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'twitter', label: 'X (Twitter)', icon: '🐦' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {previewTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePreview(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activePreview === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Facebook Preview */}
      {activePreview === 'facebook' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is how your content will appear when shared on Facebook
          </p>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-w-[500px] bg-white dark:bg-gray-800">
            {imageUrl && (
              <div className="relative aspect-[1.91/1] bg-gray-100 dark:bg-gray-700">
                {imageLoading && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading image...</p>
                    </div>
                  </div>
                )}
                {!imageError ? (
                  <img
                    src={imageUrl}
                    alt={`${seoConfig.siteName} Open Graph preview image`}
                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl">🖼️</span>
                      <p className="mt-2 text-sm">Image preview unavailable</p>
                      <p className="text-xs mt-1">{imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {domain}
              </p>
              <h3 className="font-semibold text-base mt-1 text-gray-900 dark:text-gray-100">
                {truncateText(title, 60) || 'Page Title'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {truncateText(description, 120) || 'Page description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Twitter Preview */}
      {activePreview === 'twitter' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is how your content will appear when shared on X (Twitter)
          </p>
          {twitterCard === 'summary_large_image' ? (
            <div className="border border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden max-w-[500px] bg-white dark:bg-gray-800">
              {imageUrl && (
                <div className="relative aspect-[2/1] bg-gray-100 dark:bg-gray-700">
                  {imageLoading && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading image...</p>
                      </div>
                    </div>
                  )}
                  {!imageError ? (
                    <img
                      src={imageUrl}
                      alt={`${seoConfig.siteName} Twitter card preview image`}
                      className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <span className="text-4xl">🖼️</span>
                        <p className="mt-2 text-sm">Image preview unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="p-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  {truncateText(title, 70) || 'Page Title'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {truncateText(description, 125) || 'Page description will appear here...'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                  <span className="mr-1">🔗</span> {domain}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden max-w-[500px] bg-white dark:bg-gray-800">
              <div className="flex p-3">
                {imageUrl && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {!imageError ? (
                      <img
                        src={imageUrl}
                        alt={`${seoConfig.siteName} Twitter card preview image`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <span className="text-2xl">🖼️</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="ml-3 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {truncateText(title, 50) || 'Page Title'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {truncateText(description, 100) || 'Description...'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {domain}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LinkedIn Preview */}
      {activePreview === 'linkedin' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is how your content will appear when shared on LinkedIn
          </p>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-w-[500px] bg-white dark:bg-gray-800">
            {imageUrl && (
              <div className="relative aspect-[1.91/1] bg-gray-100 dark:bg-gray-700">
                {imageLoading && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading image...</p>
                    </div>
                  </div>
                )}
                {!imageError ? (
                  <img
                    src={imageUrl}
                    alt={`${seoConfig.siteName} LinkedIn preview image`}
                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl">🖼️</span>
                      <p className="mt-2 text-sm">Image preview unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                {truncateText(title, 70) || 'Page Title'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {domain} • {siteName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Guidelines */}
      <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Image Guidelines</h4>
        <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
          <li>• <strong>Facebook & LinkedIn:</strong> 1200×630px (1.91:1 ratio) for best results</li>
          <li>• <strong>Twitter:</strong> 1200×600px (2:1 ratio) for large image cards</li>
          <li>• <strong>File size:</strong> Keep under 5MB for faster loading</li>
          <li>• <strong>Format:</strong> JPG, PNG, or WebP recommended</li>
          <li>• <strong>Text on image:</strong> Keep important text in the center 80% to avoid cropping</li>
        </ul>
      </div>
    </div>
  );
}