'use client';

import { useState, KeyboardEvent } from 'react';

interface KeywordsInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}

export default function KeywordsInput({ keywords, onChange, placeholder = 'Add keywords...' }: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword when backspace is pressed on empty input
      const newKeywords = [...keywords];
      newKeywords.pop();
      onChange(newKeywords);
    }
  };

  const addKeyword = (keywordValue?: string) => {
    const value = keywordValue || inputValue.trim();
    if (value && !keywords.includes(value)) {
      onChange([...keywords, value]);
      setInputValue('');
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    onChange(keywords.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If user types a comma, add the keyword
    if (value.endsWith(',')) {
      setInputValue(value.slice(0, -1));
      addKeyword();
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className="keywords-input-container" style={{ position: 'relative' }}>
      <div className="keywords-input-wrapper">
        {keywords.map((keyword, index) => (
          <span key={index} className="keyword-chip">
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="keyword-remove"
              aria-label={`Remove ${keyword}`}
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
          placeholder={placeholder}
          className="keyword-input"
        />
      </div>
      
      <div className="keyword-hint">Press Enter or comma to add a keyword</div>
      
      <style jsx>{`
        .keywords-input-container {
          width: 100%;
        }

        .keywords-input-wrapper {
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

        .keywords-input-wrapper:focus-within {
          border-color: var(--color-primary);
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .keyword-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--color-success);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 14px;
          white-space: nowrap;
        }

        .keyword-remove {
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

        .keyword-remove:hover {
          opacity: 1;
        }

        .keyword-input {
          flex: 1;
          min-width: 120px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--color-text-primary);
        }

        .keyword-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        .keyword-hint {
          margin-top: 4px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}