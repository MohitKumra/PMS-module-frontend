import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModalRoot } from './ModalRoot';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const modalRoot = useModalRoot();

  // Keep the latest onClose in a ref so the effect below doesn't need it
  // as a dependency. onClose is passed as an inline arrow function from
  // parents (e.g. `onClose={() => setShowCreate(false)}`), which is a new
  // reference every render. If it were a dependency, this effect would
  // tear down and re-run on every keystroke inside the modal (since typing
  // re-renders the parent), re-focusing the first focusable element and
  // stealing focus away from whatever input the user is typing in.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Handle initial focus, focus trapping, and body scroll lock.
  // Deps: [open] ONLY — this must run exactly once per open/close
  // transition, never on incidental re-renders while the modal is open.
  useEffect(() => {
    if (!open) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element INSIDE THE CONTENT AREA, not the
    // header. The header's close (X) button sits before the content in
    // DOM order, so querying the whole dialog would focus the X button
    // first instead of e.g. the form's first input.
    const focusableInContent = contentRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableInContent?.[0] ?? null;
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      dialogRef.current?.focus();
    }

    // Focus trap cycles across the WHOLE dialog (header + content), so Tab
    // still reaches the close button — just don't auto-focus it on open.
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const all = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!all?.length) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      previouslyFocusedElement.current?.focus();
    };
  }, [open]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-overlay animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={[
          'relative z-[80] w-full shadow-2xl flex flex-col max-h-[90dvh] border rounded-2xl animate-scale-in',
          maxWidth,
        ].join(' ')}
        style={{
          background: 'var(--modal-bg)',
          borderColor: 'var(--modal-border)',
          boxShadow: 'var(--modal-shadow)',
        }}
      >
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

        <div ref={contentRef} className="overflow-y-auto px-6 pb-6 pt-1 flex-1">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
}