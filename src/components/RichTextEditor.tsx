'use client';

import { useRef, useLayoutEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(value);

  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current.setAttribute('contenteditable', 'true');
      
      // Set initial content
      editorRef.current.innerHTML = value || '';
      contentRef.current = value;
      
      const handleInput = () => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          contentRef.current = newContent;
          onChange(newContent);
        }
      };

      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
      };

      editorRef.current.addEventListener('input', handleInput);
      editorRef.current.addEventListener('paste', handlePaste);

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener('input', handleInput);
          editorRef.current.removeEventListener('paste', handlePaste);
        }
      };
    }
  }, []); // Empty dependency array - only run on mount

  // Update content when value prop changes externally
  useLayoutEffect(() => {
    if (editorRef.current && value !== contentRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
      contentRef.current = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h1')}
            className="toolbar-btn"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h2')}
            className="toolbar-btn"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'h3')}
            className="toolbar-btn"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'p')}
            className="toolbar-btn"
            title="Paragraph"
          >
            P
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="toolbar-btn"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="toolbar-btn"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="toolbar-btn"
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="toolbar-btn"
            title="Strike"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="toolbar-btn"
            title="Bullet List"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="3" r="1.5"/>
              <rect x="6" y="2" width="8" height="2" rx="0.5"/>
              <circle cx="3" cy="8" r="1.5"/>
              <rect x="6" y="7" width="8" height="2" rx="0.5"/>
              <circle cx="3" cy="13" r="1.5"/>
              <rect x="6" y="12" width="8" height="2" rx="0.5"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="toolbar-btn"
            title="Numbered List"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <text x="1" y="4" fontSize="6" fontFamily="monospace">1.</text>
              <rect x="6" y="2" width="8" height="2" rx="0.5"/>
              <text x="1" y="9" fontSize="6" fontFamily="monospace">2.</text>
              <rect x="6" y="7" width="8" height="2" rx="0.5"/>
              <text x="1" y="14" fontSize="6" fontFamily="monospace">3.</text>
              <rect x="6" y="12" width="8" height="2" rx="0.5"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            className="toolbar-btn"
            title="Blockquote"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v7h5V5H3V2h4v10H2V2zm7 0v7h5V5h-4V2h4v10H9V2z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', 'pre')}
            className="toolbar-btn"
            title="Code Block"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 3L1 8l4.5 5v-3h1v3L11 8 6.5 3v3h-1V3z"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={insertLink}
            className="toolbar-btn"
            title="Insert Link"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.5 8.5A2.5 2.5 0 0 1 7 6h2a2.5 2.5 0 0 1 0 5H7a2.5 2.5 0 0 1-2.5-2.5zm1 0A1.5 1.5 0 0 0 7 10h2a1.5 1.5 0 0 0 0-3H7a1.5 1.5 0 0 0-1.5 1.5z"/>
              <path d="M0 8.5A2.5 2.5 0 0 1 2.5 6H4v1H2.5a1.5 1.5 0 0 0 0 3H4v1H2.5A2.5 2.5 0 0 1 0 8.5zm11.5-2.5H10V5h1.5a2.5 2.5 0 0 1 0 5H10v-1h1.5a1.5 1.5 0 0 0 0-3z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={insertImage}
            className="toolbar-btn"
            title="Insert Image"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="3" width="14" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="5" cy="6.5" r="1.5"/>
              <path d="M1 10l3-3 3 3 4-4 3 3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="toolbar-btn toolbar-btn-danger"
            title="Clear Formatting"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 3l-6 10h3l1.5-2.5h6l1.5 2.5h3l-6-10h-3zm.5 2h1l2 3.5h-5l2-3.5z"/>
              <path d="M2 2L14 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        data-placeholder={placeholder || 'Start writing...'}
      />
      
      <style jsx>{`
        .rich-text-editor {
          border: 1px solid var(--color-border-medium);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-surface);
        }

        [data-theme="dark"] .rich-text-editor {
          background: var(--color-surface);
          border-color: var(--color-border-medium);
        }

        .editor-toolbar {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border-light);
          padding: var(--spacing-sm);
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          align-items: center;
        }

        [data-theme="dark"] .editor-toolbar {
          background: var(--color-surface);
          border-bottom-color: var(--color-border-medium);
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--color-border-light);
          margin: 0 4px;
        }

        .toolbar-btn {
          padding: 6px 10px;
          background: var(--color-surface);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
        }

        .toolbar-btn:hover {
          background: var(--color-blue-50);
          border-color: var(--color-border-accent);
          color: var(--color-primary);
        }

        [data-theme="dark"] .toolbar-btn {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-border-medium);
        }

        [data-theme="dark"] .toolbar-btn:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: var(--color-primary-light);
        }

        .toolbar-btn:active {
          background: var(--color-blue-100);
          transform: scale(0.98);
        }

        [data-theme="dark"] .toolbar-btn:active {
          background: rgba(59, 130, 246, 0.25);
        }

        .toolbar-btn-danger {
          color: var(--color-error);
        }

        .toolbar-btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--color-error);
        }

        [data-theme="dark"] .toolbar-btn-danger:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .editor-content {
          padding: var(--spacing-lg);
          min-height: 500px;
          max-height: 500px;
          overflow-y: auto;
          outline: none;
          color: var(--color-text-primary);
          font-size: 16px;
          line-height: 1.6;
        }

        .editor-content:focus {
          outline: none;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }

        .editor-content h1 { 
          font-size: 2em; 
          font-weight: bold; 
          margin: 0.67em 0; 
          color: var(--color-text-primary); 
        }

        .editor-content h2 { 
          font-size: 1.5em; 
          font-weight: bold; 
          margin: 0.83em 0; 
          color: var(--color-text-primary); 
        }

        .editor-content h3 { 
          font-size: 1.17em; 
          font-weight: bold; 
          margin: 1em 0; 
          color: var(--color-text-primary); 
        }

        .editor-content p { 
          margin: 1em 0; 
          color: var(--color-text-primary); 
        }

        .editor-content blockquote { 
          border-left: 4px solid var(--color-border-accent); 
          padding-left: 1em; 
          margin: 1em 0;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        .editor-content pre {
          background: rgba(59, 130, 246, 0.05);
          padding: 1em;
          border-radius: var(--radius-md);
          overflow-x: auto;
          font-family: monospace;
          color: var(--color-text-primary);
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        [data-theme="dark"] .editor-content pre {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .editor-content ul { 
          list-style: disc; 
          padding-left: 2em; 
          margin: 1em 0; 
          color: var(--color-text-primary);
        }

        .editor-content ol { 
          list-style: decimal; 
          padding-left: 2em; 
          margin: 1em 0; 
          color: var(--color-text-primary);
        }

        .editor-content a { 
          color: var(--color-primary); 
          text-decoration: underline; 
        }

        .editor-content img { 
          max-width: 100%; 
          height: auto; 
          border-radius: var(--radius-md);
          margin: 1em 0;
        }

        .editor-content code {
          background: rgba(59, 130, 246, 0.1);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-family: monospace;
          color: var(--color-primary);
        }

        [data-theme="dark"] .editor-content code {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-primary-light);
        }

        @media (max-width: 640px) {
          .editor-toolbar {
            padding: var(--spacing-xs);
          }

          .toolbar-btn {
            padding: 4px 8px;
            min-width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .toolbar-divider {
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
}