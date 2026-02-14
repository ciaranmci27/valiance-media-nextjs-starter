import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin/require-auth';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;
  const isProduction = process.env.NODE_ENV === 'production';
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isProduction,
    canEditPages: !isProduction
  });
}