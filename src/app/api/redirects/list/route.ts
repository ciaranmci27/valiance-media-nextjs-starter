import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Public API endpoint to fetch redirects
 * This is used by middleware to load redirects at runtime
 * without causing circular dependencies
 */
export async function GET() {
  try {
    const redirectsPath = path.join(process.cwd(), 'public', 'redirects.json');
    const data = await fs.readFile(redirectsPath, 'utf-8');
    const redirects = JSON.parse(data);

    return NextResponse.json(redirects, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error reading redirects:', error);
    return NextResponse.json({ redirects: [] }, { status: 200 });
  }
}
