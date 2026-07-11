import React from 'react';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string | number;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable header component for all views/routes.
 * Ensures consistent title typography, sizing, spacing, and icon display.
 */
export function PageHeader({
  icon,
  title,
  subtitle,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 ${className}`}>
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background: 'var(--icon-bg-accent)',
              color: 'var(--icon-text-accent)',
              border: '1px solid var(--color-accent-border)',
            }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle !== undefined && (
            <p className="text-sm sm:text-base text-text-muted mt-1 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center shrink-0 self-start sm:self-center">
          {action}
        </div>
      )}
    </div>
  );
}
