'use client';

import { useEffect, useId, forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { injectAnimations, labelSizeClass } from './_shared';

export interface CheckboxProps {
  label?: string;
  description?: string;
  error?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  required?: boolean;
  value?: string;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      error,
      checked = false,
      indeterminate = false,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      required,
      value,
      name,
      id,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    useEffect(() => {
      injectAnimations();
    }, []);

    const handleToggle = () => {
      if (disabled) return;
      onChange?.(!checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Only prevent default for Space to stop page scroll; do NOT call handleToggle()
      // because <button> natively fires a click event on Space/Enter, which triggers onClick.
      if (e.key === ' ') {
        e.preventDefault();
      }
    };

    const boxSize =
      size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    const isActive = checked || indeterminate;
    const errorMargin =
      size === 'sm' ? 'ml-[26px]' : size === 'lg' ? 'ml-[34px]' : 'ml-[30px]';

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={checked ? (value || 'on') : ''}
          />
        )}

        <button
          ref={forwardedRef}
          id={inputId}
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`inline-flex items-center gap-2.5 select-none outline-none rounded-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } focus-visible:ring-2 focus-visible:ring-input-ring focus-visible:ring-offset-1 ${inputClassName || ''}`}
        >
          <span
            className={`relative inline-flex items-center justify-center ${boxSize} rounded border-2 transition-all duration-150 flex-shrink-0 ${
              isActive
                ? 'bg-input-accent border-input-accent'
                : error
                  ? 'border-input-border-error bg-input-bg'
                  : 'border-input-bg-inset bg-input-bg hover:border-input-border-hover'
            }`}
          >
            {checked && !indeterminate && (
              <Check
                size={iconSize}
                strokeWidth={3}
                className="absolute text-input-accent-fg"
                style={{ animation: 'ui-check-pop 150ms ease-out' }}
              />
            )}
            {indeterminate && (
              <Minus size={iconSize} strokeWidth={3} className="absolute text-input-accent-fg" />
            )}
          </span>
          {label && (
            <span className={`${labelSizeClass(size)} text-input-text-label leading-none`}>
              {label}
            </span>
          )}
        </button>

        {description && (
          <p id={descId} className={`text-xs text-input-text-subtle ${errorMargin}`}>{description}</p>
        )}

        {error && (
          <p id={errorId} role="alert" className={`text-xs text-input-error ${errorMargin}`}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
