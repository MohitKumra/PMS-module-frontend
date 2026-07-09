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
 * Responsive modal / bottom sheet.
 * - On small screens (< md): slides up as a bottom sheet (thumb-reachable).
 * - On md+: centered dialog overlay.
 * One component, one behavior — per Architecture §8 mobile-first rules.
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centered dialog on desktop */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={[
          'relative z-10 w-full bg-surface-raised shadow-2xl',
          'flex flex-col max-h-[90dvh]',
          // Mobile: rounded top, full width, slides up
          'rounded-t-2xl animate-slide-up',
          // Desktop: rounded all sides, constrained width, centered
          `md:rounded-2xl md:${maxWidth} md:mx-4 md:animate-fade-in`,
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="tap-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface text-text-muted transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Drag handle — mobile only */}
        <div className="md:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-border" />

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-5 pt-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}