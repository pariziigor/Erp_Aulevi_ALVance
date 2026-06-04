import type React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader, Check } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  successText?: string;
  showSuccess?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function LoadingButton({
  isLoading = false,
  loadingText = 'Processando...',
  successText = 'Salvo!',
  showSuccess = false,
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200';

  const variantClasses = {
    primary: `
      bg-orange-500 text-white
      hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20
      disabled:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60
    `,
    secondary: `
      bg-white border border-slate-200 text-slate-700
      hover:bg-slate-50 hover:border-slate-300
      disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20
      disabled:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60
    `,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader className="w-4 h-4 animate-spin" />
      )}
      {showSuccess && !isLoading && (
        <Check className="w-4 h-4 text-green-500" />
      )}
      {isLoading ? loadingText : showSuccess ? successText : children}
    </button>
  );
}

interface InputWithFocusProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function InputWithFocus({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputWithFocusProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border-2 border-slate-200
          bg-white/70 backdrop-blur-sm
          focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10
          transition-all duration-200
          placeholder:text-slate-400
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 font-medium animate-shake">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export function FormShakeAnimation() {
  return (
    <style>{`
      @keyframes shake {
        0%, 100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-5px);
        }
        75% {
          transform: translateX(5px);
        }
      }

      .animate-shake {
        animation: shake 0.4s ease-in-out;
      }
    `}</style>
  );
}
