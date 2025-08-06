import { NextResponse } from 'next/server';
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