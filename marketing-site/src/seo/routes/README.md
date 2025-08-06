# SEO Routes

This directory contains centralized route handlers for all SEO-related functionality, keeping the main `app` directory clean and organized.

## Structure

```
src/seo/routes/
└── sitemap-handlers.ts    # All sitemap route logic centralized here
```

## Benefits

### 1. **Ultra-Clean App Directory**
The `app` directory now contains just a single dynamic route file that handles all sitemaps:

```typescript
// app/[...sitemap]/route.ts
import { handleSitemapIndex, handlePagesSitemap, /* ... */ } from '@/seo/routes/sitemap-handlers';

export async function GET(request: Request, { params }: { params: Promise<{ sitemap: string[] }> }) {
  const resolvedParams = await params;
  const sitemapPath = resolvedParams.sitemap.join('/');

  switch (sitemapPath) {
    case 'sitemap.xml': return handleSitemapIndex(request);
    case 'sitemap-pages.xml': return handlePagesSitemap(request);
    // ... other cases
    default: return new Response('Sitemap not found', { status: 404 });
  }
}
```

**Result**: From 4+ route directories down to 1 single file!

### 2. **Centralized Logic**
All sitemap generation logic is in one file (`sitemap-handlers.ts`), making it easier to:
- Maintain and update
- Debug issues
- Add new sitemap types
- Ensure consistency

### 3. **Better Organization**
SEO-related code is grouped together:
- Configuration: `seo.config.ts`
- Components: `SEO.tsx`, `StructuredData.tsx`
- Sitemap Logic: `sitemap-*.ts`
- Route Handlers: `routes/sitemap-handlers.ts`
- Utilities: `sitemap-utils.ts`, `seo-utils.ts`

### 4. **Reusable Handlers**
The handlers can be used in different contexts:
- API routes
- Static generation
- Testing
- External integrations

## Current Handlers

### `handleSitemapIndex(request: Request)`
- Main sitemap index (`/sitemap.xml`)
- Dynamically includes sub-sitemaps based on content availability
- Returns XML sitemap index format

### `handlePagesSitemap(request: Request)`
- Static pages sitemap (`/sitemap-pages.xml`)
- Uses page-level `seo-config.json` files
- Supports exclusions and custom priorities

### `handleBlogPostsSitemap(request: Request)`
- Blog posts sitemap (`/sitemap-blog-posts.xml`)
- Filters out drafts and example content
- Returns 404 if no real posts exist

### `handleBlogCategoriesSitemap(request: Request)`
- Blog categories sitemap (`/sitemap-blog-categories.xml`)
- Only includes categories with real content
- Returns 404 if no real categories exist

## Adding New Sitemap Types

To add a new sitemap (e.g., products):

1. **Create the sitemap function** in `src/seo/sitemap-products.ts`
2. **Add handler** to `sitemap-handlers.ts`:
   ```typescript
   export async function handleProductsSitemap(request: Request): Promise<Response> {
     const baseUrl = getBaseUrl(request);
     const sitemap = sitemapProducts(baseUrl);
     
     if (sitemap.length === 0) {
       return new Response('Not Found: No products available for sitemap', {
         status: 404,
         headers: { 'Content-Type': 'text/plain' },
       });
     }
     
     const xml = generateSitemapXML(sitemap);
     return new Response(xml, {
       headers: { 'Content-Type': 'application/xml' },
     });
   }
   ```
3. **Create route** in `app/sitemap-products.xml/route.ts`:
   ```typescript
   import { handleProductsSitemap } from '@/seo/routes/sitemap-handlers';
   
   export async function GET(request: Request) {
     return handleProductsSitemap(request);
   }
   ```
4. **Update sitemap index** to include the new sitemap when content exists

## Helper Functions

The handlers use shared helper functions for consistency:

- `getBaseUrl(request)` - Determines the correct base URL for development/production
- `generateSitemapXML(entries)` - Creates standard sitemap XML format
- `generateSitemapIndexXML(sitemaps)` - Creates sitemap index XML format

This approach ensures all sitemaps have consistent formatting and behavior.