import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from './crypto';
import type { EmailAccount } from './types';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// ─── Shared ───────────────────────────────────────────────────────────────────

interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function loadEmailAccounts(): Promise<EmailAccount[]> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return settings.email?.accounts ?? [];
  } catch {
    return [];
  }
}

async function getAccountAndTransport(accountId?: string) {
  const accounts = await loadEmailAccounts();

  if (accounts.length === 0) {
    return { error: 'No email accounts configured' } as const;
  }

  const account = accountId
    ? accounts.find((a) => a.id === accountId)
    : accounts.find((a) => a.isDefault) ?? accounts[0];

  if (!account) {
    return { error: 'Email account not found' } as const;
  }

  let password: string;
  try {
    password = decrypt(account.encryptedPassword);
  } catch {
    return { error: 'Failed to decrypt email account password' } as const;
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

  return { account, transport } as const;
}

// ─── Transactional ────────────────────────────────────────────────────────────
// App → User: confirmations, receipts, password resets, notifications.
// Uses the account's configured From identity and Reply-To.
//
// Example:
//   await sendTransactional({
//     to: user.email,
//     subject: 'Your order has been confirmed',
//     html: orderConfirmationHtml,
//   });

interface TransactionalOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  accountId?: string;
}

export async function sendTransactional(options: TransactionalOptions): Promise<SendMailResult> {
  const result = await getAccountAndTransport(options.accountId);
  if ('error' in result) return { success: false, error: result.error };

  const { account, transport } = result;

  try {
    const info = await transport.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      replyTo: account.replyTo || undefined,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    return { success: false, error: message };
  }
}

// ─── Relay ────────────────────────────────────────────────────────────────────
// Form submitter → Your team: contact forms, support requests, inquiries.
// From name shows the submitter, From email stays as account's domain (for SPF/DKIM).
// Reply-To is set to the submitter so your team can reply directly.
//
// Example:
//   await sendRelay({
//     to: 'team@yourdomain.com',
//     subject: `New inquiry from ${formData.name}`,
//     html: contactFormHtml,
//     sender: { name: 'John Doe', email: 'john@gmail.com' },
//   });

interface RelayOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  sender: { name: string; email: string };
  accountId?: string;
}

export async function sendRelay(options: RelayOptions): Promise<SendMailResult> {
  const result = await getAccountAndTransport(options.accountId);
  if ('error' in result) return { success: false, error: result.error };

  const { account, transport } = result;

  // Sanitize sender input to prevent email header injection
  const safeName = options.sender.name.replace(/[\r\n"]/g, '').trim();
  const safeEmail = options.sender.email.replace(/[\r\n]/g, '').trim();

  try {
    const info = await transport.sendMail({
      from: `"${safeName}" <${account.fromEmail}>`,
      replyTo: safeEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    return { success: false, error: message };
  }
}
