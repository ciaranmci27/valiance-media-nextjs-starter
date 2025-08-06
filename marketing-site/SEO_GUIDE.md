# SEO Guide for Valiance Media NextJS Boilerplate

This guide explains how to leverage the built-in SEO features of this boilerplate to maximize your website's search engine visibility.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Page-Level SEO](#page-level-seo)
4. [Structured Data](#structured-data)
5. [Technical SEO](#technical-seo)
6. [Best Practices](#best-practices)
7. [Testing & Validation](#testing--validation)

## Quick Start

### 1. Update SEO Configuration
First, customize your SEO settings in `src/config/seo.config.ts`:

```typescript
export const seoConfig = {
  siteName: 'Your Company Name',
  siteUrl: 'https://yoursite.com',
  defaultTitle: 'Your Default Title',
  defaultDescription: 'Your default description',
  // ... update other fields
};
```

### 2. Set Up Environment Variables
Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### 3. Add Your Logo and OG Image
- Place your logo in `/public/logos/square-logo.png`
- Create an Open Graph image (1200x630px) at `/public/images/og-image.jpg`

## Configuration

### Main Configuration File
The `src/config/seo.config.ts` file contains all default SEO settings:

- **Basic Information**: Site name, URL, company details
- **Default Metadata**: Title template, description, keywords
- **Social Media**: Twitter/X handle, social links
- **Verification Codes**: Google Search Console, Bing, etc.
- **Analytics IDs**: GA4, Facebook Pixel, etc.

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_SITE_URL`: Your production URL

Optional analytics variables:
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- `NEXT_PUBLIC_FB_PIXEL_ID`: Facebook Pixel ID

## Page-Level SEO

### Static Pages (Server Components)
For static pages, use the `generateMetadata` function:

```typescript
import { Metadata } from 'next';
import { generateMetadata, generateCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn about our company',
  keywords: ['about', 'company', 'team'],
  alternates: {
    canonical: generateCanonicalUrl('/about'),
  },
});

export default function AboutPage() {
  return (
    // Your page content
  );
}
```

### Client Components
For client components, use the SEO component:

```typescript
'use client';

import { SEO } from '@/components/SEO';

export default function ClientPage() {
  return (
    <>
      <SEO 
        pageData={{
          title: "Page Title",
          description: "Page description",
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Current Page", url: "/current" }
        ]}
      />
      {/* Your page content */}
    </>
  );
}
```

### Dynamic Pages
For dynamic content (blog posts, products):

```typescript
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.featuredImage],
      type: 'article',
    },
  });
}
```

## Structured Data

### Organization Schema
Add to your homepage:

```typescript
<SEO 
  includeOrganization
  includeWebsite
/>
```

### Product Schema
For e-commerce product pages:

```typescript
<SEO 
  product={{
    name: "Product Name",
    description: "Product description",
    image: "/images/product.jpg",
    price: 99.99,
    currency: "USD",
    availability: "https://schema.org/InStock",
    rating: 4.5,
    reviewCount: 42
  }}
/>
```

### FAQ Schema
For FAQ sections:

```typescript
<SEO 
  faqs={[
    {
      question: "What is your return policy?",
      answer: "We offer 30-day returns..."
    },
    // More FAQs
  ]}
/>
```

### Breadcrumbs
Improve navigation understanding:

```typescript
<SEO 
  breadcrumbs={[
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Current Product", url: "/products/current" }
  ]}
/>
```

### Custom Structured Data
For custom schemas:

```typescript
<SEO 
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Your Event",
    // ... other properties
  }}
/>
```

## Technical SEO

### Sitemap
The sitemap is automatically generated at `/sitemap.xml`. To add pages:

1. Edit `src/app/sitemap.ts`
2. Add static routes to the `staticRoutes` array
3. For dynamic routes, fetch and map your data

### Robots.txt
Configure crawling rules in `src/app/robots.ts`:

```typescript
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
```

### Canonical URLs
Always set canonical URLs to avoid duplicate content:

```typescript
export const metadata: Metadata = generateMetadata({
  alternates: {
    canonical: generateCanonicalUrl('/page-path'),
  },
});
```

### Language Alternates
For multi-language sites:

```typescript
export const metadata: Metadata = generateMetadata({
  alternates: {
    languages: {
      'en-US': 'https://example.com',
      'es-ES': 'https://es.example.com',
    },
  },
});
```

## Best Practices

### 1. Title Tags
- Keep under 60 characters
- Include primary keyword
- Make unique for each page
- Use the title template for consistency

### 2. Meta Descriptions
- Keep between 150-160 characters
- Include call-to-action
- Make compelling and unique
- Include target keywords naturally

### 3. Keywords
- Research relevant keywords
- Include 5-10 per page
- Mix short and long-tail keywords
- Update based on performance

### 4. Images
- Always include alt text
- Optimize file sizes
- Use descriptive filenames
- Implement lazy loading

### 5. Content Structure
- Use one H1 per page
- Maintain heading hierarchy (H1 → H2 → H3)
- Use semantic HTML elements
- Keep paragraphs concise

### 6. Performance
- Optimize Core Web Vitals
- Minimize JavaScript bundles
- Use Next.js Image component
- Enable caching strategies

### 7. Mobile Optimization
- Ensure responsive design
- Test on real devices
- Optimize touch targets
- Check mobile page speed

## Testing & Validation

### Tools for Testing

1. **Google Search Console**
   - Submit sitemap
   - Monitor indexing
   - Check for errors
   - Review search performance

2. **Schema Markup Validator**
   - Test at: https://validator.schema.org/
   - Validate structured data
   - Fix any errors

3. **Google Rich Results Test**
   - Test at: https://search.google.com/test/rich-results
   - Preview how pages appear
   - Identify opportunities

4. **PageSpeed Insights**
   - Test at: https://pagespeed.web.dev/
   - Monitor Core Web Vitals
   - Get optimization suggestions

5. **SEO Browser Extensions**
   - SEO Meta in 1 Click
   - Lighthouse
   - Wappalyzer

### Checklist Before Launch

- [ ] Update all configuration in `seo.config.ts`
- [ ] Set production URL in environment variables
- [ ] Create and upload favicon assets
- [ ] Create and upload OG image (1200x630px)
- [ ] Add verification codes (Google, Bing)
- [ ] Set up Google Analytics
- [ ] Test all pages have unique titles/descriptions
- [ ] Validate structured data
- [ ] Submit sitemap to Google Search Console
- [ ] Test robots.txt rules
- [ ] Check all canonical URLs
- [ ] Verify mobile responsiveness
- [ ] Test page loading speed
- [ ] Set up 301 redirects if needed
- [ ] Configure error pages (404, 500)

## Common Issues & Solutions

### Issue: Pages not indexing
**Solution**: Check robots.txt, ensure pages aren't blocked, submit sitemap

### Issue: Duplicate content warnings
**Solution**: Set canonical URLs, use consistent URLs (with/without trailing slash)

### Issue: Poor mobile usability
**Solution**: Test with mobile devices, fix viewport issues, increase touch target sizes

### Issue: Slow page speed
**Solution**: Optimize images, reduce JavaScript, use Next.js optimizations

### Issue: Structured data errors
**Solution**: Validate with Schema.org validator, ensure required fields are present

## Advanced Features

### Dynamic OG Images
Generate dynamic Open Graph images:

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  return new ImageResponse(
    (
      <div style={{ /* your styles */ }}>
        {/* Your dynamic content */}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

### A/B Testing Titles
Test different titles for better CTR:

```typescript
const titles = [
  "Best Products for 2024",
  "Top Rated Products This Year"
];

export const metadata: Metadata = generateMetadata({
  title: titles[Math.floor(Math.random() * titles.length)],
});
```

### Monitoring & Analytics
Track SEO performance:

```typescript
// Add to your pages
useEffect(() => {
  // Track page views
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }
}, []);
```

## Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)
- [Core Web Vitals](https://web.dev/vitals/)

## Support

For questions about this boilerplate's SEO features, please refer to:
- The example implementations in the codebase
- The inline documentation in the SEO utilities
- Valiance Media's development guidelines

Remember: Good SEO is an ongoing process. Regularly monitor your performance, update content, and stay informed about search engine algorithm changes.