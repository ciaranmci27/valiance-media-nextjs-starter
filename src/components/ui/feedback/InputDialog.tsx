'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { TextInput } from '@/components/ui/inputs';
import {
  injectFeedbackAnimations,
  createFocusTrap,
  lockScroll,
} from './_shared';

// ─── Types ────────────────────────────────────────────────────────────

export interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────

export function InputDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  placeholder,
  defaultValue = '',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  className,
}: InputDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [exiting, setExiting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId();
  const titleId = `${uid}-input-dialog-title`;
  const descId = `${uid}-input-dialog-desc`;

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

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setInputValue(defaultValue);
      setExiting(false);
    }
    prevOpenRef.current = open;
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open, defaultValue]);

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
    if (exiting) return;
    scheduleExit(() => onOpenChange(false));
  }, [exiting, onOpenChange, scheduleExit]);

  const handleSubmit = useCallback(() => {
    if (exiting) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    scheduleExit(() => onOpenChange(false));
  }, [exiting, inputValue, onSubmit, onOpenChange, scheduleExit]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  if (!open && !exiting) return null;
  if (typeof document === 'undefined') return null;

  const overlayAnim = exiting
    ? 'fb-fade-out 150ms ease-in forwards'
    : 'fb-fade-in 150ms ease-out';
  const panelAnim = exiting
    ? 'fb-zoom-out 150ms ease-in forwards'
    : 'fb-zoom-in 200ms cubic-bezier(0.16, 1, 0.3, 1)';

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative z-[9999] w-full max-w-[420px] rounded-xl shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] ${className ?? ''}`}
        style={{ animation: panelAnim, backgroundColor: 'var(--color-surface-elevated)' }}
      >
        <div className="p-6">
          {/* Title */}
          <h3
            id={titleId}
            className="text-[15px] font-semibold text-fb-text leading-snug mb-0"
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              id={descId}
              className="text-sm leading-relaxed text-fb-text-subtle mt-2 mb-0"
            >
              {description}
            </p>
          )}

          {/* Input */}
          <div className="mt-4">
            <TextInput
              value={inputValue}
              onChange={setInputValue}
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-fb-text-subtle hover:bg-fb-bg-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="h-9 px-4 rounded-lg text-[13px] font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-ring disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 bg-fb-accent text-fb-accent-fg hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── useInputDialog hook ──────────────────────────────────────────────

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useInputDialog() {
  const [state, setState] = useState<{
    open: boolean;
    options: PromptOptions;
    resolve: ((value: string | null) => void) | null;
  }>({
    open: false,
    options: { title: '' },
    resolve: null,
  });

  const promptInput = useCallback(
    (options: PromptOptions): Promise<string | null> => {
      return new Promise<string | null>((resolve) => {
        setState((prev) => {
          // If a previous promise is still pending, resolve it with null
          if (prev.resolve) {
            prev.resolve(null);
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
            prev.resolve(null);
          }
          return { ...prev, open: false, resolve: null };
        });
      }
    },
    []
  );

  const handleSubmit = useCallback((value: string) => {
    setState((prev) => {
      if (prev.resolve) {
        prev.resolve(value);
      }
      // Clear resolve so onOpenChange(false) from the animation won't double-resolve
      return { ...prev, resolve: null };
    });
  }, []);

  const dialog = (
    <InputDialog
      open={state.open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      title={state.options.title}
      description={state.options.description}
      placeholder={state.options.placeholder}
      defaultValue={state.options.defaultValue}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
    />
  );

  return { promptInput, dialog };
}
