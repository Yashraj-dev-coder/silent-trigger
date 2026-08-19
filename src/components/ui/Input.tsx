import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-navy-700 bg-navy-800/50 px-4 py-2.5 text-sm text-white placeholder-navy-400',
            'focus:border-info-500 focus:outline-none focus:ring-1 focus:ring-info-500',
            'transition-colors',
            error && 'border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-emergency-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
