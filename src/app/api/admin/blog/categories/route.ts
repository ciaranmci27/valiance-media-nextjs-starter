import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(contentDir, 'categories');
    const categories: { name: string; slug: string; description: string; postCount: number }[] = [];

    try {
      const categoryFolders = await fs.readdir(categoriesDir);

      for (const categorySlug of categoryFolders) {
        const categoryPath = path.join(categoriesDir, categorySlug);
        const stat = await fs.stat(categoryPath);

        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          const postCount = files.filter(file =>
            file.endsWith('.json') && !file.startsWith('.')
          ).length;

          let categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
          let description = '';

          try {
            const configPath = path.join(categoryPath, '.config.json');
            const configContent = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configContent);
            categoryName = config.name || categoryName;
            description = config.description || '';
          } catch {
            // No config file, use defaults
          }

          categories.push({
            name: categoryName,
            slug: categorySlug,
            description,
            postCount
          });
        }
      }
    } catch {
      // Categories directory not found
    }

    categories.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

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