'use client';

import { useRef, useCallback, useEffect, useId, forwardRef } from 'react';
import { labelSizeClass } from './_shared';

export interface SliderProps {
  label?: string;
  description?: string;
  error?: string;
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    {
      label,
      description,
      error,
      value = 0,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      min = 0,
      max = 100,
      step = 1,
      showValue = false,
      formatValue,
      required,
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
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      return () => { cleanupRef.current?.(); };
    }, []);

    const clamp = (val: number): number => {
      const stepped = Math.round(val / step) * step;
      // Fix floating-point artifacts (e.g. 0.1 * 3 = 0.30000000000000004)
      const decimals = (String(step).split('.')[1] || '').length;
      const fixed = decimals > 0 ? parseFloat(stepped.toFixed(decimals)) : stepped;
      return Math.max(min, Math.min(max, fixed));
    };

    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    const displayValue = formatValue ? formatValue(value) : String(value);

    const getValueFromPosition = useCallback((clientX: number): number => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return clamp(min + ratio * (max - min));
    }, [min, max, step, value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      isDragging.current = true;
      const newValue = getValueFromPosition(e.clientX);
      onChange?.(newValue);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const v = getValueFromPosition(moveEvent.clientX);
        onChange?.(v);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        cleanupRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        onBlur?.();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      cleanupRef.current = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return;
      isDragging.current = true;
      const touch = e.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      onChange?.(newValue);

      const handleTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        const t = moveEvent.touches[0];
        const v = getValueFromPosition(t.clientX);
        onChange?.(v);
      };

      const handleTouchEnd = () => {
        isDragging.current = false;
        cleanupRef.current = null;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        onBlur?.();
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      cleanupRef.current = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      let newValue = value;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = clamp(value + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = clamp(value - step);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        case 'PageUp':
          e.preventDefault();
          newValue = clamp(value + step * 10);
          break;
        case 'PageDown':
          e.preventDefault();
          newValue = clamp(value - step * 10);
          break;
        default:
          return;
      }
      onChange?.(newValue);
    };

    const trackHeight =
      size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2' : 'h-1.5';
    const thumbSize =
      size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const thumbOffset =
      size === 'sm' ? '-8px' : size === 'lg' ? '-12px' : '-10px';

    return (
      <div ref={forwardedRef} className={`space-y-1.5 ${className || ''}`}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label id={`${inputId}-label`} className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}>
                {label}
              </label>
            )}
            {showValue && (
              <span className={`${labelSizeClass(size)} font-medium text-input-text tabular-nums`}>
                {displayValue}
              </span>
            )}
          </div>
        )}
        {description && (
          <p id={descId} className="text-xs text-input-text-subtle">{description}</p>
        )}

        {name && <input type="hidden" name={name} value={value} />}

        <div
          ref={trackRef}
          className={`relative w-full py-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${inputClassName || ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className={`w-full ${trackHeight} rounded-full bg-input-bg-inset`}>
            <div
              className={`${trackHeight} rounded-full transition-all ${
                error ? 'bg-input-border-error' : 'bg-input-accent'
              } ${isDragging.current ? '' : 'duration-150'}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={displayValue}
            aria-labelledby={label ? `${inputId}-label` : undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            aria-required={required}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`absolute top-1/2 -translate-y-1/2 ${thumbSize} rounded-full bg-input-bg border-2 shadow-sm outline-none transition-all ${
              error
                ? 'border-input-border-error focus-visible:ring-2 focus-visible:ring-input-ring-error'
                : 'border-input-accent focus-visible:ring-2 focus-visible:ring-input-ring'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110'} ${
              isDragging.current ? '' : 'duration-150'
            }`}
            style={{
              left: `${percent}%`,
              marginLeft: thumbOffset,
            }}
          />
        </div>

        <div className="flex justify-between">
          <span className="text-xs text-input-text-placeholder">{formatValue ? formatValue(min) : min}</span>
          <span className="text-xs text-input-text-placeholder">{formatValue ? formatValue(max) : max}</span>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
