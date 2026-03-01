'use client';

import { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react';
import { useInputDialog, toast } from '@/components/ui/feedback';
import { Tooltip } from '@/components/admin/ui/Tooltip';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered,
  Quote, Code, CodeXml,
  Link, Unlink, Image,
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2,
  Minus, RemoveFormatting,
  FileCode2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  shortcut?: string;
  command?: string;
  commandValue?: string;
  queryCommand?: string;
  queryBlockTag?: string;
  action?: 'custom';
  variant?: 'danger';
}

interface ToolbarGroup {
  id: string;
  items: ToolbarAction[];
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  blockTag: string;
  isLink: boolean;
  linkUrl: string;
}

// ─── Constants ───────────────────────────────────────────────────────

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    id: 'block-format',
    items: [
      { id: 'h1', label: 'Heading 1', icon: Heading1, command: 'formatBlock', commandValue: 'h1', queryBlockTag: 'h1' },
      { id: 'h2', label: 'Heading 2', icon: Heading2, command: 'formatBlock', commandValue: 'h2', queryBlockTag: 'h2' },
      { id: 'h3', label: 'Heading 3', icon: Heading3, command: 'formatBlock', commandValue: 'h3', queryBlockTag: 'h3' },
      { id: 'p', label: 'Paragraph', icon: Pilcrow, command: 'formatBlock', commandValue: 'p', queryBlockTag: 'p' },
    ],
  },
  {
    id: 'inline-format',
    items: [
      { id: 'bold', label: 'Bold', icon: Bold, shortcut: 'Ctrl+B', command: 'bold', queryCommand: 'bold' },
      { id: 'italic', label: 'Italic', icon: Italic, shortcut: 'Ctrl+I', command: 'italic', queryCommand: 'italic' },
      { id: 'underline', label: 'Underline', icon: Underline, shortcut: 'Ctrl+U', command: 'underline', queryCommand: 'underline' },
      { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough, shortcut: 'Ctrl+Shift+X', command: 'strikeThrough', queryCommand: 'strikeThrough' },
      { id: 'inline-code', label: 'Inline Code', icon: Code, shortcut: 'Ctrl+E', action: 'custom' },
    ],
  },
  {
    id: 'lists',
    items: [
      { id: 'bullet-list', label: 'Bullet List', icon: List, command: 'insertUnorderedList', queryCommand: 'insertUnorderedList' },
      { id: 'numbered-list', label: 'Numbered List', icon: ListOrdered, command: 'insertOrderedList', queryCommand: 'insertOrderedList' },
    ],
  },
  {
    id: 'block-insert',
    items: [
      { id: 'blockquote', label: 'Blockquote', icon: Quote, command: 'formatBlock', commandValue: 'blockquote', queryBlockTag: 'blockquote' },
      { id: 'code-block', label: 'Code Block', icon: CodeXml, command: 'formatBlock', commandValue: 'pre', queryBlockTag: 'pre' },
      { id: 'horizontal-rule', label: 'Horizontal Rule', icon: Minus, action: 'custom' },
    ],
  },
  {
    id: 'alignment',
    items: [
      { id: 'align-left', label: 'Align Left', icon: AlignLeft, command: 'justifyLeft', queryCommand: 'justifyLeft' },
      { id: 'align-center', label: 'Align Center', icon: AlignCenter, command: 'justifyCenter', queryCommand: 'justifyCenter' },
      { id: 'align-right', label: 'Align Right', icon: AlignRight, command: 'justifyRight', queryCommand: 'justifyRight' },
    ],
  },
  {
    id: 'links',
    items: [
      { id: 'link', label: 'Insert Link', icon: Link, shortcut: 'Ctrl+K', action: 'custom' },
      { id: 'unlink', label: 'Remove Link', icon: Unlink, action: 'custom' },
      { id: 'image', label: 'Insert Image', icon: Image, action: 'custom' },
    ],
  },
  {
    id: 'history',
    items: [
      { id: 'undo', label: 'Undo', icon: Undo2, shortcut: 'Ctrl+Z', command: 'undo' },
      { id: 'redo', label: 'Redo', icon: Redo2, shortcut: 'Ctrl+Shift+Z', command: 'redo' },
    ],
  },
  {
    id: 'utility',
    items: [
      { id: 'clear-formatting', label: 'Clear Formatting', icon: RemoveFormatting, command: 'removeFormat', variant: 'danger' },
      { id: 'source-view', label: 'HTML Source', icon: FileCode2, action: 'custom' },
    ],
  },
];

const ALLOWED_PASTE_TAGS = new Set([
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'code', 'pre', 'blockquote', 'hr',
]);

const ALLOWED_PASTE_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
};

const DEFAULT_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
  blockTag: 'p',
  isLink: false,
  linkUrl: '',
};

// ─── Utilities ───────────────────────────────────────────────────────

function getTextStats(html: string): { words: number; chars: number } {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  const trimmed = text.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    chars: trimmed.length,
  };
}

function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const clean = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (['script', 'style', 'meta', 'link', 'head', 'title', 'noscript', 'iframe', 'object', 'embed'].includes(tag)) {
      return '';
    }

    const childContent = Array.from(el.childNodes).map(clean).join('');

    if (!ALLOWED_PASTE_TAGS.has(tag)) {
      return childContent;
    }

    const attrs = (ALLOWED_PASTE_ATTRS[tag] || [])
      .map(attr => {
        const val = el.getAttribute(attr);
        if (!val) return '';
        if (attr === 'href' && val.trim().toLowerCase().startsWith('javascript:')) return '';
        return ` ${attr}="${val.replace(/"/g, '&quot;')}"`;
      })
      .join('');

    if (tag === 'br' || tag === 'hr') return `<${tag} />`;
    return `<${tag}${attrs}>${childContent}</${tag}>`;
  };

  return Array.from(doc.body.childNodes).map(clean).join('');
}

// ─── Component ───────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(value);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>(0);
  const { promptInput, dialog: inputDialog } = useInputDialog();

  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(DEFAULT_FORMATS);
  const [isSourceView, setIsSourceView] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // ─── Helpers ─────────────────────────────────────────────────────

  const triggerChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      contentRef.current = newContent;
      onChange(newContent);
      const stats = getTextStats(newContent);
      setWordCount(stats.words);
      setCharCount(stats.chars);
    }
  }, [onChange]);

  const executeCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    editorRef.current?.focus();
    triggerChange();
  }, [triggerChange]);

  const getBlockTag = useCallback((): string => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return 'p';
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote', 'li'].includes(tag)) {
          return tag;
        }
      }
      node = node.parentNode;
    }
    return 'p';
  }, []);

  const getLinkInfo = useCallback((): { isLink: boolean; linkUrl: string } => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return { isLink: false, linkUrl: '' };
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'A') {
        return { isLink: true, linkUrl: (node as HTMLAnchorElement).href };
      }
      node = node.parentNode;
    }
    return { isLink: false, linkUrl: '' };
  }, []);

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current.contains(sel.anchorNode)) return;

    const linkInfo = getLinkInfo();

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      blockTag: getBlockTag(),
      isLink: linkInfo.isLink,
      linkUrl: linkInfo.linkUrl,
    });
  }, [getBlockTag, getLinkInfo]);

  // ─── Inline Code Toggle ──────────────────────────────────────────

  const toggleInlineCode = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    let codeParent: HTMLElement | null = null;
    let node: Node | null = range.commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'CODE') {
        codeParent = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (codeParent) {
      const parent = codeParent.parentNode;
      if (parent) {
        while (codeParent.firstChild) {
          parent.insertBefore(codeParent.firstChild, codeParent);
        }
        parent.removeChild(codeParent);
      }
    } else if (!range.collapsed) {
      const code = document.createElement('code');
      try {
        range.surroundContents(code);
      } catch {
        const selectedText = range.toString();
        document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
      }
    }

    editorRef.current?.focus();
    triggerChange();
  }, [triggerChange]);

  // ─── Link Dialog ──────────────────────────────────────────────────

  const insertLink = useCallback(async () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const savedRange = sel.getRangeAt(0).cloneRange();
    const linkInfo = getLinkInfo();

    const url = await promptInput({
      title: linkInfo.isLink ? 'Edit Link' : 'Insert Link',
      placeholder: 'https://...',
      defaultValue: linkInfo.isLink ? linkInfo.linkUrl : '',
      confirmLabel: linkInfo.isLink ? 'Update' : 'Insert',
    });

    // Restore selection
    if (editorRef.current) {
      editorRef.current.focus();
      const newSel = window.getSelection();
      if (newSel) {
        newSel.removeAllRanges();
        newSel.addRange(savedRange);
      }
    }

    if (url) {
      if (linkInfo.isLink) {
        let linkNode: Node | null = savedRange.commonAncestorContainer;
        while (linkNode && linkNode !== editorRef.current) {
          if (linkNode.nodeType === Node.ELEMENT_NODE && (linkNode as HTMLElement).tagName === 'A') {
            (linkNode as HTMLAnchorElement).href = url;
            (linkNode as HTMLAnchorElement).target = '_blank';
            (linkNode as HTMLAnchorElement).rel = 'noopener noreferrer';
            triggerChange();
            return;
          }
          linkNode = linkNode.parentNode;
        }
      }

      executeCommand('createLink', url);

      // Set target and rel on the new link
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let linkEl: Node | null = selection.anchorNode;
        while (linkEl && linkEl !== editorRef.current) {
          if (linkEl.nodeType === Node.ELEMENT_NODE && (linkEl as HTMLElement).tagName === 'A') {
            (linkEl as HTMLAnchorElement).target = '_blank';
            (linkEl as HTMLAnchorElement).rel = 'noopener noreferrer';
            break;
          }
          linkEl = linkEl.parentNode;
        }
      }
      triggerChange();
    }
  }, [getLinkInfo, promptInput, executeCommand, triggerChange]);

  const insertImage = useCallback(async () => {
    const url = await promptInput({
      title: 'Insert Image',
      placeholder: 'https://example.com/image.jpg',
    });
    if (url) {
      executeCommand('insertImage', url);
    }
  }, [promptInput, executeCommand]);

  // ─── Source View Toggle ───────────────────────────────────────────

  const toggleSourceView = useCallback(() => {
    if (isSourceView) {
      // Switching from source to WYSIWYG: apply textarea edits to the div
      const sourceHtml = sourceTextareaRef.current?.value || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceHtml;
      }
      contentRef.current = sourceHtml;
      onChange(sourceHtml);
      const stats = getTextStats(sourceHtml);
      setWordCount(stats.words);
      setCharCount(stats.chars);
    } else {
      // Switching from WYSIWYG to source: sync textarea value
      if (sourceTextareaRef.current && editorRef.current) {
        sourceTextareaRef.current.value = editorRef.current.innerHTML;
      }
    }
    setIsSourceView(prev => !prev);
  }, [isSourceView, onChange]);

  // ─── Custom Action Dispatch ───────────────────────────────────────

  const handleCustomAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'link': insertLink(); break;
      case 'unlink': executeCommand('unlink'); break;
      case 'image': insertImage(); break;
      case 'inline-code': toggleInlineCode(); break;
      case 'horizontal-rule': executeCommand('insertHorizontalRule'); break;
      case 'source-view': toggleSourceView(); break;
    }
  }, [insertLink, executeCommand, insertImage, toggleInlineCode, toggleSourceView]);

  // ─── Active State Check ───────────────────────────────────────────

  const getIsActive = useCallback((item: ToolbarAction): boolean => {
    if (item.queryCommand) {
      return activeFormats[item.queryCommand as keyof ActiveFormats] === true;
    }
    if (item.queryBlockTag) {
      return activeFormats.blockTag === item.queryBlockTag;
    }
    if (item.id === 'source-view') {
      return isSourceView;
    }
    if (item.id === 'unlink') {
      return activeFormats.isLink;
    }
    if (item.id === 'inline-code') {
      // Check if inside a <code> element
      const sel = window.getSelection();
      if (sel && sel.anchorNode && editorRef.current?.contains(sel.anchorNode)) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'CODE') {
            return true;
          }
          node = node.parentNode;
        }
      }
    }
    return false;
  }, [activeFormats, isSourceView]);

  // ─── Keyboard Shortcuts ───────────────────────────────────────────

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); executeCommand('bold'); break;
        case 'i': e.preventDefault(); executeCommand('italic'); break;
        case 'u': e.preventDefault(); executeCommand('underline'); break;
        case 'k': e.preventDefault(); insertLink(); break;
        case 'e': e.preventDefault(); toggleInlineCode(); break;
        case 'z': e.preventDefault(); executeCommand('undo'); break;
      }
    }

    if (ctrl && e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'x': e.preventDefault(); executeCommand('strikeThrough'); break;
        case 'z': e.preventDefault(); executeCommand('redo'); break;
      }
    }

    // Tab indent in code blocks
    if (e.key === 'Tab' && !ctrl) {
      const blockTag = getBlockTag();
      if (blockTag === 'pre') {
        e.preventDefault();
        document.execCommand('insertText', false, '  ');
      }
    }
  }, [executeCommand, insertLink, toggleInlineCode, getBlockTag]);

  // ─── Editor Setup ─────────────────────────────────────────────────

  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current.setAttribute('contenteditable', 'true');
      editorRef.current.innerHTML = value || '';
      contentRef.current = value;

      // Initial word/char counts
      const stats = getTextStats(value);
      setWordCount(stats.words);
      setCharCount(stats.chars);

      const handleInput = () => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          contentRef.current = newContent;
          onChange(newContent);
          const s = getTextStats(newContent);
          setWordCount(s.words);
          setCharCount(s.chars);
        }
      };

      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const html = e.clipboardData?.getData('text/html');
        const plain = e.clipboardData?.getData('text/plain') || '';

        if (html) {
          const sanitized = sanitizePastedHtml(html);
          document.execCommand('insertHTML', false, sanitized);
        } else {
          document.execCommand('insertText', false, plain);
        }
      };

      const editor = editorRef.current;
      editor.addEventListener('input', handleInput);
      editor.addEventListener('paste', handlePaste);

      return () => {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('paste', handlePaste);
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach keydown listener; re-attach when handler changes so it never goes stale
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Update content when value prop changes externally
  useLayoutEffect(() => {
    if (editorRef.current && value !== contentRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
      contentRef.current = value;
      const stats = getTextStats(value);
      setWordCount(stats.words);
      setCharCount(stats.chars);
    }
  }, [value]);

  // Selection change listener for active format tracking
  useEffect(() => {
    const handleSelectionChange = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActiveFormats);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateActiveFormats]);

  // ─── Toolbar Button Renderer ──────────────────────────────────────

  const renderToolbarButton = (item: ToolbarAction) => {
    const isActive = getIsActive(item);
    const Icon = item.icon;
    const shortcutHint = item.shortcut
      ? `${item.label} (${item.shortcut})`
      : item.label;

    const handleClick = () => {
      if (item.action === 'custom') {
        handleCustomAction(item.id);
      } else if (item.command) {
        executeCommand(item.command, item.commandValue);
      }
    };

    return (
      <Tooltip key={item.id} content={shortcutHint} position="bottom" delay={300}>
        <button
          type="button"
          onClick={handleClick}
          className={`toolbar-btn${isActive ? ' toolbar-btn-active' : ''}${item.variant === 'danger' ? ' toolbar-btn-danger' : ''}`}
          aria-label={item.label}
          aria-pressed={isActive}
        >
          <Icon size={16} />
        </button>
      </Tooltip>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {TOOLBAR_GROUPS.flatMap(group => group.items).map(renderToolbarButton)}
      </div>

      {/* Editor Content: both always mounted, toggled via display */}
      <textarea
        ref={sourceTextareaRef}
        className="editor-source"
        style={{ display: isSourceView ? 'block' : 'none' }}
        defaultValue={value}
        onChange={(e) => {
          contentRef.current = e.target.value;
          onChange(e.target.value);
          const stats = getTextStats(e.target.value);
          setWordCount(stats.words);
          setCharCount(stats.chars);
        }}
        spellCheck={false}
      />
      <div
        ref={editorRef}
        className="editor-content"
        style={{ display: isSourceView ? 'none' : 'block' }}
        data-placeholder={placeholder || 'Start writing...'}
      />

      {/* Footer */}
      <div className="editor-footer">
        <div className="editor-stats">
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span className="stats-divider">|</span>
          <span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
        </div>
        {isSourceView && (
          <span className="source-indicator">HTML Source</span>
        )}
      </div>

      {inputDialog}

      <style jsx global>{`
        .rich-text-editor {
          border: 1px solid var(--color-border-medium);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .rich-text-editor:focus-within {
          border-color: var(--color-border-accent);
          box-shadow: 0 0 0 3px rgba(91, 138, 138, 0.1);
        }

        [data-theme="dark"] .rich-text-editor {
          background: var(--color-surface);
          border-color: var(--color-border-medium);
        }

        [data-theme="dark"] .rich-text-editor:focus-within {
          box-shadow: 0 0 0 3px rgba(91, 138, 138, 0.15);
        }

        .editor-toolbar {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border-light);
          padding: var(--spacing-sm);
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        [data-theme="dark"] .editor-toolbar {
          background: var(--color-surface);
          border-bottom-color: var(--color-border-medium);
        }

        .toolbar-btn {
          padding: 6px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
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
          background: var(--color-primary-100);
          color: var(--color-primary);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .toolbar-btn:active {
          background: var(--color-primary-100);
          transform: translateY(0) scale(0.96);
          box-shadow: none;
        }

        .toolbar-btn-active {
          background: var(--color-primary-100);
          border-color: var(--color-border-accent);
          color: var(--color-primary);
        }

        [data-theme="dark"] .toolbar-btn {
          background: transparent;
          color: var(--color-text-secondary);
        }

        [data-theme="dark"] .toolbar-btn:hover {
          background: rgba(91, 138, 138, 0.2);
          color: var(--color-primary-light);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        [data-theme="dark"] .toolbar-btn:active {
          background: rgba(91, 138, 138, 0.3);
          box-shadow: none;
        }

        [data-theme="dark"] .toolbar-btn-active {
          background: rgba(91, 138, 138, 0.2);
          border-color: rgba(91, 138, 138, 0.4);
          color: var(--color-primary-light);
        }

        .toolbar-btn-danger {
          color: var(--color-error);
        }

        .toolbar-btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--color-error);
        }

        [data-theme="dark"] .toolbar-btn-danger {
          color: var(--color-error);
        }

        [data-theme="dark"] .toolbar-btn-danger:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .editor-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
          min-height: 500px;
          outline: none;
          color: var(--color-text-primary);
          font-size: 16px;
          line-height: 1.7;
        }

        .editor-content:focus {
          outline: none;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }

        .editor-source {
          flex: 1;
          overflow-y: auto;
          width: 100%;
          min-height: 500px;
          padding: var(--spacing-lg);
          border: none;
          outline: none;
          resize: none;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-primary);
          background: var(--color-surface);
          tab-size: 2;
        }

        [data-theme="dark"] .editor-source {
          background: var(--color-surface);
          color: var(--color-text-primary);
        }

        .editor-footer {
          border-top: 1px solid var(--color-border-light);
          padding: 6px var(--spacing-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-surface);
          font-size: 12px;
          color: var(--color-text-tertiary);
          flex-shrink: 0;
        }

        [data-theme="dark"] .editor-footer {
          border-top-color: var(--color-border-medium);
        }

        .editor-stats {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .stats-divider {
          color: var(--color-border-medium);
        }

        .source-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          background: rgba(91, 138, 138, 0.1);
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 500;
        }

        [data-theme="dark"] .source-indicator {
          background: rgba(91, 138, 138, 0.15);
          color: var(--color-primary-light);
        }

        /* Content element styles */

        .editor-content h1 {
          font-size: 1.875em;
          font-weight: 700;
          margin: 1.25em 0 0.6em;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .editor-content h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 1.5em 0 0.6em;
          padding-bottom: 0.3em;
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border-light);
          letter-spacing: -0.01em;
          line-height: 1.35;
        }

        .editor-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1.25em 0 0.5em;
          color: var(--color-text-primary);
          line-height: 1.4;
        }

        .editor-content p {
          margin: 0.75em 0;
          color: var(--color-text-primary);
          line-height: 1.75;
        }

        .editor-content blockquote {
          border-left: 4px solid var(--color-primary);
          padding: 0.75em 1.25em;
          margin: 1.25em 0;
          background: var(--color-primary-50);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        [data-theme="dark"] .editor-content blockquote {
          background: rgba(91, 138, 138, 0.08);
        }

        .editor-content pre {
          background: #1e293b;
          padding: 1.25em 1.5em;
          border-radius: var(--radius-md);
          overflow-x: auto;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          color: #e2e8f0;
          border: 1px solid #334155;
          line-height: 1.6;
          tab-size: 2;
          margin: 1.25em 0;
        }

        [data-theme="dark"] .editor-content pre {
          background: #0f172a;
          border-color: #1e293b;
          color: #e2e8f0;
        }

        .editor-content ul {
          list-style: disc;
          padding-left: 1.75em;
          margin: 0.75em 0;
          color: var(--color-text-primary);
        }

        .editor-content ol {
          list-style: decimal;
          padding-left: 1.75em;
          margin: 0.75em 0;
          color: var(--color-text-primary);
        }

        .editor-content li {
          margin: 0.35em 0;
          line-height: 1.7;
        }

        .editor-content li > ul,
        .editor-content li > ol {
          margin: 0.25em 0;
        }

        .editor-content a {
          color: var(--color-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .editor-content a:hover {
          opacity: 0.8;
        }

        .editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-md);
          margin: 1.25em 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .editor-content code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.875em;
          color: #c2410c;
          border: 1px solid #e2e8f0;
        }

        [data-theme="dark"] .editor-content code {
          background: rgba(255, 255, 255, 0.08);
          color: #fb923c;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .editor-content pre code {
          background: none;
          padding: 0;
          font-size: inherit;
          color: inherit;
          border: none;
        }

        .editor-content hr {
          border: none;
          border-top: 2px solid var(--color-border-light);
          margin: 2em 0;
        }

        .editor-content > *:first-child {
          margin-top: 0;
        }

        .editor-content > *:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 640px) {
          .editor-toolbar {
            padding: 4px;
          }

          .toolbar-btn {
            padding: 4px;
            min-width: 28px;
            height: 28px;
          }

          .toolbar-divider {
            height: 20px;
          }

          .editor-content {
            min-height: 350px;
          }
        }
      `}</style>
    </div>
  );
}
