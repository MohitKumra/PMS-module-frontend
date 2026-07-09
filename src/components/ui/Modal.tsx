import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Max width class — default 'max-w-lg' */
  maxWidth?: string;
}

/**
 * Centered responsive modal.
 * Centers on all screen sizes with background blur and scale-in animation.
 */
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-overlay animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — centered dialog on all screen sizes */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={[
          'relative z-10 w-full shadow-2xl flex flex-col max-h-[90dvh] border rounded-2xl animate-scale-in',
          maxWidth,
        ].join(' ')}
        style={{
          background: 'var(--modal-bg)',
          borderColor: 'var(--modal-border)',
          boxShadow: 'var(--modal-shadow)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          {title ? (
            <h2 id="modal-title" className="text-lg font-bold text-text-primary">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="tap-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 pb-6 pt-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}