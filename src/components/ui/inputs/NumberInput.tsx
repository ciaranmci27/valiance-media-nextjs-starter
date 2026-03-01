'use client';

import { useRef, useId, forwardRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface NumberInputProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: number | '';
  onChange?: (value: number | '') => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  min?: number;
  max?: number;
  step?: number;
  showButtons?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      label,
      description,
      error,
      placeholder,
      value = '',
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      min,
      max,
      step = 1,
      showButtons = true,
      prefix,
      suffix,
      name,
      id,
      autoFocus,
      required,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const internalRef = useRef<HTMLInputElement>(null);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    const clamp = (val: number): number => {
      let clamped = val;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      return clamped;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      if (raw === '') {
        onChange?.('');
        return;
      }

      if (raw === '-' || raw === '.' || raw === '-.') {
        return;
      }

      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange?.(parsed);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
        onChange?.('');
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          onChange?.(clamp(parsed));
        }
      }
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'Home', 'End',
      ];
      if (allowed.includes(e.key)) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        increment();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        decrement();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
        return;
      }

      if (e.key === '-') {
        const input = e.currentTarget;
        if (input.selectionStart === 0 && !input.value.includes('-')) {
          return;
        }
        e.preventDefault();
        return;
      }

      if (e.key === '.') {
        if (!e.currentTarget.value.includes('.')) {
          return;
        }
        e.preventDefault();
        return;
      }

      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    const increment = () => {
      if (disabled) return;
      const current = typeof value === 'number' ? value : 0;
      onChange?.(clamp(current + step));
      internalRef.current?.focus();
    };

    const decrement = () => {
      if (disabled) return;
      const current = typeof value === 'number' ? value : 0;
      onChange?.(clamp(current - step));
      internalRef.current?.focus();
    };

    const preventSelection = (e: React.MouseEvent) => {
      e.preventDefault();
    };

    const sizeClasses =
      size === 'sm' ? 'py-1.5 text-xs' : size === 'lg' ? 'py-2.5 text-base' : 'py-2 text-sm';

    const wrapperPx = size === 'sm' ? 'px-2.5' : size === 'lg' ? 'px-3.5' : 'px-3';

    const isInteger = step % 1 === 0;
    const atMax = max !== undefined && typeof value === 'number' && value >= max;
    const atMin = min !== undefined && typeof value === 'number' && value <= min;

    const stepperIconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {label && (
          <label htmlFor={inputId} className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}>
            {label}
          </label>
        )}
        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}
        <div
          className={`flex items-center bg-input-bg border rounded-input outline-none transition-all duration-150 ${
            error
              ? 'border-input-border-error focus-within:border-input-border-error focus-within:ring-2 focus-within:ring-input-ring-error'
              : 'border-input-border hover:border-input-border-hover focus-within:border-input-border-focus focus-within:ring-2 focus-within:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : ''} ${inputClassName || ''}`}
        >
          <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${wrapperPx}`}>
            {prefix != null && (
              <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} text-input-text-subtle flex-shrink-0 select-none`}>
                {prefix}
              </span>
            )}
            <input
              ref={mergeRefs(internalRef, forwardedRef)}
              id={inputId}
              name={name}
              type="text"
              inputMode={isInteger ? 'numeric' : 'decimal'}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={onFocus}
              disabled={disabled}
              placeholder={placeholder}
              autoFocus={autoFocus}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={typeof value === 'number' ? value : undefined}
              className={`flex-1 min-w-0 ${sizeClasses} bg-transparent outline-none text-input-text placeholder:text-input-text-placeholder`}
            />
            {suffix != null && (
              <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} text-input-text-subtle flex-shrink-0 select-none`}>
                {suffix}
              </span>
            )}
          </div>
          {showButtons && (
            <div className="flex flex-col border-l border-input-border-divider rounded-r-input overflow-hidden self-stretch">
              <button
                type="button"
                tabIndex={-1}
                onClick={increment}
                onMouseDown={preventSelection}
                disabled={disabled || atMax}
                aria-label="Increment"
                className="flex-1 flex items-center justify-center px-2.5 hover:bg-input-bg-hover active:bg-input-bg-active text-input-text-subtle hover:text-input-text transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp size={stepperIconSize} />
              </button>
              <div className="border-t border-input-border-divider" />
              <button
                type="button"
                tabIndex={-1}
                onClick={decrement}
                onMouseDown={preventSelection}
                disabled={disabled || atMin}
                aria-label="Decrement"
                className="flex-1 flex items-center justify-center px-2.5 hover:bg-input-bg-hover active:bg-input-bg-active text-input-text-subtle hover:text-input-text transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown size={stepperIconSize} />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';
