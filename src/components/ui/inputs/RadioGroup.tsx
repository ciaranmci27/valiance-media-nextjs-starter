'use client';

import { useRef, useEffect, useId, forwardRef } from 'react';
import { injectAnimations, labelSizeClass } from './_shared';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  description?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  direction?: 'vertical' | 'horizontal';
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      label,
      description,
      error,
      options,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      direction = 'vertical',
      required,
      name,
      id,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const autoId = useId();
    const groupId = id || autoId;
    const errorId = error ? `${groupId}-error` : undefined;
    const descId = description ? `${groupId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
      injectAnimations();
    }, []);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      onChange?.(optionValue);
    };

    const findNextEnabled = (from: number, direction: 1 | -1): number => {
      for (let i = 0; i < options.length; i++) {
        const idx = (from + direction * (i + 1) + options.length) % options.length;
        if (!options[idx].disabled && !disabled) return idx;
      }
      return -1;
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!options[index].disabled) handleSelect(options[index].value);
        return;
      }

      let nextIndex = -1;
      const isVertical = direction === 'vertical';

      if ((isVertical && e.key === 'ArrowDown') || (!isVertical && e.key === 'ArrowRight')) {
        nextIndex = findNextEnabled(index, 1);
      } else if ((isVertical && e.key === 'ArrowUp') || (!isVertical && e.key === 'ArrowLeft')) {
        nextIndex = findNextEnabled(index, -1);
      } else if (e.key === 'Home') {
        nextIndex = findNextEnabled(-1, 1);
      } else if (e.key === 'End') {
        nextIndex = findNextEnabled(options.length, -1);
      }

      if (nextIndex >= 0) {
        e.preventDefault();
        handleSelect(options[nextIndex].value);
        optionRefs.current[nextIndex]?.focus();
      }
    };

    const outerSize =
      size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const dotSize =
      size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2';

    return (
      <div ref={forwardedRef} className={`space-y-1.5 ${className || ''}`}>
        {label && (
          <span id={`${groupId}-label`} className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}>
            {label}
          </span>
        )}
        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}

        {name && <input type="hidden" name={name} value={value || ''} />}

        <div
          role="radiogroup"
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`flex ${direction === 'vertical' ? 'flex-col gap-2.5' : 'flex-row flex-wrap gap-4'} ${inputClassName || ''}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isOptionDisabled = disabled || option.disabled;
            const isTabbable =
              isSelected ||
              (!value && index === options.findIndex((o) => !o.disabled && !disabled));

            return (
              <button
                key={option.value}
                ref={(el) => { optionRefs.current[index] = el; }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={isOptionDisabled}
                disabled={isOptionDisabled}
                tabIndex={isOptionDisabled ? -1 : isTabbable ? 0 : -1}
                onClick={() => !isOptionDisabled && handleSelect(option.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`inline-flex items-center gap-2.5 select-none outline-none rounded-sm ${
                  isOptionDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } focus-visible:ring-2 focus-visible:ring-input-ring focus-visible:ring-offset-1`}
              >
                <span
                  className={`relative inline-flex items-center justify-center ${outerSize} rounded-full border-2 transition-all duration-150 flex-shrink-0 ${
                    isSelected
                      ? 'border-input-accent'
                      : error
                        ? 'border-input-border-error'
                        : 'border-input-bg-inset hover:border-input-border-hover'
                  }`}
                >
                  {isSelected && (
                    <span
                      className={`${dotSize} rounded-full bg-input-accent`}
                      style={{ animation: 'ui-radio-pop 150ms ease-out' }}
                    />
                  )}
                </span>
                <span className={`${labelSizeClass(size)} text-input-text-label leading-none`}>
                  {option.label}
                </span>
              </button>
            );
          })}
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

RadioGroup.displayName = 'RadioGroup';
