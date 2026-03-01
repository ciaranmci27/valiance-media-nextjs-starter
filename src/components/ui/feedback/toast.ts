'use client';

// ─── Types ────────────────────────────────────────────────────────────

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
}

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description: string;
  duration: number;
  dismissible: boolean;
  action?: ToastAction;
  exiting?: boolean;
  pausedAt?: number | null;
  remainingMs?: number;
}

// ─── Store ────────────────────────────────────────────────────────────

type Listener = () => void;

let toasts: ToastData[] = [];
const listeners = new Set<Listener>();
let counter = 0;
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
const autoDismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
const autoDismissScheduledAt = new Map<string, number>();

function emit() {
  // Create a new array reference so useSyncExternalStore detects the change
  toasts = [...toasts];
  listeners.forEach((l) => l());
}

function scheduleAutoDismiss(id: string, ms: number) {
  clearAutoDismissTimer(id);
  if (ms <= 0) return;
  autoDismissScheduledAt.set(id, Date.now());
  autoDismissTimers.set(
    id,
    setTimeout(() => {
      autoDismissTimers.delete(id);
      autoDismissScheduledAt.delete(id);
      dismiss(id);
    }, ms),
  );
}

function clearAutoDismissTimer(id: string) {
  const existing = autoDismissTimers.get(id);
  if (existing != null) {
    clearTimeout(existing);
    autoDismissTimers.delete(id);
    autoDismissScheduledAt.delete(id);
  }
}

function addToast(
  type: ToastData['type'],
  description: string,
  options?: ToastOptions
): string {
  const id = `toast-${++counter}-${Date.now()}`;
  const duration = options?.duration ?? 4000;
  const data: ToastData = {
    id,
    type,
    description,
    title: options?.title,
    duration,
    dismissible: options?.dismissible ?? true,
    action: options?.action,
    pausedAt: null,
  };
  toasts = [...toasts, data];
  emit();
  scheduleAutoDismiss(id, duration);
  return id;
}

function dismiss(id: string) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const t = toasts[idx];
  if (t.exiting) return;

  // Clear any pending auto-dismiss timer
  clearAutoDismissTimer(id);

  toasts = toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t));
  emit();
  // Remove after exit animation completes
  const timer = setTimeout(() => {
    dismissTimers.delete(id);
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 200);
  dismissTimers.set(id, timer);
}

function dismissAll() {
  const active = toasts.filter((t) => !t.exiting);
  if (active.length === 0) return;

  // Clear all pending timers
  for (const [id, timer] of dismissTimers) {
    clearTimeout(timer);
    dismissTimers.delete(id);
  }
  for (const [id] of autoDismissTimers) {
    clearAutoDismissTimer(id);
  }

  const exitingIds = new Set(toasts.filter((t) => !t.exiting).map((t) => t.id));
  toasts = toasts.map((t) => (t.exiting ? t : { ...t, exiting: true }));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => !exitingIds.has(t.id));
    emit();
  }, 200);
}

function pause(id: string) {
  const t = toasts.find((t) => t.id === id);
  if (!t || t.exiting || t.pausedAt) return;
  // Compute how much time was left before we clear the timer
  const scheduledAt = autoDismissScheduledAt.get(id);
  const totalMs = t.remainingMs ?? t.duration;
  const elapsed = scheduledAt ? Date.now() - scheduledAt : 0;
  const remaining = Math.max(totalMs - elapsed, 500);
  clearAutoDismissTimer(id);
  toasts = toasts.map((t) =>
    t.id === id ? { ...t, pausedAt: Date.now(), remainingMs: remaining } : t
  );
  emit();
}

function resume(id: string) {
  const existing = toasts.find((t) => t.id === id);
  if (!existing || !existing.pausedAt) return;
  // Use the remaining time that was captured at pause; hover duration does not count against it
  const remaining = Math.max(existing.remainingMs ?? existing.duration, 500);
  toasts = toasts.map((t) => {
    if (t.id !== id || !t.pausedAt) return t;
    return { ...t, pausedAt: null, remainingMs: remaining };
  });
  emit();
  scheduleAutoDismiss(id, remaining);
}

// ─── External store contract (useSyncExternalStore) ───────────────────

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ToastData[] {
  return toasts;
}

// ─── Public API ───────────────────────────────────────────────────────

export const toast = {
  success: (description: string, options?: ToastOptions) =>
    addToast('success', description, options),
  error: (description: string, options?: ToastOptions) =>
    addToast('error', description, options),
  warning: (description: string, options?: ToastOptions) =>
    addToast('warning', description, options),
  info: (description: string, options?: ToastOptions) =>
    addToast('info', description, options),
  dismiss,
  dismissAll,
};

export const toastStore = {
  subscribe,
  getSnapshot,
  dismiss,
  pause,
  resume,
};
