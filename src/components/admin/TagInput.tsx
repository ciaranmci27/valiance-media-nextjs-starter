'use client';

import { useState, useEffect, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = 'Add tags...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing tags from API
    fetch('/api/admin/tags')
      .then(res => res.json())
      .then(data => setExistingTags(data.tags || []))
      .catch(err => console.error('Error fetching tags:', err));
  }, []);

  useEffect(() => {
    // Filter existing tags based on input
    if (inputValue.trim()) {
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [inputValue, existingTags, tags]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  const addTag = (tagValue?: string) => {
    const value = tagValue || inputValue.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If user types a comma, add the tag
    if (value.endsWith(',')) {
      setInputValue(value.slice(0, -1));
      addTag();
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className="tag-input-container" style={{ position: 'relative' }}>
      <div className="tag-input-wrapper" onBlur={(e) => {
        // Hide suggestions when clicking outside
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setTimeout(() => setShowSuggestions(false), 200);
        }
      }}>
        {tags.map((tag, index) => (
          <span key={index} className="tag-chip">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="tag-remove"
              aria-label={`Remove ${tag}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredTags.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="tag-suggestions">
          {filteredTags.map((tag, index) => (
            <button
              key={index}
              type="button"
              className="tag-suggestion"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(tag);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      
      {/* Existing tags section */}
      {existingTags.length > 0 && (
        <div className="existing-tags-section">
          <div className="existing-tags-label">Available tags (click to add):</div>
          <div className="existing-tags">
            {existingTags
              .filter(tag => !tags.includes(tag))
              .map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className="existing-tag"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .tag-input-container {
          width: 100%;
        }

        .tag-input-wrapper {
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

        .tag-input-wrapper:focus-within {
          border-color: var(--color-primary);
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 14px;
          white-space: nowrap;
        }

        .tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .tag-remove:hover {
          opacity: 1;
        }

        .tag-input {
          flex: 1;
          min-width: 120px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--color-text-primary);
        }

        .tag-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        .tag-hint {
          margin-top: 4px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .tag-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--color-surface);
          border: 1px solid var(--color-border-medium);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
        }

        .tag-suggestion {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .tag-suggestion:hover {
          background: var(--color-primary);
          color: white;
        }

        .existing-tags-section {
          margin-top: 12px;
          padding-top: 12px;
        }

        .existing-tags-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }

        .existing-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .existing-tag {
          padding: 4px 10px;
          background: var(--color-surface-elevated);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .existing-tag:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}