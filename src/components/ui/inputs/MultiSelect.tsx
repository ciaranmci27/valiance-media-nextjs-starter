'use client';

import { useState, useRef, useEffect, useCallback, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { mergeRefs, labelSizeClass } from './_shared';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  description?: string;
  error?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  searchable?: boolean;
  selectAll?: boolean;
  maxSelections?: number;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  function MultiSelect(
    {
      label,
      description,
      error,
      options,
      placeholder,
      value = [],
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      searchable = true,
      selectAll = false,
      maxSelections,
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
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0, left: 0, width: 0, maxHeight: 280, openAbove: false,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const maxDropdownHeight = 280;

    const filteredOptions = search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

    const enabledFiltered = filteredOptions.filter((o) => !o.disabled);
    const allSelected = enabledFiltered.length > 0 && enabledFiltered.every((o) => value.includes(o.value));
    const atMax = maxSelections !== undefined && value.length >= maxSelections;

    const selectedLabels = value
      .map((v) => options.find((o) => o.value === v)?.label)
      .filter(Boolean);

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
      if (isOpen && searchable) {
        setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (isOpen) {
        setSearch('');
        setHighlightedIndex(-1);
      }
    }, [isOpen, searchable]);

    useEffect(() => {
      if (!isOpen || highlightedIndex < 0) return;
      const el = dropdownRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, highlightedIndex]);

    const toggleOption = (optionValue: string) => {
      const isSelected = value.includes(optionValue);
      if (isSelected) {
        onChange?.(value.filter((v) => v !== optionValue));
      } else {
        if (atMax) return;
        onChange?.([...value, optionValue]);
      }
    };

    const handleSelectAll = () => {
      if (allSelected) {
        const enabledValues = new Set(enabledFiltered.map((o) => o.value));
        onChange?.(value.filter((v) => !enabledValues.has(v)));
      } else {
        const current = new Set(value);
        for (const o of enabledFiltered) {
          if (maxSelections !== undefined && current.size >= maxSelections) break;
          current.add(o.value);
        }
        onChange?.([...current]);
      }
    };

    const removeChip = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(value.filter((v) => v !== optionValue));
    };

    const findNextEnabled = (from: number, dir: 1 | -1): number => {
      for (let i = 0; i < filteredOptions.length; i++) {
        const idx = (from + dir * (i + 1) + filteredOptions.length) % filteredOptions.length;
        if (!filteredOptions[idx].disabled) return idx;
      }
      return -1;
    };

    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(
            highlightedIndex < 0
              ? findNextEnabled(-1, 1)
              : findNextEnabled(highlightedIndex, 1),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(
            highlightedIndex < 0
              ? findNextEnabled(filteredOptions.length, -1)
              : findNextEnabled(highlightedIndex, -1),
          );
          break;
        case 'Enter':
        case ' ':
          if ((highlightedIndex >= 0 && !e.currentTarget.contains(searchRef.current)) || e.key === 'Enter') {
            if (e.key === ' ' && searchable && document.activeElement === searchRef.current) return;
            e.preventDefault();
            if (highlightedIndex >= 0 && !filteredOptions[highlightedIndex].disabled) {
              toggleOption(filteredOptions[highlightedIndex].value);
            }
          }
          break;
        case 'Home':
          e.preventDefault();
          setHighlightedIndex(findNextEnabled(-1, 1));
          break;
        case 'End':
          e.preventDefault();
          setHighlightedIndex(findNextEnabled(filteredOptions.length, -1));
          break;
      }
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    const sizeClasses =
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-3.5 py-2.5 text-base' : 'px-3 py-2 text-sm';
    const chipSize =
      size === 'sm' ? 'text-xs px-1.5 py-0' : size === 'lg' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5';
    const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    const minHeight =
      size === 'sm' ? 'min-h-[30px]' : size === 'lg' ? 'min-h-[46px]' : 'min-h-[38px]';

    const highlightedOptionId =
      highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;

    const displayContent = value.length === 0
      ? <span className="text-input-text-placeholder">{placeholder || 'Select...'}</span>
      : (
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.slice(0, 3).map((lbl, i) => (
            <span
              key={value[i]}
              className={`inline-flex items-center gap-1 ${chipSize} bg-input-accent-subtle text-input-accent-subtle-fg rounded-input-sm font-medium`}
            >
              <span className="truncate max-w-[100px]">{lbl}</span>
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => removeChip(value[i], e)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeChip(value[i], e as any); } }}
                aria-label={`Remove ${lbl}`}
                className="p-0.5 -mr-0.5 rounded-input-sm hover:bg-input-accent/20 hover:text-input-accent-subtle-fg transition-colors cursor-pointer"
              >
                <X size={10} />
              </span>
            </span>
          ))}
          {selectedLabels.length > 3 && (
            <span className={`${chipSize} text-input-text-subtle`}>
              +{selectedLabels.length - 3} more
            </span>
          )}
        </div>
      );

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

        {name && value.map((v) => (
          <input key={v} type="hidden" name={name} value={v} />
        ))}

        <button
          ref={mergeRefs(triggerRef, forwardedRef)}
          id={inputId}
          type="button"
          role="combobox"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={isOpen ? highlightedOptionId : undefined}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          onFocus={onFocus}
          onBlur={() => { if (!isOpen) onBlur?.(); }}
          className={`w-full ${sizeClasses} bg-input-bg border rounded-input outline-none transition-all duration-150 flex items-center justify-between gap-2 text-left ${minHeight} ${
            error
              ? 'border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
              : isOpen
                ? 'border-input-border-focus ring-2 ring-input-ring'
                : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-input-bg-disabled' : 'cursor-pointer'} ${inputClassName || ''}`}
        >
          {displayContent}
          <ChevronDown
            size={chevronSize}
            className={`flex-shrink-0 text-input-text-placeholder transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-input-error">{error}</p>
        )}

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={label ? `${inputId}-label` : undefined}
            onKeyDown={handleDropdownKeyDown}
            className="fixed z-[9999] bg-input-bg border border-input-border rounded-input shadow-lg overflow-hidden"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width,
              maxHeight: dropdownPos.maxHeight,
              transform: dropdownPos.openAbove ? 'translateY(-100%)' : undefined,
            }}
          >
            {searchable && (
              <div className="p-2 border-b border-input-border-divider">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-input-text-placeholder" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(-1); }}
                    placeholder="Search..."
                    aria-activedescendant={highlightedOptionId}
                    aria-controls={listboxId}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-input-bg-hover border border-input-border rounded-input-sm outline-none focus:border-input-border-focus focus:ring-1 focus:ring-input-ring text-input-text placeholder:text-input-text-placeholder"
                  />
                </div>
              </div>
            )}

            {selectAll && !search && (
              <div
                onMouseDown={(e) => { e.preventDefault(); handleSelectAll(); }}
                className="flex items-center gap-2 px-3 py-2 text-sm border-b border-input-border-divider cursor-pointer hover:bg-input-bg-hover transition-colors"
              >
                <span className={`inline-flex items-center justify-center h-4 w-4 rounded border-2 transition-all duration-150 ${
                  allSelected ? 'bg-input-accent border-input-accent' : 'border-input-bg-inset'
                }`}>
                  {allSelected && <Check size={10} strokeWidth={3} className="text-input-accent-fg" />}
                </span>
                <span className="text-input-text font-medium">Select all</span>
              </div>
            )}

            <div className="overflow-auto" style={{ maxHeight: Math.max(80, dropdownPos.maxHeight - (searchable ? 56 : 0) - (selectAll && !search ? 40 : 0)) }}>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-sm text-input-text-placeholder text-center">No options found</div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  const isHighlighted = index === highlightedIndex;
                  const isDisabled = option.disabled || (!isSelected && atMax);
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
                        if (!isDisabled) toggleOption(option.value);
                      }}
                      onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer select-none ${
                        isDisabled
                          ? 'text-input-text-disabled cursor-not-allowed'
                          : isHighlighted
                            ? 'bg-input-bg-hover text-input-text'
                            : 'text-input-text hover:bg-input-bg-hover'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center h-4 w-4 rounded border-2 transition-all duration-150 flex-shrink-0 ${
                        isSelected ? 'bg-input-accent border-input-accent' : isDisabled ? 'border-input-border' : 'border-input-bg-inset'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} className="text-input-accent-fg" />}
                      </span>
                      <span className="flex-1">{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>

            {maxSelections !== undefined && (
              <div className="px-3 py-1.5 border-t border-input-border-divider text-xs text-input-text-placeholder text-right">
                {value.length}/{maxSelections} selected
              </div>
            )}
          </div>,
          document.body,
        )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
