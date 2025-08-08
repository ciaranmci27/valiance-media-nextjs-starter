'use client';

import { useState, useEffect, KeyboardEvent, useRef } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInputImproved({ tags, onChange, placeholder = 'Type to search or add tags...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
      const filtered = existingTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag)
        )
        .slice(0, 10); // Limit to 10 suggestions
      setFilteredTags(filtered);
      // Show suggestions if we have matches OR if it's a new tag
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [inputValue, existingTags, tags]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredTags[selectedIndex]) {
        addTag(filteredTags[selectedIndex]);
      } else {
        addTag();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredTags.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const addTag = (tagValue?: string) => {
    const value = tagValue || inputValue.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
      setInputValue('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
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
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const recentTags = existingTags
    .filter(tag => !tags.includes(tag))
    .slice(0, 4); // Show up to 4 recent tags

  return (
    <div className="tag-input-container" style={{ position: 'relative' }}>
      <div className="tag-input-wrapper">
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
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim() && filteredTags.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => {
              setShowSuggestions(false);
              setSelectedIndex(-1);
            }, 200);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && inputValue.trim() && (
        (() => {
          const showCreate = !existingTags.some(tag => tag.toLowerCase() === inputValue.trim().toLowerCase()) &&
                           !tags.some(tag => tag.toLowerCase() === inputValue.trim().toLowerCase());
          
          // Only show dropdown if we have suggestions or can create a new tag
          if (filteredTags.length === 0 && !showCreate) {
            return null;
          }
          
          return (
            <div ref={suggestionsRef} className="tag-suggestions">
              {filteredTags.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className={`tag-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(tag);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {tag}
                </button>
              ))}
              {/* Only show Create option if tag doesn't exist */}
              {showCreate && (
                <button
                  type="button"
                  className={`tag-suggestion create-new ${selectedIndex === filteredTags.length ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(inputValue.trim());
                  }}
                  onMouseEnter={() => setSelectedIndex(filteredTags.length)}
                >
                  <span className="create-icon">+</span> Create "{inputValue.trim()}"
                </button>
              )}
            </div>
          );
        })()
      )}
      
      {/* Recent tags section */}
      {tags.length === 0 && recentTags.length > 0 && !showSuggestions && (
        <div className="recent-tags">
          <span className="recent-tags-label">Recent Tags:</span>
          {recentTags.map((tag, index) => (
            <button
              key={index}
              type="button"
              className="recent-tag"
              onClick={() => addTag(tag)}
            >
              + {tag}
            </button>
          ))}
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
          font-size: 13px;
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

        .tag-suggestions {
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


        .tag-suggestion {
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

        .tag-suggestion:hover,
        .tag-suggestion.selected {
          background: var(--color-surface-elevated);
        }

        .tag-suggestion.create-new {
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

        .recent-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .recent-tags-label {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .recent-tag {
          padding: 4px 10px;
          background: var(--color-surface-elevated);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .recent-tag:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}