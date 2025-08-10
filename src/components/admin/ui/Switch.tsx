'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, disabled = false, label, className = '' }: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      role="switch"
      aria-checked={checked}
    >
      <div className="relative">
        <div
          className={`
            block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out
            ${checked 
              ? 'bg-primary' 
              : 'bg-gray-300 dark:bg-gray-600'
            }
          `}
        >
          <div
            className={`
              absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md
              transform transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </span>
      )}
    </button>
  );
}