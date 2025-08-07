import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function PUT(request: Request) {
  try {
    const { oldSlug, name, description } = await request.json();
    
    if (!oldSlug || !name) {
      return NextResponse.json(
        { message: 'Category slug and name are required' },
        { status: 400 }
      );
    }
    
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(contentDir, 'categories');
    const oldCategoryPath = path.join(categoriesDir, oldSlug);
    
    // Check if category exists
    try {
      await fs.access(oldCategoryPath);
    } catch {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Generate new slug from name
    const newSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Read existing config or create new one
    const configPath = path.join(oldCategoryPath, '.config.json');
    let config: any = {
      name,
      slug: newSlug,
      description: description || '',
      createdAt: new Date().toISOString(),
      seo: {
        title: `${name} Blog Posts | Your Site Name`,
        description: description || `Browse our latest ${name.toLowerCase()} blog posts and articles.`,
        keywords: [name.toLowerCase(), 'blog', 'articles']
      }
    };
    
    try {
      const existingConfig = await fs.readFile(configPath, 'utf-8');
      const existing = JSON.parse(existingConfig);
      config.createdAt = existing.createdAt || config.createdAt;
      config.seo.keywords = existing.seo?.keywords || config.seo.keywords;
    } catch {
      // Config doesn't exist yet, use defaults
    }
    
    config.updatedAt = new Date().toISOString();
    
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2)
    );
    
    // If slug has changed, rename the directory
    if (oldSlug !== newSlug) {
      const newCategoryPath = path.join(categoriesDir, newSlug);
      
      // Check if new slug already exists
      try {
        await fs.access(newCategoryPath);
        return NextResponse.json(
          { message: 'A category with this name already exists' },
          { status: 400 }
        );
      } catch {
        // New path doesn't exist, we can rename
      }
      
      // Rename the directory
      await fs.rename(oldCategoryPath, newCategoryPath);
      
      // Update all blog posts in this category to reflect the new category slug
      const files = await fs.readdir(newCategoryPath);
      for (const file of files) {
        if (file.endsWith('.json') && !file.startsWith('.')) {
          const filePath = path.join(newCategoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const postData = JSON.parse(content);
          postData.category = newSlug;
          await fs.writeFile(filePath, JSON.stringify(postData, null, 2));
        }
      }
    }
    
    return NextResponse.json({ 
      message: 'Category updated successfully',
      category: config 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 500 }
    );
  }
}