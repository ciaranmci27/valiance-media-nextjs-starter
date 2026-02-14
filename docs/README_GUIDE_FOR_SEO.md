# SEO Configuration Guide

## Quick Start

This boilerplate includes a comprehensive SEO system that handles meta tags, Open Graph, Twitter Cards, JSON-LD structured data, sitemaps, and more. All SEO settings are centralized and easy to customize.

## 🚀 Initial Setup

### 1. Basic Configuration

Update `src/seo/seo.config.ts` with your business information:

```typescript
export const seoConfig = {
  siteName: 'Your Company Name',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  
  company: {
    name: 'Your Company LLC',
    legalName: 'Your Company LLC',
    foundingDate: '2024',
    email: 'hello@yourdomain.com',
    phone: '+1-555-0123',
    address: {
      streetAddress: '123 Your Street',
      addressLocality: 'Your City',
      addressRegion: 'ST',
      postalCode: '12345',
      addressCountry: 'US'
    }
  },
  
  defaultTitle: 'Your Company - Your Value Proposition',
  defaultDescription: 'Your compelling business description...',
  // ...
};
```

### 2. Environment Variables

Set your site URL in `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

For development:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Required Images

Create these images in `/public/images/`:

- **`og-image.jpg`** - 1200x630px - Default Open Graph image
- **`logo.png`** - Your company logo
- **`favicon.ico`** - Website favicon (also in `/public/favicon/`)

## 🎯 SEO Features

### Automatic Generation
- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ JSON-LD structured data
- ✅ Canonical URLs
- ✅ Robots meta tags
- ✅ XML sitemaps
- ✅ robots.txt

### Per-Page Customization
- ✅ Custom titles and descriptions
- ✅ Custom Open Graph images
- ✅ Custom keywords
- ✅ Search engine control (index/noindex)

## 📄 Page-Level SEO

### Method 1: Using generatePageMetadata Utility

For pages with seo-config.json files, use the utility function:

```tsx
import { generatePageMetadata } from '@/seo/page-seo-utils';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    pagePath: '/about', // Path to your page
    fallbackTitle: 'About Us',
    fallbackDescription: 'Learn about our company'
  });
}
```

### Method 2: Using SEO Component

For simple pages, use the `<SEO>` component:

```tsx
import { SEO } from '@/seo';

export default function AboutPage() {
  return (
    <>
      <SEO 
        pageData={{
          title: "About Us",
          description: "Learn about our company mission and team",
          keywords: ["about", "company", "mission"],
          image: "/images/about-hero.jpg"
        }}
        breadcrumbs={[
          { name: "Home", url: "https://yourdomain.com" },
          { name: "About", url: "https://yourdomain.com/about" }
        ]}
      />
      {/* Your page content */}
    </>
  );
}
```

### Method 2: Using generateMetadata (Recommended)

For full Next.js App Router integration:

```tsx
import { Metadata } from 'next';
import { seoConfig } from '@/seo/seo.config';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About Us',
    description: 'Learn about our company mission and team',
    keywords: ['about', 'company', 'mission'],
    openGraph: {
      title: 'About Us - Your Company',
      description: 'Learn about our company mission and team',
      images: ['/images/about-hero.jpg'],
      url: `${seoConfig.siteUrl}/about`,
    },
    twitter: {
      title: 'About Us - Your Company',
      description: 'Learn about our company mission and team',
      images: ['/images/about-hero.jpg'],
    },
  };
}
```

### Method 3: Using seo-config.json

Create `seo-config.json` in any page directory:

```json
{
  "seo": {
    "title": "Custom Page Title",
    "description": "Custom page description",
    "keywords": ["keyword1", "keyword2"],
    "image": "/images/custom-image.jpg",
    "noIndex": false
  },
  "sitemap": {
    "exclude": false,
    "priority": 0.8,
    "changeFrequency": "monthly"
  },
  "metadata": {
    "lastModified": "2024-01-15T10:00:00Z"
  }
}
```

## 📱 Social Media Configuration

### Open Graph (Facebook, LinkedIn)

```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  siteName: 'Your Company',
  defaultImage: '/images/og-image.jpg',
  imageWidth: 1200,
  imageHeight: 630,
}
```

### X (Twitter) Cards

```typescript
twitter: {
  handle: '@yourhandle',
  site: '@yourhandle',
  cardType: 'summary_large_image',
}
```

### Social Media Links

```typescript
social: {
  twitter: 'https://twitter.com/yourhandle',
  linkedin: 'https://linkedin.com/company/yourcompany',
  github: 'https://github.com/yourcompany',
  instagram: 'https://instagram.com/yourcompany',
  facebook: 'https://facebook.com/yourcompany',
  youtube: 'https://youtube.com/@yourcompany',
}
```

## 🕷️ Search Engine Configuration

### Search Console Verification

Add verification codes to your SEO config:

```typescript
verification: {
  google: 'your-google-verification-code',
  bing: 'your-bing-verification-code',
  yandex: 'your-yandex-verification-code',
  pinterest: 'your-pinterest-verification-code',
}
```

### Robots Configuration

Control how search engines crawl your site:

```typescript
robots: {
  index: true,           // Allow indexing
  follow: true,          // Follow links
  nocache: false,        // Allow caching
  googleBot: {
    index: true,
    follow: true,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

## 🗺️ Sitemap Management

### Automatic Generation

The system automatically generates these sitemaps:

- **`/sitemap`** - Main sitemap index
- **`/sitemap/pages`** - Static pages
- **`/sitemap/blog-posts`** - Blog posts
- **`/sitemap/blog-categories`** - Blog categories

### Sitemap Configuration

```typescript
sitemap: {
  // Pages to exclude from sitemap
  excludedPages: [
    '/admin',
    '/dashboard',
    '/api',
    '/test',
    '/dev',
  ],
  
  // Blog posts with these patterns will be excluded
  excludedBlogPatterns: [
    'example',
    'test', 
    'demo',
    'sample',
  ],
  
  // How often content changes
  changeFrequency: {
    homepage: 'weekly',
    pages: 'monthly', 
    blog: 'weekly',
    categories: 'monthly',
  },
  
  // Content priorities (0.0 to 1.0)
  priority: {
    homepage: 1.0,
    mainPages: 0.8,
    blog: 0.6,
    categories: 0.7,
  },
}
```

### Excluding Pages from Sitemap

**Method 1: Global exclusion**
Add to `seoConfig.sitemap.excludedPages`

**Method 2: Page-level exclusion**
Use `seo-config.json`:
```json
{
  "sitemap": {
    "exclude": true
  }
}
```

**Method 3: Blog post exclusion**
```json
{
  "draft": true,
  "excludeFromSearch": true
}
```

## 📊 Analytics Integration

### Google Analytics 4

```typescript
analytics: {
  googleAnalyticsId: 'G-XXXXXXXXXX',
  facebookPixelId: '',
  hotjarId: '',
  clarityId: '',
}
```

Then implement in your layout:

```tsx
import Script from 'next/script';
import { seoConfig } from '@/seo/seo.config';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {seoConfig.analytics.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seoConfig.analytics.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seoConfig.analytics.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🌍 International SEO

### Multiple Languages

```typescript
alternates: {
  canonical: 'https://yourdomain.com',
  languages: {
    'en-US': 'https://yourdomain.com',
    'es-ES': 'https://es.yourdomain.com',
    'fr-FR': 'https://fr.yourdomain.com',
  },
}
```

### Canonical URLs

Automatically generated for all pages. Override with:

```tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: {
      canonical: 'https://yourdomain.com/custom-canonical'
    }
  };
}
```

## 🧪 Testing Your SEO

### Development Tools

1. **[Rich Results Test](https://search.google.com/test/rich-results)** - Test structured data
2. **[Open Graph Debugger](https://developers.facebook.com/tools/debug/)** - Test Facebook sharing
3. **[Twitter Card Validator](https://cards-dev.twitter.com/validator)** - Test Twitter cards
4. **[SEO Extension](https://chrome.google.com/webstore/detail/seo-meta-in-1-click/bjogjfinolnhfhkbipphpdlldadpnmhc)** - Browser extension

### Check Your Sitemaps

- Visit `/sitemap` to see your sitemap index
- Visit `/robots.txt` to verify robots configuration
- Use Google Search Console to submit your sitemap

## 🔧 Advanced Configuration

### Custom Structured Data

Create custom JSON-LD in your pages:

```tsx
import { StructuredData } from '@/seo';

const customStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your Product",
  "description": "Product description",
  // ...
};

export default function ProductPage() {
  return (
    <>
      <StructuredData data={customStructuredData} />
      {/* Your content */}
    </>
  );
}
```

### Dynamic Meta Tags

```tsx
'use client';

import { useEffect } from 'react';

export default function DynamicSEO({ title, description }) {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
```

## 📋 SEO Checklist

### Initial Setup
- [ ] Update `seo.config.ts` with your business info
- [ ] Set `NEXT_PUBLIC_SITE_URL` environment variable
- [ ] Create required images (og-image.jpg, logo, favicon)
- [ ] Configure social media handles
- [ ] Add Google Search Console verification

### For Each Page
- [ ] Set custom title and description
- [ ] Add relevant keywords
- [ ] Create custom Open Graph image (1200x630px)
- [ ] Set appropriate robots directive
- [ ] Configure sitemap inclusion/exclusion

### Testing
- [ ] Test meta tags with browser inspector
- [ ] Validate Open Graph with Facebook debugger
- [ ] Test Twitter cards
- [ ] Verify structured data with Google tools
- [ ] Check sitemaps are accessible
- [ ] Submit sitemap to Google Search Console

## 🆘 Troubleshooting

### Common Issues

**Q: My sitemap isn't updating**
A: Check that your content isn't excluded by `draft: true`, `excludeFromSearch: true`, or excluded patterns.

**Q: Social media previews aren't working**
A: Ensure your Open Graph image is exactly 1200x630px and accessible at the specified URL.

**Q: Search engines aren't indexing my pages**
A: Check robots.txt, ensure `noindex` isn't set, and verify your sitemap is submitted to Search Console.

**Q: Meta tags aren't showing**
A: Make sure you're using `generateMetadata` for server-side rendering or the SEO component for client-side.

### Debug Mode

Add this to see what SEO data is being generated:

```tsx
console.log('SEO Config:', {
  title: metadata.title,
  description: metadata.description,
  openGraph: metadata.openGraph,
});
```

---

## 📚 Additional Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)