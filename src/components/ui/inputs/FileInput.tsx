'use client';

import { useState, useRef, useId, forwardRef, useImperativeHandle } from 'react';
import { Upload, X, File, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { labelSizeClass } from './_shared';

export interface FileInputProps {
  label?: string;
  description?: string;
  error?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  accept?: string;
  maxSize?: number; // bytes
  maxFiles?: number;
  multiple?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export interface FileInputRef {
  open: () => void;
  clear: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) return ImageIcon;
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return FileText;
  return File;
}

export const FileInput = forwardRef<FileInputRef, FileInputProps>(
  function FileInput(
    {
      label,
      description,
      error,
      value = [],
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      size = 'default',
      accept,
      maxSize,
      maxFiles = 10,
      multiple = true,
      required,
      name,
      id,
      className,
      inputClassName,
    },
    forwardedRef,
  ) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [validationError, setValidationError] = useState('');
    const nativeInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = (error || validationError) ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    useImperativeHandle(forwardedRef, () => ({
      open: () => nativeInputRef.current?.click(),
      clear: () => {
        onChange?.([]);
        setValidationError('');
        if (nativeInputRef.current) nativeInputRef.current.value = '';
      },
    }));

    const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          errors.push(`"${file.name}" exceeds ${formatFileSize(maxSize)} limit`);
          continue;
        }
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const matches = acceptedTypes.some((type) => {
            if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase());
            if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'));
            return file.type === type;
          });
          if (!matches) {
            errors.push(`"${file.name}" is not an accepted file type`);
            continue;
          }
        }
        valid.push(file);
      }

      return { valid, errors };
    };

    const addFiles = (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const { valid, errors } = validateFiles(arr);

      if (errors.length > 0) {
        setValidationError(errors[0]);
      } else {
        setValidationError('');
      }

      const effectiveMax = multiple ? maxFiles : 1;
      const remaining = effectiveMax - value.length;
      if (remaining <= 0) {
        setValidationError(`Maximum of ${effectiveMax} file${effectiveMax === 1 ? '' : 's'} allowed`);
        return;
      }

      const toAdd = valid.slice(0, remaining);
      if (toAdd.length > 0) {
        onChange?.(multiple ? [...value, ...toAdd] : toAdd);
      }
    };

    const removeFile = (index: number) => {
      if (disabled) return;
      const next = [...value];
      next.splice(index, 1);
      onChange?.(next);
      setValidationError('');
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      if (!disabled) setIsDragOver(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (disabled) return;
      addFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = '';
    };

    const handleClick = () => {
      if (!disabled) nativeInputRef.current?.click();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const displayError = error || validationError;
    const padClasses =
      size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6';
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
    const iconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;

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

        <input
          ref={nativeInputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-describedby={describedBy}
          aria-invalid={displayError ? true : undefined}
          aria-required={required}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${padClasses} border-2 border-dashed rounded-input transition-all duration-150 text-center outline-none ${
            displayError
              ? 'border-input-border-error bg-input-ring-error/10'
              : isDragOver
                ? 'border-input-accent bg-input-accent-subtle/50'
                : 'border-input-border hover:border-input-border-hover bg-input-bg-hover/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus-visible:ring-2 focus-visible:ring-input-ring focus-visible:ring-offset-1 ${inputClassName || ''}`}
        >
          <Upload size={iconSize} className="mx-auto text-input-text-placeholder mb-2" />
          <p className={`${textSize} text-input-text-subtle font-medium`}>
            {isDragOver ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p className="text-xs text-input-text-placeholder mt-1">
            {[
              accept && `Accepts: ${accept}`,
              maxSize && `Max size: ${formatFileSize(maxSize)}`,
              multiple && maxFiles > 1 && `Up to ${maxFiles} files`,
            ].filter(Boolean).join(' · ') || 'Any file type'}
          </p>
        </div>

        {value.length > 0 && (
          <div className="space-y-1.5">
            {value.map((file, i) => {
              const Icon = getFileIcon(file);
              return (
                <div
                  key={`${file.name}-${file.lastModified}-${i}`}
                  className="flex items-center gap-2 px-3 py-2 bg-input-bg border border-input-border rounded-input"
                >
                  <Icon size={16} className="flex-shrink-0 text-input-text-placeholder" />
                  <span className="flex-1 text-sm text-input-text truncate">{file.name}</span>
                  <span className="text-xs text-input-text-placeholder flex-shrink-0">{formatFileSize(file.size)}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      aria-label={`Remove ${file.name}`}
                      className="p-1 -m-0.5 rounded-input-sm hover:bg-input-bg-hover text-input-text-placeholder hover:text-input-text transition-colors duration-150"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {displayError && (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-input-error">
            <AlertCircle size={12} className="flex-shrink-0" />
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
