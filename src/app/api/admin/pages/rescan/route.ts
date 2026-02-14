import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/pages/page-utils-server';
import { requireAuth } from '@/lib/admin/require-auth';

export async function POST() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    // In development, getAllPages always does a fresh filesystem scan
    // In production, this would typically trigger a rebuild
    const pages = await getAllPages();
    
    return NextResponse.json({ 
      success: true, 
      pages,
      message: `Found ${pages.length} pages` 
    });
  } catch (error) {
    console.error('Error rescanning pages:', error);
    return NextResponse.json(
      { error: 'Failed to rescan pages' },
      { status: 500 }
    );
  }
}