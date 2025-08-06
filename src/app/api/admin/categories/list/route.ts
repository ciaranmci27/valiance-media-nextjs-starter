import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(contentDir, 'categories');
    const categories: any[] = [];
    
    try {
      const categoryFolders = await fs.readdir(categoriesDir);
      
      for (const categorySlug of categoryFolders) {
        const categoryPath = path.join(categoriesDir, categorySlug);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          // Count posts in this category
          const files = await fs.readdir(categoryPath);
          const postCount = files.filter(file => 
            file.endsWith('.json') && !file.includes('seo-config')
          ).length;
          
          // Try to read category metadata if it exists
          let categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
          let description = '';
          
          try {
            const metaPath = path.join(categoryPath, 'category-meta.json');
            const metaContent = await fs.readFile(metaPath, 'utf-8');
            const metadata = JSON.parse(metaContent);
            categoryName = metadata.name || categoryName;
            description = metadata.description || '';
          } catch {
            // No metadata file, use defaults
          }
          
          categories.push({
            name: categoryName,
            slug: categorySlug,
            description,
            postCount
          });
        }
      }
    } catch (err) {
      console.log('Categories directory not found');
    }
    
    // Sort categories alphabetically
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] });
  }
}