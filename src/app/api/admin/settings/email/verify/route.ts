import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';
import { decrypt, isEncryptionConfigured } from '@/lib/email/crypto';
import type { EmailAccount } from '@/lib/email/types';

export const runtime = 'nodejs';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: 'SMTP_ENCRYPTION_KEY is not configured' },
      { status: 400 }
    );
  }

  let body: { accountId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  let accounts: EmailAccount[];
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    accounts = settings.email?.accounts ?? [];
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }

  const account = accounts.find((a) => a.id === body.accountId);
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  let password: string;
  try {
    password = decrypt(account.encryptedPassword);
  } catch {
    return NextResponse.json({
      online: false,
      reason: 'decrypt_failed',
      error: 'Failed to decrypt password — check your SMTP_ENCRYPTION_KEY',
    });
  }

  const transport = nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: { user: account.username, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  try {
    await transport.verify();
    return NextResponse.json({ online: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return NextResponse.json({ online: false, reason: 'connection_failed', error: message });
  }
}
