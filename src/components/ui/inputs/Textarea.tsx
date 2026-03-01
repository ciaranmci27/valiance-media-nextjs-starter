'use client';

import { useRef, useEffect, useCallback, useId, forwardRef } from 'react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface TextareaProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
  resizable?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  spellCheck?: boolean;
  className?: string;
  inputClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      description,
      error,
      placeholder,
      value = '',
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      disabled = false,
      size = 'default',
      rows = 4,
      maxLength,
      showCharCount = false,
      autoResize = false,
      resizable = false,
      name,
      id,
      autoFocus,
      readOnly,
      required,
      spellCheck,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    const adjustHeight = useCallback(() => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    const sizeClasses =
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-3.5 py-2.5 text-base' : 'px-3 py-2 text-sm';

    const showCounter = showCharCount || maxLength !== undefined;
    const charCount = value.length;
    const isNearLimit = maxLength !== undefined && charCount >= maxLength * 0.9;
    const isOverLimit = maxLength !== undefined && charCount > maxLength;

    const resizeClass = autoResize ? 'resize-none' : resizable ? 'resize-y' : 'resize-none';

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {(label || showCounter) && (
          <div className="flex items-center justify-between gap-2">
            {label ? (
              <label htmlFor={inputId} className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}>
                {label}
              </label>
            ) : <span />}
            {showCounter && (
              <p
                className={`text-xs flex-shrink-0 mb-0 text-input-text-subtle ${
                  isOverLimit ? 'text-input-error font-medium' : isNearLimit ? 'text-input-warning' : 'text-input-text-placeholder'
                }`}
              >
                {charCount}
                {maxLength !== undefined ? `/${maxLength}` : ''}
              </p>
            )}
          </div>
        )}
        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}
        <textarea
          ref={mergeRefs(internalRef, forwardedRef)}
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
          spellCheck={spellCheck}
          rows={autoResize ? 1 : rows}
          aria-invalid={error || isOverLimit ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full ${sizeClasses} bg-input-bg border rounded-input outline-none transition-all duration-150 text-input-text ${resizeClass} ${
            error || isOverLimit
              ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
              : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : ''} ${
            readOnly ? 'bg-input-bg-disabled cursor-default' : ''
          } placeholder:text-input-text-placeholder ${inputClassName || ''}`}
          style={autoResize ? { overflow: 'hidden', minHeight: `${rows * 1.5 + 1}rem` } : undefined}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
