import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';
import { decrypt, isEncryptionConfigured } from '@/lib/email/crypto';
import type { EmailAccount } from '@/lib/email/types';

export const runtime = 'nodejs';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  let body: { accountId: string; recipientEmail: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.accountId || !body.recipientEmail) {
    return NextResponse.json(
      { error: 'accountId and recipientEmail are required' },
      { status: 400 }
    );
  }

  let accounts: EmailAccount[];
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    accounts = settings.email?.accounts ?? [];
  } catch {
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }

  const account = accounts.find((a) => a.id === body.accountId);
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  let password: string;
  try {
    password = decrypt(account.encryptedPassword);
  } catch {
    return NextResponse.json(
      { error: 'Failed to decrypt account password. Check your SMTP_ENCRYPTION_KEY.' },
      { status: 500 }
    );
  }

  const transport = nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.username,
      pass: password,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  // Verify connection first
  try {
    await transport.verify();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return NextResponse.json(
      { error: `SMTP connection failed: ${message}` },
      { status: 400 }
    );
  }

  // Send test email
  try {
    const safeLabel = escapeHtml(account.label);
    const safeHost = escapeHtml(account.host);
    const safeFromEmail = escapeHtml(account.fromEmail);
    const sentAt = new Date().toISOString();

    const info = await transport.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      replyTo: account.replyTo || undefined,
      to: body.recipientEmail,
      subject: 'Test Email: SMTP Configuration',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="margin: 0 0 16px 0; color: #111;">SMTP Test Successful</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
            This is a test email from your admin panel. If you&rsquo;re reading this, your SMTP account
            <strong>&ldquo;${safeLabel}&rdquo;</strong> is configured correctly.
          </p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; font-size: 13px; color: #666;">
            <p style="margin: 0 0 4px 0;"><strong>Host:</strong> ${safeHost}:${account.port}</p>
            <p style="margin: 0 0 4px 0;"><strong>From:</strong> ${safeFromEmail}</p>
            <p style="margin: 0;"><strong>Sent at:</strong> ${sentAt}</p>
          </div>
        </div>
      `,
      text: `SMTP Test Successful\n\nThis is a test email from your admin panel. Your SMTP account "${account.label}" is configured correctly.\n\nHost: ${account.host}:${account.port}\nFrom: ${account.fromEmail}\nSent at: ${sentAt}`,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send test email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
