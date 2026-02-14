import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';
import { encrypt, decrypt, isEncryptionConfigured } from '@/lib/email/crypto';
import type { EmailAccount, EmailAccountSafe } from '@/lib/email/types';

export const runtime = 'nodejs';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

async function loadSettings(): Promise<Record<string, unknown>> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function toSafe(account: EmailAccount): EmailAccountSafe {
  return {
    id: account.id,
    label: account.label,
    host: account.host,
    port: account.port,
    secure: account.secure,
    username: account.username,
    hasPassword: !!account.encryptedPassword,
    fromName: account.fromName,
    fromEmail: account.fromEmail,
    replyTo: account.replyTo,
    isDefault: account.isDefault,
    createdAt: account.createdAt,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: 'SMTP_ENCRYPTION_KEY is not configured' },
      { status: 400 }
    );
  }

  const { id } = await params;

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const settings = await loadSettings();
  const email = (settings.email as { accounts?: EmailAccount[] }) ?? { accounts: [] };
  const accounts: EmailAccount[] = email.accounts ?? [];

  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const existing = accounts[index];

  // Update fields — reject empty strings for required fields
  const requiredStrings = ['label', 'host', 'username', 'fromName', 'fromEmail'] as const;
  for (const field of requiredStrings) {
    if (typeof input[field] === 'string' && !(input[field] as string).trim()) {
      return NextResponse.json({ error: `${field} cannot be empty` }, { status: 400 });
    }
  }

  if (typeof input.label === 'string') existing.label = input.label;
  if (typeof input.host === 'string') existing.host = input.host;
  if (typeof input.port === 'number') existing.port = input.port;
  if (typeof input.secure === 'boolean') existing.secure = input.secure;
  if (typeof input.username === 'string') existing.username = input.username;
  if (typeof input.fromName === 'string') existing.fromName = input.fromName;
  if (typeof input.fromEmail === 'string') existing.fromEmail = input.fromEmail;
  if (typeof input.replyTo === 'string') existing.replyTo = input.replyTo || undefined;

  // Prevent duplicate accounts (same username + host, excluding self)
  const duplicate = accounts.find(
    (a) => a.id !== id && a.username.toLowerCase() === existing.username.toLowerCase() && a.host.toLowerCase() === existing.host.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json(
      { error: `An account with username "${existing.username}" on host "${existing.host}" already exists` },
      { status: 409 }
    );
  }

  // Re-encrypt password only if a new one is provided
  const passwordChanged = typeof input.password === 'string' && input.password.length > 0;
  if (passwordChanged) {
    existing.encryptedPassword = encrypt(input.password as string);
  }

  // Verify SMTP connection if any connection fields changed
  const connectionChanged = input.host !== undefined || input.port !== undefined
    || input.secure !== undefined || input.username !== undefined || passwordChanged;

  if (connectionChanged) {
    let password: string;
    try {
      password = passwordChanged ? (input.password as string) : decrypt(existing.encryptedPassword);
    } catch {
      return NextResponse.json(
        { error: 'Failed to decrypt existing password. Check your SMTP_ENCRYPTION_KEY.' },
        { status: 500 }
      );
    }

    const transport = nodemailer.createTransport({
      host: existing.host,
      port: existing.port,
      secure: existing.secure,
      auth: { user: existing.username, pass: password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    try {
      await transport.verify();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return NextResponse.json(
        { error: `SMTP connection failed: ${message}` },
        { status: 400 }
      );
    }
  }

  // Handle default flag
  if (input.isDefault === true) {
    for (const acc of accounts) {
      acc.isDefault = acc.id === id;
    }
  } else if (input.isDefault === false && existing.isDefault) {
    // Don't allow removing default if this is the only account
    // or if no other account is default — keep it as default
    const otherDefault = accounts.some((a) => a.id !== id && a.isDefault);
    if (!otherDefault) {
      existing.isDefault = true;
    } else {
      existing.isDefault = false;
    }
  }

  accounts[index] = existing;
  settings.email = { ...email, accounts };
  await saveSettings(settings);

  return NextResponse.json({ account: toSafe(existing) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;

  const settings = await loadSettings();
  const email = (settings.email as { accounts?: EmailAccount[] }) ?? { accounts: [] };
  let accounts: EmailAccount[] = email.accounts ?? [];

  const toDelete = accounts.find((a) => a.id === id);
  if (!toDelete) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  accounts = accounts.filter((a) => a.id !== id);

  // Reassign default if needed
  if (toDelete.isDefault && accounts.length > 0) {
    accounts[0].isDefault = true;
  }

  settings.email = { ...email, accounts };
  await saveSettings(settings);

  return NextResponse.json({ success: true });
}
