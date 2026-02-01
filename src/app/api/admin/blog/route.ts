import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Blog post API using local file system storage.
 * Changes are saved to public/blog-content/ and can be committed via your IDE/git client.
 */

// Validate slug to prevent path traversal attacks
const VALID_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length > 200) return false; // Reasonable max length
  return VALID_SLUG_REGEX.test(slug);
}

function isValidCategory(category: string): boolean {
  if (!category) return true; // Category is optional
  if (typeof category !== 'string') return false;
  if (category.length > 100) return false;
  return VALID_SLUG_REGEX.test(category);
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');

    const { slug, category, ...postData } = data;

    // Validate slug and category to prevent path traversal
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    let targetDir = blogContentDir;

    if (category) {
      targetDir = path.join(blogContentDir, 'categories', category);
      try {
        await fs.access(targetDir);
      } catch {
        await fs.mkdir(targetDir, { recursive: true });
      }
    }

    const filePath = path.join(targetDir, `${slug}.json`);
    const fileContent = {
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      author: postData.author,
      publishedAt: postData.publishedAt,
      tags: postData.tags,
      image: postData.image,
      imageAlt: postData.imageAlt,
      readingTime: postData.readingTime || Math.ceil((postData.content || '').split(/\s+/).length / 200),
      featured: postData.featured,
      draft: postData.draft,
      excludeFromSearch: postData.excludeFromSearch,
      seo: postData.seo
    };

    await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      slug,
      category,
      message: 'Blog post created. Commit via your IDE to save changes.'
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update existing blog post
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');

    // Handle renaming/moving if needed
    if (data.originalSlug && (data.originalSlug !== data.slug || data.originalCategory !== data.category)) {
      let oldPath: string;
      if (data.originalCategory) {
        oldPath = path.join(blogContentDir, 'categories', data.originalCategory, `${data.originalSlug}.json`);
      } else {
        oldPath = path.join(blogContentDir, `${data.originalSlug}.json`);
      }

      try {
        await fs.unlink(oldPath);
      } catch {
        // Old file might not exist, continue
      }
    }

    const { slug, category, originalSlug, originalCategory, ...postData } = data;

    // Validate slug and category to prevent path traversal
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }
    if (originalSlug && !isValidSlug(originalSlug)) {
      return NextResponse.json(
        { error: 'Invalid original slug format.' },
        { status: 400 }
      );
    }
    if (originalCategory && !isValidCategory(originalCategory)) {
      return NextResponse.json(
        { error: 'Invalid original category format.' },
        { status: 400 }
      );
    }

    let targetDir = blogContentDir;

    if (category) {
      targetDir = path.join(blogContentDir, 'categories', category);
      try {
        await fs.access(targetDir);
      } catch {
        await fs.mkdir(targetDir, { recursive: true });
      }
    }

    const filePath = path.join(targetDir, `${slug}.json`);
    const fileContent = {
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      author: postData.author,
      publishedAt: postData.publishedAt,
      tags: postData.tags,
      image: postData.image,
      imageAlt: postData.imageAlt,
      readingTime: postData.readingTime || Math.ceil((postData.content || '').split(/\s+/).length / 200),
      featured: postData.featured,
      draft: postData.draft,
      excludeFromSearch: postData.excludeFromSearch,
      seo: postData.seo
    };

    await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      slug,
      category,
      message: 'Blog post updated. Commit via your IDE to save changes.'
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');

    const { slug, category } = data;

    // Validate slug and category to prevent path traversal
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format.' },
        { status: 400 }
      );
    }
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category format.' },
        { status: 400 }
      );
    }

    let filePath: string;

    if (category) {
      filePath = path.join(blogContentDir, 'categories', category, `${slug}.json`);
    } else {
      filePath = path.join(blogContentDir, `${slug}.json`);
    }

    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted. Commit via your IDE to save changes.'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

// GET - Fetch blog post(s)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug and category to prevent path traversal
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format.' },
        { status: 400 }
      );
    }
    if (category && !isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category format.' },
        { status: 400 }
      );
    }

    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
    let filePath: string;

    if (category) {
      filePath = path.join(blogContentDir, 'categories', category, `${slug}.json`);
    } else {
      filePath = path.join(blogContentDir, `${slug}.json`);
    }

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const postData = JSON.parse(fileContent);

      return NextResponse.json({
        ...postData,
        slug,
        category
      });
    } catch {
      // Try searching in categories
      const categoriesDir = path.join(blogContentDir, 'categories');
      try {
        const categories = await fs.readdir(categoriesDir);

        for (const cat of categories) {
          const categoryPath = path.join(categoriesDir, cat);
          const stat = await fs.stat(categoryPath);

          if (stat.isDirectory()) {
            const postPath = path.join(categoryPath, `${slug}.json`);

            try {
              const fileContent = await fs.readFile(postPath, 'utf-8');
              const postData = JSON.parse(fileContent);

              return NextResponse.json({
                ...postData,
                slug,
                category: cat
              });
            } catch {
              continue;
            }
          }
        }
      } catch {
        // Categories directory doesn't exist
      }

      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
