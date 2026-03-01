'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  injectFeedbackAnimations,
  createFocusTrap,
  lockScroll,
} from './_shared';

// ─── Types ────────────────────────────────────────────────────────────

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  icon?: ReactNode;
  loading?: boolean;
  doubleConfirm?: boolean;
  className?: string;
}

// Variant only affects the confirm button color - nothing else
const confirmStyles = {
  default: 'bg-fb-accent text-fb-accent-fg hover:opacity-90',
  danger: 'bg-fb-danger text-fb-danger-fg hover:opacity-90',
  warning: 'bg-fb-warning text-white hover:opacity-90',
} as const;

// ─── Component ────────────────────────────────────────────────────────

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  loading: externalLoading,
  doubleConfirm = false,
  className,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId();
  const titleId = `${uid}-dialog-title`;
  const descriptionId = `${uid}-dialog-desc`;

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    injectFeedbackAnimations();
  }, []);

  useEffect(() => {
    if (!open || exiting) return;
    const unlockScroll = lockScroll();
    const raf = requestAnimationFrame(() => {
      if (panelRef.current) {
        trapRef.current = createFocusTrap(panelRef.current);
        trapRef.current.activate();
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      trapRef.current?.deactivate();
      trapRef.current = null;
      unlockScroll();
    };
  }, [open, exiting]);

  useEffect(() => {
    if (open) {
      setInternalLoading(false);
      setExiting(false);
      setAwaitingConfirm(false);
    }
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open]);

  const scheduleExit = useCallback((cb: () => void) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setExiting(false);
      cb();
    }, 150);
  }, []);

  const handleClose = useCallback(() => {
    if (loading || exiting) return;
    scheduleExit(() => onOpenChange(false));
  }, [loading, exiting, onOpenChange, scheduleExit]);

  const handleConfirm = useCallback(async () => {
    if (loading || exiting) return;
    if (doubleConfirm && !awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
        setInternalLoading(false);
      }
      scheduleExit(() => onOpenChange(false));
    } catch {
      setInternalLoading(false);
    }
  }, [loading, exiting, onConfirm, onOpenChange, doubleConfirm, awaitingConfirm, scheduleExit]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        if (awaitingConfirm) {
          setAwaitingConfirm(false);
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, handleClose, awaitingConfirm]);

  if (!open && !exiting) return null;
  if (typeof document === 'undefined') return null;

  // Only show an icon for danger/warning (or if explicitly provided)
  const resolvedIcon =
    icon ??
    (variant === 'danger' || variant === 'warning' ? (
      <AlertTriangle className="h-[18px] w-[18px]" />
    ) : null);

  const iconColor =
    variant === 'danger'
      ? 'text-fb-error'
      : variant === 'warning'
        ? 'text-fb-warning'
        : 'text-fb-text-placeholder';

  const overlayAnim = exiting
    ? 'fb-fade-out 150ms ease-in forwards'
    : 'fb-fade-in 150ms ease-out';
  const panelAnim = exiting
    ? 'fb-zoom-out 150ms ease-in forwards'
    : 'fb-zoom-in 200ms cubic-bezier(0.16, 1, 0.3, 1)';

  const btnLabel = awaitingConfirm
    ? `Yes, ${confirmLabel.toLowerCase()}`
    : confirmLabel;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-fb-overlay/40 backdrop-blur-[2px]"
        style={{ animation: overlayAnim }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative z-[9999] w-full max-w-[420px] rounded-xl shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] ${className ?? ''}`}
        style={{ animation: panelAnim, backgroundColor: 'var(--color-surface-elevated)' }}
      >
        <div className="p-6">
          {/* Title */}
          <div className="flex items-start gap-2.5">
            {resolvedIcon && (
              <span className={`mt-[3px] shrink-0 ${iconColor}`}>
                {resolvedIcon}
              </span>
            )}
            <h3
              id={titleId}
              className="text-[15px] font-semibold text-fb-text leading-snug mb-0"
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          <p
            id={descriptionId}
            className={`text-sm leading-relaxed text-fb-text-subtle mt-2 mb-0 ${resolvedIcon ? 'ml-[28px]' : ''}`}
          >
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={() => {
              if (awaitingConfirm) {
                setAwaitingConfirm(false);
                return;
              }
              handleClose();
            }}
            disabled={loading}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-fb-text-subtle hover:bg-fb-bg-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {awaitingConfirm ? 'Go back' : cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`h-9 px-4 rounded-lg text-[13px] font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 ${confirmStyles[variant]}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {btnLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── useConfirmationDialog hook ───────────────────────────────────────

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  icon?: ReactNode;
  doubleConfirm?: boolean;
}

export function useConfirmationDialog() {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: '', description: '' },
    resolve: null,
  });

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setState((prev) => {
          // If a previous promise is still pending, resolve it with false
          if (prev.resolve) {
            prev.resolve(false);
          }
          return { open: true, options, resolve };
        });
      });
    },
    []
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setState((prev) => {
          if (prev.resolve) {
            prev.resolve(false);
          }
          return { ...prev, open: false, resolve: null };
        });
      }
    },
    []
  );

  const handleConfirm = useCallback(() => {
    setState((prev) => {
      if (prev.resolve) {
        prev.resolve(true);
      }
      // Clear resolve so onOpenChange(false) from animation won't double-resolve
      return { ...prev, resolve: null };
    });
  }, []);

  const dialog = (
    <ConfirmationDialog
      open={state.open}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
      title={state.options.title}
      description={state.options.description}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
      icon={state.options.icon}
      doubleConfirm={state.options.doubleConfirm}
    />
  );

  return { confirm, dialog };
}
