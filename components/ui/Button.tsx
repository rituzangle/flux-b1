import { ButtonHTMLAttributes, forwardRef } from 'react';
import { ButtonVariant } from '@/utils/types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    const baseClasses = 'min-h-[44px] px-6 rounded-lg font-bold text-base transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-border-focus disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-brand-primary text-text-inverse hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500',
      secondary: 'bg-white text-brand-primary border-2 border-brand-primary hover:bg-blue-50 active:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300',
      destructive: 'bg-brand-error text-text-inverse hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500',
      ghost: 'bg-transparent text-text-primary hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const finalVariant = disabled ? 'disabled' : variant;

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[finalVariant]} ${widthClass} ${className}`}
        disabled={disabled || variant === 'disabled'}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
