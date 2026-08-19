import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-navy-800/50 p-4">
        <Icon className="h-8 w-8 text-navy-400" />
      </div>
      <h3 className="text-base font-semibold text-navy-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-navy-300 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-emergency-500/10 p-4">
        <svg className="h-8 w-8 text-emergency-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-navy-100">Something went wrong</h3>
      <p className="mt-1 text-sm text-navy-300 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-100 hover:bg-navy-800 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
