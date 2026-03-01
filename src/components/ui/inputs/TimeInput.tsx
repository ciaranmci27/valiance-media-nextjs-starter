'use client';

import { useState, useRef, useEffect, useCallback, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface TimeInputProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value?: string; // 24h format: "HH:MM"
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  use24Hour?: boolean;
  minuteStep?: number;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseTime(str: string | undefined): { hours: number; minutes: number } | null {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hours: h, minutes: m };
}

function formatDisplay(hours: number, minutes: number, use24Hour: boolean): string {
  if (use24Hour) return `${pad(hours)}:${pad(minutes)}`;
  const period = hours >= 12 ? 'PM' : 'AM';
  const display12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${display12}:${pad(minutes)} ${period}`;
}

export const TimeInput = forwardRef<HTMLButtonElement, TimeInputProps>(
  function TimeInput(
    {
      label,
      description,
      error,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      use24Hour = false,
      minuteStep = 1,
      required,
      name,
      id,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const parsed = parseTime(value);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [editHours, setEditHours] = useState(parsed?.hours ?? 12);
    const [editMinutes, setEditMinutes] = useState(parsed?.minutes ?? 0);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, openAbove: false });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const dropdownHeight = 200;

    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < dropdownHeight + 8 && spaceAbove > spaceBelow;
      const pickerWidth = Math.max(rect.width, 220);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - pickerWidth - 8));
      setDropdownPos({
        top: openAbove ? rect.top - 4 : rect.bottom + 4,
        left,
        width: pickerWidth,
        openAbove,
      });
    }, []);

    useEffect(() => {
      if (!isOpen) return;
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [isOpen, updatePosition]);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current && !triggerRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
          onBlur?.();
        }
      };
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, onBlur]);

    useEffect(() => {
      if (isOpen && parsed) {
        setEditHours(parsed.hours);
        setEditMinutes(parsed.minutes);
      } else if (isOpen && !parsed) {
        setEditHours(12);
        setEditMinutes(0);
      }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const emitChange = (h: number, m: number) => {
      onChange?.(`${pad(h)}:${pad(m)}`);
    };

    const adjustHours = (delta: number) => {
      const next = ((editHours + delta) + 24) % 24;
      setEditHours(next);
      emitChange(next, editMinutes);
    };

    const adjustMinutes = (delta: number) => {
      let next = editMinutes + delta;
      let h = editHours;
      if (next < 0) { next = 60 + next; h = (h - 1 + 24) % 24; }
      if (next >= 60) { next = next - 60; h = (h + 1) % 24; }
      setEditMinutes(next);
      setEditHours(h);
      emitChange(h, next);
    };

    const togglePeriod = () => {
      const next = editHours >= 12 ? editHours - 12 : editHours + 12;
      setEditHours(next);
      emitChange(next, editMinutes);
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    const displayLabel = parsed
      ? formatDisplay(parsed.hours, parsed.minutes, use24Hour)
      : (placeholder || 'Select time...');

    const sizeClasses =
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-3.5 py-2.5 text-base' : 'px-3 py-2 text-sm';
    const clockSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    const colonText = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
    const periodClass = size === 'sm' ? 'px-2 py-1.5 text-xs' : size === 'lg' ? 'px-4 py-2.5 text-base' : 'px-3 py-2 text-sm';
    const presetClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : size === 'lg' ? 'px-2.5 py-1.5 text-sm' : 'px-2 py-1 text-xs';
    const pickerPad = size === 'sm' ? 'p-3' : size === 'lg' ? 'p-5' : 'p-4';

    const display12Hour = editHours === 0 ? 12 : editHours > 12 ? editHours - 12 : editHours;
    const displayHour = use24Hour ? pad(editHours) : String(display12Hour);
    const period = editHours >= 12 ? 'PM' : 'AM';

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

        {name && <input type="hidden" name={name} value={value || ''} />}

        <button
          ref={mergeRefs(triggerRef, forwardedRef)}
          id={inputId}
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          onFocus={onFocus}
          onBlur={() => { if (!isOpen) onBlur?.(); }}
          className={`w-full ${sizeClasses} bg-input-bg border rounded-input outline-none transition-all duration-150 flex items-center justify-between gap-2 text-left ${
            error
              ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
              : isOpen
                ? 'border-input-border-focus ring-2 ring-input-ring'
                : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : 'cursor-pointer'} ${inputClassName || ''}`}
        >
          <span className={`truncate ${parsed ? 'text-input-text' : 'text-input-text-placeholder'}`}>
            {displayLabel}
          </span>
          <Clock size={clockSize} className="flex-shrink-0 text-input-text-placeholder" />
        </button>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            role="dialog"
            aria-label="Time picker"
            className={`fixed z-[9999] bg-input-bg border border-input-border rounded-input shadow-lg ${pickerPad}`}
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              transform: dropdownPos.openAbove ? 'translateY(-100%)' : undefined,
            }}
          >
            <div className="flex items-center justify-center gap-1">
              <SpinnerColumn
                value={displayHour}
                onIncrement={() => adjustHours(1)}
                onDecrement={() => adjustHours(-1)}
                ariaLabel="Hours"
                size={size}
              />

              <span className={`${colonText} font-semibold text-input-text-placeholder px-0.5 select-none`}>:</span>

              <SpinnerColumn
                value={pad(editMinutes)}
                onIncrement={() => adjustMinutes(minuteStep)}
                onDecrement={() => adjustMinutes(-minuteStep)}
                ariaLabel="Minutes"
                size={size}
              />

              {!use24Hour && (
                <button
                  type="button"
                  onClick={togglePeriod}
                  className={`ml-2 ${periodClass} font-semibold rounded-input-sm bg-input-bg-hover hover:bg-input-bg-active text-input-text transition-colors duration-150 select-none`}
                  aria-label={`Toggle AM/PM, currently ${period}`}
                >
                  {period}
                </button>
              )}
            </div>

            <div className="flex gap-1.5 mt-3 pt-3 border-t border-input-border-divider justify-center flex-wrap">
              {(use24Hour
                ? ['09:00', '12:00', '15:00', '18:00']
                : ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']
              ).map((preset) => {
                const [hStr, rest] = preset.split(':');
                const isPM = preset.includes('PM');
                let h = parseInt(hStr);
                if (!use24Hour) {
                  if (isPM && h !== 12) h += 12;
                  if (!isPM && h === 12) h = 0;
                }
                const m = parseInt(rest);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setEditHours(h);
                      setEditMinutes(m);
                      emitChange(h, m);
                    }}
                    className={`${presetClass} rounded-input-sm bg-input-bg-hover hover:bg-input-accent-subtle text-input-text-subtle hover:text-input-accent-subtle-fg transition-colors duration-150`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
      </div>
    );
  },
);

TimeInput.displayName = 'TimeInput';

// Internal spinner column

function SpinnerColumn({
  value,
  onIncrement,
  onDecrement,
  ariaLabel,
  size = 'default',
}: {
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  ariaLabel: string;
  size?: 'default' | 'sm' | 'lg';
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); onIncrement(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); onDecrement(); }
  };

  const btnPad = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-2.5' : 'p-2';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const valueClass = size === 'sm' ? 'w-10 text-lg' : size === 'lg' ? 'w-14 text-2xl' : 'w-12 text-xl';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        tabIndex={-1}
        onClick={onIncrement}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={`Increase ${ariaLabel}`}
        className={`${btnPad} rounded-input-sm hover:bg-input-bg-hover text-input-text-placeholder hover:text-input-text transition-colors duration-150`}
      >
        <ChevronUp size={iconSize} />
      </button>
      <div
        role="spinbutton"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuenow={parseInt(value)}
        onKeyDown={handleKeyDown}
        className={`${valueClass} text-center font-semibold text-input-text py-1 rounded-input-sm bg-input-bg-hover select-none outline-none focus-visible:ring-2 focus-visible:ring-input-ring`}
      >
        {value}
      </div>
      <button
        type="button"
        tabIndex={-1}
        onClick={onDecrement}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={`Decrease ${ariaLabel}`}
        className={`${btnPad} rounded-input-sm hover:bg-input-bg-hover text-input-text-placeholder hover:text-input-text transition-colors duration-150`}
      >
        <ChevronDown size={iconSize} />
      </button>
    </div>
  );
}
