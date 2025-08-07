import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearGitHubCache } from '@/lib/blog-utils-github';

export async function POST(request: NextRequest) {
  try {
    const { secret, path, tag } = await request.json();

    // Verify the revalidation secret to secure the endpoint
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (path) {
      // Clear GitHub cache and revalidate specific path(s)
      clearGitHubCache();
      if (Array.isArray(path)) {
        path.forEach(p => revalidatePath(p));
      } else {
        revalidatePath(path);
      }
      
      return NextResponse.json({ 
        revalidated: true, 
        paths: Array.isArray(path) ? path : [path],
        now: Date.now() 
      });
    }

    if (tag) {
      // Revalidate by cache tag
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        now: Date.now() 
      });
    }

    // Default: revalidate blog pages and clear cache
    clearGitHubCache();
    revalidatePath('/blog');
    revalidatePath('/blog/[category]', 'page');
    revalidatePath('/blog/[category]/[slug]', 'page');
    
    return NextResponse.json({ 
      revalidated: true, 
      message: 'Blog pages revalidated',
      now: Date.now() 
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}