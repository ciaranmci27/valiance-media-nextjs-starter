'use client';

import { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  presets?: string[];
}

const DEFAULT_PRESETS: string[] = [
  'general',
  'about',
  'services',
  'portfolio',
  'case-studies',
  'blog',
  'contact',
  'legal',
  'privacy',
  'terms',
  'resources',
  'marketing',
  'sales',
  'support',
  'product',
  'engineering',
  'design',
  'careers',
  'events',
  'press',
  'docs',
  'faq',
  'landing',
  'feature',
  'pricing',
  'testimonial',
  'webinar',
  'ebook',
  'template'
];

export default function CategoryInput({ value, onChange, placeholder = 'Select or type a category…', presets = DEFAULT_PRESETS }: CategoryInputProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing categories from pages API
  useEffect(() => {
    fetch('/api/admin/pages')
      .then(res => res.json())
      .then(data => {
        const categories: string[] = Array.from(
          new Set(
            (data.pages || [])
              .map((p: any) => p.category)
              .filter((c: string | undefined) => typeof c === 'string' && c.trim() !== '')
          )
        );
        setExistingCategories(categories);
      })
      .catch(() => {
        // Ignore fetch errors; presets will still work
      });
  }, []);

  // Compute unified, unique list of categories
  const allCategories = useMemo(() => {
    return Array.from(new Set([...(presets || []), ...existingCategories]))
      .sort((a, b) => a.localeCompare(b));
  }, [existingCategories, presets]);

  const filtered = useMemo(() => {
    const needle = (inputValue || '').toLowerCase().trim();
    if (!needle) return allCategories.filter(c => c !== value);
    return allCategories.filter(c => c.toLowerCase().includes(needle) && c !== value);
  }, [inputValue, allCategories, value]);

  const recent = useMemo(() => {
    return allCategories
      .filter(c => c !== value)
      .slice(0, 6);
  }, [allCategories, value]);

  const applyCategory = (val: string) => {
    onChange(val);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filtered[selectedIndex]) {
        applyCategory(filtered[selectedIndex]);
      } else if (inputValue.trim()) {
        // Allow custom value
        applyCategory(normalizeCategory(inputValue.trim()));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const normalizeCategory = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="category-input-container" style={{ position: 'relative' }}>
      <div className="category-input-wrapper">
        {value && (
          <span className="category-chip" title={value}>
            {value}
            <button
              type="button"
              className="category-remove"
              aria-label="Clear category"
              onClick={() => applyCategory('')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filtered.length > 0 || !value) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowSuggestions(false);
              setSelectedIndex(-1);
            }, 150);
          }}
          placeholder={value ? '' : placeholder}
          className="category-input"
        />
      </div>

      {showSuggestions && (
        (() => {
          const canCreate = !!inputValue.trim() && !allCategories.some(c => c.toLowerCase() === normalizeCategory(inputValue.trim()).toLowerCase());
          const hasAny = filtered.length > 0 || canCreate;
          if (!hasAny) return null;
          return (
            <div className="category-suggestions">
              {filtered.map((c, index) => (
                <button
                  key={c}
                  type="button"
                  className={`category-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyCategory(c);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {c}
                </button>
              ))}
              {canCreate && (
                <button
                  type="button"
                  className={`category-suggestion create-new ${selectedIndex === filtered.length ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyCategory(normalizeCategory(inputValue.trim()));
                  }}
                  onMouseEnter={() => setSelectedIndex(filtered.length)}
                >
                  <span className="create-icon">+</span> Create "{normalizeCategory(inputValue.trim())}"
                </button>
              )}
            </div>
          );
        })()
      )}

      {!value && !showSuggestions && recent.length > 0 && (
        <div className="recent-categories">
          <span className="recent-label">Popular:</span>
          {recent.map((c) => (
            <button
              key={c}
              type="button"
              className="recent-item"
              onClick={() => applyCategory(c)}
            >
              + {c}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .category-input-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--color-border-medium);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          min-height: 44px;
          align-items: center;
          transition: border-color 0.2s;
        }
        .category-input-wrapper:focus-within {
          border-color: var(--color-primary);
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 13px;
          white-space: nowrap;
        }
        .category-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          margin-left: 2px;
          opacity: 0.8;
        }
        .category-remove:hover { opacity: 1; }
        .category-input {
          flex: 1;
          min-width: 160px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--color-text-primary);
        }
        .category-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }
        .category-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--color-surface);
          border: 1px solid var(--color-border-medium);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-height: 280px;
          overflow-y: auto;
          z-index: 1000;
        }
        .category-suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .category-suggestion:hover,
        .category-suggestion.selected { background: var(--color-surface-elevated); }
        .category-suggestion.create-new {
          border-top: 1px solid var(--color-border-light);
          color: var(--color-primary);
          font-weight: 500;
        }
        .create-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          margin-right: 6px;
        }
        .recent-categories {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .recent-label { font-size: 12px; color: var(--color-text-secondary); }
        .recent-item {
          padding: 4px 10px;
          background: var(--color-surface-elevated);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .recent-item:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}


