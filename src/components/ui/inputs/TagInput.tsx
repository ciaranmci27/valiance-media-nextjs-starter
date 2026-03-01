'use client';

import { useState, useRef, useId, forwardRef } from 'react';
import { X } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface TagInputProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  maxTags?: number;
  allowDuplicates?: boolean;
  delimiter?: string;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(
    {
      label,
      description,
      error,
      placeholder,
      value = [],
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      maxTags,
      allowDuplicates = false,
      delimiter = ',',
      required,
      name,
      id,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    const atMax = maxTags !== undefined && value.length >= maxTags;

    const addTag = (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (!allowDuplicates && value.includes(tag)) return;
      if (atMax) return;
      onChange?.([...value, tag]);
    };

    const removeTag = (index: number) => {
      if (disabled) return;
      const next = [...value];
      next.splice(index, 1);
      onChange?.(next);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === delimiter) {
        e.preventDefault();
        addTag(inputValue);
        setInputValue('');
        return;
      }

      if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
        e.preventDefault();
        removeTag(value.length - 1);
        return;
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (pasted.includes(delimiter)) {
        e.preventDefault();
        const tags = pasted.split(delimiter).map((t) => t.trim()).filter(Boolean);
        let next = [...value];
        for (const tag of tags) {
          if (maxTags !== undefined && next.length >= maxTags) break;
          if (!allowDuplicates && next.includes(tag)) continue;
          next.push(tag);
        }
        onChange?.(next);
        setInputValue('');
      }
    };

    const handleBlur = () => {
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue('');
      }
      setIsFocused(false);
      onBlur?.();
    };

    const handleContainerClick = () => {
      internalRef.current?.focus();
    };

    const sizeClasses =
      size === 'sm' ? 'px-2.5 py-1.5' : size === 'lg' ? 'px-3.5 py-2.5' : 'px-3 py-2';
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
    const chipPadding =
      size === 'sm' ? 'px-1.5 py-0.5' : size === 'lg' ? 'px-2.5 py-1' : 'px-2 py-0.5';
    const minHeight =
      size === 'sm' ? 'min-h-[30px]' : size === 'lg' ? 'min-h-[46px]' : 'min-h-[38px]';

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

        {name && <input type="hidden" name={name} value={value.join(delimiter)} />}

        <div
          onClick={handleContainerClick}
          className={`w-full ${sizeClasses} bg-input-bg border rounded-input transition-all duration-150 flex flex-wrap items-center gap-1.5 ${minHeight} ${
            error
              ? 'border-input-border-error focus-within:border-input-border-error focus-within:ring-2 focus-within:ring-input-ring-error'
              : isFocused
                ? 'border-input-border-focus ring-2 ring-input-ring'
                : 'border-input-border hover:border-input-border-hover'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : 'cursor-text'} ${inputClassName || ''}`}
        >
          {value.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className={`inline-flex items-center gap-1 ${chipPadding} ${textSize} bg-input-accent-subtle text-input-accent-subtle-fg rounded-input-sm font-medium select-none`}
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                  aria-label={`Remove ${tag}`}
                  className="p-0.5 rounded-input-sm hover:bg-input-accent/20 text-input-accent hover:text-input-accent-subtle-fg transition-colors duration-150"
                >
                  <X size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />
                </button>
              )}
            </span>
          ))}
          {!atMax && (
            <input
              ref={mergeRefs(internalRef, forwardedRef)}
              id={inputId}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onPaste={handlePaste}
              onFocus={() => { setIsFocused(true); onFocus?.(); }}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder={value.length === 0 ? (placeholder || 'Type and press Enter...') : ''}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              aria-required={required}
              className={`flex-1 min-w-[80px] ${textSize} bg-transparent outline-none text-input-text placeholder:text-input-text-placeholder`}
            />
          )}
        </div>

        {(error || maxTags !== undefined) && (
          <div className="flex items-start justify-between gap-2">
            {error ? (
              <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
            ) : (
              <span />
            )}
            {maxTags !== undefined && (
              <p className={`text-xs flex-shrink-0 ${value.length >= maxTags ? 'text-input-warning' : 'text-input-text-placeholder'}`}>
                {value.length}/{maxTags}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

TagInput.displayName = 'TagInput';
