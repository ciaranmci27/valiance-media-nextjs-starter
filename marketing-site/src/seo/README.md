# SEO Directory

This directory contains all SEO-related functionality for the application, organized in one central location.

## 📁 File Structure

```
seo/
├── seo.config.ts      # SEO configuration and defaults
├── seo-utils.ts      # SEO utility functions
├── SEO.tsx           # React SEO component
├── StructuredData.tsx # JSON-LD structured data component
├── sitemap.ts        # Sitemap generation
├── robots.ts         # Robots.txt configuration
└── index.ts          # Central exports
```

## 🎯 Why This Organization?

**Before:** SEO files were scattered across multiple directories:
- `config/seo.config.ts`
- `lib/seo.ts`
- `components/SEO.tsx`
- `components/StructuredData.tsx`
- `app/sitemap.ts`
- `app/robots.ts`

**Now:** Everything SEO-related is in one logical place:
- ✅ All SEO code in `seo/`
- ✅ Easy to find and maintain
- ✅ Clear separation of concerns
- ✅ Single source of truth for SEO

## 📝 What Each File Does

### `seo.config.ts`
- Default SEO settings
- Site-wide metadata
- Social media configuration
- Open Graph defaults
- Twitter Card settings

### `seo-utils.ts`
- `generateMetadata()` - Creates Next.js metadata
- `generateCanonicalUrl()` - Creates canonical URLs
- Schema generators for structured data
- Multi-language support utilities

### `SEO.tsx`
- Client-side SEO component
- Dynamic meta tag updates
- Structured data injection
- Page-specific SEO overrides

### `StructuredData.tsx`
- Renders JSON-LD scripts
- Handles multiple schema types
- Client-safe structured data

### `sitemap.ts`
- Auto-generates XML sitemap
- Includes all public routes
- Configurable priorities and frequencies

### `robots.ts`
- Configures robots.txt
- Sets crawling rules
- Manages sitemap reference

## 💡 Usage Examples

### Import everything from index:
```typescript
import { 
  generateMetadata, 
  SEO, 
  seoConfig 
} from '@/seo';
```

### Page metadata (App Router):
```typescript
import { generateMetadata } from '@/seo';

export const metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn more about our company'
});
```

### Client-side SEO:
```typescript
import { SEO } from '@/seo';

export default function Page() {
  return (
    <>
      <SEO 
        title="Product Page"
        description="Amazing product"
        includeProduct={true}
      />
      {/* Page content */}
    </>
  );
}
```

## 🔧 Configuration

Edit `seo.config.ts` to update:
- Company information
- Default meta tags
- Social media handles
- Open Graph images
- Site URL
- Language settings

## ⚠️ Important Notes

1. **App Directory Files**: `sitemap.ts` and `robots.ts` are re-exported from the `app/` directory because Next.js requires them there.

2. **Client vs Server**: 
   - Use `generateMetadata()` for server-side (App Router)
   - Use `<SEO />` component for client-side updates

3. **Structured Data**: Always validate your JSON-LD with Google's Rich Results Test

4. **Images**: Store Open Graph images in `public/images/` and reference them in `seo.config.ts`

## 🚀 Best Practices

1. **Always set unique titles and descriptions** for each page
2. **Use structured data** for better search results
3. **Include Open Graph tags** for social sharing
4. **Set canonical URLs** to avoid duplicate content
5. **Keep meta descriptions** between 150-160 characters
6. **Use descriptive, keyword-rich titles** (50-60 characters)

## 🔄 Adding New SEO Features

When adding new SEO functionality:
1. Place it in this directory
2. Export from `index.ts`
3. Update this README
4. Add TypeScript types
5. Include usage examples