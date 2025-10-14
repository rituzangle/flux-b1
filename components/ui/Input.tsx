import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  isAmount?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, isAmount = false, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {isAmount && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary text-base font-medium">
              $
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full h-[44px] px-4 ${isAmount ? 'pl-8' : ''}
              text-base text-text-primary
              bg-white border-2 rounded-lg
              ${error ? 'border-brand-error' : 'border-border-default'}
              focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-border-focus focus:ring-opacity-20
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="mt-2 text-sm text-text-secondary">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-brand-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
