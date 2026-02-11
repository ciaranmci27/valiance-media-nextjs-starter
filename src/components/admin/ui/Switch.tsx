'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: 'default' | 'sm';
}

export function Switch({ checked, onChange, disabled = false, label, className = '', size = 'default' }: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const isSmall = size === 'sm';

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
            block rounded-full transition-colors duration-200 ease-in-out
            ${isSmall ? 'w-8 h-[18px]' : 'w-14 h-8'}
            ${checked
              ? 'bg-primary'
              : 'bg-gray-300 dark:bg-gray-600'
            }
          `}
        >
          <div
            className={`
              absolute bg-white rounded-full shadow-md
              transform transition-transform duration-200 ease-in-out
              ${isSmall
                ? 'top-[3px] left-[3px] w-3 h-3'
                : 'top-1 left-1 w-6 h-6'
              }
              ${checked
                ? isSmall ? 'translate-x-[14px]' : 'translate-x-6'
                : 'translate-x-0'
              }
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
