'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-primary',
    warning: 'bg-yellow-600',
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onRemove}
        className="text-white/80 hover:text-white text-lg"
      >
        ×
      </button>
    </div>
  );
};

// Simple toast function for components that can't use hooks
export const toast = {
  success: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'success' } });
    window.dispatchEvent(event);
  },
  error: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'error' } });
    window.dispatchEvent(event);
  },
  info: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'info' } });
    window.dispatchEvent(event);
  },
  warning: (message: string) => {
    const event = new CustomEvent('toast', { detail: { message, type: 'warning' } });
    window.dispatchEvent(event);
  },
};