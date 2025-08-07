/**
 * SEO Configuration
 * 
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 */

export const seoConfig = {
  siteName: 'Your Company Name',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  company: {
    name: 'Your Company',
    legalName: 'Your Company LLC',
    email: 'info@example.com'
  },
  defaultTitle: 'Welcome to Your Company - Your Tagline Here',
  titleTemplate: '{pageName} | {siteName}',
  defaultDescription: 'Describe your company and what makes it unique. This description will appear in search results.',
  defaultKeywords: [
    'keyword1',
    'keyword2',
    'keyword3'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Your Company Name',
    defaultImage: '/images/og-image.jpg',
    imageWidth: 1200,
    imageHeight: 630
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: 'https://valiancemedia.com',
    languages: {
      'en-US': 'https://valiancemedia.com'
    }
  },
  sitemap: {
    excludedPages: [
    '/admin',
    '/dashboard',
    '/api',
    '/test',
    '/dev'
  ],
    excludedBlogPatterns: [
    'example',
    'test',
    'demo',
    'sample'
  ],
    changeFrequency: {
      homepage: 'weekly',
      pages: 'monthly',
      blog: 'weekly',
      categories: 'monthly'
    },
    priority: {
      homepage: 1,
      mainPages: 0.8,
      blog: 0.6,
      categories: 0.7
    }
  }
};

// Page-specific metadata templates
export const pageMetadata = {
  home: {
    title: 'Home',
    description: 'Welcome to our website',
    keywords: [],
  },
  about: {
    title: 'About Us',
    description: 'Learn more about our company',
    keywords: [],
  },
  services: {
    title: 'Our Services',
    description: 'Explore our range of services',
    keywords: [],
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with us',
    keywords: [],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Our privacy policy and data protection practices',
    keywords: [],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using our services',
    keywords: [],
  },
};

export default seoConfig;
