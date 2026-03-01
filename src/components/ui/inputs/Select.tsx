'use client';

import { useState, useRef, useEffect, useCallback, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface SelectProps {
  label?: string;
  description?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      description,
      error,
      options,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
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
    const listboxId = `${inputId}-listbox`;

    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: 240,
      openAbove: false,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);
    const selectedIndex = options.findIndex((o) => o.value === value);
    const displayLabel = selectedOption?.label || placeholder || 'Select...';
    const maxDropdownHeight = 240;

    const findNextEnabled = (from: number, direction: 1 | -1): number => {
      let idx = from;
      for (let i = 0; i < options.length; i++) {
        idx = (idx + direction + options.length) % options.length;
        if (!options[idx].disabled) return idx;
      }
      return -1;
    };

    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < maxDropdownHeight + 8 && spaceAbove > spaceBelow;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
      setDropdownPos({
        top: openAbove ? rect.top - 4 : rect.bottom + 4,
        left,
        width: rect.width,
        maxHeight: openAbove
          ? Math.min(maxDropdownHeight, spaceAbove - 8)
          : Math.min(maxDropdownHeight, spaceBelow - 8),
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
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
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
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen || highlightedIndex < 0) return;
      const el = dropdownRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, highlightedIndex]);

    const openDropdown = () => {
      if (disabled) return;
      setIsOpen(true);
      const startIndex = selectedIndex >= 0 ? selectedIndex : findNextEnabled(-1, 1);
      setHighlightedIndex(startIndex);
    };

    const closeDropdown = () => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      closeDropdown();
      triggerRef.current?.focus();
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          } else if (highlightedIndex >= 0) {
            if (e.key === 'Enter' || e.key === ' ') {
              handleSelect(options[highlightedIndex].value);
            } else {
              setHighlightedIndex(findNextEnabled(highlightedIndex, 1));
            }
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
          } else if (highlightedIndex >= 0) {
            setHighlightedIndex(findNextEnabled(highlightedIndex, -1));
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            setHighlightedIndex(findNextEnabled(-1, 1));
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            setHighlightedIndex(findNextEnabled(options.length, -1));
          }
          break;
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            closeDropdown();
          }
          break;
        default:
          if (isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const char = e.key.toLowerCase();
            const startFrom = highlightedIndex >= 0 ? highlightedIndex + 1 : 0;
            for (let i = 0; i < options.length; i++) {
              const idx = (startFrom + i) % options.length;
              if (!options[idx].disabled && options[idx].label.toLowerCase().startsWith(char)) {
                setHighlightedIndex(idx);
                break;
              }
            }
          }
      }
    };

    const handleTriggerBlur = () => {
      setTimeout(() => {
        if (
          !dropdownRef.current?.contains(document.activeElement) &&
          !triggerRef.current?.contains(document.activeElement)
        ) {
          closeDropdown();
          onBlur?.();
        }
      }, 0);
    };

    const sizeClasses =
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-3.5 py-2.5 text-base' : 'px-3 py-2 text-sm';
    const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

    const highlightedOptionId =
      highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;

    return (
      <div className={`space-y-1.5 ${className || ''}`}>
        {label && (
          <label
            id={`${inputId}-label`}
            htmlFor={inputId}
            className={`block ${labelSizeClass(size)} font-medium text-input-text-label`}
          >
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
          role="combobox"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={highlightedOptionId}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          onClick={() => (isOpen ? closeDropdown() : openDropdown())}
          onKeyDown={handleTriggerKeyDown}
          onFocus={onFocus}
          onBlur={handleTriggerBlur}
          className={`w-full ${sizeClasses} bg-input-bg border rounded-input outline-none transition-all duration-150 flex items-center justify-between gap-2 text-left ${
            error
              ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
              : isOpen
                ? 'border-input-border-focus ring-2 ring-input-ring'
                : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : 'cursor-pointer'} ${inputClassName || ''}`}
        >
          <span className={`truncate ${selectedOption ? 'text-input-text' : 'text-input-text-placeholder'}`}>
            {displayLabel}
          </span>
          <ChevronDown
            size={chevronSize}
            className={`flex-shrink-0 text-input-text-placeholder transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">
            {error}
          </p>
        )}

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={label ? `${inputId}-label` : undefined}
              className="fixed z-[9999] bg-input-bg border border-input-border rounded-input shadow-lg py-1 overflow-auto"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: dropdownPos.width,
                maxHeight: dropdownPos.maxHeight,
                transform: dropdownPos.openAbove ? 'translateY(-100%)' : undefined,
              }}
            >
              {options.length === 0 ? (
                <div className="px-3 py-4 text-sm text-input-text-placeholder text-center">No options available</div>
              ) : (
                options.map((option, index) => {
                  const isSelected = option.value === value;
                  const isHighlighted = index === highlightedIndex;
                  const isDisabled = option.disabled;
                  return (
                    <div
                      key={option.value}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      data-index={index}
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!isDisabled) handleSelect(option.value);
                      }}
                      onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer select-none ${
                        isDisabled
                          ? 'text-input-text-disabled cursor-not-allowed'
                          : isSelected
                            ? 'bg-input-accent-subtle text-input-accent-subtle-fg'
                            : isHighlighted
                              ? 'bg-input-bg-hover text-input-text'
                              : 'text-input-text hover:bg-input-bg-hover'
                      }`}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <Check size={14} className="flex-shrink-0 text-input-accent" />
                      )}
                    </div>
                  );
                })
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

Select.displayName = 'Select';
