import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  pulse?: boolean;
}

export function Badge({ color, pulse, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        color || 'border-navy-700 bg-navy-800 text-navy-200',
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span className={cn('inline-block h-2 w-2 rounded-full', color, pulse && 'animate-pulse')} />
  );
}
