'use client';

import { useId, forwardRef } from 'react';
import { labelSizeClass } from './_shared';

export interface ToggleProps {
  label?: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  labelPosition?: 'left' | 'right';
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      label,
      description,
      error,
      checked = false,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      labelPosition = 'right',
      required,
      name,
      id,
      className,
      inputClassName,
      'aria-label': ariaLabel,
    },
    forwardedRef,
  ) {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

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

    const trackWidth =
      size === 'sm' ? 'w-8' : size === 'lg' ? 'w-14' : 'w-10';
    const trackHeight =
      size === 'sm' ? 'h-[18px]' : size === 'lg' ? 'h-[28px]' : 'h-[22px]';
    const thumbSize =
      size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-[18px] w-[18px]';
    const thumbTranslate =
      size === 'sm' ? 'translate-x-[14px]' : size === 'lg' ? 'translate-x-[26px]' : 'translate-x-[18px]';

    const labelEl = label && (
      <span className={`${labelSizeClass(size)} text-input-text-label leading-none select-none`}>
        {label}
      </span>
    );

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {name && <input type="hidden" name={name} value={checked ? 'on' : ''} />}

        <button
          ref={forwardedRef}
          id={inputId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-label={!label ? ariaLabel : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`inline-flex items-center gap-2.5 outline-none rounded-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } focus-visible:ring-2 focus-visible:ring-input-ring focus-visible:ring-offset-1 ${inputClassName || ''}`}
        >
          {labelPosition === 'left' && labelEl}
          <span
            className={`relative inline-flex items-center ${trackWidth} ${trackHeight} rounded-full transition-colors duration-150 flex-shrink-0 ${
              error
                ? checked
                  ? 'bg-input-border-error ring-2 ring-input-ring-error'
                  : 'bg-input-border-error/50 ring-2 ring-input-ring-error'
                : checked
                  ? 'bg-input-accent'
                  : 'bg-input-bg-inset'
            }`}
          >
            <span
              className={`${thumbSize} rounded-full bg-input-accent-fg shadow-sm transition-transform duration-150 ml-0.5 ${
                checked ? thumbTranslate : 'translate-x-0'
              }`}
            />
          </span>
          {labelPosition === 'right' && labelEl}
        </button>

        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';
