import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';
import { encrypt, isEncryptionConfigured } from '@/lib/email/crypto';
import type { EmailAccount, EmailAccountInput, EmailAccountSafe } from '@/lib/email/types';

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

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const settings = await loadSettings();
  const accounts: EmailAccount[] = (settings.email as { accounts?: EmailAccount[] })?.accounts ?? [];

  return NextResponse.json({
    accounts: accounts.map(toSafe),
    encryptionConfigured: isEncryptionConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: 'SMTP_ENCRYPTION_KEY is not configured' },
      { status: 400 }
    );
  }

  let input: EmailAccountInput;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!input.label || !input.host || !input.port || !input.username || !input.password || !input.fromName || !input.fromEmail) {
    return NextResponse.json(
      { error: 'Missing required fields: label, host, port, username, password, fromName, fromEmail' },
      { status: 400 }
    );
  }

  const settings = await loadSettings();
  const email = (settings.email as { accounts?: EmailAccount[] }) ?? { accounts: [] };
  const accounts: EmailAccount[] = email.accounts ?? [];

  // Prevent duplicate accounts (same username + host)
  const duplicate = accounts.find(
    (a) => a.username.toLowerCase() === input.username.toLowerCase() && a.host.toLowerCase() === input.host.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json(
      { error: `An account with username "${input.username}" on host "${input.host}" already exists` },
      { status: 409 }
    );
  }

  const newAccount: EmailAccount = {
    id: crypto.randomUUID(),
    label: input.label,
    host: input.host,
    port: input.port,
    secure: input.secure ?? (input.port === 465),
    username: input.username,
    encryptedPassword: encrypt(input.password),
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    replyTo: input.replyTo || undefined,
    isDefault: accounts.length === 0 ? true : !!input.isDefault,
    createdAt: new Date().toISOString(),
  };

  // Verify SMTP connection before saving
  const transport = nodemailer.createTransport({
    host: newAccount.host,
    port: newAccount.port,
    secure: newAccount.secure,
    auth: { user: newAccount.username, pass: input.password },
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

  // If this is set as default, unset others
  if (newAccount.isDefault) {
    for (const acc of accounts) {
      acc.isDefault = false;
    }
  }

  accounts.push(newAccount);
  settings.email = { ...email, accounts };
  await saveSettings(settings);

  return NextResponse.json({ account: toSafe(newAccount) }, { status: 201 });
}
