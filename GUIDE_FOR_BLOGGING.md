# Blog Content Guide

## Quick Start

### Creating a Blog Post

1. **Root-level post** (no category): Create a `.json` file in this directory
2. **Categorized post**: Create a `.json` file in `/categories/your-category/`

### Blog Post JSON Structure

```json
{
  "title": "Your Blog Post Title",
  "excerpt": "Brief description for previews and SEO",
  "content": "<p>Your HTML content here</p>",
  "author": {
    "name": "Author Name",
    "image": "/path/to/author-photo.jpg",
    "bio": "Author biography"
  },
  "publishedAt": "2024-01-15T10:00:00Z",
  "tags": ["tag1", "tag2"],
  "image": "/path/to/featured-image.jpg",
  "imageAlt": "Image description",
  "featured": false,
  "draft": false,
  "excludeFromSearch": false,
  "seo": {
    "title": "Custom SEO title",
    "description": "Custom SEO description",
    "keywords": ["keyword1", "keyword2"],
    "image": "/path/to/social-preview.jpg"
  }
}
```

### Required Fields
- `title` - Blog post title
- `excerpt` - Brief description
- `content` - Main HTML content
- `author.name` - Author's name
- `publishedAt` - ISO 8601 date format

### SEO & Search Engine Control
- `draft: true` - Excludes from public listings and sitemap
- `excludeFromSearch: true` - Excludes from search engines and sitemap
- Posts with filenames containing "example", "test", "demo", or "sample" are automatically excluded from sitemap

### Creating Categories

1. Create a folder in `/categories/`
2. Add a `seo-config.json` file:

```json
{
  "name": "Category Name",
  "description": "Category description",
  "seo": {
    "title": "Category - Your Site",
    "description": "SEO description for category page",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

3. Add blog post `.json` files to the category folder

## File Structure

```
blog-content/
├── README.md
├── my-root-post.json          # Root-level post → /blog/my-root-post
└── categories/
    ├── tutorials/
    │   ├── seo-config.json
    │   └── react-guide.json   # Categorized post → /blog/tutorials/react-guide
    └── guides/
        ├── seo-config.json
        └── campaign-guide.json  # Categorized post → /blog/guides/campaign-guide
```

## SEO Features

- **Auto-generated**: Open Graph, Twitter Cards, JSON-LD
- **Custom SEO**: Use `seo` object to override defaults
- **Social previews**: Set `seo.image` for custom social media images
- **Fallbacks**: System uses `title`/`excerpt`/`image` if SEO fields are empty
- **Sitemap inclusion**: Automatically included unless `draft: true`, `noIndex: true`, or filename contains excluded patterns

## Sitemap Control

The sitemap automatically includes:
- ✅ All published blog posts (not drafts)
- ✅ All category pages
- ✅ Main site pages

The sitemap automatically excludes:
- ❌ Posts with `draft: true`
- ❌ Posts with `excludeFromSearch: true`
- ❌ Posts with filenames containing: "example", "test", "demo", "sample"
- ❌ Pages listed in `seoConfig.sitemap.excludedPages`

## Tips

- Filename becomes URL slug (e.g., `my-post.json` → `/blog/my-post`)
- Use HTML in `content` field for rich formatting
- Set `draft: true` to hide posts during development
- Set `featured: true` to highlight important posts
- Set `excludeFromSearch: true` for example posts that shouldn't rank in search engines