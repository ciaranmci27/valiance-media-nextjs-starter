# Sitemap Structure

This project uses a professional sitemap index structure for optimal search engine optimization.

The sitemap system is centrally managed in the `src/seo/` directory to keep the app directory clean and organized.

## Sitemap URLs

### Human-Readable Sitemap
- **`/sitemap`** - Human-readable sitemap page with clickable links to all sitemaps

### Main Sitemap Index (for search engines)
- **`/sitemap.xml`** - Main XML sitemap index that references all other sitemaps

### Individual Sitemaps
- **`/sitemap-pages.xml`** - Static pages (homepage, privacy, terms, etc.)
- **`/sitemap-blog-posts.xml`** - Individual blog posts
- **`/sitemap-blog-categories.xml`** - Blog categories and blog index page

## Why This Structure?

### SEO Benefits
1. **Better Organization** - Search engines can prioritize different content types
2. **Faster Crawling** - Search engines can crawl specific content types independently
3. **Performance** - Smaller, focused sitemaps load faster
4. **Industry Standard** - Follows SEO best practices
5. **Scalability** - Easy to add new content types (products, services, etc.)

### Technical Benefits
1. **Modular Structure** - Each sitemap can be updated independently
2. **Better Caching** - Individual sitemaps can have different cache strategies
3. **Easier Debugging** - Specific content type issues are isolated
4. **Future-Proof** - Easy to extend for new content types

## Sitemap Content

### Pages Sitemap (`/sitemap-pages.xml`)
Contains all static pages:
- Homepage (priority: 1.0, weekly updates)
- Privacy Policy (priority: 0.8, monthly updates)
- Terms of Service (priority: 0.8, monthly updates)
- Future pages: About, Services, Contact, etc.

**Exclusions**: Pages listed in `seoConfig.sitemap.excludedPages`

### Blog Posts Sitemap (`/sitemap-blog-posts.xml`)
Contains all published blog posts:
- Individual blog posts (priority: 0.6, weekly updates)
- Proper URLs for both categorized and root-level posts
- Uses actual publication dates as `lastModified`

**Intelligent Behavior**:
- Only appears in sitemap index if real user content exists
- Returns empty if only example/demo content is found
- Automatically excludes example posts from search engines

**Exclusions**:
- Posts with `draft: true`
- Posts with `excludeFromSearch: true`
- Posts with filenames containing excluded patterns (example, test, demo, sample)

### Blog Categories Sitemap (`/sitemap-blog-categories.xml`)
Contains blog navigation pages:
- Main blog index `/blog` (priority: 0.7, monthly updates)
- Category pages `/blog/category-name` (priority: 0.7, monthly updates)

**Intelligent Behavior**:
- Only appears in sitemap index if categories with real content exist
- Categories with only example posts are excluded
- Returns empty if no real blog content is found

## Configuration

All sitemap settings are controlled via `seoConfig.sitemap` in `/src/seo/seo.config.ts`:

```typescript
sitemap: {
  excludedPages: ['/admin', '/dashboard', '/api'],
  excludedBlogPatterns: ['example', 'test', 'demo'],
  changeFrequency: {
    homepage: 'weekly',
    pages: 'monthly',
    blog: 'weekly',
    categories: 'monthly',
  },
  priority: {
    homepage: 1.0,
    mainPages: 0.8,
    blog: 0.6,
    categories: 0.7,
  },
}
```

## File Organization

### SEO Directory Structure
```
src/seo/
├── routes/
│   ├── sitemap-handlers.ts    # Centralized sitemap logic
│   └── README.md             # Routes documentation
├── sitemap-pages.ts          # Pages sitemap generation
├── sitemap-blog-posts.ts     # Blog posts sitemap generation
├── sitemap-blog-categories.ts # Categories sitemap generation
├── sitemap-utils.ts          # Shared utilities
└── seo.config.ts            # SEO configuration
```

### App Directory (Ultra Clean)
```
src/app/
└── [...sitemap]/route.ts    # Single dynamic route handles all sitemaps
```

The dynamic route handler automatically routes:
- `/sitemap.xml` → sitemap index
- `/sitemap-pages.xml` → pages sitemap  
- `/sitemap-blog-posts.xml` → blog posts sitemap
- `/sitemap-blog-categories.xml` → categories sitemap

## Adding New Content Types

To add a new content type (e.g., products):

1. **Create the sitemap function**: `/src/seo/sitemap-products.ts`
2. **Add handler**: Add to `/src/seo/routes/sitemap-handlers.ts`
3. **Update the dynamic route**: Add case to `/src/app/[...sitemap]/route.ts`
4. **Update the sitemap index**: Add logic to `handleSitemapIndex`

Example:
```typescript
// 1. sitemap-products.ts
export function sitemapProducts(): MetadataRoute.Sitemap {
  // Implementation
}

// 2. Add to sitemap-handlers.ts
export async function handleProductsSitemap(request: Request): Promise<Response> {
  const baseUrl = getBaseUrl(request);
  const sitemap = sitemapProducts(baseUrl);
  if (sitemap.length === 0) {
    return new Response('Not Found: No products available', { status: 404 });
  }
  return new Response(generateSitemapXML(sitemap), {
    headers: { 'Content-Type': 'application/xml' },
  });
}

// 3. Add case to [...sitemap]/route.ts
case 'sitemap-products.xml':
  return handleProductsSitemap(request);
```

**No need to create new route files!** The dynamic handler automatically routes all `sitemap-*.xml` requests.

## Testing

### Verify Sitemaps
- Visit `/sitemap.xml` to see the index
- Visit individual sitemaps to verify content
- Use Google Search Console to submit sitemaps

### Validation
- Use online XML validators
- Check that all URLs are accessible
- Verify proper XML formatting
- Ensure no duplicate URLs across sitemaps

## Search Engine Submission

Submit the main sitemap index to search engines:
- **Google Search Console**: Submit `/sitemap.xml`
- **Bing Webmaster Tools**: Submit `/sitemap.xml`
- **robots.txt**: Include `Sitemap: https://yourdomain.com/sitemap.xml`

The search engines will automatically discover and crawl the individual sitemaps referenced in the index.

## User-Friendly Sitemap

For human visitors who want to explore your site structure:
- **Human-Readable Sitemap**: Visit `/sitemap` for a nice visual interface
- **Direct XML Access**: Visit `/sitemap.xml` for the machine-readable version

The human-readable sitemap page provides:
- Visual overview of all available sitemaps
- Clickable links to individual XML sitemaps
- Descriptions of what each sitemap contains
- Easy access for SEO auditing and debugging