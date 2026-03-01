'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { toastStore } from './toast';
import { Toast } from './ToastItem';
import { injectFeedbackAnimations } from './_shared';

type Position =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

interface ToasterProps {
  position?: Position;
  maxToasts?: number;
  className?: string;
}

const positionClasses: Record<Position, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

const stackDirection: Record<Position, string> = {
  'top-right': 'flex-col',
  'top-left': 'flex-col',
  'bottom-right': 'flex-col-reverse',
  'bottom-left': 'flex-col-reverse',
  'top-center': 'flex-col',
  'bottom-center': 'flex-col-reverse',
};

// SSR-safe empty snapshot
const emptyToasts: ReturnType<typeof toastStore.getSnapshot> = [];

export function Toaster({
  position = 'bottom-right',
  maxToasts = 5,
  className,
}: ToasterProps) {
  useEffect(() => {
    injectFeedbackAnimations();
  }, []);

  const allToasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => emptyToasts
  );

  // Limit visible toasts (keep most recent)
  const visible = allToasts.slice(-maxToasts);

  if (typeof document === 'undefined' || visible.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className={`fixed z-[9999] pointer-events-none flex ${stackDirection[position]} gap-2 ${positionClasses[position]} ${className ?? ''}`}
    >
      {visible.map((t) => (
        <Toast key={t.id} data={t} position={position} />
      ))}
    </div>,
    document.body
  );
}
