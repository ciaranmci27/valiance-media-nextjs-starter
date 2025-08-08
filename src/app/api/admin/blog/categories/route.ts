import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(blogContentDir, 'categories');
    
    try {
      await fs.access(categoriesDir);
    } catch {
      return NextResponse.json({ categories: [] });
    }
    
    const items = await fs.readdir(categoriesDir);
    const categories: string[] = [];
    
    for (const item of items) {
      const itemPath = path.join(categoriesDir, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        categories.push(item);
      }
    }
    
    return NextResponse.json({ 
      categories: categories.sort() 
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    const categoriesDir = path.join(process.cwd(), 'public', 'blog-content', 'categories');
    const categoryPath = path.join(categoriesDir, data.slug);
    
    // Check if category already exists
    try {
      await fs.access(categoryPath);
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    } catch {
      // Category doesn't exist, proceed with creation
    }
    
    // Create category directory
    await fs.mkdir(categoryPath, { recursive: true });
    
    // Create config file
    const config = {
      name: data.name,
      description: data.description || '',
      seo: data.seo || {
        title: '',
        description: '',
        keywords: []
      },
      createdAt: new Date().toISOString()
    };
    
    const configPath = path.join(categoryPath, '.config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    return NextResponse.json({ 
      success: true,
      slug: data.slug 
    });
    
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}