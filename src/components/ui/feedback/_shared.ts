'use client';

/**
 * Inject shared keyframe animations for feedback components.
 * Safe to call multiple times; only injects once.
 * Must be called from useEffect (client-side only).
 */
let animationsInjected = false;

export function injectFeedbackAnimations(): void {
  if (typeof document === 'undefined') return;
  if (animationsInjected || document.querySelector('style[data-ui-feedback]')) {
    animationsInjected = true;
    return;
  }
  animationsInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-ui-feedback', '');
  style.textContent = [
    // Slide in
    '@keyframes fb-slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }',
    '@keyframes fb-slide-in-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }',
    '@keyframes fb-slide-in-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
    '@keyframes fb-slide-in-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
    // Slide out
    '@keyframes fb-slide-out-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }',
    '@keyframes fb-slide-out-left { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }',
    // Fade
    '@keyframes fb-fade-in { from { opacity: 0; } to { opacity: 1; } }',
    '@keyframes fb-fade-out { from { opacity: 1; } to { opacity: 0; } }',
    // Dialog enter/exit - subtle slide-up, not zoom
    '@keyframes fb-zoom-in { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
    '@keyframes fb-zoom-out { from { transform: translateY(0); opacity: 1; } to { transform: translateY(6px); opacity: 0; } }',
  ].join('\n');
  document.head.appendChild(style);
}

/**
 * Create a focus trap that keeps Tab/Shift+Tab within a container.
 * Returns activate/deactivate functions. Restores focus on deactivate.
 */
export function createFocusTrap(container: HTMLElement) {
  let previouslyFocused: HTMLElement | null = null;

  const getFocusable = (): HTMLElement[] => {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.closest('[aria-hidden="true"]')
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return {
    activate() {
      previouslyFocused = document.activeElement as HTMLElement | null;
      container.addEventListener('keydown', handleKeyDown);
      // Focus first focusable element
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    },
    deactivate() {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    },
  };
}

/**
 * Lock page scrolling. Returns a cleanup function.
 * Uses reference counting so nested calls don't break each other.
 */
let scrollLockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};

  scrollLockCount++;
  if (scrollLockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    savedOverflow = document.body.style.overflow;
    savedPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount--;
    if (scrollLockCount === 0) {
      document.body.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedPaddingRight;
    }
  };
}
