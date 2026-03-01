'use client';

import { useState, useId, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { labelSizeClass } from './_shared';

export interface PasswordInputProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  className?: string;
  inputClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      label,
      description,
      error,
      placeholder = 'Enter password',
      value,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      disabled = false,
      size = 'default',
      showIcon = true,
      name,
      id,
      autoComplete = 'current-password',
      autoFocus,
      required,
      minLength,
      maxLength,
      pattern,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const [visible, setVisible] = useState(false);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const toggleVisibility = () => {
      setVisible((v) => !v);
    };

    const sizeClasses =
      size === 'sm' ? 'py-1.5 text-xs' : size === 'lg' ? 'py-2.5 text-base' : 'py-2 text-sm';
    const iconSizeClasses =
      size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    const wrapperPx = size === 'sm' ? 'px-2.5' : size === 'lg' ? 'px-3.5' : 'px-3';

    const ToggleIcon = visible ? EyeOff : Eye;

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
          className={`flex items-center gap-1.5 ${wrapperPx} bg-input-bg border rounded-input outline-none transition-all duration-150 ${
            error
              ? 'border-input-border-error focus-within:border-input-border-error focus-within:ring-2 focus-within:ring-input-ring-error'
              : 'border-input-border hover:border-input-border-hover focus-within:border-input-border-focus focus-within:ring-2 focus-within:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : ''} ${inputClassName || ''}`}
        >
          {showIcon && (
            <Lock className={`${iconSizeClasses} text-input-text-placeholder flex-shrink-0`} />
          )}
          <input
            ref={forwardedRef}
            id={inputId}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`flex-1 min-w-0 ${sizeClasses} bg-transparent outline-none text-input-text placeholder:text-input-text-placeholder`}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="p-1 -m-0.5 rounded-input-sm hover:bg-input-bg-hover text-input-text-placeholder hover:text-input-text transition-colors duration-150 flex-shrink-0"
          >
            <ToggleIcon className={iconSizeClasses} />
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
