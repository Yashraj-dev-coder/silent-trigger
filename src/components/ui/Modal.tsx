import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full glass-card border border-navy-700 shadow-2xl animate-slide-up',
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-navy-400 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'success';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading,
}: ConfirmDialogProps) {
  const variantClass = {
    danger: 'bg-emergency-600 hover:bg-emergency-500',
    primary: 'bg-info-600 hover:bg-info-500',
    success: 'bg-success-600 hover:bg-success-500',
  }[variant];

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-navy-200 mb-5">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50',
            variantClass
          )}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
