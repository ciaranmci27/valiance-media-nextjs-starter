import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/admin/require-auth';

export const runtime = 'nodejs';

export async function POST() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const key = crypto.randomBytes(32).toString('hex');

  return NextResponse.json({ key });
}
