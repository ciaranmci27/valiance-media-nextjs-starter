'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import { Select } from '@/components/admin/ui/Select';
import { Switch } from '@/components/admin/ui/Switch';
import { Tooltip } from '@/components/admin/ui/Tooltip';

interface EmailAccountSafe {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isDefault: boolean;
  createdAt: string;
}

interface FormData {
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isDefault: boolean;
}

const emptyForm: FormData = {
  label: '',
  host: '',
  port: 465,
  secure: true,
  username: '',
  password: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  isDefault: false,
};

function FieldLabel({ label, tooltip, required, optional }: { label: string; tooltip: string; required?: boolean; optional?: boolean }) {
  return (
    <Tooltip content={tooltip} position="top" delay={300}>
      <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-primary)', cursor: 'help' }}>
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>*</span>}
        {optional && <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400, marginLeft: '4px' }}>(optional)</span>}
      </label>
    </Tooltip>
  );
}

type AccountStatusType = 'checking' | 'online' | 'offline' | 'key_error';

function getStatusStyle(status: AccountStatusType) {
  switch (status) {
    case 'online': return { color: 'var(--color-success)', label: 'Online', glow: true, animation: 'pulse 3s ease-in-out infinite' };
    case 'offline': return { color: 'var(--color-error)', label: 'Offline', glow: false, animation: undefined };
    case 'key_error': return { color: 'var(--color-warning)', label: 'Key Error', glow: false, animation: undefined };
    default: return { color: 'var(--color-text-disabled)', label: 'Checking...', glow: false, animation: 'pulse 1.5s ease-in-out infinite' };
  }
}

function StatusDot({ status }: { status: AccountStatusType }) {
  const s = getStatusStyle(status);
  return (
    <span className="flex items-center gap-1.5">
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          flexShrink: 0,
          background: s.color,
          boxShadow: s.glow ? `0 0 6px color-mix(in srgb, ${s.color} 50%, transparent)` : undefined,
          animation: s.animation,
        }}
      />
      <span style={{ color: s.color }}>{s.label}</span>
    </span>
  );
}

interface EmailSettingsProps {
  encryptionConfigured: boolean;
}

export default function EmailSettings({ encryptionConfigured }: EmailSettingsProps) {
  const [accounts, setAccounts] = useState<EmailAccountSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Onboarding state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Test state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  // Connection status per account
  const [accountStatus, setAccountStatus] = useState<Record<string, AccountStatusType>>({});

  // Key recovery state: null | 'lost' | 'generate'
  const [keyRecoveryPath, setKeyRecoveryPath] = useState<'lost' | 'generate' | null>(null);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [recoveryCopied, setRecoveryCopied] = useState(false);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const verifyAccounts = useCallback((accs: EmailAccountSafe[]) => {
    if (accs.length === 0) return;

    // Set all to checking
    const initial: Record<string, 'checking'> = {};
    for (const acc of accs) initial[acc.id] = 'checking';
    setAccountStatus(initial);

    // Fire verify calls in parallel
    for (const acc of accs) {
      fetch('/api/admin/settings/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: acc.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          const status = data.online ? 'online' : data.reason === 'decrypt_failed' ? 'key_error' : 'offline';
          setAccountStatus((prev) => ({ ...prev, [acc.id]: status }));
        })
        .catch(() => {
          setAccountStatus((prev) => ({ ...prev, [acc.id]: 'offline' }));
        });
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings/email');
      if (res.ok) {
        const data = await res.json();
        const accs = data.accounts ?? [];
        setAccounts(accs);
        verifyAccounts(accs);
      }
    } catch {
      console.error('Failed to fetch email accounts');
    } finally {
      setLoading(false);
    }
  }, [verifyAccounts]);

  useEffect(() => {
    if (encryptionConfigured) {
      fetchAccounts();
    } else {
      setLoading(false);
    }
  }, [encryptionConfigured, fetchAccounts]);

  // ─── Onboarding ─────────────────────────────────────────────────────────────

  if (!encryptionConfigured) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="hidden md:block animate-fade-up">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            Email
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Configure SMTP email accounts
          </p>
        </div>

        <AdminBanner variant="warning">
          <p className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0" style={{ marginTop: '1px' }} />
            <span>
              An encryption key is required to securely store SMTP passwords. Generate a key below and add it to your environment.
            </span>
          </p>
        </AdminBanner>

        <div className="dash-card animate-fade-up" style={{ animationDelay: '80ms' } as React.CSSProperties}>
          <div className="dash-card-header">
            <h2 className="dash-card-title">Setup Encryption Key</h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* Step 1 */}
            <div className="flex gap-3">
              <StepNumber n={1} />
              <div className="flex-1">
                <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Generate an encryption key
                </p>
                <AdminButton
                  onClick={async () => {
                    setGeneratingKey(true);
                    try {
                      const res = await fetch('/api/admin/settings/email/generate-key', { method: 'POST' });
                      if (res.ok) {
                        const data = await res.json();
                        setGeneratedKey(data.key);
                      }
                    } catch {
                      showMessage('error', 'Failed to generate key');
                    } finally {
                      setGeneratingKey(false);
                    }
                  }}
                  disabled={generatingKey || !!generatedKey}
                  variant="secondary"
                >
                  {generatingKey ? 'Generating...' : generatedKey ? 'Key Generated' : 'Generate Key'}
                </AdminButton>
              </div>
            </div>

            {/* Step 2 — copy and add to env */}
            {generatedKey && (
              <div className="flex gap-3 animate-fade-up">
                <StepNumber n={2} />
                <div className="flex-1">
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Add to your environment
                  </p>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderRadius: 'var(--radius-md, 8px)',
                      padding: '10px 12px',
                      border: '1px solid var(--color-border-light)',
                    }}
                  >
                    <code
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        flex: 1,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      SMTP_ENCRYPTION_KEY={generatedKey}
                    </code>
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(`SMTP_ENCRYPTION_KEY=${generatedKey}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          showMessage('error', 'Failed to copy — clipboard requires HTTPS');
                        }
                      }}
                      title="Copy to clipboard"
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      )}
                    </AdminButton>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    Copy this line into your environment variables file, then restart your dev server and refresh this page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="hidden md:block">
          <div className="skeleton" style={{ width: '80px', height: '36px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '260px', height: '18px' }} />
        </div>
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl, 16px)' }} />
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────────

  if (accounts.length === 0 && !showForm) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="hidden md:block animate-fade-up">
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            Email
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Configure SMTP email accounts
          </p>
        </div>

        <div className="dash-empty-state animate-fade-up" style={{ animationDelay: '80ms' } as React.CSSProperties}>
          <EnvelopeIcon className="w-10 h-10" style={{ color: 'var(--color-text-disabled)' }} />
          <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, margin: '12px 0 4px' }}>
            No email accounts configured
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 16px' }}>
            Add an SMTP account to start sending transactional emails
          </p>
          <AdminButton onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <span className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add Email Account
            </span>
          </AdminButton>
        </div>

        {message && (
          <AdminBanner variant={message.type === 'success' ? 'success' : 'error'}>
            <p>{message.text}</p>
          </AdminBanner>
        )}
      </div>
    );
  }

  // ─── Account list + form ────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);

    const isEdit = !!editingId;
    const url = isEdit
      ? `/api/admin/settings/email/${editingId}`
      : '/api/admin/settings/email';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showMessage('success', isEdit ? 'Account updated' : 'Account created');
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        await fetchAccounts();
      } else {
        const data = await res.json().catch(() => ({}));
        showMessage('error', data.error || 'Failed to save account');
      }
    } catch {
      showMessage('error', 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this email account?')) return;

    try {
      const res = await fetch(`/api/admin/settings/email/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Account deleted');
        await fetchAccounts();
      } else {
        showMessage('error', 'Failed to delete account');
      }
    } catch {
      showMessage('error', 'Failed to delete account');
    }
  };

  const handleTest = async (accountId: string) => {
    if (!testEmail) return;
    setTestSending(true);

    try {
      const res = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, recipientEmail: testEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMessage('success', `Test email sent! Message ID: ${data.messageId}`);
        setTestingId(null);
        setTestEmail('');
      } else {
        showMessage('error', data.error || 'Failed to send test email');
      }
    } catch {
      showMessage('error', 'Failed to send test email');
    } finally {
      setTestSending(false);
    }
  };

  const startEdit = (account: EmailAccountSafe) => {
    setForm({
      label: account.label,
      host: account.host,
      port: account.port,
      secure: account.secure,
      username: account.username,
      password: '',
      fromName: account.fromName,
      fromEmail: account.fromEmail,
      replyTo: account.replyTo ?? '',
      isDefault: account.isDefault,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
            Email
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            {editingId
              ? <>Editing <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{accounts.find((a) => a.id === editingId)?.fromEmail ?? 'account'}</span> account</>
              : showForm
                ? 'Adding new account'
                : `${accounts.length} account${accounts.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
        {!showForm && (
          <AdminButton onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <span className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add Account
            </span>
          </AdminButton>
        )}
      </div>

      {/* Mobile add button */}
      {!showForm && (
        <div className="md:hidden">
          <AdminButton onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <span className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add Account
            </span>
          </AdminButton>
        </div>
      )}

      {/* Toast message */}
      {message && (
        <AdminBanner variant={message.type === 'success' ? 'success' : 'error'}>
          <p>{message.text}</p>
        </AdminBanner>
      )}

      {/* Encryption key recovery */}
      {Object.values(accountStatus).some((s) => s === 'key_error') && (
        <div
          className="animate-fade-up"
          style={{
            animationDelay: '60ms',
            background: 'color-mix(in srgb, var(--color-warning) 6%, var(--color-surface))',
            border: '1px solid color-mix(in srgb, var(--color-warning) 20%, var(--color-border-light))',
            borderRadius: 'var(--radius-xl, 16px)',
            padding: 'var(--spacing-md, 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md, 16px)',
          } as React.CSSProperties}
        >
          {/* Banner header */}
          <div className="flex items-start gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <KeyIcon className="w-4.5 h-4.5" style={{ color: 'var(--color-warning)', width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-label" style={{ color: 'var(--color-text-primary)', margin: 0 }}>Encryption Key Issue</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: '2px 0 0' }}>
                Unable to decrypt account passwords &mdash; your <code className="px-1 rounded text-xs" style={{ background: 'color-mix(in srgb, var(--color-warning) 10%, var(--color-surface-elevated))' }}>SMTP_ENCRYPTION_KEY</code> may have changed or is missing
              </p>
            </div>
          </div>

          {/* Path selector */}
          {!keyRecoveryPath && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setKeyRecoveryPath('lost')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-medium)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-light)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MagnifyingGlassIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
                    Recover Existing Key
                  </p>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '4px 0 0' }}>
                    Find and restore your original encryption key from environment variables
                  </p>
                </div>
              </button>

              <button
                onClick={() => setKeyRecoveryPath('generate')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-medium)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-light)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <SparklesIcon className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                </div>
                <div>
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
                    Generate New Key
                  </p>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '4px 0 0' }}>
                    Start fresh with a new key &mdash; existing accounts will need to be re-added
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Recover existing key flow */}
          {keyRecoveryPath === 'lost' && (
            <div className="flex flex-col gap-5 animate-fade-up">
              <div className="flex gap-3">
                <StepNumber n={1} />
                <div className="flex-1">
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    Locate your original key
                  </p>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                    Check your <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>.env.local</code> file,
                    hosting provider environment variables, or deployment settings for your original{' '}
                    <code className="px-1 rounded text-xs" style={{ background: 'var(--color-surface-elevated)' }}>SMTP_ENCRYPTION_KEY</code>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <StepNumber n={2} />
                <div className="flex-1">
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    Restore the key to your environment
                  </p>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                    Add the key back to your environment variables, then restart your server and refresh this page
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-md)' }}>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', margin: '0 0 12px' }}>
                  Can&apos;t find your original key? Use <strong>Generate New Key</strong> instead &mdash; you&apos;ll need to delete affected accounts and re-add them.
                </p>
                <div className="flex gap-2">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setKeyRecoveryPath(null)}
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowLeftIcon className="w-3.5 h-3.5" />
                      Back
                    </span>
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setKeyRecoveryPath('generate')}
                  >
                    Generate New Key Instead
                  </AdminButton>
                </div>
              </div>
            </div>
          )}

          {/* Generate new key flow */}
          {keyRecoveryPath === 'generate' && (
            <div className="flex flex-col gap-5 animate-fade-up">
              <div className="flex gap-3">
                <StepNumber n={1} />
                <div className="flex-1">
                  <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Generate an encryption key
                  </p>
                  <AdminButton
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/settings/email/generate-key', { method: 'POST' });
                        if (res.ok) {
                          const data = await res.json();
                          setRecoveryKey(data.key);
                        }
                      } catch {
                        showMessage('error', 'Failed to generate key');
                      }
                    }}
                    disabled={!!recoveryKey}
                    variant="secondary"
                  >
                    {recoveryKey ? 'Key Generated' : 'Generate Key'}
                  </AdminButton>
                </div>
              </div>

              {recoveryKey && (
                <>
                  <div className="flex gap-3 animate-fade-up">
                    <StepNumber n={2} />
                    <div className="flex-1">
                      <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                        Add to your environment
                      </p>
                      <div
                        className="flex items-center gap-2"
                        style={{
                          background: 'var(--color-surface-elevated)',
                          borderRadius: 'var(--radius-md, 8px)',
                          padding: '10px 12px',
                          border: '1px solid var(--color-border-light)',
                        }}
                      >
                        <code
                          style={{
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            flex: 1,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          SMTP_ENCRYPTION_KEY={recoveryKey}
                        </code>
                        <AdminButton
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`SMTP_ENCRYPTION_KEY=${recoveryKey}`);
                              setRecoveryCopied(true);
                              setTimeout(() => setRecoveryCopied(false), 2000);
                            } catch {
                              showMessage('error', 'Failed to copy — clipboard requires HTTPS');
                            }
                          }}
                          title="Copy to clipboard"
                          className="shrink-0"
                        >
                          {recoveryCopied ? (
                            <CheckIcon className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                          ) : (
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          )}
                        </AdminButton>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        Copy this line into your environment variables file, then restart your server and refresh this page.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 animate-fade-up" style={{ animationDelay: '60ms' } as React.CSSProperties}>
                    <StepNumber n={3} />
                    <div className="flex-1">
                      <p className="text-label" style={{ color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        Re-add affected accounts
                      </p>
                      <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', margin: 0 }}>
                        Delete accounts showing key errors and re-add them &mdash; they&apos;ll be encrypted with your new key
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-md)' }}>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => { setKeyRecoveryPath(null); setRecoveryKey(null); setRecoveryCopied(false); }}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back
                  </span>
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="dash-card animate-fade-up">
          <div className="dash-card-header">
            <h2 className="dash-card-title">{editingId ? 'Edit Account' : 'Add Email Account'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Account Name" tooltip="A friendly name to identify this account, e.g. Support Inbox or Noreply" required />
              <input
                className="input-field w-full"
                placeholder="e.g. SiteGround Noreply"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel label="Host" tooltip="Your SMTP server address, provided by your email host" required />
              <input
                className="input-field w-full"
                placeholder="e.g. mail.yourdomain.com"
                value={form.host}
                onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel label="Username" tooltip="SMTP login username — usually your full email address" required />
              <input
                className="input-field w-full"
                placeholder="e.g. noreply@yourdomain.com"
                value={form.username}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => {
                    const updated = { ...f, username: val };
                    if (val.includes('@') && (!f.fromEmail || f.fromEmail === f.username)) {
                      updated.fromEmail = val;
                    }
                    return updated;
                  });
                }}
              />
            </div>

            <div>
              <FieldLabel label="Password" tooltip="SMTP password — encrypted before storage, never stored in plaintext" required />
              <input
                type="password"
                className="input-field w-full"
                placeholder={editingId ? 'Leave blank to keep existing' : 'SMTP password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel label="From Name" tooltip="The sender name recipients see in their inbox" required />
              <input
                className="input-field w-full"
                placeholder="e.g. Your Company"
                value={form.fromName}
                onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel label="From Email" tooltip="The email address shown as the sender — should match your domain for deliverability" required />
              <input
                type="email"
                className="input-field w-full"
                placeholder="e.g. noreply@yourdomain.com"
                value={form.fromEmail}
                onChange={(e) => setForm((f) => ({ ...f, fromEmail: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel label="Port" tooltip="465 uses implicit SSL, 587 uses STARTTLS — check with your email provider" required />
              <Select
                options={[
                  { value: '465', label: '465 (SSL)' },
                  { value: '587', label: '587 (STARTTLS)' },
                  { value: 'custom', label: 'Custom' },
                ]}
                value={form.port === 465 ? '465' : form.port === 587 ? '587' : 'custom'}
                onChange={(val) => {
                  if (val === 'custom') {
                    setForm((f) => ({ ...f, port: 0, secure: false }));
                  } else {
                    const port = parseInt(val);
                    setForm((f) => ({ ...f, port, secure: port === 465 }));
                  }
                }}
              />
              {form.port !== 465 && form.port !== 587 && (
                <input
                  type="number"
                  className="input-field w-full mt-2"
                  placeholder="Enter custom port"
                  value={form.port || ''}
                  onChange={(e) => {
                    const port = parseInt(e.target.value) || 0;
                    setForm((f) => ({ ...f, port, secure: false }));
                  }}
                  autoFocus
                />
              )}
            </div>

            <div>
              <FieldLabel label="Reply-To" tooltip="When recipients hit reply, their response goes to this address instead of the From Email" optional />
              <input
                type="email"
                className="input-field w-full"
                placeholder="e.g. hello@yourdomain.com"
                value={form.replyTo}
                onChange={(e) => setForm((f) => ({ ...f, replyTo: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2.5 self-end" style={{ paddingBottom: '2px' }}>
              <Switch
                checked={accounts.length === 0 && !editingId ? true : form.isDefault}
                onChange={(checked) => setForm((f) => ({ ...f, isDefault: checked }))}
                disabled={accounts.length === 0 && !editingId}
                size="sm"
              />
              <Tooltip content="The default account used when sending emails — only one can be primary" position="top" delay={300}>
                <span className="text-label" style={{ color: 'var(--color-text-primary)', cursor: 'help' }}>Primary Account</span>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Account' : 'Create Account'}
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </AdminButton>
          </div>
        </div>
      )}

      {/* Account list */}
      {accounts.length > 0 && !showForm && (
        <div className="dash-card animate-fade-up" style={{ padding: 0, animationDelay: '80ms' } as React.CSSProperties}>
          {/* Column headers */}
          <div className="pages-list-header">
            <span>Account</span>
            <span>Actions</span>
          </div>

          <div className="pages-list">
            {[...accounts].sort((a, b) => a.label.localeCompare(b.label)).map((account, i) => (
              <div
                key={account.id}
                className="pages-row animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}
              >
                {/* Left: Account info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                        {account.label}
                      </h4>
                      {account.isDefault && (
                        <span className="posts-tag" style={{
                          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--color-primary)',
                          borderColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                        }}>
                          Primary
                        </span>
                      )}
                    </div>
                    {/* Mobile status indicator */}
                    <span className="flex md:hidden shrink-0" style={{ fontSize: '12px' }}>
                      <StatusDot status={accountStatus[account.id] ?? 'checking'} />
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                    <span><span style={{ color: 'var(--color-text-tertiary)' }}>Email:</span> {account.fromEmail}</span>
                    <span className="hidden md:inline" style={{ opacity: 0.3 }}>&middot;</span>
                    <span><span style={{ color: 'var(--color-text-tertiary)' }}>Host:</span> {account.host}</span>
                    <span className="hidden md:inline" style={{ opacity: 0.3 }}>&middot;</span>
                    <span><span style={{ color: 'var(--color-text-tertiary)' }}>Port:</span> {account.port} ({account.secure ? 'SSL' : 'STARTTLS'})</span>
                    {/* Desktop status indicator */}
                    <span className="hidden md:inline" style={{ opacity: 0.3 }}>&middot;</span>
                    <span className="hidden md:flex">
                      <StatusDot status={accountStatus[account.id] ?? 'checking'} />
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="pages-row-actions">
                  {testingId === account.id ? (
                    <div className="flex items-center gap-2 animate-fade-up">
                      <input
                        type="email"
                        className="input-field"
                        placeholder="Recipient email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        style={{ width: '200px', fontSize: '13px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTest(account.id);
                          if (e.key === 'Escape') { setTestingId(null); setTestEmail(''); }
                        }}
                        autoFocus
                      />
                      <button
                        className="pages-action-btn"
                        onClick={() => handleTest(account.id)}
                        disabled={testSending || !testEmail}
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span className="pages-action-label">{testSending ? 'Sending...' : 'Send'}</span>
                      </button>
                      <button
                        className="pages-action-btn"
                        onClick={() => { setTestingId(null); setTestEmail(''); }}
                      >
                        <span className="pages-action-label">Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="pages-action-btn"
                        onClick={() => { setTestingId(account.id); setTestEmail(''); }}
                        title="Send test email"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span className="pages-action-label">Test</span>
                      </button>
                      <button
                        className="pages-action-btn"
                        onClick={() => startEdit(account)}
                        title="Edit account"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        <span className="pages-action-label">Edit</span>
                      </button>
                      <button
                        className="pages-action-btn danger"
                        onClick={() => handleDelete(account.id)}
                        title="Delete account"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span className="pages-action-label">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        flexShrink: 0,
        marginTop: '1px',
      }}
    >
      {n}
    </div>
  );
}
