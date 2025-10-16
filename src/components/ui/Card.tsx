// src/components/ui/Card.tsx

import { HTMLAttributes, forwardRef } from 'react';
import { CardVariant } from '@/src/utils/types';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  selected?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', selected = false, className = '', children, ...props }, ref) => {
    const baseClasses = 'rounded-lg p-6 transition-all duration-200';
const variantClasses = {
  default: 'bg-gray-300 border border-border-default shadow-sm',
  elevated: 'bg-gray-300 shadow-md hover:shadow-lg',
  selectable: `bg-gray-300 border-2 cursor-pointer ${
    selected
      ? 'border-border-selected bg-blue-50'
      : 'border-border-default hover:border-blue-300 hover:shadow-md'
  }`,
  glass: 'bg-background-glass backdrop-blur-md shadow-glass border border-border-default',
};
    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
