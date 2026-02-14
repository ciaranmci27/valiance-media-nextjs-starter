'use client';

import { useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  LockClosedIcon,
  ServerStackIcon,
  EnvelopeIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import type { AuthProvider } from '@/lib/admin/auth-provider';

const SUPABASE_GREEN = '#22C55E';
const EMAIL_COPPER = '#C5A68F';

function SupabaseIcon({ size = 20 }: { size?: number }) {
  const id = useId();
  const gradientId = `sb-grad-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="53.974" y1="113.174" x2="94.163" y2="22.925" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16A34A" />
          <stop offset="1" stopColor={SUPABASE_GREEN} />
        </linearGradient>
      </defs>
      <path d="M63.708 110.284C60.727 114.083 54.87 112.147 54.694 107.26L53.098 59.218H99.14C108.123 59.218 113.172 69.618 107.56 76.659L63.708 110.284Z" fill={`url(#${gradientId})`} />
      <path d="M63.708 110.284C60.727 114.083 54.87 112.147 54.694 107.26L53.098 59.218H99.14C108.123 59.218 113.172 69.618 107.56 76.659L63.708 110.284Z" fill={`url(#${gradientId})`} fillOpacity="0.2" />
      <path d="M45.317 2.071C48.298 -1.728 54.155 0.209 54.331 5.096L55.202 53.137H10.088C1.105 53.137 -3.944 42.737 1.668 35.696L45.317 2.071Z" fill={SUPABASE_GREEN} />
    </svg>
  );
}

interface SettingsHubProps {
  authProvider: AuthProvider;
  supabaseConfigured: boolean;
  smtpConfigured: boolean;
}

interface SettingsCard {
  title: string;
  description: string;
  href: string;
  provider: string;
  accentColor?: string;
  icon: React.ReactNode;
}

export default function SettingsHub({ authProvider, supabaseConfigured, smtpConfigured }: SettingsHubProps) {
  const router = useRouter();

  const isAuthSupabase = authProvider === 'supabase';
  const isStorageSupabase = supabaseConfigured;

  const cards: SettingsCard[] = [
    {
      title: 'Authentication',
      description: isAuthSupabase
        ? 'Managed by Supabase Auth. View configuration and allowed users'
        : 'Configure session timeout, login attempts, and lockout security',
      href: '/admin/settings/auth',
      provider: isAuthSupabase ? 'Supabase' : 'Simple',
      accentColor: isAuthSupabase ? SUPABASE_GREEN : undefined,
      icon: isAuthSupabase
        ? <SupabaseIcon />
        : <LockClosedIcon className="w-5 h-5" />,
    },
    {
      title: 'Storage',
      description: isStorageSupabase
        ? 'Supabase configured. Content data backed by Supabase database'
        : 'Local file system. Blog content and data stored as JSON on disk',
      href: '/admin/settings/storage',
      provider: isStorageSupabase ? 'Supabase' : 'Local',
      accentColor: isStorageSupabase ? SUPABASE_GREEN : undefined,
      icon: isStorageSupabase
        ? <SupabaseIcon />
        : <ServerStackIcon className="w-5 h-5" />,
    },
    {
      title: 'Email',
      description: 'Configure SMTP accounts for sending emails',
      href: '/admin/settings/email',
      provider: 'SMTP',
      accentColor: smtpConfigured ? EMAIL_COPPER : undefined,
      icon: <EnvelopeIcon className="w-5 h-5" />,
    },
  ];

  const handleCardClick = (href: string) => router.push(href);

  const handleCardKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Settings
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Manage authentication, storage, email, and system configuration
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className="dash-card animate-fade-up"
            role="link"
            tabIndex={0}
            onClick={() => handleCardClick(card.href)}
            onKeyDown={(e) => handleCardKeyDown(e, card.href)}
            style={{
              animationDelay: `${i * 80}ms`,
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
              borderColor: card.accentColor
                ? `color-mix(in srgb, ${card.accentColor} 20%, var(--color-border-light))`
                : undefined,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              if (card.accentColor) {
                el.style.borderColor = `color-mix(in srgb, ${card.accentColor} 40%, var(--color-border-light))`;
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = '';
              el.style.boxShadow = '';
              if (card.accentColor) {
                el.style.borderColor = `color-mix(in srgb, ${card.accentColor} 20%, var(--color-border-light))`;
              }
            }}
          >
            {/* Provider badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '999px',
                letterSpacing: '0.02em',
                ...(card.accentColor
                  ? {
                      background: `color-mix(in srgb, ${card.accentColor} 12%, transparent)`,
                      color: card.accentColor,
                    }
                  : {
                      background: 'var(--color-surface-elevated)',
                      color: 'var(--color-text-secondary)',
                    }),
              }}
            >
              {card.provider}
            </div>

            {/* Icon */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg, 12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                background: card.accentColor
                  ? `color-mix(in srgb, ${card.accentColor} 10%, transparent)`
                  : 'color-mix(in srgb, var(--color-text-secondary) 8%, var(--color-surface))',
                color: card.accentColor || 'var(--color-text-secondary)',
              }}
            >
              {card.icon}
            </div>

            {/* Content */}
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0 0 6px 0',
            }}>
              {card.title}
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.5,
              paddingRight: '24px',
            }}>
              {card.description}
            </p>

            {/* Arrow */}
            <ArrowUpRightIcon
              className="w-4 h-4"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                color: 'var(--color-text-disabled)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
