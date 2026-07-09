import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Mobile-only Bottom Sheet component.
 * Replaces hardcoded styles with token variables for backdrop color, backdrop blur, border color, and background.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:hidden"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 backdrop-blur-overlay ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Sheet */}
      <div
        className={`relative w-full max-w-lg border-t rounded-t-3xl max-h-[80vh] overflow-y-auto transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          background: 'var(--modal-bg)',
          borderColor: 'var(--modal-border)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div 
            className="w-12 h-1 rounded-full" 
            style={{ background: 'var(--color-border-strong)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {title && (
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="tap-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}

