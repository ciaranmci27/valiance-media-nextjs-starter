import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { name, slug, description } = await request.json();
    
    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Category name and slug are required' },
        { status: 400 }
      );
    }
    
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(contentDir, 'categories');
    const categoryPath = path.join(categoriesDir, slug);
    
    // Check if category already exists
    try {
      await fs.access(categoryPath);
      return NextResponse.json(
        { message: 'Category already exists' },
        { status: 400 }
      );
    } catch {
      // Directory doesn't exist, we can create it
    }
    
    // Create the category directory
    await fs.mkdir(categoryPath, { recursive: true });
    
    // Create unified config file
    const config = {
      name,
      slug,
      description: description || '',
      createdAt: new Date().toISOString(),
      seo: {
        title: `${name} Blog Posts | Your Site Name`,
        description: description || `Browse our latest ${name.toLowerCase()} blog posts and articles.`,
        keywords: [name.toLowerCase(), 'blog', 'articles']
      }
    };
    
    await fs.writeFile(
      path.join(categoryPath, '.config.json'),
      JSON.stringify(config, null, 2)
    );
    
    return NextResponse.json({ 
      message: 'Category created successfully',
      category: config 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    );
  }
}