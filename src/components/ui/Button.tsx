import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: typeof Loader2;
}

const variants: Record<Variant, string> = {
  primary: 'bg-info-600 hover:bg-info-500 text-white shadow-lg shadow-info-600/20',
  secondary: 'bg-navy-700 hover:bg-navy-600 text-navy-100',
  danger: 'bg-emergency-600 hover:bg-emergency-500 text-white shadow-lg shadow-emergency-600/20',
  success: 'bg-success-600 hover:bg-success-500 text-white shadow-lg shadow-success-600/20',
  warning: 'bg-warning-600 hover:bg-warning-500 text-white shadow-lg shadow-warning-600/20',
  ghost: 'hover:bg-navy-800 text-navy-200',
  outline: 'border border-navy-700 hover:bg-navy-800 text-navy-100',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-lg gap-2',
  xl: 'text-lg px-8 py-4 rounded-xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon: Icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-info-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
