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
          // Count posts in this category (exclude config files)
          const files = await fs.readdir(categoryPath);
          const postCount = files.filter(file => 
            file.endsWith('.json') && !file.startsWith('.')
          ).length;
          
          // Try to read category config if it exists
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