'use client';

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastData } from './toast';
import { toastStore } from './toast';

type Position =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

type ToastType = ToastData['type'];

interface ToastProps {
  data: ToastData;
  position: Position;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

// Type-tinted styling triads: bg, border, icon/title color
const typeStyles: Record<ToastType, { card: string; title: string; actionBtn: string; dismissBtn: string }> = {
  success: {
    card: 'bg-fb-success-subtle border-fb-success-border',
    title: 'text-fb-success',
    actionBtn: 'bg-fb-success text-white hover:opacity-90',
    dismissBtn: 'bg-fb-success-subtle border-fb-success-border hover:bg-fb-success-border/30',
  },
  error: {
    card: 'bg-fb-error-subtle border-fb-error-border',
    title: 'text-fb-error',
    actionBtn: 'bg-fb-error text-white hover:opacity-90',
    dismissBtn: 'bg-fb-error-subtle border-fb-error-border hover:bg-fb-error-border/30',
  },
  warning: {
    card: 'bg-fb-warning-subtle border-fb-warning-border',
    title: 'text-fb-warning',
    actionBtn: 'bg-fb-warning text-white hover:opacity-90',
    dismissBtn: 'bg-fb-warning-subtle border-fb-warning-border hover:bg-fb-warning-border/30',
  },
  info: {
    card: 'bg-fb-info-subtle border-fb-info-border',
    title: 'text-fb-info',
    actionBtn: 'bg-fb-info text-white hover:opacity-90',
    dismissBtn: 'bg-fb-info-subtle border-fb-info-border hover:bg-fb-info-border/30',
  },
};

function getEntryAnimation(position: Position): string {
  if (position.includes('right')) return 'fb-slide-in-right';
  if (position.includes('left')) return 'fb-slide-in-left';
  if (position.startsWith('top')) return 'fb-slide-in-down';
  return 'fb-slide-in-up';
}

function getExitAnimation(position: Position): string {
  if (position.includes('right')) return 'fb-slide-out-right';
  if (position.includes('left')) return 'fb-slide-out-left';
  return 'fb-fade-out';
}

export function Toast({ data, position }: ToastProps) {
  const handleMouseEnter = () => {
    toastStore.pause(data.id);
  };

  const handleMouseLeave = () => {
    toastStore.resume(data.id);
  };

  const Icon = icons[data.type];
  const styles = typeStyles[data.type];
  const animation = data.exiting
    ? `${getExitAnimation(position)} 200ms ease-in forwards`
    : `${getEntryAnimation(position)} 400ms ease-out`;

  const ariaRole = data.type === 'error' || data.type === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={ariaRole}
      aria-live={ariaRole === 'alert' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ animation }}
      className={`pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-fb border p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${styles.card}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.title}`} />
      <div className="flex-1 min-w-0">
        {data.title && (
          <p className={`mb-0 text-sm font-semibold ${styles.title}`}>{data.title}</p>
        )}
        <p className={`mb-0 text-sm text-fb-text ${data.title ? 'mt-1' : ''}`}>
          {data.description}
        </p>
      </div>
      {data.action && (
        <button
          type="button"
          onClick={data.action.onClick}
          className={`shrink-0 h-6 px-2 text-xs font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring ${styles.actionBtn}`}
        >
          {data.action.label}
        </button>
      )}
      {data.dismissible && (
        <button
          type="button"
          onClick={() => toastStore.dismiss(data.id)}
          className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-fb-text-subtle hover:text-fb-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring ${styles.dismissBtn}`}
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
