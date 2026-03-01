'use client';

import { useRef, useId, forwardRef, useImperativeHandle } from 'react';
import { labelSizeClass } from './_shared';

export interface OTPInputProps {
  label?: string;
  description?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  length?: number;
  mask?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export interface OTPInputRef {
  focus: () => void;
  clear: () => void;
}

export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
  function OTPInput(
    {
      label,
      description,
      error,
      value = '',
      onChange,
      onComplete,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      length = 6,
      mask = false,
      required,
      name,
      id,
      className,
      inputClassName,
      autoFocus,
    },
    forwardedRef,
  ) {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(forwardedRef, () => ({
      focus: () => inputRefs.current[0]?.focus(),
      clear: () => {
        onChange?.('');
        inputRefs.current[0]?.focus();
      },
    }));

    const chars = value.split('').slice(0, length);
    while (chars.length < length) chars.push('');

    const focusIndex = (i: number) => {
      const clamped = Math.max(0, Math.min(i, length - 1));
      inputRefs.current[clamped]?.focus();
      inputRefs.current[clamped]?.select();
    };

    const updateValue = (newChars: string[]) => {
      const next = newChars.join('').slice(0, length);
      onChange?.(next);
      if (next.length === length) {
        onComplete?.(next);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const input = e.target.value;
      const digit = input.replace(/\D/g, '').slice(-1);
      if (!digit) return;

      const next = [...chars];
      next[index] = digit;
      updateValue(next);

      if (index < length - 1) {
        focusIndex(index + 1);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      switch (e.key) {
        case 'Backspace':
          e.preventDefault();
          if (chars[index]) {
            const next = [...chars];
            next[index] = '';
            updateValue(next);
          } else if (index > 0) {
            const next = [...chars];
            next[index - 1] = '';
            updateValue(next);
            focusIndex(index - 1);
          }
          break;
        case 'Delete':
          e.preventDefault();
          if (chars[index]) {
            const next = [...chars];
            next[index] = '';
            updateValue(next);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) focusIndex(index - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (index < length - 1) focusIndex(index + 1);
          break;
        case 'Home':
          e.preventDefault();
          focusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          focusIndex(length - 1);
          break;
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
      if (!pasted) return;

      const next = [...chars];
      for (let i = 0; i < pasted.length && index + i < length; i++) {
        next[index + i] = pasted[i];
      }
      updateValue(next);

      const nextEmpty = next.findIndex((c, i) => i >= index && !c);
      focusIndex(nextEmpty >= 0 ? nextEmpty : Math.min(index + pasted.length, length - 1));
    };

    const handleFocus = (index: number) => {
      inputRefs.current[index]?.select();
      if (index === 0) onFocus?.();
    };

    const handleBlur = (index: number) => {
      setTimeout(() => {
        const focused = document.activeElement;
        const isStillInGroup = inputRefs.current.some((ref) => ref === focused);
        if (!isStillInGroup) onBlur?.();
      }, 0);
    };

    const boxSize =
      size === 'sm'
        ? 'h-9 w-9 text-sm'
        : size === 'lg'
          ? 'h-14 w-14 text-xl'
          : 'h-11 w-11 text-lg';

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {label && (
          <label id={`${inputId}-label`} className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}>
            {label}
          </label>
        )}
        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}

        {name && <input type="hidden" name={name} value={value} />}

        <div
          role="group"
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-describedby={describedBy}
          className="flex items-center gap-2"
        >
          {chars.map((char, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type={mask ? 'password' : 'text'}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus={autoFocus && i === 0}
              value={char}
              disabled={disabled}
              aria-required={required && i === 0}
              aria-invalid={error ? true : undefined}
              aria-label={`Digit ${i + 1} of ${length}`}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={(e) => handlePaste(e, i)}
              onFocus={() => handleFocus(i)}
              onBlur={() => handleBlur(i)}
              className={`${boxSize} text-center font-semibold bg-input-bg border rounded-input outline-none transition-all duration-150 text-input-text ${
                error
                  ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
                  : char
                    ? 'border-input-accent/50 focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
                    : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
              } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : ''} ${inputClassName || ''}`}
            />
          ))}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}
      </div>
    );
  },
);

OTPInput.displayName = 'OTPInput';
