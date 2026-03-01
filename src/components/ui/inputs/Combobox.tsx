'use client';

import { useState, useRef, useEffect, useCallback, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label?: string;
  description?: string;
  error?: string;
  options: ComboboxOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  creatable?: boolean;
  loading?: boolean;
  loadingText?: string;
  onInputChange?: (value: string) => void;
  filterOptions?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      label,
      description,
      error,
      options,
      placeholder,
      value = '',
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      creatable = false,
      loading = false,
      loadingText = 'Loading...',
      onInputChange,
      filterOptions = true,
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
    const [inputValue, setInputValue] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0, left: 0, width: 0, maxHeight: 240, openAbove: false,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const maxDropdownHeight = 240;

    useEffect(() => {
      const match = options.find((o) => o.value === value);
      setInputValue(match ? match.label : value);
    }, [value, options]);

    const filteredOptions = filterOptions
      ? (inputValue
        ? options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
        : options)
      : options;

    const showCreateOption = creatable &&
      inputValue.trim() &&
      !options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());

    const totalItems = filteredOptions.length + (showCreateOption ? 1 : 0);

    const findNextEnabled = (from: number, dir: 1 | -1): number => {
      for (let i = 0; i < totalItems; i++) {
        const idx = (from + dir * (i + 1) + totalItems) % totalItems;
        if (idx < filteredOptions.length && filteredOptions[idx].disabled) continue;
        return idx;
      }
      return -1;
    };

    const updatePosition = useCallback(() => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
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
          inputRef.current && !inputRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen || highlightedIndex < 0) return;
      const el = dropdownRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, highlightedIndex]);

    const selectOption = (optionValue: string, optionLabel: string) => {
      onChange?.(optionValue);
      setInputValue(optionLabel);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setIsOpen(true);
      setHighlightedIndex(-1);
      onInputChange?.(val);
      if (creatable) {
        onChange?.(val);
      }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsOpen(true);
      e.target.select();
      onFocus?.(e);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Capture target ref before the async callback - React nullifies synthetic events
      const relatedTarget = e.relatedTarget as Node | null;
      requestAnimationFrame(() => {
        const activeEl = document.activeElement;
        if (
          !dropdownRef.current?.contains(activeEl) &&
          !dropdownRef.current?.contains(relatedTarget)
        ) {
          setIsOpen(false);
          if (!creatable) {
            const match = options.find((o) => o.label.toLowerCase() === inputValue.toLowerCase());
            if (match) {
              onChange?.(match.value);
              setInputValue(match.label);
            } else if (value) {
              const selected = options.find((o) => o.value === value);
              setInputValue(selected ? selected.label : '');
            } else {
              setInputValue('');
            }
          }
          onBlur?.(e);
        }
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(
            highlightedIndex < 0 ? findNextEnabled(-1, 1) : findNextEnabled(highlightedIndex, 1),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(
            highlightedIndex < 0
              ? findNextEnabled(totalItems, -1)
              : findNextEnabled(highlightedIndex, -1),
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            if (highlightedIndex < filteredOptions.length) {
              const opt = filteredOptions[highlightedIndex];
              if (!opt.disabled) selectOption(opt.value, opt.label);
            } else if (showCreateOption) {
              selectOption(inputValue.trim(), inputValue.trim());
            }
          } else if (showCreateOption) {
            selectOption(inputValue.trim(), inputValue.trim());
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
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
            setHighlightedIndex(findNextEnabled(totalItems, -1));
          }
          break;
      }
    };

    const sizeClasses =
      size === 'sm' ? 'py-1.5 text-xs' : size === 'lg' ? 'py-2.5 text-base' : 'py-2 text-sm';
    const paddingLeft = size === 'sm' ? 'pl-2.5' : size === 'lg' ? 'pl-3.5' : 'pl-3';
    const paddingRight = size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-11' : 'pr-9';
    const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

    const highlightedOptionId =
      highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;

    const showNoResults = !loading && totalItems === 0 && inputValue.trim().length > 0;

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

        {name && <input type="hidden" name={name} value={value} />}

        <div className="relative">
          <input
            ref={mergeRefs(inputRef, forwardedRef)}
            id={inputId}
            type="text"
            role="combobox"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Type to search...'}
            autoComplete="off"
            required={required}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={highlightedOptionId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full ${sizeClasses} ${paddingLeft} ${paddingRight} bg-input-bg border rounded-input outline-none transition-all duration-150 text-input-text ${
              error
                ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
                : isOpen
                  ? 'border-input-border-focus ring-2 ring-input-ring'
                  : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : ''} placeholder:text-input-text-placeholder ${inputClassName || ''}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown
              size={chevronSize}
              className={`text-input-text-placeholder transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}

        {isOpen && (totalItems > 0 || loading || showNoResults) && createPortal(
          <div
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
            className="fixed z-[9999] bg-input-bg border border-input-border rounded-input shadow-lg py-1 overflow-auto"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width,
              maxHeight: dropdownPos.maxHeight,
              transform: dropdownPos.openAbove ? 'translateY(-100%)' : undefined,
            }}
          >
            {filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  data-index={index}
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!option.disabled) selectOption(option.value, option.label);
                  }}
                  onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer select-none ${
                    option.disabled
                      ? 'text-input-text-disabled cursor-not-allowed'
                      : isSelected
                        ? 'bg-input-accent-subtle text-input-accent-subtle-fg'
                        : isHighlighted
                          ? 'bg-input-bg-hover text-input-text'
                          : 'text-input-text hover:bg-input-bg-hover'
                  }`}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <Check size={14} className="flex-shrink-0 text-input-accent" />}
                </div>
              );
            })}
            {showCreateOption && (
              <div
                id={`${listboxId}-option-${filteredOptions.length}`}
                role="option"
                data-index={filteredOptions.length}
                aria-selected={false}
                onMouseDown={(e) => { e.preventDefault(); selectOption(inputValue.trim(), inputValue.trim()); }}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer select-none border-t border-input-border-divider ${
                  highlightedIndex === filteredOptions.length
                    ? 'bg-input-bg-hover text-input-text'
                    : 'text-input-text-subtle hover:bg-input-bg-hover'
                }`}
              >
                <span className="flex-1">
                  Create &ldquo;<span className="font-medium">{inputValue.trim()}</span>&rdquo;
                </span>
              </div>
            )}
            {loading && (
              <div className={`flex items-center justify-center gap-2 px-3 py-3 text-sm text-input-text-placeholder${totalItems > 0 ? ' border-t border-input-border-divider' : ''}`}>
                <Loader2 size={14} className="animate-spin flex-shrink-0" />
                <span>{loadingText}</span>
              </div>
            )}
            {showNoResults && (
              <div className="px-3 py-4 text-sm text-input-text-placeholder text-center">No results found</div>
            )}
          </div>,
          document.body,
        )}
      </div>
    );
  },
);

Combobox.displayName = 'Combobox';
