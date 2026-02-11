'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

// ============================================================================
// Option Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  /** If true, renders as a non-clickable group header */
  isGroupHeader?: boolean;
}

// ============================================================================
// Custom Select with Portal Dropdown
// ============================================================================

export interface CustomSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  size?: 'default' | 'sm';
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export function Select({
  className = '',
  label,
  error,
  helperText,
  options,
  placeholder = 'Select an option',
  value,
  onChange,
  required,
  disabled,
  id,
  size = 'default',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<DropdownPosition | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate dropdown position based on trigger button
  const updateDropdownPosition = React.useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Update position when dropdown opens
  React.useLayoutEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen, updateDropdownPosition]);

  // Update position on scroll/resize
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePositionUpdate = () => {
      updateDropdownPosition();
    };

    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideButton = buttonRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideButton && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      } else if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  // Render dropdown via Portal to escape stacking context issues
  const renderDropdown = () => {
    if (!isOpen || !dropdownPosition) return null;

    const dropdown = (
      <div
        ref={dropdownRef}
        role="listbox"
        style={{
          position: 'absolute',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 99999,
          border: '1px solid var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '4px 0',
        }}
      >
        {options.map((option, index) => {
          // Render group headers as non-clickable dividers
          if (option.isGroupHeader) {
            return (
              <div
                key={`header-${option.value}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-disabled)',
                  borderTop: index > 0 ? '1px solid var(--color-border-light)' : undefined,
                  marginTop: index > 0 ? '4px' : undefined,
                  paddingTop: index > 0 ? '8px' : undefined,
                }}
              >
                {option.label}
              </div>
            );
          }

          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(option.value)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                fontSize: size === 'sm' ? '13px' : '14px',
                padding: size === 'sm' ? '6px 12px' : '8px 12px',
                cursor: 'pointer',
                border: 'none',
                background: isSelected
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'transparent',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isSelected
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'transparent';
              }}
            >
              <span>{option.label}</span>
              {isSelected && <CheckIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
            </button>
          );
        })}
      </div>
    );

    // Portal to body to escape stacking contexts
    if (typeof document !== 'undefined') {
      return createPortal(dropdown, document.body);
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-label block mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          type="button"
          id={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="input-field"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            padding: size === 'sm' ? '6px 12px' : undefined,
            fontSize: size === 'sm' ? '13px' : undefined,
            borderColor: isOpen ? 'var(--color-border-accent)' : undefined,
            boxShadow: isOpen ? '0 0 0 3px var(--color-primary-100)' : undefined,
          }}
        >
          <span style={{ color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            className="w-4 h-4"
            style={{
              color: 'var(--color-text-tertiary)',
              transition: 'transform 200ms ease',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              flexShrink: 0,
            }}
          />
        </button>

        {/* Dropdown rendered via Portal */}
        {renderDropdown()}
      </div>

      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

Select.displayName = 'Select';
