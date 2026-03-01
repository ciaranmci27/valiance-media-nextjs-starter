'use client';

import { type Ref, type RefCallback } from 'react';

/**
 * Merge multiple refs into a single ref callback.
 * Supports both callback refs and RefObject refs.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else (ref as { current: T | null }).current = node;
    });
  };
}

/**
 * Return the Tailwind text-size class for a label based on input size.
 */
export function labelSizeClass(size: 'sm' | 'default' | 'lg'): string {
  if (size === 'sm') return 'text-xs';
  if (size === 'lg') return 'text-base';
  return 'text-sm';
}

/**
 * Inject shared keyframe animations into the document head.
 * Safe to call multiple times; only injects once.
 * Must be called from useEffect (client-side only).
 */
let animationsInjected = false;

export function injectAnimations(): void {
  if (typeof document === 'undefined') return;
  // Check both module flag and DOM to handle HMR re-evaluation
  if (animationsInjected || document.querySelector('style[data-ui-inputs]')) {
    animationsInjected = true;
    return;
  }
  animationsInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-ui-inputs', '');
  style.textContent = [
    '@keyframes ui-check-pop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }',
    '@keyframes ui-radio-pop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }',
  ].join('\n');
  document.head.appendChild(style);
}
