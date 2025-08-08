import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const categoriesDir = path.join(process.cwd(), 'public', 'blog-content', 'categories');
    const categoryPath = path.join(categoriesDir, slug);
    const configPath = path.join(categoryPath, '.config.json');

    // Check if category has published posts
    let hasPublishedPosts = false;
    try {
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (file.endsWith('.json') && !file.startsWith('.')) {
          const postPath = path.join(categoryPath, file);
          const postContent = await fs.readFile(postPath, 'utf-8');
          const post = JSON.parse(postContent);
          if (!post.draft && post.publishedAt) {
            hasPublishedPosts = true;
            break;
          }
        }
      }
    } catch {
      // Directory doesn't exist yet
    }

    // Default category data
    let categoryData = {
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      description: '',
      seo: {
        title: '',
        description: '',
        keywords: []
      },
      hasPublishedPosts
    };

    try {
      // Try to read existing config
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      categoryData = {
        ...categoryData,
        ...config,
        slug, // Ensure slug is always present
        hasPublishedPosts
      };
    } catch {
      // Config doesn't exist, use defaults
    }

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: currentSlug } = await params;
    const data = await request.json();
    const { originalSlug, slug: newSlug, ...categoryData } = data;
    
    const categoriesDir = path.join(process.cwd(), 'public', 'blog-content', 'categories');
    const oldCategoryPath = path.join(categoriesDir, originalSlug || currentSlug);
    const newCategoryPath = path.join(categoriesDir, newSlug || currentSlug);
    const targetSlug = newSlug || currentSlug;

    // If slug is changing, handle the rename
    if (originalSlug && newSlug && originalSlug !== newSlug) {
      try {
        // Check if old directory exists
        await fs.access(oldCategoryPath);
        
        // Check if new slug already exists
        try {
          await fs.access(newCategoryPath);
          return NextResponse.json(
            { error: 'A category with this slug already exists' },
            { status: 400 }
          );
        } catch {
          // New path doesn't exist, good to proceed
        }

        // Move all posts to new category directory
        const files = await fs.readdir(oldCategoryPath);
        
        // Create new directory
        await fs.mkdir(newCategoryPath, { recursive: true });
        
        // Move all files
        for (const file of files) {
          const oldFilePath = path.join(oldCategoryPath, file);
          const newFilePath = path.join(newCategoryPath, file);
          await fs.rename(oldFilePath, newFilePath);
        }
        
        // Remove old directory
        await fs.rmdir(oldCategoryPath);
        
        // Also create redirects for all posts that were moved
        const postFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('.'));
        for (const postFile of postFiles) {
          const postSlug = postFile.replace('.json', '');
          // The blog post redirects will be handled separately if needed
        }
      } catch (error) {
        console.error('Error renaming category:', error);
        // Continue to save config even if rename fails
      }
    } else {
      // Ensure category directory exists
      await fs.mkdir(newCategoryPath, { recursive: true });
    }

    // Save config to the target directory
    const configPath = path.join(newCategoryPath, '.config.json');
    const config = {
      name: categoryData.name,
      description: categoryData.description || '',
      seo: categoryData.seo || {
        title: '',
        description: '',
        keywords: []
      },
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return NextResponse.json({ 
      success: true,
      newSlug: targetSlug
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const categoriesDir = path.join(process.cwd(), 'public', 'blog-content', 'categories');
    const categoryPath = path.join(categoriesDir, slug);

    // Check if category exists
    try {
      await fs.access(categoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has posts
    const files = await fs.readdir(categoryPath);
    const postFiles = files.filter(file => 
      file.endsWith('.json') && !file.startsWith('.')
    );

    if (postFiles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with posts' },
        { status: 400 }
      );
    }

    // Delete category directory
    await fs.rmdir(categoryPath, { recursive: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}